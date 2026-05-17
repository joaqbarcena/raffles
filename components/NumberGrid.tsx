"use client";

import { forwardRef } from "react";
import type { Participant } from "@/lib/types";

interface Props {
  totalNumbers: number;
  numbersPerRow: number;
  participants: Participant[];
  title: string;
  prizes: string[];
}

const NumberGrid = forwardRef<HTMLDivElement, Props>(
  ({ totalNumbers, numbersPerRow, participants, title, prizes }, ref) => {
    const soldNumbers = new Map<number, string>();
    for (const p of participants) {
      for (const n of p.numbers) {
        soldNumbers.set(n, p.name);
      }
    }

    const numbers = Array.from({ length: totalNumbers }, (_, i) => i + 1);

    return (
      <div ref={ref} className="inline-block w-full max-w-full overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 px-6 py-5 text-center text-white sm:px-8 sm:py-6">
          <h2 className="text-lg font-extrabold tracking-tight sm:text-2xl">{title}</h2>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm sm:text-base">
            {prizes.map((p, i) => (
              <span key={i}>
                <span className="font-semibold text-yellow-300">
                  {i + 1}°{i === 0 ? "r" : i === 1 ? "d" : i === 2 ? "r" : "°"}{" "}
                </span>
                {p}
              </span>
            ))}
          </div>
        </div>

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
                    <span className="absolute -right-0.5 -top-0.5 text-[8px] sm:text-xs">
                      ✅
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
