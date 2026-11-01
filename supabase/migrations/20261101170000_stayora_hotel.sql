-- Stayora hotel: rooms, reservations, payments, and front-desk operations.

create table public.stayora_settings (
  id integer primary key default 1 check (id = 1),
  payments_live boolean not null default false,
  hold_minutes integer not null default 45,
  check_in_time text not null default '14:00',
  check_out_time text not null default '12:00'
);

insert into public.stayora_settings (id) values (1);

create table public.stayora_secrets (
  id text primary key,
  value text not null
);

insert into public.stayora_secrets (id, value)
values ('webhook', replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''));

create table public.stayora_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'guest' check (role in ('guest', 'staff', 'admin')),
  created_at timestamptz not null default now()
);

create table public.stayora_room_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text not null,
  description text not null,
  long_description text not null,
  price_ghs integer not null check (price_ghs > 0),
  max_guests integer not null check (max_guests > 0),
  size_sqm integer not null,
  bed_type text not null,
  view_name text not null,
  amenities text[] not null default '{}',
  images text[] not null,
  featured boolean not null default false,
  popular boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.stayora_rooms (
  id uuid primary key default gen_random_uuid(),
  room_type_id uuid not null references public.stayora_room_types (id),
  room_number text not null unique,
  floor integer not null,
  status text not null default 'available' check (status in ('available', 'occupied', 'dirty', 'maintenance')),
  notes text,
  created_at timestamptz not null default now()
);

create table public.stayora_reservations (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  room_type_id uuid not null references public.stayora_room_types (id),
  guest_name text not null,
  guest_email text not null,
  guest_phone text not null,
  guests integer not null check (guests > 0),
  rooms_count integer not null check (rooms_count > 0 and rooms_count <= 5),
  check_in date not null,
  check_out date not null,
  nights integer not null check (nights > 0 and nights <= 30),
  nightly_rate integer not null check (nightly_rate > 0),
  total_ghs integer not null check (total_ghs > 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')),
  special_requests text,
  internal_note text,
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (check_out > check_in)
);

create table public.stayora_reservation_rooms (
  reservation_id uuid not null references public.stayora_reservations (id) on delete cascade,
  room_id uuid not null references public.stayora_rooms (id),
  primary key (reservation_id, room_id)
);

create table public.stayora_payments (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.stayora_reservations (id) on delete cascade,
  amount_ghs integer not null check (amount_ghs > 0),
  currency text not null default 'GHS',
  provider text not null check (provider in ('moolre', 'desk')),
  mode text not null check (mode in ('sandbox', 'live')),
  channel text,
  payer_phone text,
  external_ref text not null unique,
  provider_ref text,
  status text not null default 'pending' check (status in ('pending', 'otp_required', 'processing', 'paid', 'failed', 'refund_due')),
  raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stayora_operations (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid references public.stayora_reservations (id) on delete set null,
  room_id uuid references public.stayora_rooms (id) on delete set null,
  kind text not null check (kind in ('check_in', 'check_out', 'housekeeping', 'maintenance', 'note', 'cancel')),
  note text,
  staff_name text,
  created_at timestamptz not null default now()
);

create table public.stayora_messages (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid references public.stayora_reservations (id) on delete set null,
  channel text not null check (channel in ('email', 'sms')),
  recipient text not null,
  subject text,
  body text not null,
  provider text,
  provider_id text,
  status text not null,
  created_at timestamptz not null default now()
);

create table public.stayora_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  topic text,
  message text not null,
  created_at timestamptz not null default now()
);

create table public.stayora_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create table public.stayora_reviews (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  guest_from text not null,
  rating integer not null check (rating between 1 and 5),
  quote text not null,
  stay_label text not null,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index stayora_reservations_dates_idx on public.stayora_reservations (room_type_id, check_in, check_out);
create index stayora_reservations_status_idx on public.stayora_reservations (status, check_in);
create index stayora_reservations_guest_idx on public.stayora_reservations (guest_email);
create index stayora_rooms_type_idx on public.stayora_rooms (room_type_id, status);
create index stayora_payments_reservation_idx on public.stayora_payments (reservation_id, created_at desc);

create or replace function public.stayora_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.stayora_profiles
    where id = auth.uid()
      and role in ('staff', 'admin')
  );
$$;

create or replace function public.stayora_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.stayora_profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.stayora_require_staff()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.stayora_is_staff() then
    raise exception 'Front desk access only';
  end if;
end;
$$;

create or replace function public.stayora_protect_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role text;
  admin_count integer;
begin
  if tg_op = 'INSERT' then
    new.role := 'guest';
    return new;
  end if;

  if new.role is not distinct from old.role then
    return new;
  end if;

  select role into actor_role from public.stayora_profiles where id = auth.uid();
  select count(*) into admin_count from public.stayora_profiles where role = 'admin';

  if actor_role = 'admin' then
    return new;
  end if;

  if admin_count = 0 and new.id = auth.uid() and new.role = 'admin' then
    return new;
  end if;

  raise exception 'Only a manager can change roles';
end;
$$;

create trigger stayora_profiles_protect_role
before insert or update on public.stayora_profiles
for each row execute function public.stayora_protect_role();

create or replace function public.stayora_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.stayora_profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    'guest'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger stayora_on_auth_user_created
after insert on auth.users
for each row execute function public.stayora_handle_new_user();

create or replace function public.stayora_touch_reservation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger stayora_reservations_touch
before update on public.stayora_reservations
for each row execute function public.stayora_touch_reservation();

create or replace function public.stayora_touch_payment()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger stayora_payments_touch
before update on public.stayora_payments
for each row execute function public.stayora_touch_payment();

create or replace function public.stayora_release_expired_holds()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  mins integer;
begin
  select hold_minutes into mins from public.stayora_settings where id = 1;
  update public.stayora_reservations
  set status = 'cancelled'
  where status = 'pending'
    and created_at < now() - make_interval(mins => coalesce(mins, 45));
end;
$$;

create or replace function public.stayora_remaining(
  p_room_type uuid,
  p_check_in date,
  p_check_out date
)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select greatest(
    (
      select count(*)::integer
      from public.stayora_rooms r
      where r.room_type_id = p_room_type
        and r.status <> 'maintenance'
    )
    - coalesce((
      select sum(res.rooms_count)::integer
      from public.stayora_reservations res
      where res.room_type_id = p_room_type
        and res.status in ('pending', 'confirmed', 'checked_in')
        and res.check_in < p_check_out
        and res.check_out > p_check_in
    ), 0),
    0
  );
$$;

create or replace function public.stayora_search_availability(
  p_check_in date,
  p_check_out date,
  p_guests integer,
  p_rooms integer
)
returns table (
  id uuid,
  slug text,
  name text,
  tagline text,
  description text,
  long_description text,
  price_ghs integer,
  max_guests integer,
  size_sqm integer,
  bed_type text,
  view_name text,
  amenities text[],
  images text[],
  featured boolean,
  popular boolean,
  sort_order integer,
  remaining integer
)
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if p_check_in is null or p_check_out is null then
    raise exception 'Choose a check-in and check-out date';
  end if;
  if p_check_out <= p_check_in then
    raise exception 'Check-out must be at least one night after check-in';
  end if;
  if p_check_in < (now() at time zone 'Africa/Accra')::date then
    raise exception 'Check-in cannot be in the past';
  end if;
  if p_check_out > p_check_in + 30 then
    raise exception 'Stays can be booked up to 30 nights online';
  end if;
  if p_guests < 1 or p_guests > 12 then
    raise exception 'Choose between 1 and 12 guests';
  end if;
  if p_rooms < 1 or p_rooms > 5 then
    raise exception 'Choose between 1 and 5 rooms';
  end if;

  perform public.stayora_release_expired_holds();

  return query
  select
    rt.id,
    rt.slug,
    rt.name,
    rt.tagline,
    rt.description,
    rt.long_description,
    rt.price_ghs,
    rt.max_guests,
    rt.size_sqm,
    rt.bed_type,
    rt.view_name,
    rt.amenities,
    rt.images,
    rt.featured,
    rt.popular,
    rt.sort_order,
    public.stayora_remaining(rt.id, p_check_in, p_check_out) as remaining
  from public.stayora_room_types rt
  where rt.max_guests * p_rooms >= p_guests
    and public.stayora_remaining(rt.id, p_check_in, p_check_out) >= p_rooms
  order by rt.sort_order;
end;
$$;

create or replace function public.stayora_create_reservation(
  p_slug text,
  p_check_in date,
  p_check_out date,
  p_guests integer,
  p_rooms integer,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_requests text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_type public.stayora_room_types%rowtype;
  v_nights integer;
  v_total integer;
  v_remaining integer;
  v_reference text;
  v_id uuid;
  v_live boolean;
  v_mode text;
  v_external text;
  v_name text;
  v_email text;
  v_phone text;
begin
  perform public.stayora_release_expired_holds();

  if p_check_out <= p_check_in then
    raise exception 'Check-out must be at least one night after check-in';
  end if;
  if p_check_in < (now() at time zone 'Africa/Accra')::date then
    raise exception 'Check-in cannot be in the past';
  end if;
  v_nights := p_check_out - p_check_in;
  if v_nights > 30 then
    raise exception 'Stays can be booked up to 30 nights online';
  end if;
  if p_guests < 1 or p_guests > 12 or p_rooms < 1 or p_rooms > 5 then
    raise exception 'Guest or room count is out of range';
  end if;

  v_name := trim(regexp_replace(coalesce(p_guest_name, ''), '\s+', ' ', 'g'));
  v_email := lower(trim(coalesce(p_guest_email, '')));
  v_phone := trim(coalesce(p_guest_phone, ''));

  if char_length(v_name) < 2 or char_length(v_name) > 80 then
    raise exception 'Enter the guest name as it should appear at the desk';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Enter a valid email address';
  end if;
  if char_length(regexp_replace(v_phone, '\D', '', 'g')) < 10 then
    raise exception 'Enter a valid mobile number';
  end if;
  if p_requests is not null and char_length(p_requests) > 500 then
    raise exception 'Keep special requests under 500 characters';
  end if;

  select * into v_type
  from public.stayora_room_types
  where slug = p_slug
  for update;

  if not found then
    raise exception 'That room is no longer listed';
  end if;
  if v_type.max_guests * p_rooms < p_guests then
    raise exception 'This room cannot host that many guests. Add another room or choose a suite.';
  end if;

  v_remaining := public.stayora_remaining(v_type.id, p_check_in, p_check_out);
  if v_remaining < p_rooms then
    raise exception 'Those dates just filled. Try another room or different dates.';
  end if;

  v_total := v_type.price_ghs * v_nights * p_rooms;
  select payments_live into v_live from public.stayora_settings where id = 1;
  v_mode := case when coalesce(v_live, false) then 'live' else 'sandbox' end;

  loop
    v_reference := 'STY-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (
      select 1 from public.stayora_reservations where reference = v_reference
    );
  end loop;

  insert into public.stayora_reservations (
    reference, user_id, room_type_id, guest_name, guest_email, guest_phone,
    guests, rooms_count, check_in, check_out, nights, nightly_rate, total_ghs,
    status, special_requests
  )
  values (
    v_reference, auth.uid(), v_type.id, v_name, v_email, v_phone,
    p_guests, p_rooms, p_check_in, p_check_out, v_nights, v_type.price_ghs, v_total,
    'pending', nullif(trim(coalesce(p_requests, '')), '')
  )
  returning id into v_id;

  v_external := v_reference || '-1';

  insert into public.stayora_payments (
    reservation_id, amount_ghs, provider, mode, external_ref, status
  )
  values (v_id, v_total, 'moolre', v_mode, v_external, 'pending');

  return jsonb_build_object(
    'id', v_id,
    'reference', v_reference,
    'external_ref', v_external,
    'total_ghs', v_total,
    'nights', v_nights,
    'nightly_rate', v_type.price_ghs,
    'room_name', v_type.name,
    'mode', v_mode,
    'guest_email', v_email
  );
end;
$$;

create or replace function public.stayora_lookup_booking(p_reference text, p_email text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_row public.stayora_reservations%rowtype;
  v_type public.stayora_room_types%rowtype;
  v_payment public.stayora_payments%rowtype;
  v_rooms jsonb;
begin
  select * into v_row
  from public.stayora_reservations
  where reference = upper(trim(coalesce(p_reference, '')))
    and guest_email = lower(trim(coalesce(p_email, '')));

  if not found then
    raise exception 'We could not find a stay with that reference and email';
  end if;

  select * into v_type from public.stayora_room_types where id = v_row.room_type_id;

  select * into v_payment
  from public.stayora_payments
  where reservation_id = v_row.id
  order by created_at desc
  limit 1;

  select coalesce(jsonb_agg(jsonb_build_object(
    'room_number', rm.room_number,
    'floor', rm.floor
  ) order by rm.room_number), '[]'::jsonb)
  into v_rooms
  from public.stayora_reservation_rooms rr
  join public.stayora_rooms rm on rm.id = rr.room_id
  where rr.reservation_id = v_row.id;

  return jsonb_build_object(
    'id', v_row.id,
    'reference', v_row.reference,
    'guest_name', v_row.guest_name,
    'guest_email', v_row.guest_email,
    'guest_phone', v_row.guest_phone,
    'guests', v_row.guests,
    'rooms_count', v_row.rooms_count,
    'check_in', v_row.check_in,
    'check_out', v_row.check_out,
    'nights', v_row.nights,
    'nightly_rate', v_row.nightly_rate,
    'total_ghs', v_row.total_ghs,
    'status', v_row.status,
    'special_requests', v_row.special_requests,
    'room_name', v_type.name,
    'room_slug', v_type.slug,
    'image', v_type.images[1],
    'payment_status', v_payment.status,
    'payment_mode', v_payment.mode,
    'external_ref', v_payment.external_ref,
    'channel', v_payment.channel,
    'assigned_rooms', v_rooms
  );
end;
$$;

create or replace function public.stayora_sandbox_approve(p_reference text, p_email text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_row public.stayora_reservations%rowtype;
  v_payment public.stayora_payments%rowtype;
begin
  select * into v_row
  from public.stayora_reservations
  where reference = upper(trim(coalesce(p_reference, '')))
    and guest_email = lower(trim(coalesce(p_email, '')))
  for update;

  if not found then
    raise exception 'We could not find a stay with that reference and email';
  end if;
  if v_row.status = 'cancelled' then
    raise exception 'This hold has expired. Please choose the room again.';
  end if;
  if v_row.status <> 'pending' then
    return public.stayora_lookup_booking(v_row.reference, v_row.guest_email);
  end if;

  select * into v_payment
  from public.stayora_payments
  where reservation_id = v_row.id
  order by created_at desc
  limit 1
  for update;

  if v_payment.mode <> 'sandbox' then
    raise exception 'This stay is waiting for a live mobile-money approval';
  end if;

  update public.stayora_payments
  set status = 'paid',
      provider_ref = coalesce(provider_ref, 'sandbox-' || external_ref),
      raw_response = coalesce(raw_response, '{}'::jsonb) || jsonb_build_object('sandbox', true, 'approved_at', now())
  where id = v_payment.id;

  update public.stayora_reservations
  set status = 'confirmed'
  where id = v_row.id;

  return public.stayora_lookup_booking(v_row.reference, v_row.guest_email);
end;
$$;

create or replace function public.stayora_open_payment_attempt(p_reference text, p_email text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_row public.stayora_reservations%rowtype;
  v_count integer;
  v_mode text;
  v_external text;
begin
  select * into v_row
  from public.stayora_reservations
  where reference = upper(trim(coalesce(p_reference, '')))
    and guest_email = lower(trim(coalesce(p_email, '')))
  for update;

  if not found then
    raise exception 'We could not find a stay with that reference and email';
  end if;
  if v_row.status <> 'pending' then
    raise exception 'This stay is no longer awaiting payment';
  end if;

  select count(*) into v_count from public.stayora_payments where reservation_id = v_row.id;
  select case when payments_live then 'live' else 'sandbox' end into v_mode
  from public.stayora_settings where id = 1;

  v_external := v_row.reference || '-' || (v_count + 1);

  insert into public.stayora_payments (
    reservation_id, amount_ghs, provider, mode, external_ref, status
  )
  values (v_row.id, v_row.total_ghs, 'moolre', v_mode, v_external, 'pending');

  return jsonb_build_object(
    'external_ref', v_external,
    'amount_ghs', v_row.total_ghs,
    'mode', v_mode,
    'reference', v_row.reference
  );
end;
$$;

create or replace function public.stayora_secret_ok(p_secret text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.stayora_secrets
    where id = 'webhook'
      and value = p_secret
      and p_secret is not null
      and length(p_secret) > 16
  );
$$;

create or replace function public.stayora_apply_payment(
  p_secret text,
  p_external_ref text,
  p_status text,
  p_provider_ref text,
  p_amount numeric,
  p_raw jsonb
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_payment public.stayora_payments%rowtype;
  v_reservation public.stayora_reservations%rowtype;
begin
  if not public.stayora_secret_ok(p_secret) then
    raise exception 'Unauthorized';
  end if;
  if p_status not in ('pending', 'otp_required', 'processing', 'paid', 'failed') then
    raise exception 'Unknown payment status';
  end if;

  select * into v_payment
  from public.stayora_payments
  where external_ref = p_external_ref
  for update;

  if not found then
    raise exception 'Unknown payment reference';
  end if;

  if p_amount is not null and round(p_amount) <> v_payment.amount_ghs then
    raise exception 'Payment amount does not match the stay';
  end if;

  if v_payment.status = 'paid' and p_status = 'paid' then
    select * into v_reservation from public.stayora_reservations where id = v_payment.reservation_id;
    return jsonb_build_object('reference', v_reservation.reference, 'status', v_reservation.status, 'duplicate', true);
  end if;

  update public.stayora_payments
  set status = p_status,
      provider_ref = coalesce(p_provider_ref, provider_ref),
      raw_response = coalesce(p_raw, raw_response)
  where id = v_payment.id;

  if p_status = 'paid' then
    update public.stayora_reservations
    set status = 'confirmed'
    where id = v_payment.reservation_id
      and status = 'pending';
  end if;

  select * into v_reservation from public.stayora_reservations where id = v_payment.reservation_id;

  return jsonb_build_object(
    'reference', v_reservation.reference,
    'email', v_reservation.guest_email,
    'guest_name', v_reservation.guest_name,
    'phone', v_reservation.guest_phone,
    'status', v_reservation.status,
    'total_ghs', v_reservation.total_ghs,
    'check_in', v_reservation.check_in,
    'check_out', v_reservation.check_out,
    'room_type_id', v_reservation.room_type_id
  );
end;
$$;

create or replace function public.stayora_attach_payer(
  p_reference text,
  p_email text,
  p_channel text,
  p_payer_phone text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_row public.stayora_reservations%rowtype;
  v_payment public.stayora_payments%rowtype;
begin
  if p_channel not in ('mtn', 'telecel', 'at') then
    raise exception 'Choose MTN, Telecel, or AT';
  end if;

  select * into v_row
  from public.stayora_reservations
  where reference = upper(trim(p_reference))
    and guest_email = lower(trim(p_email));

  if not found then
    raise exception 'We could not find a stay with that reference and email';
  end if;

  select * into v_payment
  from public.stayora_payments
  where reservation_id = v_row.id
  order by created_at desc
  limit 1
  for update;

  update public.stayora_payments
  set channel = p_channel,
      payer_phone = p_payer_phone
  where id = v_payment.id;

  return jsonb_build_object(
    'external_ref', v_payment.external_ref,
    'amount_ghs', v_payment.amount_ghs,
    'mode', v_payment.mode,
    'status', v_payment.status
  );
end;
$$;

create or replace function public.stayora_log_notice(
  p_secret text,
  p_channel text,
  p_recipient text,
  p_subject text,
  p_body text,
  p_provider text,
  p_provider_id text,
  p_status text,
  p_reservation uuid
)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.stayora_secret_ok(p_secret) then
    raise exception 'Unauthorized';
  end if;
  if p_channel not in ('email', 'sms') then
    raise exception 'Unknown channel';
  end if;

  insert into public.stayora_messages (
    reservation_id, channel, recipient, subject, body, provider, provider_id, status
  )
  values (
    p_reservation, p_channel, p_recipient, p_subject, p_body, p_provider, p_provider_id, p_status
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.stayora_create_inquiry(
  p_name text,
  p_email text,
  p_phone text,
  p_topic text,
  p_message text
)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_name text := trim(coalesce(p_name, ''));
  v_email text := lower(trim(coalesce(p_email, '')));
  v_message text := trim(coalesce(p_message, ''));
begin
  if char_length(v_name) < 2 then
    raise exception 'Tell us who to reply to';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Enter a valid email address';
  end if;
  if char_length(v_message) < 8 or char_length(v_message) > 2000 then
    raise exception 'Write a short note between 8 and 2000 characters';
  end if;

  insert into public.stayora_inquiries (name, email, phone, topic, message)
  values (
    v_name,
    v_email,
    nullif(trim(coalesce(p_phone, '')), ''),
    nullif(trim(coalesce(p_topic, '')), ''),
    v_message
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.stayora_subscribe(p_email text)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Enter a valid email address';
  end if;
  insert into public.stayora_subscribers (email) values (v_email)
  on conflict (email) do nothing;
end;
$$;

create or replace function public.stayora_claim_admin()
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if auth.uid() is null then
    raise exception 'Sign in first';
  end if;
  select count(*) into v_count from public.stayora_profiles where role = 'admin';
  if v_count > 0 then
    raise exception 'A manager already looks after Stayora';
  end if;
  update public.stayora_profiles set role = 'admin' where id = auth.uid();
  return 'admin';
end;
$$;

create or replace function public.stayora_set_role(p_user uuid, p_role text)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if not public.stayora_is_admin() then
    raise exception 'Only a manager can change roles';
  end if;
  if p_role not in ('guest', 'staff', 'admin') then
    raise exception 'Unknown role';
  end if;
  update public.stayora_profiles set role = p_role where id = p_user;
  if not found then
    raise exception 'Guest profile not found';
  end if;
end;
$$;

create or replace function public.stayora_set_payments_live(p_live boolean)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.stayora_require_staff();
  update public.stayora_settings set payments_live = p_live where id = 1;
  return p_live;
end;
$$;

create or replace function public.stayora_set_note(p_reservation uuid, p_note text)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.stayora_require_staff();
  update public.stayora_reservations
  set internal_note = nullif(trim(coalesce(p_note, '')), '')
  where id = p_reservation;
end;
$$;

create or replace function public.stayora_cancel_reservation(p_reservation uuid, p_reason text)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_row public.stayora_reservations%rowtype;
  v_staff boolean := public.stayora_is_staff();
begin
  select * into v_row from public.stayora_reservations where id = p_reservation for update;
  if not found then
    raise exception 'Stay not found';
  end if;
  if not v_staff and v_row.user_id is distinct from auth.uid() then
    raise exception 'You can only cancel your own stay';
  end if;
  if v_row.status in ('checked_in', 'checked_out', 'cancelled') then
    raise exception 'This stay can no longer be cancelled online';
  end if;

  update public.stayora_rooms rm
  set status = 'dirty'
  where rm.id in (
    select room_id from public.stayora_reservation_rooms where reservation_id = v_row.id
  )
  and rm.status = 'occupied';

  delete from public.stayora_reservation_rooms where reservation_id = v_row.id;

  update public.stayora_reservations set status = 'cancelled' where id = v_row.id;

  if exists (
    select 1 from public.stayora_payments
    where reservation_id = v_row.id and status = 'paid'
  ) then
    update public.stayora_payments
    set status = 'refund_due'
    where reservation_id = v_row.id and status = 'paid';
  end if;

  insert into public.stayora_operations (reservation_id, kind, note, staff_name)
  values (
    v_row.id,
    'cancel',
    nullif(trim(coalesce(p_reason, '')), ''),
    case when v_staff then 'Front desk' else 'Guest' end
  );

  return 'cancelled';
end;
$$;

create or replace function public.stayora_available_rooms(p_reservation uuid)
returns table (id uuid, room_number text, floor integer, status text)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_row public.stayora_reservations%rowtype;
begin
  perform public.stayora_require_staff();
  select * into v_row from public.stayora_reservations as booked where booked.id = p_reservation;
  if not found then
    raise exception 'Stay not found';
  end if;

  return query
  select rm.id, rm.room_number, rm.floor, rm.status
  from public.stayora_rooms rm
  where rm.room_type_id = v_row.room_type_id
    and rm.status = 'available'
    and not exists (
      select 1
      from public.stayora_reservation_rooms rr
      join public.stayora_reservations other on other.id = rr.reservation_id
      where rr.room_id = rm.id
        and other.id <> v_row.id
        and other.status in ('confirmed', 'checked_in')
        and other.check_in < v_row.check_out
        and other.check_out > v_row.check_in
    )
  order by rm.room_number;
end;
$$;

create or replace function public.stayora_check_in(p_reservation uuid, p_room_ids uuid[])
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_row public.stayora_reservations%rowtype;
  v_room uuid;
  v_count integer;
begin
  perform public.stayora_require_staff();
  if p_room_ids is null or array_length(p_room_ids, 1) is null then
    raise exception 'Choose a room before check-in';
  end if;

  select * into v_row from public.stayora_reservations where id = p_reservation for update;
  if not found then
    raise exception 'Stay not found';
  end if;
  if v_row.status <> 'confirmed' then
    raise exception 'Only confirmed stays can be checked in';
  end if;
  if (now() at time zone 'Africa/Accra')::date < v_row.check_in - 1 then
    raise exception 'Check-in opens the day before arrival';
  end if;

  v_count := array_length(p_room_ids, 1);
  if v_count <> v_row.rooms_count then
    raise exception 'Assign exactly % room(s) for this stay', v_row.rooms_count;
  end if;

  foreach v_room in array p_room_ids loop
    if not exists (
      select 1 from public.stayora_rooms
      where id = v_room
        and room_type_id = v_row.room_type_id
        and status = 'available'
    ) then
      raise exception 'One of the selected rooms is not ready';
    end if;
  end loop;

  insert into public.stayora_reservation_rooms (reservation_id, room_id)
  select v_row.id, unnest(p_room_ids);

  update public.stayora_rooms
  set status = 'occupied'
  where id = any (p_room_ids);

  update public.stayora_reservations
  set status = 'checked_in', checked_in_at = now()
  where id = v_row.id;

  insert into public.stayora_operations (reservation_id, kind, note, staff_name)
  values (v_row.id, 'check_in', 'Guest welcomed at the desk', 'Front desk');
end;
$$;

create or replace function public.stayora_check_out(p_reservation uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_row public.stayora_reservations%rowtype;
begin
  perform public.stayora_require_staff();
  select * into v_row from public.stayora_reservations where id = p_reservation for update;
  if not found then
    raise exception 'Stay not found';
  end if;
  if v_row.status <> 'checked_in' then
    raise exception 'This guest is not currently in house';
  end if;

  update public.stayora_rooms
  set status = 'dirty'
  where id in (
    select room_id from public.stayora_reservation_rooms where reservation_id = v_row.id
  );

  update public.stayora_reservations
  set status = 'checked_out', checked_out_at = now()
  where id = v_row.id;

  insert into public.stayora_operations (reservation_id, room_id, kind, note, staff_name)
  select v_row.id, rr.room_id, 'housekeeping', 'Departure clean requested', 'Front desk'
  from public.stayora_reservation_rooms rr
  where rr.reservation_id = v_row.id;

  insert into public.stayora_operations (reservation_id, kind, note, staff_name)
  values (v_row.id, 'check_out', 'Guest departed', 'Front desk');
end;
$$;

create or replace function public.stayora_set_room_status(p_room uuid, p_status text, p_note text)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_old text;
begin
  perform public.stayora_require_staff();
  if p_status not in ('available', 'dirty', 'maintenance') then
    raise exception 'Choose available, dirty, or maintenance';
  end if;

  select status into v_old from public.stayora_rooms where id = p_room for update;
  if not found then
    raise exception 'Room not found';
  end if;
  if v_old = 'occupied' and p_status <> 'dirty' then
    raise exception 'Occupied rooms are released at check-out';
  end if;

  update public.stayora_rooms
  set status = p_status,
      notes = coalesce(nullif(trim(coalesce(p_note, '')), ''), notes)
  where id = p_room;

  insert into public.stayora_operations (room_id, kind, note, staff_name)
  values (
    p_room,
    case when p_status = 'maintenance' then 'maintenance' else 'housekeeping' end,
    coalesce(nullif(trim(coalesce(p_note, '')), ''), 'Marked ' || p_status),
    'Front desk'
  );
end;
$$;

create or replace function public.stayora_mark_no_show(p_reservation uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  perform public.stayora_require_staff();
  update public.stayora_reservations
  set status = 'no_show'
  where id = p_reservation
    and status = 'confirmed';
  if not found then
    raise exception 'Only a confirmed arrival can be marked as a no-show';
  end if;
  insert into public.stayora_operations (reservation_id, kind, note, staff_name)
  values (p_reservation, 'note', 'Marked as no-show', 'Front desk');
end;
$$;

create or replace function public.stayora_desk_payment(p_reservation uuid, p_note text)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_row public.stayora_reservations%rowtype;
begin
  perform public.stayora_require_staff();
  select * into v_row from public.stayora_reservations where id = p_reservation for update;
  if not found then
    raise exception 'Stay not found';
  end if;
  if v_row.status <> 'pending' then
    raise exception 'This stay is not waiting for payment';
  end if;

  insert into public.stayora_payments (
    reservation_id, amount_ghs, provider, mode, channel, external_ref, provider_ref, status, raw_response
  )
  values (
    v_row.id,
    v_row.total_ghs,
    'desk',
    'live',
    'desk',
    v_row.reference || '-DESK-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6),
    'desk',
    'paid',
    jsonb_build_object('note', nullif(trim(coalesce(p_note, '')), ''))
  );

  update public.stayora_reservations set status = 'confirmed' where id = v_row.id;

  insert into public.stayora_operations (reservation_id, kind, note, staff_name)
  values (v_row.id, 'note', coalesce(nullif(trim(coalesce(p_note, '')), ''), 'Paid at the desk'), 'Front desk');
end;
$$;

create or replace function public.stayora_dashboard()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'Africa/Accra')::date;
  v_sellable integer;
  v_occupied integer;
begin
  perform public.stayora_require_staff();

  select count(*) into v_sellable from public.stayora_rooms where status <> 'maintenance';
  select count(*) into v_occupied from public.stayora_rooms where status = 'occupied';

  return jsonb_build_object(
    'today', v_today,
    'arrivals', (select count(*) from public.stayora_reservations where check_in = v_today and status in ('confirmed', 'checked_in')),
    'departures', (select count(*) from public.stayora_reservations where check_out = v_today and status in ('checked_in', 'checked_out')),
    'in_house', (select count(*) from public.stayora_reservations where status = 'checked_in'),
    'pending', (select count(*) from public.stayora_reservations where status = 'pending'),
    'dirty_rooms', (select count(*) from public.stayora_rooms where status = 'dirty'),
    'occupancy_pct', case when v_sellable = 0 then 0 else round((v_occupied::numeric / v_sellable) * 100) end,
    'month_revenue_ghs', (
      select coalesce(sum(amount_ghs), 0)
      from public.stayora_payments
      where status = 'paid'
        and created_at >= date_trunc('month', now() at time zone 'Africa/Accra')
    )
  );
end;
$$;

revoke all on function public.stayora_release_expired_holds() from public, anon, authenticated;
revoke all on function public.stayora_remaining(uuid, date, date) from public, anon, authenticated;
revoke all on function public.stayora_secret_ok(text) from public, anon, authenticated;
revoke all on function public.stayora_require_staff() from public, anon, authenticated;
revoke all on function public.stayora_protect_role() from public, anon, authenticated;
revoke all on function public.stayora_handle_new_user() from public, anon, authenticated;
revoke all on function public.stayora_is_staff() from public, anon, authenticated;
revoke all on function public.stayora_is_admin() from public, anon, authenticated;

grant execute on function public.stayora_is_staff() to authenticated;
grant execute on function public.stayora_is_admin() to authenticated;
grant execute on function public.stayora_search_availability(date, date, integer, integer) to anon, authenticated;
grant execute on function public.stayora_create_reservation(text, date, date, integer, integer, text, text, text, text) to anon, authenticated;
grant execute on function public.stayora_lookup_booking(text, text) to anon, authenticated;
grant execute on function public.stayora_sandbox_approve(text, text) to anon, authenticated;
grant execute on function public.stayora_open_payment_attempt(text, text) to anon, authenticated;
grant execute on function public.stayora_attach_payer(text, text, text, text) to anon, authenticated;
grant execute on function public.stayora_apply_payment(text, text, text, text, numeric, jsonb) to anon, authenticated;
grant execute on function public.stayora_log_notice(text, text, text, text, text, text, text, text, uuid) to anon, authenticated;
grant execute on function public.stayora_create_inquiry(text, text, text, text, text) to anon, authenticated;
grant execute on function public.stayora_subscribe(text) to anon, authenticated;
grant execute on function public.stayora_claim_admin() to authenticated;
grant execute on function public.stayora_set_role(uuid, text) to authenticated;
grant execute on function public.stayora_set_payments_live(boolean) to authenticated;
grant execute on function public.stayora_set_note(uuid, text) to authenticated;
grant execute on function public.stayora_cancel_reservation(uuid, text) to authenticated;
grant execute on function public.stayora_available_rooms(uuid) to authenticated;
grant execute on function public.stayora_check_in(uuid, uuid[]) to authenticated;
grant execute on function public.stayora_check_out(uuid) to authenticated;
grant execute on function public.stayora_set_room_status(uuid, text, text) to authenticated;
grant execute on function public.stayora_mark_no_show(uuid) to authenticated;
grant execute on function public.stayora_desk_payment(uuid, text) to authenticated;
grant execute on function public.stayora_dashboard() to authenticated;

alter table public.stayora_settings enable row level security;
alter table public.stayora_secrets enable row level security;
alter table public.stayora_profiles enable row level security;
alter table public.stayora_room_types enable row level security;
alter table public.stayora_rooms enable row level security;
alter table public.stayora_reservations enable row level security;
alter table public.stayora_reservation_rooms enable row level security;
alter table public.stayora_payments enable row level security;
alter table public.stayora_operations enable row level security;
alter table public.stayora_messages enable row level security;
alter table public.stayora_inquiries enable row level security;
alter table public.stayora_subscribers enable row level security;
alter table public.stayora_reviews enable row level security;

create policy stayora_room_types_read on public.stayora_room_types
for select to anon, authenticated using (true);

create policy stayora_reviews_read on public.stayora_reviews
for select to anon, authenticated using (true);

create policy stayora_profiles_read on public.stayora_profiles
for select to authenticated
using (id = auth.uid() or public.stayora_is_staff());

create policy stayora_profiles_update on public.stayora_profiles
for update to authenticated
using (id = auth.uid() or public.stayora_is_admin())
with check (id = auth.uid() or public.stayora_is_admin());

create policy stayora_reservations_read on public.stayora_reservations
for select to authenticated
using (user_id = auth.uid() or public.stayora_is_staff());

create policy stayora_reservation_rooms_read on public.stayora_reservation_rooms
for select to authenticated
using (
  public.stayora_is_staff()
  or exists (
    select 1 from public.stayora_reservations r
    where r.id = reservation_id and r.user_id = auth.uid()
  )
);

create policy stayora_payments_read on public.stayora_payments
for select to authenticated
using (
  public.stayora_is_staff()
  or exists (
    select 1 from public.stayora_reservations r
    where r.id = reservation_id and r.user_id = auth.uid()
  )
);

create policy stayora_rooms_staff on public.stayora_rooms
for select to authenticated
using (public.stayora_is_staff());

create policy stayora_operations_staff on public.stayora_operations
for select to authenticated
using (public.stayora_is_staff());

create policy stayora_messages_staff on public.stayora_messages
for select to authenticated
using (public.stayora_is_staff());

create policy stayora_inquiries_staff on public.stayora_inquiries
for select to authenticated
using (public.stayora_is_staff());

create policy stayora_subscribers_staff on public.stayora_subscribers
for select to authenticated
using (public.stayora_is_staff());

create policy stayora_settings_staff on public.stayora_settings
for select to authenticated
using (public.stayora_is_staff());

revoke all on table public.stayora_secrets from anon, authenticated;

revoke all on function public.stayora_apply_payment(text, text, text, text, numeric, jsonb) from public;
revoke all on function public.stayora_log_notice(text, text, text, text, text, text, text, text, uuid) from public;
revoke all on function public.stayora_claim_admin() from public;
revoke all on function public.stayora_set_role(uuid, text) from public;
revoke all on function public.stayora_set_payments_live(boolean) from public;
revoke all on function public.stayora_set_note(uuid, text) from public;
revoke all on function public.stayora_cancel_reservation(uuid, text) from public;
revoke all on function public.stayora_available_rooms(uuid) from public;
revoke all on function public.stayora_check_in(uuid, uuid[]) from public;
revoke all on function public.stayora_check_out(uuid) from public;
revoke all on function public.stayora_set_room_status(uuid, text, text) from public;
revoke all on function public.stayora_mark_no_show(uuid) from public;
revoke all on function public.stayora_desk_payment(uuid, text) from public;
revoke all on function public.stayora_dashboard() from public;
revoke all on function public.stayora_create_reservation(text, date, date, integer, integer, text, text, text, text) from public;
revoke all on function public.stayora_sandbox_approve(text, text) from public;
revoke all on function public.stayora_open_payment_attempt(text, text) from public;
revoke all on function public.stayora_attach_payer(text, text, text, text) from public;
revoke all on function public.stayora_lookup_booking(text, text) from public;
revoke all on function public.stayora_search_availability(date, date, integer, integer) from public;
revoke all on function public.stayora_create_inquiry(text, text, text, text, text) from public;
revoke all on function public.stayora_subscribe(text) from public;

create or replace function public.stayora_admin_exists()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.stayora_profiles where role = 'admin');
$$;

create or replace function public.stayora_ensure_profile()
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;
  insert into public.stayora_profiles (id, full_name, role)
  select auth.uid(), coalesce(split_part(email, '@', 1), 'Guest'), 'guest'
  from auth.users
  where id = auth.uid()
  on conflict (id) do nothing;
end;
$$;

create or replace function public.stayora_guest_cancel(p_reference text, p_email text, p_reason text)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  select id into v_id
  from public.stayora_reservations
  where reference = upper(trim(coalesce(p_reference, '')))
    and guest_email = lower(trim(coalesce(p_email, '')))
    and status in ('pending', 'confirmed');

  if v_id is null then
    raise exception 'This stay can no longer be cancelled online';
  end if;

  update public.stayora_rooms
  set status = 'dirty'
  where id in (select room_id from public.stayora_reservation_rooms where reservation_id = v_id)
    and status = 'occupied';

  delete from public.stayora_reservation_rooms where reservation_id = v_id;

  update public.stayora_reservations set status = 'cancelled' where id = v_id;

  update public.stayora_payments
  set status = 'refund_due'
  where reservation_id = v_id and status = 'paid';

  insert into public.stayora_operations (reservation_id, kind, note, staff_name)
  values (v_id, 'cancel', nullif(trim(coalesce(p_reason, '')), ''), 'Guest');

  return 'cancelled';
end;
$$;

revoke all on function public.stayora_admin_exists() from public;
revoke all on function public.stayora_ensure_profile() from public;
revoke all on function public.stayora_guest_cancel(text, text, text) from public;
grant execute on function public.stayora_admin_exists() to anon, authenticated;
grant execute on function public.stayora_ensure_profile() to authenticated;
grant execute on function public.stayora_guest_cancel(text, text, text) to anon, authenticated;
