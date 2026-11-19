# Feature Specification: App mobile de AI Ticket It

**Feature Branch**: `003-app-mobile`
**Created**: 2026-11-18
**Status**: Draft
**Input**: User description: "App mobile de AI Ticket It sobre el backend de la feature 002: los 12 casos de uso del enunciado usables desde el celular, ejecutándose localmente en un dispositivo mobile."

## Alcance

Esta feature es la **interfaz** de AI Ticket It: la app que usan compradores y
organizadores desde el celular. Todas las reglas y los datos vienen del
servicio de la feature 002 (`specs/002-api-backend/`). La app muestra,
pregunta y envía, pero no decide reglas de negocio.

Incluye:
- los 12 casos de uso del enunciado;
- la elección del usuario;
- los favoritos.

Queda **fuera**:
- el registro y el login;
- los pagos;
- las notificaciones push;
- el modo sin conexión;
- la publicación en tiendas de apps.

La app corre localmente en un celular conectado a la misma red que la PC del
servicio (constitución, Principio VI).

Es probable que al construir la app aparezcan ajustes del servicio. Se
registran y se resuelven en features propias, sin mezclarlos acá.

## Clarifications

### Session 2026-11-19

- Q: ¿El chat se actualiza solo o a mano? → A: Solo, cada pocos segundos mientras está abierto (Historia 7, FR-014).
- Q: ¿En qué dispositivo se ejecuta? → A: En un celular Android con Expo Go (afecta el plan, no los requisitos).
- Q: ¿Qué nivel de experiencia de usuario y accesibilidad? → A: Cuidar la UX y apuntar a WCAG **AAA** sin perder simplicidad (FR-019). El modo oscuro y el daltónico son ideas para después del MVP, solo si hay tiempo antes de la entrega (domingo 22/11).

## User Scenarios & Testing *(mandatory)*

Cada historia se verifica usando la app en el celular contra el servicio
con los datos de demostración.

### User Story 1 - Elegir con quién usar la app (Priority: P1)

Al abrir la app, la persona elige con qué usuario operar (Ana, Bruno, Leo o
Sofía) y puede cambiarlo cuando quiera. Así la demo muestra el lado del
comprador y el del organizador.

**Why this priority**: sin usuario no se puede comprar, ver compras ni
gestionar ventas.

**Independent Test**: se abre la app, se elige un usuario, se ve su nombre y
se cambia por otro.

**Acceptance Scenarios**:

1. **Given** la app recién abierta, **When** carga, **Then** muestra la
   lista de usuarios disponibles para elegir.
2. **Given** la lista, **When** se elige a Leo, **Then** la app pasa a la
   pantalla principal y deja claro que se está usando como Leo.
3. **Given** la app en uso como Leo, **When** se elige cambiar de usuario y
   se toma a Ana, **Then** todo lo que se muestra pasa a ser de Ana (sus
   compras, sus eventos).
4. **Given** que el servicio no responde, **When** se abre la app, **Then**
   se ve un mensaje claro de que no hay conexión con el servidor y un botón
   para reintentar.

---

### User Story 2 - Explorar, buscar y ver un evento (Priority: P1)

El comprador recorre los próximos eventos, busca por texto, filtra por
categoría y ordena por precio, fecha o puntaje del organizador. Al abrir un
evento ve sus entradas y la reputación del organizador con las reseñas de
sus eventos anteriores.

**Why this priority**: es la puerta de entrada a la compra. Cubre los casos
de uso 3, 10 y 11.

**Independent Test**: se busca "jazz", se filtra por Teatro, se ordena por
precio y se abre un evento.

**Acceptance Scenarios**:

1. **Given** la pantalla de exploración, **When** carga, **Then** muestra
   los próximos eventos. De cada uno se ve:
   - imagen, nombre, fecha y categoría;
   - el precio "desde";
   - el organizador con su puntaje;
   - un aviso si está agotado.
2. **Given** la búsqueda, **When** se escribe "jazz", **Then** la lista se
   reduce a los eventos que coinciden.
3. **Given** las categorías, **When** se elige "Teatro", **Then** solo se
   ven eventos de teatro. Se puede volver a ver todas.
4. **Given** la lista, **When** se elige ordenar por precio, fecha o puntaje,
   **Then** el orden cambia y se ve qué orden está activo.
5. **Given** una búsqueda sin resultados, **When** se ejecuta, **Then** se
   ve un mensaje de "no hay eventos" en lugar de una pantalla vacía.
6. **Given** un evento, **When** se abre, **Then** se ven:
   - su descripción, categoría, y fecha y hora;
   - cada tipo de entrada con precio y disponibles;
   - el organizador con su puntaje y las reseñas de sus eventos.

---

### User Story 3 - Comprar entradas (Priority: P1)

Desde el detalle de un evento, el comprador elige un tipo de entrada y una
cantidad, ve el total y confirma la compra. La compra queda pendiente hasta
que el organizador confirme el pago.

**Why this priority**: es la operación central del negocio. Cubre el caso de
uso 12.

**Independent Test**: como Sofía, se compran 2 VIP de Rock en el Parque y
se ve la compra en "Mis compras".

**Acceptance Scenarios**:

1. **Given** el detalle de un evento, **When** se elige un tipo y una
   cantidad, **Then** se ve el total antes de confirmar.
2. **Given** un tipo con 18 disponibles, **When** se intenta elegir más de
   18, **Then** la app no lo permite y muestra cuántas quedan.
3. **Given** un tipo agotado, **When** se mira, **Then** aparece como
   agotado y no se puede elegir.
4. **Given** la compra confirmada por el comprador, **When** el servicio la
   acepta, **Then** se ve:
   - un mensaje de éxito;
   - que la compra quedó **pendiente** hasta que el organizador confirme el
     pago;
   - una forma de ir a la compra.
5. **Given** que el servicio rechaza la compra (por ejemplo, porque otro
   compró las últimas entradas), **When** responde, **Then** se muestra su
   mensaje y no se registra nada.
6. **Given** un evento que organiza el usuario actual, **When** lo abre,
   **Then** puede igualmente comprar entradas (es un caso permitido).

---

### User Story 4 - Ver mis compras y su seguimiento (Priority: P1)

El comprador ve todas sus compras, distingue con claridad en qué estado está
cada una y, si está confirmada, cuántos días faltan. En el detalle ve la
historia completa de la compra.

**Why this priority**: es el seguimiento que pide el enunciado. Cubre el
caso de uso 1.

**Independent Test**: como Leo, se abre "Mis compras" y se verifica el
estado y los días de cada una.

**Acceptance Scenarios**:

1. **Given** "Mis compras" de Leo, **When** carga, **Then** se ve cada
   compra con su evento, tipo, cantidad, total y estado. Cada estado tiene un
   color **y** un texto propio: pendiente, confirmada, utilizada, cancelada
   y reembolsada.
2. **Given** una compra confirmada de un evento dentro de 10 días, **When** se
   mira, **Then** dice "Faltan 10 días". El mismo día dice "Es hoy", y al
   día siguiente, "Mañana".
3. **Given** un usuario sin compras, **When** abre "Mis compras", **Then** se
   ve un mensaje de que todavía no tiene compras.
4. **Given** una compra, **When** se abre, **Then** se ve su historial de
   estados, con quién hizo cada cambio y cuándo, y las acciones que tiene
   disponibles.

---

### User Story 5 - Gestionar las ventas de mis eventos (Priority: P1)

El organizador ve sus eventos y, de cada uno, las compras con su estado y
cuántas entradas quedan de cada tipo. Confirma las compras pendientes cuando
recibe el pago, rechaza las que no se pagan y registra el ingreso el día del
evento.

**Why this priority**: sin confirmación ninguna compra avanza, porque no hay
pago integrado. Cubre el caso de uso 2.

**Independent Test**: como Ana, se abren las ventas de Noche de Jazz y se
confirma la compra pendiente de Sofía. Como Bruno, se registra el ingreso de
la compra del stand up de hoy.

**Acceptance Scenarios**:

1. **Given** "Mis eventos" de Ana, **When** carga, **Then** se ven sus
   eventos, próximos y pasados, diferenciados.
2. **Given** las ventas de un evento, **When** cargan, **Then** se ven:
   - por tipo de entrada, el cupo, las ocupadas y las disponibles;
   - un resumen de cuántas compras hay en cada estado;
   - la lista de compras con su comprador y su estado.
3. **Given** una compra pendiente, **When** el organizador la confirma,
   **Then** pasa a confirmada y la pantalla se actualiza.
4. **Given** una compra pendiente, **When** el organizador la rechaza,
   **Then** la app pide confirmación antes. Al aceptar, pasa a cancelada y
   las disponibles se actualizan.
5. **Given** una compra confirmada de un evento de hoy, **When** el
   organizador registra el ingreso, **Then** pasa a utilizada.
6. **Given** una acción que el servicio rechaza (por ejemplo, registrar el
   ingreso antes del día del evento), **When** responde, **Then** se muestra
   el motivo y la compra no cambia.

---

### User Story 6 - Cancelar una compra (Priority: P2)

El comprador que no puede asistir cancela su compra. Si estaba confirmada,
se reembolsa en el acto.

**Why this priority**: cubre los casos de uso 7 y 8, y requiere compras ya
hechas.

**Independent Test**: como Leo, se cancela la compra confirmada de Noche de
Jazz.

**Acceptance Scenarios**:

1. **Given** una compra confirmada de un evento futuro, **When** el
   comprador elige cancelar, **Then** la app avisa que se reembolsará y pide
   confirmación. Al aceptar, pasa a reembolsada.
2. **Given** una compra pendiente, **When** se cancela, **Then** pasa a
   cancelada, también con confirmación previa.
3. **Given** una compra utilizada o de un evento pasado, **When** se mira,
   **Then** no se ofrece cancelar.

---

### User Story 7 - Chatear dentro de una compra (Priority: P2)

Comprador y organizador intercambian mensajes desde la compra.

**Why this priority**: cubre los casos de uso 5 y 6. No bloquea la compra.

**Independent Test**: como Leo, se escribe en el chat de su compra de Jazz.
Como Ana, se lee y se responde.

**Acceptance Scenarios**:

1. **Given** el chat de una compra, **When** se abre, **Then** se ven los
   mensajes en orden, distinguiendo los propios de los del otro, con su hora.
2. **Given** el chat, **When** se escribe y se envía un mensaje, **Then**
   aparece al final y el campo se vacía.
3. **Given** un mensaje vacío, **When** se intenta enviar, **Then** la app no
   lo permite.
4. **Given** un chat abierto, **When** la otra parte escribe, **Then** el
   mensaje nuevo aparece solo en pocos segundos, sin tocar nada. Mientras el
   chat no está en pantalla no se consulta nada.

---

### User Story 8 - Reseñar un evento al que fui (Priority: P2)

Después de usar su entrada, el comprador puntúa el evento de 1 a 5 y deja un
comentario.

**Why this priority**: cubre el caso de uso 9. Requiere compras utilizadas.

**Independent Test**: como Leo, se reseña Impro Show desde su compra
utilizada.

**Acceptance Scenarios**:

1. **Given** una compra utilizada de un evento que todavía no reseñó,
   **When** la abre, **Then** ve la opción de reseñar.
2. **Given** el formulario de reseña, **When** elige 1 a 5 estrellas,
   escribe un comentario opcional y envía, **Then** se confirma el envío y
   ya no se ofrece reseñar ese evento.
3. **Given** que el servicio rechaza la reseña (por ejemplo, porque ya
   reseñó), **When** responde, **Then** se muestra el motivo.

---

### User Story 9 - Guardar eventos favoritos (Priority: P3)

El usuario marca eventos como favoritos y los encuentra en una lista propia.

**Why this priority**: el enunciado lo menciona, pero no es parte de los 12
casos de uso.

**Independent Test**: como Sofía, se marca Hamlet como favorito y aparece en
su lista.

**Acceptance Scenarios**:

1. **Given** el detalle de un evento, **When** se toca el corazón, **Then**
   queda marcado como favorito. Al tocarlo de nuevo, se desmarca.
2. **Given** la lista de favoritos, **When** carga, **Then** muestra los
   eventos marcados. Si no hay ninguno, muestra un mensaje.

---

### User Story 10 - Publicar un evento (Priority: P3)

Un usuario publica un evento propio con uno o más tipos de entrada.

**Why this priority**: cubre el caso de uso 4. La demo ya tiene eventos
precargados.

**Independent Test**: como Leo, se publica un evento con General y VIP, y
aparece en el catálogo y en sus eventos.

**Acceptance Scenarios**:

1. **Given** el formulario, **When** se completan nombre, descripción,
   categoría, fecha y hora, una imagen opcional y al menos un tipo de entrada
   (nombre, precio, cupo), **Then** se puede publicar.
2. **Given** el formulario, **When** se agregan o quitan tipos de entrada,
   **Then** se puede tener uno o varios, nunca cero.
3. **Given** datos inválidos (fecha pasada, precio negativo, cupo 0, campos
   vacíos), **When** se intenta publicar, **Then** se indica qué corregir,
   antes de enviar si es posible. Si no, se muestra el mensaje del servicio.
4. **Given** la publicación exitosa, **When** termina, **Then** se abre el
   evento recién publicado.

---

### Edge Cases

- **Se pierde la conexión con el servidor en medio del uso**: cada pantalla
  muestra el error con un botón para reintentar, sin cerrar la app.
- **Una acción tarda**: el botón se deshabilita y se ve que está en curso,
  así no se envía dos veces.
- **El usuario elegido deja de existir** (el servidor se reinició con otros
  datos): se vuelve a la elección de usuario.
- **Nombres o descripciones largas**: se cortan prolijamente en las listas y
  se ven completos en el detalle.
- **Precio 0**: se muestra como "Gratis".
- **Después de comprar, cancelar o confirmar**: las pantallas relacionadas
  (detalle del evento, mis compras, ventas) muestran los datos actualizados
  al volver a ellas.

## Requirements *(mandatory)*

### Functional Requirements

**General**

- **FR-001**: La app DEBE funcionar en un celular, conectada al servicio de
  la feature 002 por la red local. La dirección del servicio DEBE poder
  configurarse sin cambiar el código.
- **FR-002**: Toda pantalla que carga datos DEBE mostrar los estados
  **cargando**, **error** (con reintento) y **vacío** (con un mensaje),
  además del contenido.
- **FR-003**: Ante una operación rechazada, la app DEBE mostrar el mensaje
  que devuelve el servicio.
- **FR-004**: Los estados de compra DEBEN distinguirse con color **y**
  texto, siempre con los mismos colores en toda la app.
- **FR-005**: Las fechas DEBEN mostrarse en español y en la hora local, por
  ejemplo "sáb 28 nov, 21:00". Los montos, en pesos con separador de miles,
  por ejemplo "$ 20.000". El precio 0 se muestra como "Gratis".
- **FR-006**: Los botones de acciones que modifican datos DEBEN
  deshabilitarse mientras la acción está en curso.
- **FR-007**: Las acciones destructivas (cancelar una compra, rechazar una
  compra) DEBEN pedir confirmación.

**Usuario**

- **FR-008**: La app DEBE permitir elegir el usuario entre los del servicio
  y cambiarlo en cualquier momento. El usuario actual DEBE estar visible.

**Explorar y comprar**

- **FR-009**: La app DEBE listar los próximos eventos, con búsqueda por
  texto, filtro por categoría y orden por precio, fecha o puntaje, que se
  pueden combinar.
- **FR-010**: La app DEBE mostrar el detalle de un evento, con sus tipos de
  entrada, los disponibles, la reputación del organizador y sus reseñas.
- **FR-011**: La app DEBE permitir comprar un tipo de entrada en una
  cantidad entre 1 y los disponibles, mostrando el total antes de confirmar.

**Compras**

- **FR-012**: La app DEBE listar las compras del usuario, con estado y días
  restantes si está confirmada, y mostrar el detalle con el historial.
- **FR-013**: En el detalle de una compra, la app DEBE ofrecer **solo** las
  acciones que tienen sentido para el usuario y el estado:
  - comprador: cancelar (si está pendiente o confirmada y el evento no pasó)
    y reseñar (si está utilizada y no reseñó);
  - organizador: confirmar o rechazar (si está pendiente) y registrar el
    ingreso (si está confirmada y es el día del evento o después).

  El servicio es quien decide en última instancia (FR-003).
- **FR-014**: La app DEBE ofrecer el chat de la compra al comprador y al
  organizador. Mientras el chat está en pantalla, DEBE actualizarse solo
  cada pocos segundos (5 como máximo).

**Organizador**

- **FR-015**: La app DEBE listar los eventos que organiza el usuario y, para
  cada uno, mostrar las ventas: disponibles por tipo, cantidad por estado y
  compras.

**Reseñas, favoritos y publicación**

- **FR-016**: La app DEBE permitir reseñar con una puntuación de 1 a 5
  estrellas y un comentario opcional.
- **FR-017**: La app DEBE permitir marcar y desmarcar favoritos desde el
  detalle, y listarlos.
- **FR-018**: La app DEBE permitir publicar un evento con uno o más tipos de
  entrada, validando en la app lo evidente (campos vacíos, números
  inválidos, fecha pasada) antes de enviar.

**Accesibilidad y experiencia de uso**

- **FR-019**: La app DEBE apuntar a WCAG 2.2 nivel **AAA** en lo que aplica a
  una app mobile. Esto implica:
  - **contraste**: el texto tiene un contraste mínimo de 7:1 con su fondo,
    y los íconos y bordes de controles, 3:1;
  - **áreas táctiles**: todo control tocable mide al menos 48 × 48;
  - **lectores de pantalla**: todo control tiene un nombre y un rol
    accesibles (por ejemplo, "Comprar 2 entradas VIP, total $ 40.000"), y
    las imágenes informativas tienen una descripción;
  - **tamaño de texto**: el texto respeta el tamaño de fuente del sistema
    sin que se corte el contenido esencial;
  - **color**: la información nunca depende solo del color. Los estados
    llevan ícono y texto, y la paleta se distingue con los tipos comunes de
    daltonismo;
  - **mensajes**: los errores dicen qué pasó y cómo seguir, en lenguaje
    simple.

### Key Entities *(include if feature involves data)*

La app no tiene datos propios. Muestra las vistas del contrato de la
feature 002: Usuario, Categoría, EventoResumen, EventoDetalle, CompraResumen,
CompraDetalle, Mensaje, Reseña y Ventas. Lo único que recuerda es el
**usuario actual** elegido.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Cada uno de los 12 casos de uso del enunciado se puede
  completar desde la app con los datos de demostración. Se verifica con un
  recorrido por caso de uso.
- **SC-002**: Desde el detalle de un evento, una compra se completa en menos
  de 30 segundos y con no más de 4 toques.
- **SC-003**: En "Mis compras", el estado de cada compra se identifica de un
  vistazo, sin abrirla. Los 5 estados tienen un color y un texto distintos.
- **SC-004**: El 100% de las pantallas con datos muestran cargando, error
  con reintento y vacío.
- **SC-006**: El 100% de los pares texto/fondo de la paleta cumplen el
  contraste AAA (7:1), y se verifica automáticamente.
- **SC-005**: El flujo elegido para el video (por ejemplo, comprar →
  confirmar → ingresar → reseñar) se recorre completo en menos de 3 minutos.

## Assumptions

- El celular y la PC están en la misma red Wi-Fi. La dirección del servicio
  se configura una vez por red.
- La app se usa en orientación vertical, en un celular de tamaño estándar.
- Un solo idioma: español rioplatense.
- Modo oscuro y modo daltónico: quedan fuera del MVP. La paleta base ya es
  apta para daltonismo y los colores se centralizan en un tema, así que
  agregar un modo oscuro después es definir otra paleta.
- La identidad visual sigue la portada del enunciado: el verde del logo "AI
  Ticket It" y el lema "Entradas a un click". La app no copia ninguna marca
  real de ticketeras.
- No se recuerda el usuario elegido entre aperturas de la app: se elige al
  abrirla. Es rápido y en la demo se cambia seguido.
- La imagen de un evento nuevo es una dirección (URL) opcional. No se suben
  fotos desde el celular.
- La app no hace búsquedas sin conexión ni guarda datos para usarlos sin red.
- Los ajustes que necesite el servicio se registran en la bitácora y se
  hacen en una feature aparte del backend.
