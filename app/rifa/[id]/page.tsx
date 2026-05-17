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
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-sm text-gray-400">Cargando...</p>
      </div>
    );
  }

  if (error && !raffle) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
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
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1 overflow-x-auto">
          <NumberGrid
            totalNumbers={raffle.totalNumbers}
            numbersPerRow={raffle.numbersPerRow}
            participants={raffle.participants}
            soldEmoji={raffle.soldEmoji}
          />
        </div>

        <div className="w-full shrink-0 space-y-4 lg:w-80">
          <div className="flex items-start justify-between">
            <div>
              <Link href="/" className="text-sm text-blue-600 hover:underline">
                &larr; Volver
              </Link>
              <h1 className="mt-1 text-xl font-bold sm:text-2xl">{raffle.title}</h1>
            </div>
            <button
              onClick={handleDelete}
              className="shrink-0 rounded-lg bg-red-100 px-3 py-1.5 text-xs text-red-600 hover:bg-red-200"
            >
              Eliminar
            </button>
          </div>

          {error && (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="rounded-xl bg-white p-4 shadow">
            <h2 className="mb-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Premios
            </h2>
            <div className="space-y-2">
              {prizes.map((p: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                    {i + 1}
                  </span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow">
            <h2 className="mb-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Emoji de vendido
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {["🎫", "❌", "🔴", "🟢", "🎟️", "🚫", "🧑‍🤝‍🧑", "🙋", "💸", "🏆"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={async () => {
                    setRaffle({ ...raffle, soldEmoji: emoji });
                    await fetch(`/api/raffles/${id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ soldEmoji: emoji }),
                    });
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-colors ${
                    raffle.soldEmoji === emoji
                      ? "bg-blue-100 ring-2 ring-blue-500"
                      : "bg-gray-50 hover:bg-gray-100 ring-1 ring-gray-200"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <ImageExport
            title={raffle.title}
            prizes={prizes}
            totalNumbers={raffle.totalNumbers}
            numbersPerRow={raffle.numbersPerRow}
            participants={raffle.participants}
            prices={raffle.prices || []}
            paymentAlias={raffle.paymentAlias || ""}
            disclaimer={raffle.disclaimer || ""}
            soldEmoji={raffle.soldEmoji}
          />

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
