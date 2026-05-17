"use client";

import { useState, type FormEvent } from "react";
import type { AddParticipantInput } from "@/lib/types";

interface Props {
  raffleId: string;
  totalNumbers: number;
  soldNumbers: number[];
  onParticipantAdded: () => void;
}

export default function ParticipantForm({
  raffleId,
  totalNumbers,
  soldNumbers,
  onParticipantAdded,
}: Props) {
  const [name, setName] = useState("");
  const [numbersInput, setNumbersInput] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("El nombre del comprador es obligatorio");
      return;
    }

    const rawNumbers = numbersInput
      .split(/[,;\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    if (rawNumbers.length === 0) {
      setError("Ingrese al menos un número válido");
      return;
    }

    for (const num of rawNumbers) {
      if (num < 1 || num > totalNumbers) {
        setError(`El número ${num} está fuera del rango (1-${totalNumbers})`);
        return;
      }
      if (soldNumbers.includes(num)) {
        setError(`El número ${num} ya fue vendido`);
        return;
      }
    }

    setSaving(true);
    try {
      const body: AddParticipantInput = {
        name: trimmedName,
        numbers: rawNumbers,
      };
      const res = await fetch(`/api/raffles/${raffleId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al agregar participante");
      }
      setName("");
      setNumbersInput("");
      onParticipantAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-white p-4 shadow">
      <h3 className="mb-3 text-sm font-semibold">Agregar Comprador</h3>

      {error && (
        <p className="mb-2 rounded-md bg-red-50 p-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mb-3">
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Nombre
        </label>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del comprador"
        />
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Números (separados por coma)
        </label>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          value={numbersInput}
          onChange={(e) => setNumbersInput(e.target.value)}
          placeholder="5, 12, 33"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Agregar"}
      </button>
    </form>
  );
}
