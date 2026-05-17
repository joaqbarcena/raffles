"use client";

import { useState } from "react";

interface Props {
  raffleId: string;
  title: string;
}

export default function ImageExport({ raffleId, title }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/export/${raffleId}`);
      if (!res.ok) throw new Error("Error al generar la imagen");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = title.replace(/\s+/g, "-").toLowerCase();
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 text-center">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm text-white hover:bg-green-700 active:bg-green-800 disabled:cursor-wait disabled:opacity-60"
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {loading ? "Generando..." : "Descargar PNG"}
      </button>
    </div>
  );
}
