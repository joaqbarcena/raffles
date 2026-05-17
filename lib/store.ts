import { v4 as uuidv4 } from "uuid";
import type { Raffle, Participant, CreateRaffleInput, AddParticipantInput } from "./types";
import {
  getAllRaffleIds,
  saveRaffleId,
  deleteRaffleId,
  getRaffle,
  setRaffle,
  removeRaffle,
} from "./kv";

export async function listRaffles(): Promise<Raffle[]> {
  const ids = await getAllRaffleIds();
  const raffles = await Promise.all(
    ids.map(async (id) => {
      const r = await getRaffle<Raffle>(id);
      if (!r) return null;
      if (!r.prizes && (r as any).prize) {
        r.prizes = [(r as any).prize];
      }
      if (!r.soldEmoji) r.soldEmoji = "🎫";
      return r;
    })
  );
  return raffles.filter((r): r is Raffle => r !== null);
}

export async function createRaffle(input: CreateRaffleInput): Promise<Raffle> {
  const raffle: Raffle = {
    id: uuidv4(),
    title: input.title,
    prizes: input.prizes,
    totalNumbers: input.totalNumbers,
    numbersPerRow: input.numbersPerRow,
    createdAt: new Date().toISOString(),
    participants: [],
    prices: input.prices.filter(Boolean),
    paymentAlias: input.paymentAlias,
    disclaimer: input.disclaimer,
    soldEmoji: input.soldEmoji || "🎫",
  };
  await setRaffle(raffle.id, raffle);
  await saveRaffleId(raffle.id);
  return raffle;
}

export async function getRaffleById(id: string): Promise<Raffle | null> {
  const r = await getRaffle<Raffle>(id);
  if (r && !r.prizes && (r as any).prize) {
    r.prizes = [(r as any).prize];
  }
  if (r && !r.soldEmoji) r.soldEmoji = "🎫";
  return r;
}

export async function updateRaffle(
  id: string,
  input: Partial<CreateRaffleInput>
): Promise<Raffle | null> {
  const raffle = await getRaffleById(id);
  if (!raffle) return null;
  const updated: Raffle = {
    ...raffle,
    ...(input.title !== undefined && { title: input.title }),
    ...(input.prizes !== undefined && { prizes: input.prizes }),
    ...(input.totalNumbers !== undefined && { totalNumbers: input.totalNumbers }),
    ...(input.numbersPerRow !== undefined && { numbersPerRow: input.numbersPerRow }),
    ...(input.prices !== undefined && { prices: input.prices }),
    ...(input.paymentAlias !== undefined && { paymentAlias: input.paymentAlias }),
    ...(input.disclaimer !== undefined && { disclaimer: input.disclaimer }),
    ...(input.soldEmoji !== undefined && { soldEmoji: input.soldEmoji }),
  };
  await setRaffle(id, updated);
  return updated;
}

export async function deleteRaffle(id: string): Promise<boolean> {
  const exists = await getRaffleById(id);
  if (!exists) return false;
  await removeRaffle(id);
  await deleteRaffleId(id);
  return true;
}

export async function addParticipant(
  raffleId: string,
  input: AddParticipantInput
): Promise<{ raffle: Raffle | null; error?: string }> {
  const raffle = await getRaffleById(raffleId);
  if (!raffle) return { raffle: null, error: "Rifa no encontrada" };

  const allSoldNumbers = raffle.participants.flatMap((p) => p.numbers);

  for (const num of input.numbers) {
    if (num < 1 || num > raffle.totalNumbers) {
      return {
        raffle: null,
        error: `El número ${num} está fuera del rango (1-${raffle.totalNumbers})`,
      };
    }
    if (allSoldNumbers.includes(num)) {
      return { raffle: null, error: `El número ${num} ya fue vendido` };
    }
  }

  const participant: Participant = {
    id: uuidv4(),
    name: input.name,
    numbers: [...new Set(input.numbers)].sort((a, b) => a - b),
    createdAt: new Date().toISOString(),
  };

  raffle.participants.push(participant);
  await setRaffle(raffleId, raffle);
  return { raffle };
}

export async function removeParticipant(
  raffleId: string,
  participantId: string
): Promise<Raffle | null> {
  const raffle = await getRaffleById(raffleId);
  if (!raffle) return null;

  raffle.participants = raffle.participants.filter((p) => p.id !== participantId);
  await setRaffle(raffleId, raffle);
  return raffle;
}
