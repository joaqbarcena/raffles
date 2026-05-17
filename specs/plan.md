# Raffle Management App — Plan de Implementación

## Stack

| Tecnología | Propósito |
|---|---|
| Next.js 14+ (App Router) | Framework full-stack, deploy a Vercel |
| TypeScript | Tipado del modelo de datos |
| TailwindCSS | Estilos responsive |
| Vercel KV (Redis) | Persistencia multi-dispositivo, free tier |
| html-to-image | Exportar grilla como PNG |

## Modelo de Datos

```typescript
interface Raffle {
  id: string;
  title: string;
  prize: string;
  totalNumbers: number;   // ej: 100
  numbersPerRow: number;  // ej: 10 (define la forma de la grilla)
  createdAt: string;
  participants: Participant[];
}

interface Participant {
  id: string;
  name: string;
  numbers: number[];
  createdAt: string;
}
```

## API Routes

| Método | Ruta | Acción |
|---|---|---|
| GET | `/api/raffles` | Listar todas las rifas |
| POST | `/api/raffles` | Crear rifa |
| GET | `/api/raffles/[id]` | Obtener rifa con participantes |
| PUT | `/api/raffles/[id]` | Editar rifa |
| DELETE | `/api/raffles/[id]` | Eliminar rifa |
| POST | `/api/raffles/[id]/participants` | Agregar comprador |
| DELETE | `/api/raffles/[id]/participants/[pid]` | Quitar comprador |

## Páginas

| Ruta | Componentes |
|---|---|
| `/` | Dashboard: lista de rifas, botón crear, form modal |
| `/rifa/[id]` | Grilla de números, form agregar participante, botón exportar PNG |

## Funcionalidades Clave

### Grilla configurable
- Se renderizan `totalNumbers` en filas de `numbersPerRow`
- Números disponibles: fondo claro, texto normal
- Números vendidos: marcados con ✅ y fondo verde claro, tooltip con nombre del comprador
- Sin hover/click interaction por ahora (solo display)

### Agregar comprador
- Input para nombre (texto)
- Input para números (formato CSV: "5, 12, 33")
- Validaciones: no duplicados, dentro de rango, no previamente vendidos
- Feedback de error inline

### Exportar PNG
- Botón "Descargar PNG" en la página de detalle
- Usa `html-to-image` (función `toPng`) del lado cliente
- Incluye título, premio, y grilla en la imagen
- Nombre de archivo: `{titulo}.png`

## Persistencia

### Vercel KV (Redis)
- Clave: `raffles` → array JSON de rifas
- Operaciones: `kv.get('raffles')`, `kv.set('raffles', data)`
- Setup: Integración 1-click en Vercel Dashboard > Storage > KV Database
- Local: `vercel env pull` para obtener credenciales

### Edge Cases
- Número repetido al comprar → error: "El número X ya fue vendido"
- Número fuera de rango → error: "El número X está fuera del rango (1-N)"
- Grilla sin participantes → estado vacío: "No hay participantes aún"
- Título o premio vacíos → validación al crear

## Estructura del Proyecto

```
raffle-management/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Dashboard
│   ├── globals.css
│   ├── api/
│   │   └── raffles/
│   │       ├── route.ts            # GET, POST
│   │       └── [id]/
│   │           ├── route.ts        # GET, PUT, DELETE
│   │           └── participants/
│   │               └── route.ts    # POST, DELETE
│   └── rifa/
│       └── [id]/
│           └── page.tsx            # Detalle de rifa
├── lib/
│   ├── types.ts                    # Interfaces
│   ├── kv.ts                       # Wrapper Vercel KV
│   └── store.ts                    # Funciones CRUD
├── components/
│   ├── RaffleList.tsx              # Lista de rifas
│   ├── CreateRaffleForm.tsx        # Formulario crear rifa
│   ├── ParticipantForm.tsx         # Formulario agregar comprador
│   ├── NumberGrid.tsx              # Grilla de números
│   └── ImageExport.tsx             # Botón exportar PNG
└── .env.local                      # Vercel KV credenciales
```

## Orden de Implementación

1. Scaffold: `create-next-app` con Tailwind + TS
2. Tipos: `lib/types.ts`
3. KV wrapper + store: `lib/kv.ts`, `lib/store.ts`
4. API routes: CRUD de rifas + participantes
5. Dashboard: listar + crear rifas
6. Detalle rifa: grilla + formulario participante
7. Exportar PNG con html-to-image
8. Deploy a Vercel
