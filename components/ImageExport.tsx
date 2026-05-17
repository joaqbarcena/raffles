"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { toPng } from "html-to-image";
import type { Participant } from "@/lib/types";

interface Props {
  title: string;
  prizes: string[];
  totalNumbers: number;
  numbersPerRow: number;
  participants: Participant[];
  prices: string[];
  paymentAlias: string;
  disclaimer: string;
  soldEmoji: string;
}

export default function ImageExport({
  title,
  prizes,
  totalNumbers,
  numbersPerRow,
  participants,
  prices,
  paymentAlias,
  disclaimer,
  soldEmoji,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [rendering, setRendering] = useState(false);

  const soldNumbers = new Map<number, string>();
  for (const p of participants) {
    for (const n of p.numbers) {
      soldNumbers.set(n, p.name);
    }
  }

  const numbers = Array.from({ length: totalNumbers }, (_, i) => i + 1);
  const gridCols = numbersPerRow;

  const doExport = useCallback(async () => {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, {
        backgroundColor: "#e5e5e5",
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // silent
    } finally {
      setRendering(false);
    }
  }, [title]);

  useEffect(() => {
    if (rendering) {
      setTimeout(() => doExport(), 300);
    }
  }, [rendering, doExport]);

  function handleExport() {
    setRendering(true);
  }

  const flyer = (
    <div
      ref={ref}
      style={{
        width: 800,
        height: 1400,
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(180deg, #fffdf8 0%, #fff7f1 100%)",
        borderRadius: 36,
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        border: "10px solid rgba(255,255,255,0.7)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Playfair+Display:wght@400;700&display=swap');
        .flyer-title { font-family: 'Luckiest Guy', cursive; }
        .flyer-subtitle { font-family: 'Playfair Display', serif; }
      `}</style>

      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
          opacity: 0.25,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <Blob style={{ width: 340, height: 260, top: -60, left: -120, borderRadius: "58% 42% 65% 35% / 45% 54% 46% 55%", transform: "rotate(-12deg)" }} />
      <Blob style={{ width: 300, height: 240, top: 40, right: -140, borderRadius: "52% 48% 38% 62% / 51% 41% 59% 49%", transform: "rotate(18deg)" }} />
      <Blob style={{ width: 360, height: 260, bottom: -120, left: -100, borderRadius: "41% 59% 55% 45% / 52% 34% 66% 48%", transform: "rotate(10deg)" }} />
      <Blob style={{ width: 300, height: 220, bottom: 120, right: -140, borderRadius: "62% 48% 47% 53% / 36% 57% 43% 64%", transform: "rotate(-18deg)" }} />
      <Blob style={{ width: 180, height: 140, left: -80, top: 480, borderRadius: "60% 40% 50% 50%", opacity: 0.75, transform: "rotate(-25deg)" }} />
      <Blob style={{ width: 180, height: 140, right: -70, top: 760, borderRadius: "45% 55% 38% 62%", opacity: 0.75, transform: "rotate(20deg)" }} />

      <div
        style={{
          position: "absolute",
          top: 80,
          left: "50%",
          transform: "translateX(-50%)",
          width: "82%",
          minHeight: 1220,
          borderRadius: 36,
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(8px)",
          boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.5), 0 10px 30px rgba(0,0,0,0.06)",
          padding: 42,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        <h1
          className="flyer-title"
          style={{ fontSize: 58, lineHeight: 1, textAlign: "center", color: "#1b1b1b", marginBottom: 10, letterSpacing: 2, wordBreak: "break-word" }}
        >
          {title}
        </h1>

        <p className="flyer-subtitle" style={{ fontSize: 24, color: "#555", marginBottom: 26, textAlign: "center" }}>
          Sorteamos
        </p>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16, marginBottom: 26 }}>
          {prizes.map((p, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.9)", borderRadius: 20, padding: "18px 24px", fontSize: 24, fontWeight: 700, color: "#222", boxShadow: "0 5px 14px rgba(0,0,0,0.06)", border: "2px solid rgba(0,0,0,0.04)" }}>
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`} {i + 1}° Premio — {p}
            </div>
          ))}
        </div>

        <div style={{ width: "100%", display: "grid", gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: 12, marginBottom: 40 }}>
          {numbers.map((num) => {
            const sold = soldNumbers.has(num);
            return (
              <div key={num} style={{ aspectRatio: "1", background: sold ? "rgba(220,252,231,0.7)" : "white", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: gridCols > 8 ? 16 : 24, color: sold ? "#166534" : "#333", boxShadow: "0 4px 10px rgba(0,0,0,0.05)", border: sold ? "2px solid #22c55e" : "2px solid rgba(0,0,0,0.05)", position: "relative" }}>
                {num}
                {sold && <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: gridCols > 8 ? 22 : 32, background: "rgba(220,252,231,0.7)", borderRadius: 14 }}>{soldEmoji}</span>}
              </div>
            );
          })}
        </div>

        <div style={{ width: "100%", display: "flex", justifyContent: "center", gap: 18, marginBottom: 28, flexWrap: "wrap" }}>
          {prices.map((p, i) => (
            <div key={i} style={{ background: "linear-gradient(135deg, #111, #2b2b2b)", color: "white", padding: "14px 24px", borderRadius: 18, fontSize: 22, fontWeight: 700, boxShadow: "0 8px 18px rgba(0,0,0,0.12)", letterSpacing: "0.5px" }}>
              {p}
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto", width: "100%", display: "flex", flexDirection: "column", gap: 18 }}>
          {paymentAlias && (
            <div style={{ background: "#111", color: "white", padding: 18, borderRadius: 18, textAlign: "center", fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>
              Alias: {paymentAlias}
            </div>
          )}
          {disclaimer && (
            <div style={{ fontSize: 16, lineHeight: 1.5, textAlign: "center", color: "#666", padding: "0 10px" }}>
              {disclaimer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mt-4 text-center">
        <button
          onClick={handleExport}
          className="rounded-lg bg-green-600 px-5 py-2 text-sm text-white hover:bg-green-700 active:bg-green-800"
        >
          Descargar PNG
        </button>
      </div>

      {rendering && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#e5e5e5",
          }}
        >
          {flyer}
        </div>
      )}
    </div>
  );
}

function Blob({ style }: { style: React.CSSProperties }) {
  return (
    <div
      style={{
        position: "absolute",
        background: "linear-gradient(135deg, #9fc4f0, #c8ddff)",
        filter: "blur(1px)",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -18,
          border: "6px solid #ffb7c5",
          borderRadius: "50%",
          opacity: 0.8,
        }}
      />
    </div>
  );
}
