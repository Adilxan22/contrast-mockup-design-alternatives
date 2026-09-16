import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Auto-picked up by Next.js as the og:image for every page that doesn't
// define its own — link previews (WhatsApp/Telegram/iMessage/etc.) were
// showing a bare default favicon with no card at all before this existed.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#241e15",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: "3px solid #c79a5b",
            color: "#c79a5b",
            fontSize: 64,
            marginBottom: 36,
          }}
        >
          C
        </div>
        <div style={{ display: "flex", color: "#f5f1e8", fontSize: 72, letterSpacing: 4 }}>CONTRAST</div>
        <div style={{ display: "flex", color: "#c79a5b", fontSize: 30, marginTop: 18, letterSpacing: 2 }}>
          Магазин + лаундж · Astana
        </div>
      </div>
    ),
    { ...size }
  );
}
