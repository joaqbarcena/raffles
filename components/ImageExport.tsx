"use client";

import { useRef } from "react";
import { toPng } from "html-to-image";

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function ImageExport({ title, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  async function handleExport() {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, {
        backgroundColor: "#f8fafc",
        pixelRatio: 2,
        style: { padding: "0" },
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // silent
    }
  }

  return (
    <div>
      <div ref={ref} className="inline-block bg-white">
        {children}
      </div>
      <div className="mt-4 text-center">
        <button
          onClick={handleExport}
          className="rounded-lg bg-green-600 px-5 py-2 text-sm text-white hover:bg-green-700 active:bg-green-800"
        >
          Descargar PNG
        </button>
      </div>
    </div>
  );
}
