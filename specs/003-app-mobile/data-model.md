# Data Model: App mobile de AI Ticket It

**Feature**: `003-app-mobile` · **Fecha**: 2026-11-19

La app no tiene datos propios: usa las vistas JSON del contrato de la
feature 002 (`specs/002-api-backend/contracts/api.md`). Este documento
define el estado local y la lógica pura que la app sí tiene.

## Estado local

| Estado | Dónde vive | Ciclo de vida |
|---|---|---|
| Usuario actual `{ id, nombre, apellido }` | `UsuarioContext` | Desde que se elige hasta que se cambia o se cierra la app (no se persiste) |
| Datos de cada pantalla | `useRecurso` dentro de la pantalla | Se cargan al ganar el foco; se descartan al desmontar |
| Formulario de compra (tipo, cantidad) | `useState` en `/evento/[id]` | Mientras se está en el detalle |
| Formulario de publicar | `useState` en `/publicar` | Mientras está abierto |

## Lógica pura (`mobile/src/logica/`, testeada con Vitest)

### `formato.js`

| Función | Entrada → salida |
|---|---|
| `formatearPrecio(n)` | `0` → `"Gratis"`; `20000` → `"$ 20.000"` |
| `formatearFecha(iso)` | `"2026-11-29T00:00:00.000Z"` → `"sáb 28 nov, 21:00"` (en la zona del dispositivo) |
| `formatearFechaHora(iso)` | Igual, con día y hora, para historial y chat |
| `textoDiasRestantes(n)` | `0` → `"Es hoy"`; `1` → `"Mañana"`; `10` → `"Faltan 10 días"`; `null` → `null` |

### `estados.js`

`ESTADOS` es un objeto congelado `{ PENDIENTE: { etiqueta: 'Pendiente de
pago', color, icono }, … }`, uno por cada uno de los 5 estados.
`infoEstado(estado)` devuelve su entrada, o un "Desconocido" gris si el
estado no existe.

### `acciones.js`

`accionesDisponibles(compra, usuarioId, ahora, { yaResenio })` devuelve un
`Set` de las acciones que corresponden según rol y estado:

| Acción | Rol | Condición |
|---|---|---|
| `cancelar` | comprador | Estado `PENDIENTE` o `CONFIRMADA`, y `ahora < evento.fecha` |
| `confirmar` | organizador | Estado `PENDIENTE` |
| `rechazar` | organizador | Estado `PENDIENTE` |
| `registrarIngreso` | organizador | Estado `CONFIRMADA` y `diasRestantes <= 0`, o el evento ya empezó |
| `reseniar` | comprador | Estado `UTILIZADA` y `!yaResenio` |
| `chatear` | cualquiera de los dos | Siempre |

Es solo una guía de interfaz. La regla real la aplica el servidor (D5).

### `validarEvento.js`

`validarEvento(formulario, ahora)` devuelve `{ valido, errores: { campo:
mensaje } }`. Valida:
- campos de texto no vacíos;
- categoría elegida;
- fecha futura;
- al menos un tipo de entrada;
- en cada tipo: nombre, precio ≥ 0 y cupo entero > 0;
- nombres de tipo no repetidos.

También convierte los textos numéricos de los campos ("15000") a números.

### `cliente.js` (testeado con `fetch` simulado)

`crearCliente({ baseUrl, obtenerUsuarioId, alNoIdentificado, fetch, timeoutMs })`
devuelve `{ get, post, put, delete }`. Cada uno:
- agrega `X-Usuario-Id` si hay usuario y `Content-Type: application/json`
  si hay cuerpo;
- devuelve el JSON, o `null` si la respuesta es 204;
- lanza `ErrorApi`:
  - con el `error` del servidor y el status;
  - `{ status: 0, mensaje: 'No hay conexión con el servidor…' }` si `fetch`
    falla o vence el timeout;
- llama a `alNoIdentificado()` ante un 401.
