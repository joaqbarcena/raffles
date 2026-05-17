"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Raffle } from "@/lib/types";
import NumberGrid from "@/components/NumberGrid";
import ParticipantForm from "@/components/ParticipantForm";
import ParticipantList from "@/components/ParticipantList";
import ImageExport from "@/components/ImageExport";

export default function RaffleDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRaffle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/raffles/${id}`);
      if (res.status === 404) {
        setError("Rifa no encontrada");
        setRaffle(null);
        return;
      }
      if (!res.ok) throw new Error("Error al cargar la rifa");
      setRaffle(await res.json());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) loadRaffle();
  }, [id]);

  async function handleDelete() {
    if (!confirm("¿Eliminar esta rifa? Todos los datos se perderán.")) return;
    try {
      const res = await fetch(`/api/raffles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-sm text-gray-400">Cargando...</p>
      </div>
    );
  }

  if (error && !raffle) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (!raffle) return null;

  const soldNumbers = raffle.participants.flatMap((p) => p.numbers);
  const prizes = raffle.prizes || [(raffle as any).prize].filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:underline"
          >
            &larr; Volver
          </Link>
          <h1 className="mt-1 truncate text-xl font-bold sm:text-2xl">{raffle.title}</h1>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-gray-500">
            {prizes.map((p: string, i: number) => (
              <span key={i}>
                <span className="font-medium">{i + 1}°</span> {p}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="shrink-0 rounded-lg bg-red-100 px-3 py-1.5 text-xs text-red-600 hover:bg-red-200"
        >
          Eliminar
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 overflow-x-auto">
          <ImageExport title={raffle.title}>
            <NumberGrid
              totalNumbers={raffle.totalNumbers}
              numbersPerRow={raffle.numbersPerRow}
              participants={raffle.participants}
              title={raffle.title}
              prizes={prizes}
            />
          </ImageExport>
        </div>

        <div className="w-full shrink-0 space-y-4 lg:w-72">
          <ParticipantForm
            raffleId={id}
            totalNumbers={raffle.totalNumbers}
            soldNumbers={soldNumbers}
            onParticipantAdded={loadRaffle}
          />

          <div>
            <h3 className="mb-2 text-sm font-semibold">
              Participantes ({raffle.participants.length})
            </h3>
            <div className="max-h-80 overflow-y-auto">
              <ParticipantList participants={raffle.participants} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
