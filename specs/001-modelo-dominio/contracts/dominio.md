# Contrato: API pública del módulo de dominio

**Feature**: `001-modelo-dominio`

Esta feature no expone endpoints HTTP. Su "interfaz" es el módulo
`backend/src/domain/index.js`, que consumen los servicios de las features
siguientes. Lo que se lista acá es lo que esas features pueden usar. Todo lo
demás es interno y puede cambiar sin aviso.

## Exportaciones

```js
import {
  // Entidades
  Usuario, Categoria, Evento, TipoEntrada, Compra, Resenia,
  // Valores
  CambioEstadoCompra, Mensaje,
  // Estados y reglas
  EstadoCompra, TRANSICIONES,
  // Funciones puras
  puntajeOrganizador, diaCalendario, diasEntre, normalizarNombre,
  // Errores
  ErrorDeDominio, ErrorValidacion, ErrorPermiso, ErrorConflicto,
} from './domain/index.js';
```

## Firmas

| Miembro | Firma | Lanza |
|---|---|---|
| `new Usuario` | `({ id, nombre, apellido })` | `ErrorValidacion` |
| `new Categoria` | `({ id, nombre, descripcion })` | `ErrorValidacion` |
| `new TipoEntrada` | `({ id, nombre, descripcion, precio, cupo })` | `ErrorValidacion` |
| `new Evento` | `({ id, nombre, descripcion, categoria, fecha, tiposEntrada, multimedia, organizador })` | `ErrorValidacion` |
| `Compra.crear` | `({ id, comprador, evento, tipoEntrada, cantidad, ahora }) → Compra` | `ErrorValidacion`, `ErrorConflicto` (sin cupo) |
| `compra.actualizarEstado` | `(nuevoEstado, quien, ahora) → void` | `ErrorValidacion`, `ErrorPermiso`, `ErrorConflicto` |
| `compra.confirmar` / `cancelar` / `rechazar` / `marcarUtilizada` | `(quien, ahora) → void` | igual que `actualizarEstado` |
| `compra.enviarMensaje` | `(quien, texto, ahora) → Mensaje` | `ErrorPermiso`, `ErrorValidacion` |
| `evento.reseniar` | `({ id, comprador, puntuacion, detalle }) → Resenia` | `ErrorPermiso`, `ErrorConflicto`, `ErrorValidacion` |
| `evento.tuPrecioEstaEntre` | `(min, max) → boolean` | — |
| `evento.diasRestantes` | `(ahora) → number` | — |
| `evento.yaSeRealizo` / `esElDiaDelEvento` | `(ahora) → boolean` | — |
| `tipoEntrada.hayCupoPara` | `(cantidad) → boolean` | — |
| `tipoEntrada.cupoDisponible` | `() → number` | — |
| `usuario.agregarFavorito` / `quitarFavorito` | `(evento) → void` | — |
| `usuario.esFavorito` | `(evento) → boolean` | — |
| `puntajeOrganizador` | `(eventos) → number \| null` | — |
| `diaCalendario` | `(fecha: Date) → 'YYYY-MM-DD'` (Buenos Aires) | — |
| `diasEntre` | `(desde: Date, hasta: Date) → number` | — |

`ahora` siempre es un `Date`. Los montos son `number` en pesos.

## Errores y su traducción a HTTP

La traducción a HTTP la hará la capa `routes/` en la feature siguiente
(constitución, Principio IV):

| Clase | Significado | HTTP sugerido |
|---|---|---|
| `ErrorValidacion` | Datos inválidos (cantidad 0, texto vacío, puntuación 7…) | 400 |
| `ErrorPermiso` | El usuario no tiene ese rol sobre la compra o el evento | 403 |
| `ErrorConflicto` | El estado, el cupo o la fecha no lo permiten | 409 |

Todos extienden `ErrorDeDominio` y tienen `message` en español.
