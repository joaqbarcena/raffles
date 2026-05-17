"use client";

import { forwardRef } from "react";
import type { Participant } from "@/lib/types";

interface Props {
  totalNumbers: number;
  numbersPerRow: number;
  participants: Participant[];
  soldEmoji: string;
}

const NumberGrid = forwardRef<HTMLDivElement, Props>(
  ({ totalNumbers, numbersPerRow, participants, soldEmoji }, ref) => {
    const soldNumbers = new Map<number, string>();
    for (const p of participants) {
      for (const n of p.numbers) {
        soldNumbers.set(n, p.name);
      }
    }

    const numbers = Array.from({ length: totalNumbers }, (_, i) => i + 1);

    return (
      <div ref={ref} className="inline-block rounded-2xl bg-white shadow-lg">
        <div className="p-3 sm:p-5">
          <div
            className="mx-auto inline-grid gap-1 sm:gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${numbersPerRow}, minmax(28px, 48px))`,
            }}
          >
            {numbers.map((num) => {
              const buyer = soldNumbers.get(num);
              const sold = buyer !== undefined;
              return (
                <div
                  key={num}
                  title={sold ? `Vendido a: ${buyer}` : "Disponible"}
                  className={`relative flex aspect-square items-center justify-center rounded-md text-[10px] font-semibold leading-none transition-colors sm:text-sm ${
                    sold
                      ? "bg-green-100 text-green-700 ring-1 ring-green-400"
                      : "bg-gray-50 text-gray-700 ring-1 ring-gray-200"
                  }`}
                >
                  {num}
                  {sold && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-md bg-green-100 text-xs sm:text-base">
                      {soldEmoji}
                    </span>
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
      </div>
    );
  }
);

NumberGrid.displayName = "NumberGrid";
export default NumberGrid;
