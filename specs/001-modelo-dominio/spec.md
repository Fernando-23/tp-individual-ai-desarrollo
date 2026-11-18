# Feature Specification: Modelo de dominio de AI Ticket It

**Feature Branch**: `001-modelo-dominio`
**Created**: 2026-11-18
**Status**: Draft
**Input**: User description: "Base del dominio de AI Ticket It en el backend, a partir del diagrama de clases del enunciado (Usuario, Categoria, Evento, TipoEntrada, Compra, EstadoCompra, CambioEstadoCompra, Mensaje, Resenia). Es la base sobre la que se construyen todos los casos de uso: las entidades y las reglas de negocio de la constitución. Sin endpoints HTTP ni pantallas en esta feature."

## Alcance

Esta feature define **qué es** cada concepto del negocio y **qué reglas** lo
gobiernan: quién puede comprar qué, cómo avanza una compra, quién puede
reseñar y quién puede escribir en un chat. Es la base común de los 12 casos de
uso del enunciado.

Queda **fuera** de esta feature cómo se accede a esas reglas: las pantallas,
la comunicación entre la app y el servidor, el almacenamiento y los datos de
ejemplo. Cada caso de uso posterior las expone sin redefinirlas.

## Clarifications

### Session 2026-11-18

- Q: ¿Cancelar una compra confirmada pasa por `CANCELADA` y luego `REEMBOLSADA`, o va directo? → A: Una `PENDIENTE` cancelada queda `CANCELADA`; una `CONFIRMADA` cancelada pasa directo a `REEMBOLSADA` (FR-014).
- Q: ¿Quién marca una compra como `UTILIZADA`? → A: El organizador al controlar el ingreso, a partir del día del evento (FR-015).
- Q: ¿Qué pasa con las compras `PENDIENTE` que nunca se confirman? → A: El organizador puede rechazarlas y quedan `CANCELADA`, liberando cupo; no vencen solas (FR-016).

## User Scenarios & Testing *(mandatory)*

Los "usuarios" de esta feature son el comprador y el organizador, pero vistos
a través de las reglas que la plataforma les garantiza. Cada historia se
verifica ejercitando las reglas directamente, sin interfaz.

### User Story 1 - Comprar sin superar el cupo y a precio correcto (Priority: P1)

Un comprador elige un tipo de entrada de un evento y una cantidad. La
plataforma acepta la compra solo si queda cupo suficiente de ese tipo, y
calcula ella misma el total a pagar.

**Why this priority**: es el corazón del negocio. Vender más entradas que las
disponibles o cobrar mal son los errores más graves que puede cometer la
plataforma, y casi todos los demás casos de uso parten de una compra.

**Independent Test**: se crea un evento con un tipo de entrada de cupo
conocido, se registran compras y se verifica qué se acepta, qué se rechaza y
qué total resulta.

**Acceptance Scenarios**:

1. **Given** un tipo de entrada "Platea" con cupo 100, precio $5.000 y sin
   compras, **When** un comprador pide 4 entradas, **Then** la compra se
   registra en estado `PENDIENTE` con total $20.000 y quedan 96 disponibles.
2. **Given** un tipo de entrada con 3 entradas disponibles, **When** un
   comprador pide 4, **Then** la compra se rechaza indicando que no hay cupo
   suficiente, y el disponible sigue en 3.
3. **Given** un tipo de entrada con 3 disponibles, **When** un comprador pide
   exactamente 3, **Then** la compra se acepta y el disponible queda en 0.
4. **Given** una compra de 2 entradas que luego se cancela, **When** se
   consulta el disponible de ese tipo, **Then** esas 2 entradas vuelven a
   estar disponibles.
5. **Given** un pedido de 0 entradas o una cantidad negativa o no entera,
   **When** se intenta comprar, **Then** la compra se rechaza.

---

### User Story 2 - Seguir el ciclo de vida de una compra (Priority: P1)

Toda compra atraviesa estados (`PENDIENTE`, `CONFIRMADA`, `UTILIZADA`,
`CANCELADA`, `REEMBOLSADA`). La plataforma solo permite los cambios de estado
válidos, solo a quien corresponde, y guarda el historial de quién hizo cada
cambio y cuándo.

**Why this priority**: el seguimiento de la compra, la cancelación, el
reembolso y las reseñas dependen de que los estados avancen bien. Sin
historial, ni el comprador ni el organizador pueden saber qué pasó con una
compra.

**Independent Test**: se crea una compra y se intentan todas las
transiciones posibles con distintos actores. Se verifica cuáles se aceptan,
cuáles se rechazan y qué queda en el historial.

**Acceptance Scenarios**:

1. **Given** una compra `PENDIENTE`, **When** el organizador del evento la
   confirma, **Then** pasa a `CONFIRMADA` y el historial registra al
   organizador y el momento.
2. **Given** una compra `PENDIENTE`, **When** la intenta confirmar el propio
   comprador u otro usuario que no organiza el evento, **Then** se rechaza y
   el estado no cambia.
3. **Given** una compra `CONFIRMADA` de un evento que todavía no se
   realizó, **When** el comprador la cancela, **Then** pasa directo a
   `REEMBOLSADA` y libera su cupo.
4. **Given** una compra `PENDIENTE` de un evento que todavía no se
   realizó, **When** el comprador la cancela, **Then** pasa a `CANCELADA`
   (no hubo pago que devolver) y libera su cupo.
5. **Given** una compra `UTILIZADA`, **When** el comprador intenta
   cancelarla, **Then** se rechaza.
6. **Given** una compra `CONFIRMADA` de un evento cuya fecha y hora ya
   pasaron, **When** el comprador intenta cancelarla, **Then** se rechaza.
7. **Given** una compra `CONFIRMADA` y el día del evento, **When** el
   organizador registra el ingreso, **Then** pasa a `UTILIZADA` y el
   historial lo registra a él.
8. **Given** una compra `CONFIRMADA` de un evento que es recién mañana,
   **When** el organizador intenta marcarla `UTILIZADA`, **Then** se rechaza
   porque todavía no es el día del evento.
9. **Given** una compra `CONFIRMADA`, **When** el comprador intenta
   marcarla `UTILIZADA`, **Then** se rechaza por falta de permiso.
10. **Given** una compra en `CANCELADA` o `REEMBOLSADA`, **When** cualquier
   actor intenta pasarla a otro estado distinto de los permitidos, **Then** se
   rechaza.
11. **Given** una compra con varios cambios de estado, **When** se consulta su
   historial, **Then** aparecen todos en orden, cada uno con el estado nuevo,
   quién lo hizo y cuándo.
12. **Given** una compra `PENDIENTE` que el organizador no quiere aceptar
   (por ejemplo, porque el pago nunca llegó), **When** el organizador la
   rechaza, **Then** pasa a `CANCELADA`, libera su cupo y el historial
   registra al organizador.
13. **Given** una compra `CONFIRMADA`, **When** el organizador intenta
   rechazarla, **Then** se rechaza: solo se pueden rechazar compras
   pendientes.

---

### User Story 3 - Reseñar un evento y construir la reputación del organizador (Priority: P2)

Después de usar su entrada, un comprador puntúa el evento y deja un
comentario. Las reseñas de todos los eventos de un organizador forman su
puntaje, que los compradores usan para decidir.

**Why this priority**: la reputación es lo que da confianza para comprar y
permite ordenar eventos por puntaje del organizador. Depende de que el ciclo
de vida (Historia 2) ya funcione.

**Independent Test**: se registran compras `UTILIZADA` y no utilizadas, se
intentan reseñas y se verifica cuáles se aceptan y cuál es el puntaje del
organizador.

**Acceptance Scenarios**:

1. **Given** un comprador con una compra `UTILIZADA` de un evento, **When**
   deja una puntuación de 4 y un comentario, **Then** la reseña se registra.
2. **Given** un comprador cuya compra del evento está `CONFIRMADA` (todavía
   no utilizada), **When** intenta reseñar, **Then** se rechaza.
3. **Given** un comprador que ya reseñó un evento, **When** intenta reseñarlo
   de nuevo (aunque tenga otra compra utilizada del mismo evento), **Then**
   se rechaza.
4. **Given** un organizador con dos eventos y reseñas de 5, 4 y 3 entre
   ambos, **When** se calcula su puntaje, **Then** es 4.
5. **Given** un organizador sin reseñas, **When** se consulta su puntaje,
   **Then** figura como "sin puntaje", no como 0.
6. **Given** una puntuación fuera del rango permitido, **When** se intenta
   reseñar, **Then** se rechaza.

---

### User Story 4 - Chatear dentro de una compra (Priority: P3)

Comprador y organizador intercambian mensajes dentro de cada compra para
hacer consultas sobre el evento, el acceso o los cambios de fecha.

**Why this priority**: es un canal de comunicación importante, pero no
bloquea la compra ni la reputación.

**Independent Test**: se crea una compra y se intenta escribir mensajes con
distintos actores. Se verifica quién puede escribir y en qué orden quedan los
mensajes.

**Acceptance Scenarios**:

1. **Given** una compra, **When** su comprador escribe un mensaje, **Then**
   se agrega a la compra con su autor y su momento de envío.
2. **Given** una compra, **When** el organizador del evento responde,
   **Then** el mensaje se agrega.
3. **Given** una compra, **When** escribe un usuario que no es ni su
   comprador ni el organizador del evento, **Then** se rechaza.
4. **Given** una compra en cualquier estado, incluidos `CANCELADA` y
   `UTILIZADA`, **When** escribe alguna de las partes, **Then** se acepta.
5. **Given** un mensaje vacío o hecho solo de espacios, **When** se intenta
   enviar, **Then** se rechaza.

---

### User Story 5 - Publicar eventos válidos y filtrarlos por precio (Priority: P3)

Un organizador publica un evento con una categoría, una fecha y uno o más
tipos de entrada. Los compradores pueden saber si un evento tiene entradas en
un rango de precios y guardar eventos como favoritos.

**Why this priority**: es la condición para que exista algo que comprar,
pero sus reglas son simples. Las búsquedas y el orden se definen en las
features de cada caso de uso.

**Independent Test**: se intenta crear eventos válidos e inválidos, se
consulta el rango de precios y se agregan y quitan favoritos.

**Acceptance Scenarios**:

1. **Given** un evento sin ningún tipo de entrada, **When** se intenta
   publicar, **Then** se rechaza.
2. **Given** un tipo de entrada con cupo 0 o precio negativo, **When** se
   intenta publicar el evento, **Then** se rechaza.
3. **Given** un evento con entradas de $3.000 y $12.000, **When** se pregunta
   si su precio está entre $10.000 y $15.000, **Then** la respuesta es sí.
4. **Given** el mismo evento, **When** se pregunta si su precio está entre
   $4.000 y $10.000, **Then** la respuesta es no.
5. **Given** un usuario, **When** agrega un evento a favoritos dos veces,
   **Then** el evento figura una sola vez; **When** lo quita, **Then** deja
   de figurar.

---

### Edge Cases

- Dos compras que juntas superan el cupo: se acepta la primera que entra y
  la segunda se rechaza si ya no alcanza.
- El precio de un tipo de entrada cambia después de una compra: el total de
  esa compra no cambia.
- Un evento que empieza hoy más tarde: todavía no se realizó, así que una
  compra confirmada se puede cancelar.
- Una compra de un evento de otro organizador: el organizador que no es dueño
  del evento no puede confirmarla, cancelarla ni escribir en su chat.
- Un organizador que compra entradas de su propio evento: se permite. En esa
  compra es comprador y organizador a la vez.
- Una puntuación con decimales (por ejemplo, 4,5): se rechaza.
- Un rango de precios con mínimo mayor que el máximo: no coincide con ningún
  evento.
- Un comprador con dos compras utilizadas del mismo evento: puede reseñarlo
  una sola vez.

## Requirements *(mandatory)*

### Functional Requirements

**Eventos y tipos de entrada**

- **FR-001**: Un evento DEBE tener nombre, descripción, categoría, fecha y
  hora, organizador, una lista de material multimedia (puede estar vacía) y
  al menos un tipo de entrada.
- **FR-002**: Cada tipo de entrada DEBE tener nombre, descripción, precio
  mayor o igual a 0 y cupo entero mayor a 0. Dentro de un evento no puede
  haber dos tipos con el mismo nombre.
- **FR-003**: El sistema DEBE poder responder si el precio de un evento está
  entre un mínimo y un máximo (inclusive). Esto es verdadero si al menos uno
  de sus tipos de entrada tiene un precio en ese rango.
- **FR-004**: El sistema DEBE poder responder si un tipo de entrada tiene
  cupo para una cantidad dada, considerando las compras existentes.
- **FR-005**: El cupo disponible de un tipo de entrada DEBE ser su cupo total
  menos las entradas de sus compras en estado `PENDIENTE`, `CONFIRMADA` o
  `UTILIZADA`.

**Compras**

- **FR-006**: Una compra DEBE registrar comprador, evento, tipo de entrada,
  cantidad, total, estado actual, historial de cambios de estado y mensajes.
- **FR-007**: La cantidad DEBE ser un entero mayor o igual a 1, y no puede
  superar el cupo disponible del tipo de entrada al momento de comprar.
- **FR-008**: El total DEBE calcularse como precio del tipo de entrada ×
  cantidad al momento de la compra. No lo informa el comprador y no cambia si
  después cambia el precio.
- **FR-009**: Toda compra nueva DEBE nacer en estado `PENDIENTE`, con un
  primer registro de historial a nombre del comprador.
- **FR-010**: Todo cambio de estado DEBE pasar por una única regla de
  transición que valida el estado de origen, el estado destino y quién hace
  el cambio. No hay otra forma de cambiar el estado.
- **FR-011**: Cada cambio de estado aceptado DEBE agregar al historial un
  registro con el estado nuevo, quién lo hizo y la fecha y hora.
- **FR-012**: Solo el organizador del evento DEBE poder pasar una compra de
  `PENDIENTE` a `CONFIRMADA`, una compra por vez. No hay confirmación
  automática ni pago integrado.
- **FR-013**: El comprador NO DEBE poder cancelar una compra `UTILIZADA` ni
  una compra cuyo evento ya se realizó (su fecha y hora de inicio ya pasó).
- **FR-014**: Cuando el comprador cancela, una compra `PENDIENTE` DEBE pasar
  a `CANCELADA` (no hubo pago) y una compra `CONFIRMADA` DEBE pasar directo a
  `REEMBOLSADA` (el reembolso simulado es inmediato). Las dos liberan cupo.
- **FR-015**: Solo el organizador del evento DEBE poder pasar una compra de
  `CONFIRMADA` a `UTILIZADA`, al controlar el ingreso, y solo a partir del
  día calendario del evento en la hora de Argentina.
- **FR-016**: El organizador del evento DEBE poder rechazar una compra
  `PENDIENTE`, que pasa a `CANCELADA` y libera su cupo. No puede rechazar
  compras en otro estado. Las pendientes no vencen solas.
- **FR-016b**: Las transiciones válidas son exactamente estas. Cualquier
  otra DEBE rechazarse:

  | Desde | Hacia | Quién | Condición |
  |---|---|---|---|
  | `PENDIENTE` | `CONFIRMADA` | Organizador | — |
  | `PENDIENTE` | `CANCELADA` | Comprador | El evento no se realizó |
  | `PENDIENTE` | `CANCELADA` | Organizador (rechazo) | — |
  | `CONFIRMADA` | `REEMBOLSADA` | Comprador (cancelación) | El evento no se realizó |
  | `CONFIRMADA` | `UTILIZADA` | Organizador (ingreso) | Es el día del evento o posterior |

  `UTILIZADA`, `CANCELADA` y `REEMBOLSADA` son estados finales.
- **FR-017**: Toda transición no permitida DEBE rechazarse con un motivo que
  distinga entre "el estado actual no lo permite" y "este usuario no tiene
  permiso".
- **FR-018**: El sistema DEBE poder calcular cuántos días calendario faltan
  para el evento de una compra, contados en la hora de Argentina.

**Reseñas**

- **FR-019**: Un comprador DEBE poder reseñar un evento solo si tiene al
  menos una compra `UTILIZADA` de ese evento.
- **FR-020**: Cada comprador DEBE poder dejar como máximo una reseña por
  evento.
- **FR-021**: Una reseña DEBE tener una puntuación entera de 1 a 5 y un
  comentario. El comentario puede estar vacío.
- **FR-022**: El puntaje de un organizador DEBE ser el promedio de las
  puntuaciones de las reseñas de todos sus eventos. Si no tiene reseñas, no
  tiene puntaje (no es 0).

**Mensajes**

- **FR-023**: Solo el comprador de una compra y el organizador de su evento
  DEBEN poder agregar mensajes a esa compra, en cualquier estado.
- **FR-024**: Un mensaje DEBE tener autor, texto no vacío (sin contar
  espacios) y momento de envío. Los mensajes se conservan en orden de envío.

**Usuarios y categorías**

- **FR-025**: Un usuario DEBE tener nombre y apellido, y puede ser comprador
  y organizador a la vez.
- **FR-026**: Un usuario DEBE poder agregar y quitar eventos de sus
  favoritos, sin duplicados.
- **FR-027**: Una categoría DEBE tener nombre y descripción, y el nombre
  DEBE ser único.

### Key Entities *(include if feature involves data)*

- **Usuario**: una persona de la plataforma (nombre, apellido, eventos
  favoritos). Es comprador u organizador según su relación con cada evento o
  compra.
- **Categoria**: clasificación de eventos (nombre, descripción). Ejemplos:
  Recitales, Teatro, Deportes.
- **Evento**: lo que se publica y se vende (nombre, descripción, categoría,
  fecha y hora, multimedia, organizador, tipos de entrada).
- **TipoEntrada**: una ubicación o modalidad de un evento con su precio y su
  cupo (por ejemplo, General, Platea, VIP).
- **Compra**: la adquisición de una cantidad de entradas de un tipo por un
  comprador. Tiene total, estado, historial y mensajes.
- **EstadoCompra**: la etapa de una compra: `PENDIENTE`, `CONFIRMADA`,
  `UTILIZADA`, `CANCELADA` o `REEMBOLSADA`.
- **CambioEstadoCompra**: un registro del historial de una compra (estado
  nuevo, quién lo hizo, cuándo).
- **Mensaje**: un mensaje del chat de una compra (autor, texto, momento de
  envío).
- **Resenia**: la opinión de un comprador sobre un evento (puntuación,
  comentario). Alimenta la reputación del organizador.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las restricciones de dominio de la constitución
  tienen al menos un escenario de aceptación en esta spec y una verificación
  automática que lo ejercita.
- **SC-002**: En ninguna secuencia de compras y cancelaciones las entradas
  vendidas de un tipo (pendientes, confirmadas o utilizadas) superan su cupo.
- **SC-003**: El 100% de los cambios de estado de una compra quedan en su
  historial con autor y momento. No hay ninguna compra cuyo estado actual no
  coincida con el último registro de su historial.
- **SC-004**: Cada uno de los 12 casos de uso del enunciado se puede
  construir sobre estas reglas sin redefinir ninguna. Esto se verifica con
  una tabla que asocia cada caso de uso a los requisitos que usa.
- **SC-005**: Ante una operación rechazada, el motivo permite saber en una
  sola lectura si fue por el estado, por permisos o por datos inválidos.

## Assumptions

- "El evento ya se realizó" significa que su fecha y hora de inicio ya
  pasaron. Un evento de hoy que todavía no empezó no se realizó.
- Los días que faltan para el evento se cuentan en días calendario de
  Argentina: un evento de mañana está a 1 día, uno de hoy a 0.
- La puntuación de una reseña es un entero de 1 a 5, como en la mayoría de
  las plataformas de reseñas. El diagrama la tipa como decimal, pero no pide
  medias estrellas.
- El precio de un evento a efectos de rango y orden es el de sus tipos de
  entrada: está en un rango si alguno de sus tipos lo está.
- Los montos se expresan en pesos argentinos, sin centavos obligatorios.
- No hay límite de entradas por compra más allá del cupo disponible.
- Las categorías son un catálogo precargado. Esta feature no define cómo se
  crean.
- El multimedia de un evento son direcciones de imágenes o videos. La
  plataforma no los almacena.
- Esta feature no incluye pantallas, comunicación con la app, almacenamiento
  ni datos de ejemplo. Los agregan las features de cada caso de uso, que
  dependen de esta.
