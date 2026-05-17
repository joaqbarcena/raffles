"use client";

import type { Participant } from "@/lib/types";

interface Props {
  participants: Participant[];
}

export default function ParticipantList({ participants }: Props) {
  if (participants.length === 0) {
    return (
      <p className="text-sm text-gray-400">No hay participantes aún</p>
    );
  }

  return (
    <ul className="space-y-2">
      {participants.map((p) => (
        <li
          key={p.id}
          className="rounded-lg bg-white px-3 py-2 text-sm shadow"
        >
          <span className="font-medium">{p.name}</span>
          <span className="ml-2 text-gray-400">
            — {p.numbers.join(", ")}
          </span>
        </li>
      ))}
    </ul>
  );
}
