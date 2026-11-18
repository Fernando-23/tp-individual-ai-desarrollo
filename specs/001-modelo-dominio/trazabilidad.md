# Trazabilidad: Modelo de dominio

**Feature**: `001-modelo-dominio` · **Fecha**: 2026-11-18

Este documento verifica los criterios de éxito SC-001 y SC-004 de la spec.
Las rutas de tests son relativas a `backend/tests/domain/`.

## 1. Restricciones de dominio de la constitución → requisito → test (SC-001)

| # | Restricción (constitución) | FR | Test que la ejercita |
|---|---|---|---|
| 1 | Una compra no puede superar el cupo disponible; las canceladas o reembolsadas liberan cupo | FR-004, FR-005, FR-007 | `compra.crear.test.js` (escenarios 2 y 3, "dos compras que juntas superan"); `tipoEntrada.test.js` ("al cancelar o reembolsar…"); `compra.estados.test.js` (escenarios 3, 4 y 12) |
| 2 | El total se calcula en el servidor (`precio × cantidad`) | FR-008 | `compra.crear.test.js` (escenario 1, "el total no cambia si cambia el precio") |
| 3 | No se puede cancelar una compra `UTILIZADA` ni una de un evento ya realizado | FR-013 | `compra.estados.test.js` (escenarios 5 y 6, "tampoco se puede cancelar una PENDIENTE…") |
| 4 | Solo se reseña con una compra `UTILIZADA`; una reseña por comprador y evento | FR-019, FR-020 | `resenias.test.js` (escenarios 1, 2 y 3, "otro evento no habilita") |
| 5 | El puntaje del organizador es el promedio de sus reseñas | FR-022 | `resenias.test.js` (`puntajeOrganizador`, escenarios 4 y 5) |
| 6 | Todo cambio de estado registra quién y cuándo; las transiciones están en una única función; el estado no se asigna directo | FR-010, FR-011, FR-016b | `transiciones.test.js`; `compra.estados.test.js` (Historial, Inmutabilidad, "rechazada no agrega historial") |
| 7 | Toda compra nace `PENDIENTE`; solo el organizador la confirma | FR-009, FR-012 | `compra.crear.test.js` (historial inicial); `compra.estados.test.js` (escenarios 1 y 2, otro organizador) |
| 8 | En el chat solo escriben el comprador y el organizador, en cualquier estado | FR-023 | `compra.mensajes.test.js` (escenarios 1 a 4) |
| 9 | Un evento tiene al menos un tipo de entrada, con precio ≥ 0 y cupo > 0 | FR-001, FR-002 | `evento.validaciones.test.js` (escenarios 1 y 2); `tipoEntrada.test.js` (validaciones) |

Las 9 restricciones están cubiertas.

## 2. Casos de uso del enunciado → requisitos que usan (SC-004)

Los 12 casos de uso se pueden construir sobre estas reglas sin redefinir
ninguna. Lo que queda para cada feature futura es la capa de servicios, la
API y las pantallas.

| # | Caso de uso (enunciado) | Requisitos del dominio | Lo que agrega la feature futura |
|---|---|---|---|
| 1 | Comprador: ver mis compras, su estado y los días que faltan si está confirmada | FR-006, FR-018 (`diasRestantes`) | Listar las compras por comprador (repositorio) |
| 2 | Organizador: ver las compras de un evento con su estado y las entradas disponibles por tipo | FR-005 (`cupoDisponible`), `Evento.compras()` | Autorizar que sea el organizador (`X-Usuario-Id`) |
| 3 | Comprador: buscar eventos por texto o explorarlos por categoría | FR-001, `Categoria` | La búsqueda por texto y el filtro por categoría (servicio) |
| 4 | Organizador: crear un evento con distintos tipos de entrada, precio y cupo | FR-001, FR-002 | Asignar ids y guardar |
| 5 | Comprador: enviar mensajes en una compra | FR-023, FR-024 | — |
| 6 | Organizador: responder mensajes en una compra | FR-023, FR-024 | — |
| 7 | Comprador: cancelar una compra para obtener el reembolso | FR-013, FR-014 (`cancelar`) | — |
| 8 | Organizador: que se pueda cancelar si no está `UTILIZADA` y el evento no se realizó | FR-013, FR-016b | — |
| 9 | Organizador: que, una vez utilizada la entrada, el comprador pueda puntuar y comentar | FR-015 (`marcarUtilizada`), FR-019 a FR-021 | — |
| 10 | Comprador: ver las reseñas de eventos anteriores del organizador | `Evento.resenias`, FR-022 | Buscar los eventos de un organizador |
| 11 | Comprador: ordenar eventos por precio, fecha y puntaje del organizador | FR-003 (precios de los tipos), `Evento.fecha`, FR-022 | El ordenamiento. Hay que definir qué precio representa al evento para ordenar (por ejemplo, el mínimo) |
| 12 | Comprador: comprar un tipo de entrada y una cantidad sin superar el cupo | FR-004 a FR-009 (`Compra.crear`) | — |

Cubrir los casos de uso 3 y 11 no requiere cambiar reglas de dominio, solo
agregar consultas en la capa de servicios.

**Pendiente para la feature del caso de uso 11**: decidir qué precio
representa a un evento al ordenarlo por precio. El dominio ya sabe responder
si un evento tiene precios en un rango (`tuPrecioEstaEntre`), pero no fija
ese criterio.
