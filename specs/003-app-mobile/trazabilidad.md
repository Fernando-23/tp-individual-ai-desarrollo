# Trazabilidad: App mobile de AI Ticket It

**Feature**: `003-app-mobile` · **Fecha**: 2026-11-19

Verifica SC-001 (cada caso de uso se completa desde la app) y SC-006
(contraste AAA). Las pantallas están en `mobile/app/`; los endpoints, en
`specs/002-api-backend/contracts/api.md`.

## 1. Casos de uso → pantalla → endpoint → verificación en el celular

Todos los checkpoints manuales los hizo el usuario en su Android con Expo Go
(SDK 58) el 2026-11-19.

| # | Caso de uso | Pantalla(s) | Endpoint(s) | Checkpoint |
|---|---|---|---|---|
| 1 | Ver mis compras, su estado y días restantes | `(tabs)/compras.js`, `compra/[id]/index.js` | `GET /mis-compras`, `GET /compras/:id` | ✅ "Confirmada · Faltan 30 días" |
| 2 | Organizador: compras del evento y disponibles por tipo | `(tabs)/eventos.js`, `ventas/[eventoId].js` | `GET /mis-eventos`, `GET /eventos/:id/ventas` | ✅ Ana → ventas de Rock |
| 3 | Buscar por texto o por categoría | `(tabs)/index.js` | `GET /categorias`, `GET /eventos?texto&categoria` | ✅ |
| 4 | Publicar un evento con tipos de entrada | `publicar.js` | `POST /eventos` | ✅ errores ⚠ y selectores de fecha y hora |
| 5 | Comprador envía mensajes | `compra/[id]/chat.js` | `POST /compras/:id/mensajes` | ✅ |
| 6 | Organizador responde | `compra/[id]/chat.js` (se actualiza cada 4 s) | `GET` y `POST /compras/:id/mensajes` | ✅ la respuesta apareció sola |
| 7 | Cancelar con reembolso | `compra/[id]/index.js` → "Cancelar compra" | `POST /compras/:id/cancelar` | ✅ Leo → Jazz reembolsada |
| 8 | Cancelar solo si no está utilizada y el evento no pasó | `src/logica/acciones.js` (oculta el botón) + mensaje del servidor | ídem | ✅ (lógica con tests) |
| 9 | Reseñar después de usar la entrada | `compra/[id]/index.js` → "Registrar ingreso"; `compra/[id]/reseniar.js` | `POST /compras/:id/registrar-ingreso`, `POST /eventos/:id/resenias` | ✅ el puntaje de Bruno pasó de 3 a 4 |
| 10 | Reseñas del organizador en sus eventos | `evento/[id].js` | `GET /eventos/:id` | ✅ |
| 11 | Ordenar por precio, fecha o puntaje | `(tabs)/index.js` (chips de orden) | `GET /eventos?orden` | ✅ |
| 12 | Comprar sin superar el cupo | `evento/[id].js` (`SelectorCantidad` limitado a los disponibles) | `POST /compras` | ✅ Sofía → Rock VIP × 2 |
| — | Elegir y cambiar de usuario | `elegir-usuario.js`, `(tabs)/_layout.js` | `GET /usuarios` | ✅ |
| — | Confirmar o rechazar (aclaración del docente) | `compra/[id]/index.js` | `POST /compras/:id/confirmar` · `/rechazar` | ✅ |
| — | Favoritos | `evento/[id].js` (corazón), `(tabs)/favoritos.js` | `PUT`/`DELETE`/`GET /mis-favoritos` | ✅ |

## 2. Requisitos → dónde se cumplen

| FR | Implementación | Verificación |
|---|---|---|
| FR-001 | `EXPO_PUBLIC_API_URL` en `mobile/.env`; `src/api/cliente.js` | `tests/api/cliente.test.js` + celular real |
| FR-002 | `EstadoCarga` + `useRecurso` en todas las pantallas con datos | Revisión del código; visto en el celular |
| FR-003 | `ErrorApi` con el mensaje del servidor; `avisarError` | `cliente.test.js` |
| FR-004 | `EtiquetaEstado` (color, ícono y texto) | `estados.test.js` (íconos y etiquetas distintos) |
| FR-005 | `src/logica/formato.js` | `formato.test.js` |
| FR-006 | `Boton` con `cargando` y `accessibilityState.busy` | Revisión |
| FR-007 | `confirmar()` antes de cancelar o rechazar | Celular |
| FR-008 a FR-018 | Pantallas de la tabla 1 | Checkpoints de la tabla 1; `acciones.test.js`, `validarEvento.test.js` |
| FR-019 | Áreas táctiles de 48, etiquetas y roles accesibles, texto escalable, paleta en `src/tema.js` | `estados.test.js` → contraste de **todos** los pares (SC-006) |

## 3. Contraste medido (SC-006)

Todos los pares de texto superan 7:1. El más ajustado es `error / fondo`,
con 8,72:1. Los íconos y bordes de controles superan 3:1 (el mínimo es
`borde / fondo`, con 4,26:1). La lista completa la calcula
`mobile/tests/logica/estados.test.js` sobre `PARES_DE_CONTRASTE`.
