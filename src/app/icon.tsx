import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          background: "#1c1714",
          color: "#f6f1ea",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 34,
          fontFamily: "Georgia",
          borderRadius: 32,
        }}
      >
        S
      </div>
    ),
    size,
  );
}
