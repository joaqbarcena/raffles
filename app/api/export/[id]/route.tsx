import { ImageResponse } from "@vercel/og";
import { getRaffleById } from "@/lib/store";
import { loadGoogleFont } from "@/lib/fonts";

export const runtime = "edge";

const TWEMOJI = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg";

function emojiUrl(emoji: string): string {
  const cleaned = emoji.replace(/\uFE0F/g, "");
  const codepoints = Array.from(cleaned).map((ch) =>
    ch.codePointAt(0)!.toString(16)
  );
  return `${TWEMOJI}/${codepoints.join("-")}.svg`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const raffle = await getRaffleById(id);
  if (!raffle) return new Response("Rifa no encontrada", { status: 404 });

  const fontResults = await Promise.allSettled([
    loadGoogleFont("Luckiest Guy", 400),
    loadGoogleFont("Playfair Display", 400),
    loadGoogleFont("Playfair Display", 700),
  ]);
  const fonts = fontResults
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<any>).value);

  const sold = new Set(raffle.participants.flatMap((p) => p.numbers));
  const nums = Array.from({ length: raffle.totalNumbers }, (_, i) => i + 1);
  const gridCols = raffle.numbersPerRow;
  const prizes = raffle.prizes || [(raffle as any).prize].filter(Boolean);
  const selEmoji = raffle.soldEmoji || "🎫";

  const cardInnerW = 572;
  const cellSize = Math.floor((cardInnerW - 12 * (gridCols - 1)) / gridCols);

  const prizeEmojis = ["🥇", "🥈", "🥉"];

  return new ImageResponse(
    (
      <div
        style={{
          width: 800,
          height: 1400,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(180deg, #fffdf8, #fff7f1)",
        }}
      >
        {[
          { w: 340, h: 260, t: -60, l: -120, br: "58% 42% 65% 35% / 45% 54% 46% 55%", rot: "rotate(-12deg)" },
          { w: 300, h: 240, t: 40, r: -140, br: "52% 48% 38% 62% / 51% 41% 59% 49%", rot: "rotate(18deg)" },
          { w: 360, h: 260, b: -120, l: -100, br: "41% 59% 55% 45% / 52% 34% 66% 48%", rot: "rotate(10deg)" },
          { w: 300, h: 220, b: 120, r: -140, br: "62% 48% 47% 53% / 36% 57% 43% 64%", rot: "rotate(-18deg)" },
          { w: 180, h: 140, t: 480, l: -80, br: "60% 40% 50% 50%", rot: "rotate(-25deg)", op: 0.75 },
          { w: 180, h: 140, t: 760, r: -70, br: "45% 55% 38% 62%", rot: "rotate(20deg)", op: 0.75 },
        ].map((b, i) => (
          <div key={i} style={{
            position: "absolute",
            width: b.w,
            height: b.h,
            ...(b.t !== undefined ? { top: b.t } : {}),
            ...(b.b !== undefined ? { bottom: b.b } : {}),
            ...(b.l !== undefined ? { left: b.l } : {}),
            ...(b.r !== undefined ? { right: b.r } : {}),
            borderRadius: b.br,
            transform: b.rot,
            background: "linear-gradient(135deg, #9fc4f0, #c8ddff)",
            filter: "blur(1px)",
            opacity: b.op ?? 1,
          }} />
        ))}

        <div
          style={{
            position: "absolute",
            top: 80,
            left: "50%",
            transform: "translateX(-50%)",
            width: 656,
            height: 1220,
            borderRadius: 36,
            backgroundColor: "rgba(255,255,255,0.85)",
            padding: "42px 42px 36px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ fontFamily: "Luckiest Guy", fontSize: 58, lineHeight: 1, textAlign: "center", color: "#1b1b1b", marginBottom: 10, letterSpacing: 2 }}>
            {raffle.title}
          </div>

          <div style={{ fontFamily: "Playfair Display", fontSize: 24, color: "#555", marginBottom: 26, textAlign: "center", fontWeight: 400 }}>
            Sorteamos
          </div>

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16, marginBottom: 26 }}>
            {prizes.map((p: string, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 20, padding: "18px 24px", fontSize: 24, fontWeight: 700, color: "#222", fontFamily: "Playfair Display" }}>
                {i < 3 ? (
                  <img src={emojiUrl(prizeEmojis[i])} width={32} height={32} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#e5e5e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#666" }}>{i + 1}</div>
                )}
                <span>{p}</span>
              </div>
            ))}
          </div>

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
            {Array.from({ length: Math.ceil(nums.length / gridCols) }, (_, rowIdx) => (
              <div key={rowIdx} style={{ display: "flex", gap: 12, width: "100%" }}>
                {nums.slice(rowIdx * gridCols, (rowIdx + 1) * gridCols).map((num) => (
                  <div key={num} style={{ width: cellSize, height: cellSize, flexShrink: 0, backgroundColor: sold.has(num) ? "rgba(220,252,231,0.7)" : "white", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: gridCols > 8 ? 16 : 24, color: sold.has(num) ? "#166534" : "#333", border: sold.has(num) ? "2px solid #22c55e" : "2px solid rgba(0,0,0,0.05)" }}>
                    {sold.has(num) ? (
                      <img src={emojiUrl(selEmoji)} width={cellSize * 0.6} height={cellSize * 0.6} />
                    ) : (
                      num
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ width: "100%", display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap", marginBottom: 28 }}>
            {raffle.prices.map((p: string, i: number) => (
              <div key={i} style={{ background: "linear-gradient(135deg, #111, #2b2b2b)", color: "white", padding: "14px 24px", borderRadius: 18, fontSize: 22, fontWeight: 700 }}>
                {p}
              </div>
            ))}
          </div>

          <div style={{ marginTop: "auto", width: "100%", display: "flex", flexDirection: "column", gap: 18 }}>
            {raffle.paymentAlias && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#111", color: "white", padding: 18, borderRadius: 18, fontSize: 22, fontWeight: 700 }}>
                {`Alias: ${raffle.paymentAlias}`}
              </div>
            )}
            {raffle.disclaimer && (
              <div style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
                {raffle.disclaimer}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      width: 800,
      height: 1400,
      fonts,
    }
  );
}
