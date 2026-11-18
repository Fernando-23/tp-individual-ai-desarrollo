# Contrato: API REST de AI Ticket It

**Feature**: `002-api-backend`

Es la referencia común entre backend y mobile (constitución, Principio IV).

## Convenciones

- **Base**: `http://<ip-de-la-pc>:3000/api`. Todo es JSON en UTF-8.
- **Usuario actual**: va en el header `X-Usuario-Id: <id>`. Las rutas
  marcadas con 🔒 lo exigen. Sin él, o con un id que no existe, responden
  `401`.
- **Fechas**: ISO 8601 en UTC (`"2026-11-28T21:00:00.000Z"`).
- **Montos**: `number`, en pesos.
- **Errores**: siempre `{ "error": "<mensaje en español>" }`.

  | Código | Cuándo |
  |---|---|
  | 400 | Dato inválido: tipo, rango, campo faltante, referencia del body que no existe, JSON mal formado, orden desconocido |
  | 401 | Falta `X-Usuario-Id` o el usuario no existe |
  | 403 | El usuario no tiene permiso sobre ese recurso |
  | 404 | No existe el recurso de la URL (o la ruta) |
  | 409 | Conflicto de estado, de cupo o de fecha (por ejemplo, el evento ya se realizó) |
  | 500 | Error inesperado: mensaje genérico |

## Vistas (formas de respuesta)

```jsonc
// Usuario
{ "id": "u-ana", "nombre": "Ana", "apellido": "Paz" }

// Categoria
{ "id": "c-teatro", "nombre": "Teatro", "descripcion": "Obras en sala" }

// Organizador (dentro de eventos)
{ "id": "u-ana", "nombre": "Ana", "apellido": "Paz", "puntaje": 4.5, "cantidadResenias": 2 }
// puntaje: null si no tiene reseñas ("sin puntaje")

// EventoResumen (catálogo, mis-eventos, mis-favoritos)
{
  "id": "e-jazz", "nombre": "Noche de Jazz",
  "categoria": { "id": "c-recitales", "nombre": "Recitales" },
  "fecha": "…", "imagen": "https://…" | null,
  "organizador": Organizador,
  "precioDesde": 8000,       // el precio más bajo de sus tipos (FR-012, FR-013)
  "hayEntradas": true,       // algún tipo con disponibles > 0
  "yaSeRealizo": false
}

// EventoDetalle (GET /eventos/:id)
EventoResumen + {
  "descripcion": "…", "multimedia": ["https://…"],
  "tiposEntrada": [
    { "id": "t-jazz-vip", "nombre": "VIP", "descripcion": "…", "precio": 20000, "cupo": 20, "disponibles": 18 }
  ],
  "reseniasDelOrganizador": [Resenia],   // de todos sus eventos (caso de uso 10)
  "esFavorito": true | null              // null si no se mandó X-Usuario-Id
}

// Resenia
{ "id": "r-1", "evento": { "id": "e-tango", "nombre": "…" },
  "comprador": Usuario, "puntuacion": 5, "detalle": "…" }

// CompraResumen (GET /mis-compras)
{
  "id": "k-001",
  "evento": { "id": "e-jazz", "nombre": "…", "fecha": "…" },
  "tipoEntrada": { "id": "t-jazz-vip", "nombre": "VIP" },
  "cantidad": 2, "total": 40000, "estado": "CONFIRMADA",
  "diasRestantes": 10        // solo si estado === CONFIRMADA; si no, null (FR-016)
}

// CompraDetalle (GET /compras/:id y respuestas de acciones)
CompraResumen + {
  "comprador": Usuario,
  "organizador": Usuario,
  "historial": [ { "estado": "PENDIENTE", "quien": Usuario, "fechaHora": "…" } ],
  "mensajes": [Mensaje]
}

// Mensaje
{ "usuario": Usuario, "mensaje": "¿A qué hora abren?", "enviado": "…" }

// Ventas (GET /eventos/:id/ventas)
{
  "evento": { "id": "…", "nombre": "…", "fecha": "…" },
  "tiposEntrada": [ { "id": "…", "nombre": "VIP", "precio": 20000, "cupo": 20, "ocupadas": 2, "disponibles": 18 } ],
  "cantidadPorEstado": { "PENDIENTE": 1, "CONFIRMADA": 1, "UTILIZADA": 0, "CANCELADA": 0, "REEMBOLSADA": 0 },
  "compras": [ { "id": "…", "comprador": Usuario, "tipoEntrada": { "id": "…", "nombre": "…" },
                 "cantidad": 2, "total": 40000, "estado": "CONFIRMADA", "creada": "…" } ]
}
```

## Endpoints

| Método y ruta | 🔒 | Body | Respuesta | FR | Errores propios |
|---|---|---|---|---|---|
| `GET /api/salud` | | — | `200 { ok: true }` | — | — |
| `GET /api/usuarios` | | — | `200 Usuario[]` | FR-001 | — |
| `GET /api/categorias` | | — | `200 Categoria[]` | FR-006 | — |
| `GET /api/eventos` | | query (ver abajo) | `200 EventoResumen[]` (solo próximos) | FR-007 a FR-013 | 400 (orden o precio inválido, categoría inexistente) |
| `GET /api/eventos/:id` | opcional | — | `200 EventoDetalle` (también de eventos pasados) | FR-014 | 404 |
| `POST /api/eventos` | 🔒 | `{ nombre, descripcion, categoriaId, fecha, multimedia?, tiposEntrada: [{ nombre, descripcion?, precio, cupo }] }` | `201 EventoDetalle` | FR-023 | 400 (incluye fecha no futura o categoría inexistente) |
| `GET /api/eventos/:id/ventas` | 🔒 | — | `200 Ventas` | FR-019 | 403, 404 |
| `POST /api/eventos/:id/resenias` | 🔒 | `{ puntuacion, detalle? }` | `201 Resenia` | FR-022 | 400, 403, 404, 409 |
| `GET /api/mis-eventos` | 🔒 | — | `200 EventoResumen[]` (los que organiza, incluidos pasados, por fecha) | FR-019 (derivado) | — |
| `GET /api/mis-compras` | 🔒 | — | `200 CompraResumen[]` (por fecha del evento) | FR-016 | — |
| `POST /api/compras` | 🔒 | `{ eventoId, tipoEntradaId, cantidad }` | `201 CompraDetalle` | FR-015 | 400, 409 (sin cupo, evento ya realizado) |
| `GET /api/compras/:id` | 🔒 | — | `200 CompraDetalle` | FR-017 | 403, 404 |
| `POST /api/compras/:id/confirmar` | 🔒 | — | `200 CompraDetalle` | FR-020 | 403, 404, 409 |
| `POST /api/compras/:id/rechazar` | 🔒 | — | `200 CompraDetalle` | FR-020 | 403, 404, 409 |
| `POST /api/compras/:id/registrar-ingreso` | 🔒 | — | `200 CompraDetalle` | FR-020 | 403, 404, 409 |
| `POST /api/compras/:id/cancelar` | 🔒 | — | `200 CompraDetalle` | FR-018 | 403, 404, 409 |
| `GET /api/compras/:id/mensajes` | 🔒 | — | `200 Mensaje[]` | FR-021 | 403, 404 |
| `POST /api/compras/:id/mensajes` | 🔒 | `{ mensaje }` | `201 Mensaje` | FR-021 | 400, 403, 404 |
| `GET /api/mis-favoritos` | 🔒 | — | `200 EventoResumen[]` | FR-024 | — |
| `PUT /api/mis-favoritos/:eventoId` | 🔒 | — | `204` | FR-024 | 404 |
| `DELETE /api/mis-favoritos/:eventoId` | 🔒 | — | `204` | FR-024 | 404 |

### Query de `GET /api/eventos`

| Parámetro | Ejemplo | Regla |
|---|---|---|
| `texto` | `jazz` | Busca en nombre y descripción, sin mayúsculas, acentos ni espacios de más (FR-008) |
| `categoria` | `c-teatro` | Id de la categoría; si no existe, 400 (FR-009) |
| `precioMin`, `precioMax` | `5000` | Números ≥ 0; se usa `tuPrecioEstaEntre` (FR-010). Si falta uno, ese lado queda abierto |
| `orden` | `precio` \| `fecha` \| `puntaje` | Por defecto `fecha`; otro valor → 400 (FR-012) |

**Empates**: dentro de un mismo orden, se desempata por fecha y después por
nombre, para que el resultado sea estable.

## Reglas por endpoint que no están en el dominio

- `POST /api/eventos`:
  - la fecha DEBE ser posterior a "ahora" (FR-023);
  - `categoriaId` inexistente → 400;
  - el organizador es el usuario del header;
  - los ids del evento y de los tipos se generan en el servidor.
- `POST /api/compras`:
  - `eventoId` o `tipoEntradaId` inexistentes en el body → 400;
  - no se puede comprar para un evento que ya empezó → 409. Esta regla se
    agrega al dominio (`Compra.crear`, ver plan).
