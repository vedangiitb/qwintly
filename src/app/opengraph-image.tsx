import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background:
            "radial-gradient(circle at 20% 15%, rgba(20,184,166,0.25), transparent 40%), radial-gradient(circle at 85% 85%, rgba(168,85,247,0.25), transparent 45%), linear-gradient(135deg, #020617, #0b1220)",
          color: "#e2e8f0",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial',
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 2, opacity: 0.9 }}>
          QWINTLY
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 72,
            lineHeight: 1.05,
            fontWeight: 800,
          }}
        >
          AI-Powered App Generation
        </div>
        <div style={{ marginTop: 18, fontSize: 28, opacity: 0.9, maxWidth: 920 }}>
          Describe what you want. Qwintly generates a production-ready app with
          modern code.
        </div>
        <div style={{ marginTop: 36, display: "flex", gap: 10 }}>
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              background: "rgba(20,184,166,0.15)",
              border: "1px solid rgba(20,184,166,0.35)",
              fontSize: 18,
            }}
          >
            Next.js
          </div>
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              background: "rgba(168,85,247,0.15)",
              border: "1px solid rgba(168,85,247,0.35)",
              fontSize: 18,
            }}
          >
            Tailwind
          </div>
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              background: "rgba(236,72,153,0.12)",
              border: "1px solid rgba(236,72,153,0.32)",
              fontSize: 18,
            }}
          >
            Deploy-ready
          </div>
        </div>
      </div>
    ),
    size
  );
}

