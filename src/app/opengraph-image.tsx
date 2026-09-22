import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Wolf Theory";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#ffffff",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/brand/logo.png` : "http://localhost:3000/brand/logo.png"}
          alt="Wolf Theory"
          style={{ width: "600px", height: "auto" }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}

