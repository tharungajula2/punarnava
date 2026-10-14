import { ImageResponse } from "next/og";

// Link preview for WhatsApp, LinkedIn, X, Slack… Generated once at build time.
export const alt = "Punarnava — plastic that becomes new again. A planned Bengaluru plant for traceable recycled HDPE pellets.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand tokens from globals.css, as hex (satori doesn't read CSS variables).
const PAPER = "#f9f6f0";
const INK = "#1b2224";
const TEAL = "#1f6b6b";
const TEAL_DEEP = "#173f43";
const MINT = "#5cc6a0";
const SAND = "#efe3cc";

const TITLE_1 = "Plastic that becomes";
const TITLE_2 = "new again.";
const WORDMARK = "Punarnava";
const BODY = "A planned Bengaluru plant turning post-consumer rigid plastic into traceable recycled HDPE pellets.";
const STAGES = ["Collect", "Sort", "Wash", "Extrude", "Pellet"];

/** Brand fonts from Google Fonts at build time (subset to the text used); bundled sans if offline. */
async function loadFont(family: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`)
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

function Mark({ size: s }: { size: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <circle
        cx="16"
        cy="16"
        r="11"
        fill="none"
        stroke={TEAL}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="56 100"
        transform="rotate(-50 16 16)"
      />
      <circle cx="17.15" cy="5.06" r="2.6" fill={MINT} />
    </svg>
  );
}

export default async function Image() {
  const [fraunces, inter] = await Promise.all([
    loadFont("Fraunces:opsz,wght@144,500", TITLE_1 + TITLE_2 + WORDMARK),
    loadFont("Inter:wght@400", BODY + STAGES.join("")),
  ]);
  const display = fraunces ? "Fraunces" : "sans-serif";
  const sans = inter ? "Inter" : "sans-serif";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: PAPER, color: INK }}>
        {/* Left: message */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 0 64px 72px", width: 760 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Mark size={64} />
            <div style={{ fontFamily: display, fontSize: 44, letterSpacing: -1 }}>{WORDMARK}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", fontFamily: display, fontSize: 80, lineHeight: 1.04, letterSpacing: -2 }}>
              <div style={{ color: TEAL_DEEP }}>{TITLE_1}</div>
              <div style={{ color: TEAL }}>{TITLE_2}</div>
            </div>
            <div style={{ fontFamily: sans, fontSize: 28, lineHeight: 1.4, color: "#4d5a5e", maxWidth: 620 }}>{BODY}</div>
          </div>
          <div style={{ display: "flex", gap: 12, fontFamily: sans, fontSize: 22, color: TEAL_DEEP }}>
            {STAGES.map((s) => (
              <div key={s} style={{ display: "flex", padding: "8px 18px", borderRadius: 999, background: SAND }}>
                {s}
              </div>
            ))}
          </div>
        </div>
        {/* Right: big loop mark on a teal panel */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", margin: 32, borderRadius: 40, background: TEAL_DEEP }}>
          <svg width={300} height={300} viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="11" fill="none" stroke={PAPER} strokeOpacity="0.92" strokeWidth="3" strokeLinecap="round" strokeDasharray="56 100" transform="rotate(-50 16 16)" />
            <circle cx="17.15" cy="5.06" r="2.4" fill={MINT} />
          </svg>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(fraunces ? [{ name: "Fraunces", data: fraunces, style: "normal" as const, weight: 500 as const }] : []),
        ...(inter ? [{ name: "Inter", data: inter, style: "normal" as const, weight: 400 as const }] : []),
      ],
    },
  );
}
