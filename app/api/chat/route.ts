import { NextResponse } from "next/server";
import { handleChat } from "@/lib/chat";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (
      !messages ||
      !Array.isArray(messages) ||
      messages.length === 0
    ) {
      return NextResponse.json(
        { error: "messages es requerido" },
        { status: 400 }
      );
    }

    const reply = await handleChat(messages);
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "Error al procesar el mensaje" },
      { status: 500 }
    );
  }
}
