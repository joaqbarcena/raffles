import { NextResponse } from "next/server";
import { listRaffles, createRaffle } from "@/lib/store";
import type { CreateRaffleInput } from "@/lib/types";

export async function GET() {
  try {
    const raffles = await listRaffles();
    return NextResponse.json(raffles);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener las rifas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: CreateRaffleInput = await request.json();

    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "El título es obligatorio" },
        { status: 400 }
      );
    }
    if (!body.prizes || body.prizes.length === 0 || !body.prizes.some((p: string) => p.trim())) {
      return NextResponse.json(
        { error: "Debe haber al menos un premio" },
        { status: 400 }
      );
    }
    if (!body.totalNumbers || body.totalNumbers < 1) {
      return NextResponse.json(
        { error: "La cantidad de números debe ser mayor a 0" },
        { status: 400 }
      );
    }
    if (!body.numbersPerRow || body.numbersPerRow < 1) {
      return NextResponse.json(
        { error: "Los números por fila deben ser mayor a 0" },
        { status: 400 }
      );
    }

    const raffle = await createRaffle(body);
    return NextResponse.json(raffle, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear la rifa" },
      { status: 500 }
    );
  }
}
