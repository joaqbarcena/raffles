import { NextResponse } from "next/server";
import { addParticipant, removeParticipant } from "@/lib/store";
import type { AddParticipantInput } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: AddParticipantInput = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "El nombre del comprador es obligatorio" },
        { status: 400 }
      );
    }
    if (!body.numbers || body.numbers.length === 0) {
      return NextResponse.json(
        { error: "Debe seleccionar al menos un número" },
        { status: 400 }
      );
    }

    const result = await addParticipant(id, body);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result.raffle, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al agregar participante" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { participantId } = await request.json();
    const raffle = await removeParticipant(id, participantId);
    if (!raffle) {
      return NextResponse.json(
        { error: "Rifa o participante no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(raffle);
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar participante" },
      { status: 500 }
    );
  }
}
