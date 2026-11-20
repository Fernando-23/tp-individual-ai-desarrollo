# Contrato: pantallas y navegación de la app

**Feature**: `003-app-mobile`

Es el mapa de la app: qué pantalla existe, qué muestra, qué endpoint de
`specs/002-api-backend/contracts/api.md` usa y qué acciones ofrece. Las rutas
son archivos de `mobile/app/` (Expo Router).

## Mapa de navegación

```text
/elegir-usuario                ← pantalla inicial si no hay usuario elegido
/(tabs)
   ├─ /                        Explorar
   ├─ /compras                 Mis compras
   ├─ /eventos                 Mis eventos (organizador) + botón Publicar
   └─ /favoritos               Favoritos
/evento/[id]                   Detalle del evento + comprar
/compra/[id]                   Detalle de la compra + acciones
/compra/[id]/chat              Chat de la compra
/compra/[id]/reseniar          Reseñar el evento (modal)
/ventas/[eventoId]             Ventas de un evento (organizador)
/publicar                      Publicar un evento (modal)
```

En el encabezado de las pestañas siempre se ve el **usuario actual**, con un
botón "Cambiar" que lleva a `/elegir-usuario` (FR-008).

## Pantallas

| Ruta | Historia | Muestra | Endpoint(s) | Acciones |
|---|---|---|---|---|
| `/elegir-usuario` | US1 | Lista de usuarios (nombre y apellido, con iniciales) | `GET /usuarios` | Elegir un usuario → `/` |
| `/` (Explorar) | US2 | Buscador, chips de categorías, selector de orden y tarjetas de evento (imagen, nombre, fecha, categoría, "desde $", organizador ★, "Agotado") | `GET /categorias`, `GET /eventos?texto&categoria&orden` | Tocar tarjeta → `/evento/[id]` |
| `/evento/[id]` | US2, US3, US9 | Imagen, nombre, fecha, categoría, descripción, organizador con ★ y reseñas, y tipos de entrada con precio y disponibles | `GET /eventos/:id` | ♥ favorito (`PUT`/`DELETE /mis-favoritos/:id`); elegir tipo → cantidad (− / +, de 1 a disponibles) → ver total → **Comprar** (`POST /compras`) → aviso "pendiente" con botón "Ver compra" |
| `/compras` | US4 | Tarjetas de compra: evento, tipo × cantidad, total, **etiqueta de estado** y "Faltan N días" si está confirmada | `GET /mis-compras` | Tocar → `/compra/[id]` |
| `/compra/[id]` | US4 a US8 | Resumen, etiqueta de estado, días restantes e historial (estado, quién, cuándo) | `GET /compras/:id`, más `GET /eventos/:id` si hay que saber si ya reseñó | Según `accionesDisponibles`: Cancelar (con confirmación) · Confirmar · Rechazar (con confirmación) · Registrar ingreso · Reseñar → modal · Chat → `/compra/[id]/chat` |
| `/compra/[id]/chat` | US7 | Burbujas (propias a la derecha, ajenas a la izquierda), con la hora | `GET /compras/:id/mensajes` cada 4 s mientras está en foco | Escribir y enviar (`POST /compras/:id/mensajes`); el botón se deshabilita si el texto está vacío |
| `/compra/[id]/reseniar` | US8 | 1 a 5 estrellas y un comentario opcional | `POST /eventos/:id/resenias` | Enviar → vuelve a la compra |
| `/eventos` | US5, US10 | Eventos que organiza: próximos primero y pasados atenuados | `GET /mis-eventos` | Tocar → `/ventas/[eventoId]`; botón **Publicar** → `/publicar` |
| `/ventas/[eventoId]` | US5 | Por tipo, cupo, ocupadas y disponibles (con una barra); conteo por estado; lista de compras con comprador y etiqueta | `GET /eventos/:id/ventas` | Tocar compra → `/compra/[id]` (ahí están confirmar, rechazar e ingreso) |
| `/favoritos` | US9 | Tarjetas de evento | `GET /mis-favoritos` | Tocar → `/evento/[id]` |
| `/publicar` | US10 | Formulario: nombre, descripción, categoría (chips), fecha y hora (selector nativo), URL de imagen opcional, tipos de entrada (agregar o quitar; nombre, precio y cupo) | `GET /categorias`, `POST /eventos` | Publicar → `/evento/[id]` del evento nuevo |

## Estados comunes de toda pantalla con datos (FR-002)

| Estado | Se ve |
|---|---|
| Cargando | Un indicador centrado |
| Error | El mensaje del `ErrorApi` y un botón "Reintentar" |
| Vacío | Un ícono y un mensaje propio de la pantalla ("Todavía no tenés compras", "No hay eventos que coincidan"…) |
| Éxito | El contenido |

## Reglas de UI que no son de negocio

- Mientras una acción está en curso, su botón muestra un indicador y se
  deshabilita (FR-006).
- Si el cliente HTTP recibe un 401 en cualquier pantalla, se borra el
  usuario y se vuelve a `/elegir-usuario` (caso borde).
- Las listas cortan los textos largos en 1 o 2 líneas. El detalle los
  muestra completos.
