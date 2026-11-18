# Trazabilidad: Backend de AI Ticket It de punta a punta

**Feature**: `002-api-backend` · **Fecha**: 2026-11-18

Verifica SC-001 a SC-003. Las rutas de los tests son relativas a
`backend/tests/api/`.

## 1. Casos de uso del enunciado → endpoint → test (SC-001)

| # | Caso de uso | Endpoint(s) | Test | Dato de demo |
|---|---|---|---|---|
| 1 | Ver mis compras con estado y días restantes | `GET /api/mis-compras` | `compras.test.js` (escenarios 3 y 4) | Leo: `k-001` faltan 10 días |
| 2 | Organizador: compras del evento y disponibles por tipo | `GET /api/mis-eventos`, `GET /api/eventos/:id/ventas` | `ventas.test.js` | Ana → Jazz |
| 3 | Buscar por texto o explorar por categoría | `GET /api/categorias`, `GET /api/eventos?texto=&categoria=` | `catalogo.test.js` (escenarios 1 a 4 y 9) | "jazz", Teatro |
| 4 | Crear un evento con tipos de entrada | `POST /api/eventos` | `publicacion.test.js` | cualquier usuario |
| 5 | Comprador envía mensajes | `POST /api/compras/:id/mensajes` | `mensajes.test.js` | `k-001` |
| 6 | Organizador responde mensajes | `GET`/`POST /api/compras/:id/mensajes` | `mensajes.test.js` | `k-001`, `k-003` |
| 7 | Cancelar para obtener el reembolso | `POST /api/compras/:id/cancelar` | `cancelacion.test.js` | Leo → `k-001` |
| 8 | Cancelar solo si no está utilizada y el evento no pasó | ídem (las reglas son del dominio) | `cancelacion.test.js` (escenario 3) | Sofía → `k-008` |
| 9 | Reseñar después de usar la entrada | `POST /api/compras/:id/registrar-ingreso`, `POST /api/eventos/:id/resenias` | `ventas.test.js` (escenario 5), `resenias.test.js` | Bruno → `k-006`; Leo → Impro |
| 10 | Ver reseñas del organizador en sus eventos | `GET /api/eventos/:id` (`reseniasDelOrganizador`) | `catalogo.test.js` (detalle) | Jazz muestra las de Tango |
| 11 | Ordenar por precio, fecha o puntaje | `GET /api/eventos?orden=` | `catalogo.test.js` (escenarios 5 a 7) | — |
| 12 | Comprar sin superar el cupo | `POST /api/compras` | `compras.test.js` (escenarios 1 y 2) | Sofía → Rock VIP |
| — | Confirmar o rechazar (aclaración docente) | `POST /api/compras/:id/confirmar` y `/rechazar` | `ventas.test.js` (escenarios 3 y 4) | Ana → `k-002`; Bruno → `k-003` |
| — | Favoritos (FR-024) | `GET`, `PUT` y `DELETE /api/mis-favoritos` | `favoritos.test.js` | Leo |

Además, `seed.test.js` verifica que el seed tenga lo necesario para cada
fila, y el recorrido manual con curl sobre el servidor real (T042) las
confirmó.

## 2. Requisitos funcionales → test

| FR | Test |
|---|---|
| FR-001 | `usuarios.test.js` |
| FR-002 | `errores.test.js` (401) y los casos "sin usuario" de cada archivo |
| FR-003 a FR-005 | `seed.test.js` |
| FR-006 | `catalogo.test.js` (categorías) |
| FR-007 a FR-013 | `catalogo.test.js` |
| FR-014 | `catalogo.test.js` (detalle) |
| FR-015 | `compras.test.js` (POST) y `tests/domain/compra.eventoRealizado.test.js` |
| FR-016 | `compras.test.js` (mis-compras) |
| FR-017 | `compras.test.js` (detalle, 403) |
| FR-018 | `cancelacion.test.js` |
| FR-019 | `ventas.test.js` (ventas, mis-eventos) |
| FR-020 | `ventas.test.js` (acciones) |
| FR-021 | `mensajes.test.js` |
| FR-022 | `resenias.test.js` |
| FR-023 | `publicacion.test.js` |
| FR-024 | `favoritos.test.js` |
| FR-025 | `errores.test.js` y los casos 400/401/403/404/409 de cada archivo |
| FR-026 | Por diseño: los servicios delegan en el dominio. Los tests de API y los de dominio verifican las mismas reglas |

## 3. Aislamiento entre usuarios (SC-003)

Casos que verifican que nadie accede a lo ajeno:
- compra ajena → 403 (`compras.test.js`);
- ventas de un evento ajeno → 403 (`ventas.test.js`);
- chat ajeno → 403 (`mensajes.test.js`);
- cancelar o confirmar algo ajeno → 403 (`cancelacion.test.js` y
  `ventas.test.js`);
- favoritos por usuario (`favoritos.test.js`).
