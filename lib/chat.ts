import {
  listRaffles,
  getRaffleById,
  addParticipant,
} from "./store";

const NVIDIA_BASE = "https://integrate.api.nvidia.com/v1";
const MODEL = "meta/llama-3.1-8b-instruct";

async function resolveRaffleId(nombre?: string, raffleId?: string): Promise<{ id: string; auto?: boolean } | { error: string } | { opciones: { id: string; titulo: string }[] }> {
  if (raffleId) {
    const r = await getRaffleById(raffleId);
    if (r) return { id: raffleId };
  }
  const raffles = await listRaffles();
  if (nombre) {
    const words = nombre.toLowerCase().split(/\s+/).filter((w) => !["la","el","los","las","de","del","en","para","una","un","rifa"].includes(w));
    const match = raffles.filter((r) => {
      const title = r.title.toLowerCase();
      return words.every((w) => title.includes(w));
    });
    if (match.length === 1) return { id: match[0].id };
    if (match.length > 1) return { opciones: match.map((r: any) => ({ id: r.id, titulo: r.title })) };
    if (raffles.length === 1) return { id: raffles[0].id, auto: true };
    return { error: `No encontré ninguna rifa con "${nombre}". Las rifas disponibles son: ${raffles.map((r: any) => r.title).join(", ")}` };
  }
  if (raffles.length === 1) return { id: raffles[0].id, auto: true };
  return { error: "No especificaste qué rifa" };
}

const SYSTEM = `Sos un asistente para gestionar rifas. Respondé siempre en español.

Usá las herramientas disponibles. Cuando el usuario pida:

- comprar números: llamá a comprarNumeros con los datos que te dé. Si no dice en qué rifa, no pongas nombreRifa.
- ver números disponibles: llamá a numerosDisponibles
- ver detalle de una rifa: llamá a verRifa
- listar o saludar: llamá a listarRifas
- otra cosa: llamá a listarRifas

Reglas:
- Respondé natural, sin enumerar JSON
- Si el tool devuelve "auto: true", avisá al usuario que se usó la única rifa disponible
- Si el tool devuelve opciones, preguntá cuál quiere
- Cuando se compran números, mencioná cuáles y para quién. El alias de pago viene en el resultado del tool.`;

const TOOLS: any = [
  {
    type: "function",
    function: {
      name: "listarRifas",
      description: "Obtiene la lista de todas las rifas activas",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "verRifa",
      description: "Obtiene el detalle completo de una rifa. Pasá el nombre exacto.",
      parameters: {
        type: "object",
        properties: {
          nombre: { type: "string", description: "Nombre de la rifa, ej: Rifa dia del padre" },
          raffleId: { type: "string", description: "ID exacto" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "numerosDisponibles",
      description: "Obtiene los números disponibles de una rifa. Pasá el nombre exacto.",
      parameters: {
        type: "object",
        properties: {
          nombre: { type: "string", description: "Nombre de la rifa" },
          raffleId: { type: "string", description: "ID exacto" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "comprarNumeros",
      description: "Compra números para un participante. Si el usuario no dice la rifa, no pongas nombreRifa.",
      parameters: {
        type: "object",
        properties: {
          nombreRifa: { type: "string", description: "Nombre de la rifa. Solo si el usuario la mencionó." },
          raffleId: { type: "string", description: "ID exacto" },
          comprador: { type: "string", description: "Nombre del comprador" },
          numeros: { type: "array", items: { type: "number" }, description: "Números a comprar" },
        },
        required: ["comprador", "numeros"],
      },
    },
  },
];

async function nvidiaChat(messages: any[]): Promise<any> {
  const res = await fetch(`${NVIDIA_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GEMINI_API_KEY || ""}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: SYSTEM }, ...messages],
      tools: TOOLS,
      tool_choice: "auto",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NVIDIA API error ${res.status}: ${text}`);
  }

  return res.json();
}

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
          alias: r.paymentAlias,
          vendidos: r.participants.flatMap((p: any) => p.numbers).length,
          total: r.totalNumbers,
        })),
      };
    }

    case "verRifa": {
      const resolved = await resolveRaffleId(args.nombre, args.raffleId);
      if ("error" in resolved) return resolved;
      if ("opciones" in resolved) return { multiples: true, opciones: resolved.opciones };
      const r = await getRaffleById(resolved.id);
      if (!r) return { error: "Rifa no encontrada" };
      return {
        auto: resolved.auto || false,
        titulo: r.title,
        premios: r.prizes,
        alias: r.paymentAlias,
        disclaimer: r.disclaimer,
        totalNumeros: r.totalNumbers,
        participantes: r.participants.map((p: any) => ({ nombre: p.name, numeros: p.numbers })),
      };
    }

    case "numerosDisponibles": {
      const resolved = await resolveRaffleId(args.nombre, args.raffleId);
      if ("error" in resolved) return resolved;
      if ("opciones" in resolved) return { multiples: true, opciones: resolved.opciones };
      const r = await getRaffleById(resolved.id);
      if (!r) return { error: "Rifa no encontrada" };
      const sold = new Set(r.participants.flatMap((p: any) => p.numbers));
      const disponibles = Array.from({ length: r.totalNumbers }, (_, i) => i + 1).filter((n) => !sold.has(n));
      return { auto: resolved.auto || false, titulo: r.title, total: r.totalNumbers, vendidos: sold.size, disponibles, cantidadDisponibles: disponibles.length };
    }

    case "comprarNumeros": {
      const resolved = await resolveRaffleId(args.nombreRifa || args.nombre, args.raffleId);
      if ("error" in resolved) return resolved;
      if ("opciones" in resolved) return { multiples: true, opciones: resolved.opciones };
      const nums = typeof args.numeros === "string" ? JSON.parse(args.numeros) : args.numeros;
      const result = await addParticipant(resolved.id, { name: args.comprador, numbers: nums });
      if (result.error) return { error: result.error };
      return { exito: true, auto: resolved.auto || false, comprador: args.comprador, numeros: nums, alias: result.raffle!.paymentAlias, titulo: result.raffle!.title };
    }

    default:
      return { error: `Tool desconocido: ${name}` };
  }
}

export async function handleChat(
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const apiMessages: any[] = messages.map((m) => ({ role: m.role, content: m.content }));

  for (let round = 0; round < 3; round++) {
    const data = await nvidiaChat(apiMessages);
    const msg = data.choices?.[0]?.message;
    if (!msg) break;

    const toolCalls = msg.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      apiMessages.push({ role: "assistant", content: msg.content || null, tool_calls: toolCalls });
      for (const tc of toolCalls) {
        const args = JSON.parse(tc.function.arguments);
        const result = await execTool(tc.function.name, args);
        apiMessages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(result) });
      }
      continue;
    }

    return msg.content || "";
  }

  // Last round: tool results came back → let model generate final response
  const data = await nvidiaChat(apiMessages);
  return data.choices?.[0]?.message?.content || "";
}
