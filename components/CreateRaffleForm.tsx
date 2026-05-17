"use client";

import { useState, type FormEvent } from "react";
import type { CreateRaffleInput } from "@/lib/types";

interface Props {
  onCreated: () => void;
  onCancel: () => void;
}

export default function CreateRaffleForm({ onCreated, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [prizes, setPrizes] = useState([""]);
  const [totalNumbers, setTotalNumbers] = useState(100);
  const [numbersPerRow, setNumbersPerRow] = useState(10);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updatePrize(index: number, value: string) {
    const next = [...prizes];
    next[index] = value;
    setPrizes(next);
  }

  function addPrize() {
    setPrizes([...prizes, ""]);
  }

  function removePrize(index: number) {
    if (prizes.length <= 1) return;
    setPrizes(prizes.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("El título es obligatorio");
      return;
    }
    const filledPrizes = prizes.map((p) => p.trim()).filter(Boolean);
    if (filledPrizes.length === 0) {
      setError("Debe haber al menos un premio");
      return;
    }

    setSaving(true);
    try {
      const body: CreateRaffleInput = {
        title: title.trim(),
        prizes: filledPrizes,
        totalNumbers,
        numbersPerRow,
      };
      const res = await fetch("/api/raffles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear la rifa");
      }
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
      >
        <h2 className="mb-4 text-lg font-semibold">Nueva Rifa</h2>

        {error && (
          <p className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium">Título</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Rifa del 20 de Mayo"
          />
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium">Premios</label>
          <div className="space-y-2">
            {prizes.map((p, i) => (
              <div key={i} className="flex gap-2">
                <span className="flex items-center text-xs text-gray-400 w-6 shrink-0">
                  #{i + 1}
                </span>
                <input
                  className="flex-1 rounded-lg border px-3 py-2 text-sm"
                  value={p}
                  onChange={(e) => updatePrize(i, e.target.value)}
                  placeholder={i === 0 ? "TV LED 50\"" : i === 1 ? "Parlante Bluetooth" : i === 2 ? "Peluche" : `Premio #${i + 1}`}
                />
                {prizes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePrize(i)}
                    className="text-red-400 hover:text-red-600 text-sm px-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addPrize}
            className="mt-1.5 text-xs text-blue-600 hover:underline"
          >
            + Agregar otro premio
          </button>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Total números
            </label>
            <input
              type="number"
              min={1}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={totalNumbers}
              onChange={(e) => setTotalNumbers(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Números por fila
            </label>
            <input
              type="number"
              min={1}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={numbersPerRow}
              onChange={(e) => setNumbersPerRow(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Crear Rifa"}
          </button>
        </div>
      </form>
    </div>
  );
}
