insert into public.stayora_room_types (
  slug, name, tagline, description, long_description, price_ghs, max_guests, size_sqm,
  bed_type, view_name, amenities, images, featured, popular, sort_order
) values
(
  'garden-room',
  'Garden Room',
  'Queen room opening onto the courtyard',
  'A quieter queen room for two, with garden doors and a shower that actually has pressure.',
  'The Garden Room sits on the ground floor and opens toward the frangipani. It is the right room when you want to step outside with coffee before the city is fully awake. Breakfast for two is included, and the pool is a short walk across the lawn.',
  980, 2, 28, 'Queen bed', 'Courtyard garden',
  array['Queen bed','Walk-in shower','Breakfast for two','Wi-Fi','Blackout linen','Garden doors'],
  array[
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1800&q=80',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1400&q=80'
  ],
  false, false, 1
),
(
  'premium-room',
  'Premium Room',
  'The bright king room guests book first',
  'Linen, warm wood, and a rain shower for unhurried mornings in Ahodwo.',
  'The Premium Room is the one in the photographs: a king bed, odum headboard, and daylight from a tall window. It sleeps two comfortably, includes breakfast, and is the easiest yes if you are in Kumasi for work and still want the place to feel like a stay.',
  1250, 2, 32, 'King bed', 'Courtyard garden',
  array['King bed','Rain shower','Breakfast for two','Wi-Fi','Writing desk','Blackout linen'],
  array[
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1800&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=80'
  ],
  true, true, 2
),
(
  'deluxe-room',
  'Deluxe Room',
  'A wider king room with space to actually unpack',
  'More floor, a proper desk, and a sitting corner if one of you is still on a call.',
  'The Deluxe Room is for longer Kumasi weeks. There is room for a suitcase to be open without becoming the decor, a desk that faces the trees, and a king bed. Breakfast for two is included, and the evening turn-down leaves water and kelewele if the kitchen has made a batch.',
  1680, 3, 40, 'King bed', 'Ridge trees',
  array['King bed','Sofa corner','Rain shower','Breakfast for two','Wi-Fi','Work desk'],
  array[
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1800&q=80',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1400&q=80'
  ],
  true, true, 3
),
(
  'executive-suite',
  'Executive Suite',
  'A separate sitting room for slow evenings',
  'A top-floor suite with a sofa, a dining corner, and the ridge in the window.',
  'The Executive Suite is the room you take when the trip needs a living room. Sleep in the bedroom, take calls on the sofa, and eat breakfast at the table if you would rather not go down yet. It sleeps three, with a rollaway on request, and the bathroom has a tub as well as a rain shower.',
  2450, 3, 58, 'King bed and sofa', 'Ahodwo ridge',
  array['Separate living room','King bed','Soaking tub','Breakfast for two','Wi-Fi','Nespresso'],
  array[
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1800&q=80',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1400&q=80'
  ],
  true, true, 4
),
(
  'ashanti-suite',
  'Ashanti Suite',
  'Our largest suite, with a private terrace',
  'Two rooms, a terrace, and enough space for a small family or a long celebration.',
  'The Ashanti Suite is named for the region, not dressed up as a costume. Kente is a welcome cloth on the bed, not a theme. There is a king room, a twin room, and a terrace for sunrise tea. It is the right booking for parents travelling with children, or for two couples who want doors that close.',
  3400, 4, 78, 'King and twin', 'Private terrace',
  array['Two bedrooms','Private terrace','Breakfast for four','Bathtub','Wi-Fi','Dining table'],
  array[
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1800&q=80',
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=80'
  ],
  true, true, 5
),
(
  'pool-villa',
  'Pool Villa',
  'A small house with its own plunge pool',
  'For the nights you do not want to share the garden with anyone else.',
  'Three Pool Villas sit at the back of the property. Each has a king bedroom, an outdoor shower, and a plunge pool screened by planting. Breakfast can be brought to the terrace. It is Stayora at its most private, and it still includes the same desk, the same kitchen, and a golf cart if you would rather not walk up in the rain.',
  4950, 4, 110, 'King bed', 'Private plunge pool',
  array['Private plunge pool','Outdoor shower','Breakfast for two','King bed','Wi-Fi','Golf-cart pickup'],
  array[
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=80',
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=80'
  ],
  false, false, 6
);

insert into public.stayora_rooms (room_type_id, room_number, floor)
select id, 'G' || n, 1 from public.stayora_room_types, generate_series(1, 8) as n where slug = 'garden-room';

insert into public.stayora_rooms (room_type_id, room_number, floor)
select id, (100 + n)::text, case when n <= 5 then 1 else 2 end
from public.stayora_room_types, generate_series(1, 10) as n where slug = 'premium-room';

insert into public.stayora_rooms (room_type_id, room_number, floor)
select id, (200 + n)::text, 2 from public.stayora_room_types, generate_series(1, 8) as n where slug = 'deluxe-room';

insert into public.stayora_rooms (room_type_id, room_number, floor)
select id, (300 + n)::text, 3 from public.stayora_room_types, generate_series(1, 4) as n where slug = 'executive-suite';

insert into public.stayora_rooms (room_type_id, room_number, floor)
select id, (400 + n)::text, 4 from public.stayora_room_types, generate_series(1, 2) as n where slug = 'ashanti-suite';

insert into public.stayora_rooms (room_type_id, room_number, floor)
select id, 'V' || n, 0 from public.stayora_room_types, generate_series(1, 3) as n where slug = 'pool-villa';

insert into public.stayora_reviews (guest_name, guest_from, rating, quote, stay_label, featured) values
('Efua Boateng', 'Accra', 5, 'A truly elevated hotel experience from start to finish.', 'Premium Room', true),
('Kwame Asante', 'Kumasi', 5, 'I live twenty minutes away and still booked two nights. The courtyard breakfast is the reason.', 'Garden Room', true),
('Abena Owusu', 'London', 5, 'Quiet rooms, cold towels at arrival, and a driver who knew Bonwire without a speech.', 'Executive Suite', true),
('Daniel Mensah', 'Takoradi', 4, 'The deluxe desk was wide enough for a full day of calls. I would only ask for a stronger kettle.', 'Deluxe Room', false),
('Naana Adjei', 'Accra', 5, 'The Ashanti Suite gave the children their own room and us the terrace. We will be back for Christmas.', 'Ashanti Suite', false),
('Yaw Frimpong', 'Kumasi', 5, 'Paid with MTN before I left the office and the desk had my name when I walked in.', 'Premium Room', false),
('Sarah Ampofo', 'Cape Coast', 4, 'Beautiful house. The pool is small, which is exactly what you want when the sun is serious.', 'Pool Villa', false),
('Michael Hammond', 'Toronto', 5, 'I came for a wedding at Manhyia and slept better here than I do at home.', 'Deluxe Room', true);
