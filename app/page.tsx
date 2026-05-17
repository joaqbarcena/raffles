"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Raffle } from "@/lib/types";
import CreateRaffleForm from "@/components/CreateRaffleForm";

export default function Dashboard() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  async function loadRaffles() {
    setLoading(true);
    try {
      const res = await fetch("/api/raffles");
      if (!res.ok) throw new Error("Error al cargar rifas");
      setRaffles(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRaffles();
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis Rifas</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Nueva Rifa
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : raffles.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <p className="text-gray-400">No hay rifas todavía</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 text-sm text-blue-600 hover:underline"
          >
            Crear la primera
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {raffles.map((r) => {
            const soldCount = r.participants.reduce(
              (acc, p) => acc + p.numbers.length,
              0
            );
            return (
              <Link
                key={r.id}
                href={`/rifa/${r.id}`}
                className="block rounded-xl bg-white p-4 shadow transition hover:shadow-md"
              >
                <h2 className="font-semibold">{r.title}</h2>
                <p className="text-sm text-gray-500">Premio: {r.prize}</p>
                <div className="mt-1 text-xs text-gray-400">
                  {soldCount}/{r.totalNumbers} números vendidos —{" "}
                  {r.participants.length} participantes
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showForm && (
        <CreateRaffleForm
          onCreated={() => {
            setShowForm(false);
            loadRaffles();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
