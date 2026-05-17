"use client";

import { forwardRef } from "react";
import type { Participant } from "@/lib/types";

interface Props {
  totalNumbers: number;
  numbersPerRow: number;
  participants: Participant[];
  title: string;
  prize: string;
}

const NumberGrid = forwardRef<HTMLDivElement, Props>(
  ({ totalNumbers, numbersPerRow, participants, title, prize }, ref) => {
    const soldNumbers = new Map<number, string>();
    for (const p of participants) {
      for (const n of p.numbers) {
        soldNumbers.set(n, p.name);
      }
    }

    const numbers = Array.from({ length: totalNumbers }, (_, i) => i + 1);
    const rows: number[][] = [];
    for (let i = 0; i < numbers.length; i += numbersPerRow) {
      rows.push(numbers.slice(i, i + numbersPerRow));
    }

    return (
      <div ref={ref} className="inline-block rounded-xl bg-white p-6 shadow">
        <div className="mb-4 text-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm text-gray-500">Premio: {prize}</p>
        </div>
        <div className="inline-grid gap-1.5" style={{ gridTemplateColumns: `repeat(${numbersPerRow}, 52px)` }}>
          {numbers.map((num) => {
            const buyer = soldNumbers.get(num);
            const sold = buyer !== undefined;
            return (
              <div
                key={num}
                title={sold ? `Vendido a: ${buyer}` : `Disponible`}
                className={`relative flex h-12 w-12 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                  sold
                    ? "bg-green-100 text-green-700 ring-1 ring-green-400"
                    : "bg-gray-50 text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100"
                }`}
              >
                {num}
                {sold && (
                  <span className="absolute -right-1 -top-1 text-xs">✅</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-400">
          <span>🟢 Vendido</span>
          <span>⬜ Disponible</span>
        </div>
      </div>
    );
  }
);

NumberGrid.displayName = "NumberGrid";
export default NumberGrid;
