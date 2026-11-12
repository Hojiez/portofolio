import { ImageResponse } from "next/og";
import { SITE } from "@/content/site";

/*
 * Gambar pratinjau saat link situs dibagikan (WhatsApp, LinkedIn, X, dll.).
 * Dibuat otomatis saat build dari data di content/site.ts, dengan gaya gelap
 * metalik yang sama dengan situs.
 */

export const alt = `${SITE.name} — ${SITE.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 96px",
          background: "radial-gradient(ellipse 80% 60% at 30% 0%, #23262c 0%, #08090b 70%)",
          color: "#e7e9ec",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 700 }}>
          <div style={{ fontSize: 26, color: "#8fd8ff", letterSpacing: 2 }}>{`~/${SITE.shortName.toLowerCase()}`}</div>
          <div
            style={{
              marginTop: 24,
              fontSize: 84,
              fontWeight: 700,
              lineHeight: 1.05,
              backgroundImage: "linear-gradient(180deg, #f2f4f7 0%, #d4d8de 40%, #9aa0a9 70%, #c3c8cf 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {SITE.name}
          </div>
          <div style={{ marginTop: 28, fontSize: 34, color: "#8b9099" }}>{SITE.role}</div>
          <div style={{ marginTop: 10, fontSize: 26, color: "#8b9099" }}>{SITE.location}</div>
        </div>

        {/* bola logam, senada dengan hero dan Mochi */}
        <div
          style={{
            width: 300,
            height: 300,
            borderRadius: 9999,
            display: "flex",
            background:
              "radial-gradient(circle at 35% 28%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 30%), linear-gradient(160deg, #e9ecf0 0%, #7b818a 45%, #cfd3d9 70%, #4f545c 100%)",
            boxShadow: "inset 0 0 60px rgba(0,0,0,0.55), 0 40px 90px rgba(0,0,0,0.8)",
          }}
        />
      </div>
    ),
    size
  );
}
