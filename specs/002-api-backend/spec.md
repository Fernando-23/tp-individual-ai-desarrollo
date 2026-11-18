# Feature Specification: Backend de AI Ticket It de punta a punta

**Feature Branch**: `002-api-backend`
**Created**: 2026-11-18
**Status**: Draft
**Input**: User description: "Backend de AI Ticket It funcionando de punta a punta sobre el dominio de la feature 001: los 12 casos de uso del enunciado expuestos como servicio para la app mobile, con datos en memoria y un seed reproducible que permita demostrar todos los flujos apenas arranca. Identidad simple: el usuario actual se elige entre los del seed (sin login). Errores del dominio traducidos a respuestas claras (validación, permiso, conflicto). Sin pantallas en esta feature."

## Alcance

Esta feature deja el sistema **funcionando como servicio**: la app mobile
(feature siguiente) le pide datos y le ordena acciones, y el servicio
responde aplicando las reglas de la feature 001
(`specs/001-modelo-dominio/spec.md`), sin redefinirlas.

Incluye:
- los 12 casos de uso del enunciado;
- la elección del usuario actual;
- los datos de demostración precargados;
- respuestas de error claras.

Queda **fuera**:
- las pantallas;
- el registro, el login y las contraseñas;
- los pagos reales;
- guardar datos entre reinicios. Al reiniciar se vuelve a los datos de
  demostración, como pide el enunciado: persistencia en memoria.

## Clarifications

### Session 2026-11-18

- Q: ¿El catálogo muestra solo los eventos próximos o también los pasados? → A: Solo los próximos (FR-007).
- Q: ¿Qué precio representa a un evento al ordenar por precio? → A: El más barato de sus tipos de entrada (FR-012).
- Q: ¿Se incluyen los favoritos? → A: Sí: marcar, desmarcar y listar (FR-024).

## User Scenarios & Testing *(mandatory)*

Cada historia se verifica pidiéndole al servicio lo que pediría la app y
mirando su respuesta, sin interfaz gráfica.

### User Story 1 - Arrancar con datos de demostración y elegir el usuario (Priority: P1)

Quien usa la app (y quien graba la demo) elige con qué persona operar entre
las precargadas: un organizador, un comprador, etc. Al arrancar, el sistema
ya tiene eventos, compras en todos los estados, mensajes y reseñas, así que
todos los flujos se pueden mostrar sin cargar nada a mano.

**Why this priority**: sin usuarios ni datos no se puede probar ninguna otra
historia, y la entrega es un video de demostración.

**Independent Test**: se arranca el sistema, se pide la lista de usuarios y
se verifica que existan los datos necesarios para recorrer cada caso de uso.

**Acceptance Scenarios**:

1. **Given** el sistema recién iniciado, **When** se piden los usuarios
   disponibles, **Then** aparecen al menos 2 organizadores y 2 compradores,
   con nombre y apellido.
2. **Given** el sistema recién iniciado, **When** se revisan los datos,
   **Then** hay eventos futuros, un evento que es hoy, eventos pasados y
   compras en los 5 estados, además de mensajes y reseñas.
3. **Given** una acción que requiere saber quién la hace, **When** se pide
   sin indicar el usuario, o con uno que no existe, **Then** se rechaza
   avisando que hay que elegir un usuario válido.
4. **Given** el sistema con datos modificados durante una demo, **When** se
   reinicia, **Then** vuelve exactamente a los datos de demostración. Las
   fechas se recalculan a partir del momento del arranque.

---

### User Story 2 - Explorar, buscar y ordenar eventos (Priority: P1)

Un comprador explora el catálogo por categoría, busca un espectáculo por
texto y ordena los resultados por precio, fecha o puntaje del organizador.
Al abrir un evento ve sus tipos de entrada con precio y disponibilidad, y la
reputación del organizador con las reseñas de sus eventos anteriores.

**Why this priority**: descubrir eventos es el punto de entrada de cualquier
compra. Cubre los casos de uso 3, 10 y 11.

**Independent Test**: con los datos de demostración, se busca, filtra y
ordena, y se verifica el resultado contra los datos conocidos.

**Acceptance Scenarios**:

1. **Given** el catálogo, **When** se piden las categorías, **Then** aparecen
   todas las del catálogo precargado.
2. **Given** un evento llamado "Noche de Jazz", **When** se busca "jazz",
   **Then** aparece. Se busca en el nombre y la descripción, sin distinguir
   mayúsculas ni acentos.
3. **Given** el catálogo, **When** se filtra por la categoría "Teatro",
   **Then** solo aparecen eventos de esa categoría.
4. **Given** una búsqueda por texto y una categoría a la vez, **When** se
   aplican juntas, **Then** aparecen los eventos que cumplen ambas.
5. **Given** el catálogo, **When** se ordena por precio, **Then** los eventos
   aparecen de menor a mayor según el precio que representa a cada evento
   (FR-012).
6. **Given** el catálogo, **When** se ordena por fecha, **Then** aparecen del
   más próximo al más lejano.
7. **Given** el catálogo, **When** se ordena por puntaje del organizador,
   **Then** aparecen de mayor a menor puntaje, y los organizadores sin
   puntaje van al final.
8. **Given** un evento, **When** se abre su detalle, **Then** se ven:
   - su descripción, fecha, categoría y multimedia;
   - cada tipo de entrada con su precio y sus entradas disponibles;
   - el organizador, con su puntaje y las reseñas de todos sus eventos.
9. **Given** una búsqueda sin resultados, **When** se ejecuta, **Then**
   devuelve una lista vacía, no un error.

---

### User Story 3 - Comprar entradas y seguir mis compras (Priority: P1)

Un comprador elige un tipo de entrada y una cantidad, y compra. Después ve
todas sus compras: el estado de cada una y, si está confirmada, cuántos días
faltan para el evento.

**Why this priority**: es la operación central del negocio. Cubre los casos
de uso 12 y 1.

**Independent Test**: con un usuario comprador se compra, se intenta superar
el cupo y se listan sus compras.

**Acceptance Scenarios**:

1. **Given** un tipo de entrada con disponibilidad, **When** el comprador
   compra 2 entradas, **Then** la compra queda `PENDIENTE`, con un total que
   calculó el sistema, y la disponibilidad baja en 2.
2. **Given** un tipo de entrada con 3 disponibles, **When** se piden 4,
   **Then** se rechaza explicando que no hay cupo suficiente, y la
   disponibilidad no cambia.
3. **Given** un comprador con compras en varios estados, **When** pide sus
   compras, **Then** ve cada una con su evento, tipo de entrada, cantidad,
   total y estado, y ve solo las suyas.
4. **Given** una compra `CONFIRMADA` de un evento que es dentro de 10 días,
   **When** el comprador pide sus compras, **Then** esa compra indica que
   faltan 10 días. Las compras en otros estados no indican días.
5. **Given** un comprador, **When** intenta ver el detalle de una compra
   ajena, **Then** se rechaza por falta de permiso.

---

### User Story 4 - Gestionar las ventas de mi evento (Priority: P1)

Un organizador ve las compras de uno de sus eventos: el estado de cada una y
cuántas entradas quedan de cada tipo. Desde ahí confirma las compras
pendientes (cuando llega el pago), rechaza las que no se pagan y registra el
ingreso el día del evento.

**Why this priority**: sin confirmación manual ninguna compra avanza, porque
no hay pago integrado (aclaración del docente). Cubre el caso de uso 2.

**Independent Test**: con el usuario organizador de un evento de
demostración, se listan sus compras y se confirma, rechaza y marca el
ingreso.

**Acceptance Scenarios**:

1. **Given** un evento con compras, **When** su organizador pide las ventas,
   **Then** ve cada compra con su comprador, cantidad, total y estado, y, por
   tipo de entrada, el cupo total, las entradas ocupadas y las disponibles.
2. **Given** un evento, **When** las pide alguien que no es su organizador,
   **Then** se rechaza por falta de permiso.
3. **Given** una compra `PENDIENTE`, **When** el organizador la confirma,
   **Then** pasa a `CONFIRMADA` y queda registrado quién y cuándo.
4. **Given** una compra `PENDIENTE`, **When** el organizador la rechaza,
   **Then** pasa a `CANCELADA` y su cupo vuelve a estar disponible.
5. **Given** una compra `CONFIRMADA` de un evento que es hoy, **When** el
   organizador registra el ingreso, **Then** pasa a `UTILIZADA`.
6. **Given** cualquier cambio de estado que las reglas no permiten (por
   ejemplo, registrar el ingreso antes del día del evento), **When** se
   intenta, **Then** se rechaza explicando el motivo, y la compra no cambia.
7. **Given** una compra, **When** se pide su detalle, **Then** se ve su
   historial: cada cambio de estado con quién lo hizo y cuándo.

---

### User Story 5 - Cancelar una compra y obtener el reembolso (Priority: P2)

Un comprador que no puede asistir cancela su compra. Si ya estaba
confirmada, se reembolsa en el acto.

**Why this priority**: es un derecho del comprador que pide el enunciado,
pero depende de que ya existan compras. Cubre los casos de uso 7 y 8.

**Independent Test**: se cancelan compras en distintos estados y con eventos
futuros y pasados.

**Acceptance Scenarios**:

1. **Given** una compra `CONFIRMADA` de un evento futuro, **When** su
   comprador la cancela, **Then** queda `REEMBOLSADA` y libera su cupo.
2. **Given** una compra `PENDIENTE`, **When** su comprador la cancela,
   **Then** queda `CANCELADA`.
3. **Given** una compra `UTILIZADA`, o de un evento que ya se realizó,
   **When** se intenta cancelar, **Then** se rechaza explicando el motivo.
4. **Given** una compra ajena, **When** un usuario intenta cancelarla,
   **Then** se rechaza por falta de permiso.

---

### User Story 6 - Chatear dentro de una compra (Priority: P2)

Comprador y organizador intercambian mensajes dentro de cada compra para
hacer consultas sobre el evento, el acceso o los cambios de fecha.

**Why this priority**: reduce la dependencia de canales externos, pero no
bloquea la compra. Cubre los casos de uso 5 y 6.

**Independent Test**: sobre una compra de demostración se envían y leen
mensajes con distintos usuarios.

**Acceptance Scenarios**:

1. **Given** una compra, **When** su comprador envía un mensaje, **Then**
   queda en el chat con su autor y su hora.
2. **Given** ese chat, **When** el organizador del evento lo lee y responde,
   **Then** ve los mensajes en orden y su respuesta se agrega al final.
3. **Given** una compra ajena, **When** un tercero intenta leer o escribir su
   chat, **Then** se rechaza por falta de permiso.
4. **Given** un mensaje vacío, **When** se envía, **Then** se rechaza como
   dato inválido.

---

### User Story 7 - Reseñar un evento al que asistí (Priority: P2)

Después del evento, quien usó su entrada lo puntúa del 1 al 5 y deja un
comentario. La reseña aparece en los eventos del organizador y actualiza su
puntaje.

**Why this priority**: construye la reputación que se usa para ordenar y
decidir compras, pero requiere eventos ya realizados. Cubre el caso de
uso 9.

**Independent Test**: con un comprador que tiene una compra `UTILIZADA` sin
reseñar (precargada), se reseña y se verifica el nuevo puntaje del
organizador.

**Acceptance Scenarios**:

1. **Given** un comprador con una compra `UTILIZADA` de un evento, **When**
   lo reseña con puntaje 5 y un comentario, **Then** la reseña se guarda y
   el puntaje del organizador se recalcula.
2. **Given** un comprador sin compras utilizadas de ese evento, **When**
   intenta reseñarlo, **Then** se rechaza por falta de permiso.
3. **Given** un comprador que ya reseñó el evento, **When** intenta reseñar
   otra vez, **Then** se rechaza por conflicto.

---

### User Story 8 - Publicar un evento (Priority: P3)

Un usuario publica un evento propio, con descripción, categoría, fecha,
multimedia y uno o más tipos de entrada con su precio y cupo. Queda como su
organizador.

**Why this priority**: la demostración ya cuenta con eventos precargados,
así que crear uno nuevo no bloquea a nadie. Cubre el caso de uso 4.

**Independent Test**: se publica un evento y se verifica que aparece en el
catálogo y que se puede comprar.

**Acceptance Scenarios**:

1. **Given** un usuario, **When** publica un evento válido con los tipos
   General ($5.000, 200 lugares) y VIP ($15.000, 20 lugares), **Then** el
   evento aparece en el catálogo con ese usuario como organizador.
2. **Given** un evento sin tipos de entrada, con una categoría inexistente o
   con una fecha pasada, **When** se intenta publicar, **Then** se rechaza
   indicando qué dato está mal.
3. **Given** un evento recién publicado, **When** otro usuario compra
   entradas, **Then** la compra funciona igual que con los eventos
   precargados.

---

### Edge Cases

- Se pide un evento, una compra o una categoría que no existe: se informa
  "no encontrado", sin confundirlo con falta de permiso.
- Se manda la cantidad o el puntaje como texto ("2") o con decimales: se
  rechaza como dato inválido.
- Una búsqueda con espacios de más o con mayúsculas y acentos distintos
  ("JAZZ", "jázz"): encuentra lo mismo que "jazz".
- Se pide un orden que no existe: se rechaza como dato inválido, indicando
  los órdenes posibles.
- El organizador compra entradas de su propio evento: ve esa compra tanto en
  "mis compras" como en las ventas de su evento.
- Se reinicia el sistema en medio de una demo: se pierde lo hecho y se
  vuelve al estado inicial. Es el comportamiento esperado.
- Un evento que es hoy y ya empezó: no se puede cancelar, pero sí registrar
  el ingreso.

## Requirements *(mandatory)*

### Functional Requirements

**Identidad y datos de demostración**

- **FR-001**: El sistema DEBE ofrecer la lista de usuarios disponibles para
  elegir con quién operar. No hay registro, login ni contraseñas.
- **FR-002**: Toda acción hecha por alguien (comprar, cambiar estados,
  chatear, reseñar, publicar, ver datos privados) DEBE indicar el usuario
  actual. Si falta o no existe, DEBE rechazarse con un aviso claro.
- **FR-003**: Al arrancar, el sistema DEBE cargar datos de demostración que
  permitan recorrer los 12 casos de uso sin carga manual. Como mínimo:
  - 2 organizadores y 2 compradores;
  - todas las categorías del catálogo;
  - eventos futuros, uno que es hoy y al menos uno pasado;
  - compras en los 5 estados;
  - una compra `UTILIZADA` sin reseñar;
  - mensajes y reseñas.
- **FR-004**: Las fechas de los datos de demostración DEBEN calcularse a
  partir del momento del arranque, para que la demo funcione cualquier día.
- **FR-005**: Al reiniciar, el sistema DEBE volver exactamente a los datos de
  demostración. Los cambios hechos se pierden.

**Catálogo**

- **FR-006**: El sistema DEBE listar las categorías del catálogo.
- **FR-007**: El sistema DEBE listar los eventos del catálogo. El catálogo
  muestra **solo los eventos próximos**, es decir, los que todavía no
  empezaron. Los eventos pasados se siguen viendo a través de las reseñas
  del organizador (FR-014) y de las compras de cada usuario.
- **FR-008**: La lista DEBE poder filtrarse por texto. Se busca en el nombre
  y la descripción, sin distinguir mayúsculas ni acentos, e ignorando los
  espacios de más.
- **FR-009**: La lista DEBE poder filtrarse por categoría.
- **FR-010**: La lista DEBE poder filtrarse por rango de precios, usando la
  regla de la feature 001: un evento está en el rango si alguno de sus tipos
  de entrada lo está.
- **FR-011**: Los filtros DEBEN poder combinarse entre sí y con un orden.
- **FR-012**: La lista DEBE poder ordenarse por:
  - **precio**, de menor a mayor, según el **precio más bajo** de sus tipos
    de entrada ("desde $X"), que es el mismo que muestra la lista (FR-013);
  - **fecha**, del más próximo al más lejano;
  - **puntaje del organizador**, de mayor a menor, con los organizadores sin
    puntaje al final.

  Un orden desconocido DEBE rechazarse como dato inválido.
- **FR-013**: Cada evento de la lista DEBE mostrar al menos:
  - nombre, categoría, fecha y organizador;
  - el precio más bajo;
  - el puntaje del organizador (o "sin puntaje");
  - si quedan entradas.
- **FR-014**: El detalle de un evento DEBE mostrar:
  - todos sus datos y su multimedia;
  - cada tipo de entrada con su precio y sus entradas disponibles;
  - el organizador, con su puntaje y las reseñas de todos sus eventos (caso
    de uso 10).

**Compras del comprador**

- **FR-015**: Un usuario DEBE poder comprar una cantidad de un tipo de
  entrada de un evento, con las reglas de la feature 001: cupo, total
  calculado por el sistema y estado inicial `PENDIENTE`.
- **FR-016**: Un usuario DEBE poder listar sus compras. Cada una muestra:
  - evento, fecha del evento, tipo de entrada, cantidad, total y estado;
  - los días que faltan para el evento, solo si está `CONFIRMADA`.

  La lista se ordena por fecha del evento, de la más próxima a la más
  lejana.
- **FR-017**: El detalle de una compra (datos, historial de estados y chat)
  DEBE poder verlo solo su comprador o el organizador del evento.
- **FR-018**: El comprador DEBE poder cancelar su compra, con las reglas de
  la feature 001: una `PENDIENTE` pasa a `CANCELADA` y una `CONFIRMADA` pasa a
  `REEMBOLSADA`.

**Ventas del organizador**

- **FR-019**: El organizador de un evento DEBE poder listar sus compras, con
  comprador, cantidad, total y estado. Por cada tipo de entrada ve el cupo
  total, las entradas ocupadas y las disponibles. Nadie más puede verlo.
- **FR-020**: El organizador DEBE poder confirmar o rechazar una compra
  pendiente y registrar el ingreso de una confirmada, con las reglas de la
  feature 001.

**Chat**

- **FR-021**: El comprador y el organizador DEBEN poder leer el chat de una
  compra, en orden, y enviar mensajes, en cualquier estado de la compra.
  Nadie más puede.

**Reseñas**

- **FR-022**: Un usuario DEBE poder reseñar un evento con una puntuación
  entera de 1 a 5 y un comentario, con las reglas de la feature 001.

**Publicación**

- **FR-023**: Un usuario DEBE poder publicar un evento indicando:
  - nombre, descripción y categoría (del catálogo);
  - fecha y hora, que DEBE ser futura;
  - multimedia (direcciones);
  - uno o más tipos de entrada con nombre, descripción, precio y cupo.

  Queda como su organizador.

**Favoritos**

- **FR-024**: Un usuario DEBE poder marcar y desmarcar eventos como
  favoritos, y listar sus favoritos. Se usan las reglas de la feature 001:
  sin duplicados, y desmarcar algo que no está no es un error.

**Respuestas de error**

- **FR-025**: Toda operación rechazada DEBE indicar, con un mensaje en
  español, la causa y su tipo:
  - dato inválido;
  - usuario no identificado;
  - sin permiso;
  - no encontrado;
  - conflicto de estado o de cupo.

  Una operación rechazada NO DEBE modificar ningún dato.
- **FR-026**: Todas las reglas de negocio DEBEN aplicarse con el dominio de
  la feature 001. Esta feature no reimplementa ni relaja ninguna.

### Key Entities *(include if feature involves data)*

Son las de la feature 001: Usuario, Categoria, Evento, TipoEntrada, Compra,
CambioEstadoCompra, Mensaje y Resenia. Esta feature agrega dos vistas:

- **Resumen de evento**: lo que se muestra de cada evento en el catálogo
  (FR-013).
- **Resumen de ventas**: por tipo de entrada, cupo, ocupadas y disponibles,
  más la lista de compras del evento (FR-019).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Apenas arranca el sistema, cada uno de los 12 casos de uso del
  enunciado se puede recorrer con los datos de demostración, sin cargar nada
  a mano. Se verifica con un recorrido por caso de uso.
- **SC-002**: El 100% de las operaciones rechazadas en los escenarios de esta
  spec informan su causa con el tipo correcto y no modifican ningún dato.
- **SC-003**: En los escenarios de prueba, ningún usuario puede ver ni
  modificar compras, ventas o chats que no le corresponden (0 accesos
  indebidos).
- **SC-004**: Con los datos de demostración, buscar, filtrar y ordenar el
  catálogo da el resultado de forma instantánea para quien usa la app (menos
  de 1 segundo).
- **SC-005**: Dos arranques seguidos producen los mismos datos de
  demostración: mismos usuarios, eventos, compras y estados. Las fechas
  difieren solo por el momento del arranque.

## Assumptions

- La app mobile es el único cliente. Corre en la misma red local que el
  servicio (constitución, Principio VI).
- El usuario actual lo elige la app y lo informa en cada pedido. Elegir un
  usuario no requiere contraseña.
- Las categorías del catálogo son fijas y vienen con los datos de
  demostración. Esta feature no permite crearlas.
- Los órdenes tienen un solo sentido cada uno: precio de menor a mayor, fecha
  del más próximo al más lejano y puntaje de mayor a menor. No se ofrece el
  sentido inverso.
- La búsqueda por texto no busca en el nombre del organizador ni en el de la
  categoría. La categoría se filtra aparte.
- Los eventos ya realizados no se pueden publicar ni editar. Esta feature no
  permite editar ni borrar eventos, porque ningún caso de uso lo pide.
- Los montos se muestran en pesos argentinos.
- No se pagina: el volumen de un TP (decenas de eventos) entra completo en
  una respuesta.
