import { NextResponse } from "next/server";
import { getRaffleById, updateRaffle, deleteRaffle } from "@/lib/store";
import type { CreateRaffleInput } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const raffle = await getRaffleById(id);
    if (!raffle) {
      return NextResponse.json(
        { error: "Rifa no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json(raffle);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener la rifa" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: Partial<CreateRaffleInput> = await request.json();
    const raffle = await updateRaffle(id, body);
    if (!raffle) {
      return NextResponse.json(
        { error: "Rifa no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json(raffle);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar la rifa" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteRaffle(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Rifa no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar la rifa" },
      { status: 500 }
    );
  }
}
