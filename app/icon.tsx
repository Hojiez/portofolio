import { ImageResponse } from "next/og";

/* Ikon tab browser: bola logam kecil, senada dengan hero dan Mochi. */

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#08090b",
          borderRadius: 14,
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 9999,
            display: "flex",
            background:
              "radial-gradient(circle at 35% 28%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 32%), linear-gradient(160deg, #e9ecf0 0%, #7b818a 45%, #cfd3d9 70%, #4f545c 100%)",
          }}
        />
      </div>
    ),
    size
  );
}
