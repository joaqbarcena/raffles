import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  listRaffles,
  getRaffleById,
  addParticipant,
} from "./store";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `Sos un asistente para gestionar rifas. Respondé siempre en español, de forma clara y concisa.

PODÉS hacer:
- Listar rifas activas
- Ver detalle de una rifa (premios, precios, alias de pago, números vendidos y disponibles)
- Consultar números disponibles
- Comprar números para un participante (sin pedir confirmación)

NO PODÉS:
- Crear ni eliminar rifas
- Modificar datos existentes
- Borrar participantes

Reglas:
- Cuando comprés números, anunciá claramente qué números se compraron y para quién.
- Si algún número ya está vendido, informalo.
- Después de una compra exitosa mencioná siempre el alias de pago si existe.
- Si no entendés qué rifa (cuando hay más de una), preguntá cuál.
- Usá bullet points para listar.`;

const TOOLS: any = {
  functionDeclarations: [
    {
      name: "listarRifas",
      description: "Obtiene la lista de todas las rifas activas",
      parameters: { type: "object", properties: {} },
    },
    {
      name: "verRifa",
      description: "Obtiene el detalle completo de una rifa",
      parameters: {
        type: "object",
        properties: {
          raffleId: { type: "string", description: "ID de la rifa" },
        },
        required: ["raffleId"],
      },
    },
    {
      name: "numerosDisponibles",
      description: "Obtiene la lista de números disponibles de una rifa",
      parameters: {
        type: "object",
        properties: {
          raffleId: { type: "string", description: "ID de la rifa" },
        },
        required: ["raffleId"],
      },
    },
    {
      name: "comprarNumeros",
      description:
        "Compra números para un participante. Valida disponibilidad y rango.",
      parameters: {
        type: "object",
        properties: {
          raffleId: { type: "string", description: "ID de la rifa" },
          nombre: { type: "string", description: "Nombre del comprador" },
          numeros: {
            type: "array",
            items: { type: "number" },
            description: "Números a comprar",
          },
        },
        required: ["raffleId", "nombre", "numeros"],
      },
    },
  ],
};

async function execTool(name: string, args: any): Promise<object> {
  switch (name) {
    case "listarRifas": {
      const raffles = await listRaffles();
      if (raffles.length === 0) return { mensaje: "No hay rifas activas" };
      return {
        rifas: raffles.map((r: any) => ({
          id: r.id,
          titulo: r.title,
          premios: r.prizes,
          precios: r.prices,
          alias: r.paymentAlias,
          vendidos: r.participants.flatMap((p: any) => p.numbers).length,
          total: r.totalNumbers,
        })),
      };
    }

    case "verRifa": {
      const r = await getRaffleById(args.raffleId);
      if (!r) return { error: "Rifa no encontrada" };
      return {
        titulo: r.title,
        premios: r.prizes,
        precios: r.prices,
        alias: r.paymentAlias,
        disclaimer: r.disclaimer,
        totalNumeros: r.totalNumbers,
        participantes: r.participants.map((p) => ({
          nombre: p.name,
          numeros: p.numbers,
        })),
      };
    }

    case "numerosDisponibles": {
      const r = await getRaffleById(args.raffleId);
      if (!r) return { error: "Rifa no encontrada" };
      const sold = new Set(r.participants.flatMap((p) => p.numbers));
      const disponibles = Array.from(
        { length: r.totalNumbers },
        (_, i) => i + 1
      ).filter((n) => !sold.has(n));
      return {
        titulo: r.title,
        total: r.totalNumbers,
        vendidos: sold.size,
        disponibles,
        cantidadDisponibles: disponibles.length,
      };
    }

    case "comprarNumeros": {
      const result = await addParticipant(args.raffleId, {
        name: args.nombre,
        numbers: args.numeros,
      });
      if (result.error) return { error: result.error };
      return {
        exito: true,
        comprador: args.nombre,
        numeros: args.numeros,
        alias: result.raffle!.paymentAlias,
        titulo: result.raffle!.title,
      };
    }

    default:
      return { error: `Tool desconocido: ${name}` };
  }
}

export async function handleChat(
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
    tools: [TOOLS],
  });

  const contents: any[] = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  const result = await model.generateContent({ contents });
  const response = result.response;
  const calls = response.functionCalls?.();

  if (calls && calls.length > 0) {
    for (const call of calls) {
      const data = await execTool(call.name, call.args);
      contents.push({
        role: "model",
        parts: [{ functionCall: { name: call.name, args: call.args } }],
      });
      contents.push({
        role: "function",
        parts: [{ functionResponse: { name: call.name, response: data } }],
      });
    }

    const finalResult = await model.generateContent({ contents });
    return finalResult.response.text();
  }

  return response.text();
}
