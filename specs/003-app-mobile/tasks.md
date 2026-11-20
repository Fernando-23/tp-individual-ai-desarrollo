---

description: "Lista de tareas de la feature 003-app-mobile"
---

# Tasks: App mobile de AI Ticket It

**Input**: documentos de diseño en `/specs/003-app-mobile/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md),
[research.md](./research.md), [data-model.md](./data-model.md),
[contracts/pantallas.md](./contracts/pantallas.md), [quickstart.md](./quickstart.md)

**Tests**: según la constitución (Principio I), en mobile son obligatorios
los de la **lógica pura** y del **cliente HTTP**. Van primero y DEBEN fallar
antes de implementar. Los componentes visuales no llevan tests
automatizados. Cada historia se cierra con:

1. una **verificación de compilación** automática, que arma el bundle de
   Android con `npx expo export --platform android` y debe terminar sin
   errores;
2. una **verificación manual en el celular**, que hace el usuario con Expo
   Go siguiendo el "Independent Test" de la historia.

**Organization**: una fase por historia de la spec (US1 a US10).

## Format: `[ID] [P?] [Story] Description`

## Convenciones para todas las tareas

- **Rutas**: son relativas a la raíz del repo. El proyecto de la app vive en
  `mobile/`.
- **HTTP**: toda llamada pasa por `mobile/src/api/`. Las pantallas nunca
  usan `fetch`.
- **Pantallas con datos**: usan `useRecurso` y renderizan `EstadoCarga`
  (cargando, error con "Reintentar" o vacío con un mensaje propio).
- **Botones de acciones**: usan el componente `Boton`, con la prop `cargando`,
  que lo deshabilita mientras la acción está en curso (FR-006).
- **Estados de compra**: siempre se muestran con `EtiquetaEstado`, que usa
  color, ícono y texto de `src/logica/estados.js` (FR-004).
- **Textos**: en español rioplatense. Los colores y espaciados salen de
  `src/tema.js`, a través de `useTema()`. No hay colores escritos a mano en
  las pantallas.
- **Accesibilidad (FR-019, research D11b)**: en todo componente o pantalla,
  - los controles tocables miden al menos 48 × 48 y tienen
    `accessibilityRole` y un `accessibilityLabel` que dice qué hacen;
  - los estados de carga y deshabilitado se informan con
    `accessibilityState`;
  - las imágenes de eventos tienen `accessibilityLabel` con el nombre del
    evento;
  - no se desactiva el escalado de fuente.

---

## Phase 1: Setup

- [X] T001 Crear el proyecto con `npx create-expo-app@latest mobile --template blank` (JavaScript, SDK 58) desde la raíz del repo. Borrar el `.git` que pudiera crear dentro de `mobile/`, porque el repo es la raíz.
- [X] T002 Desde `mobile/`, instalar Expo Router y sus pares con `npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar`, más `@react-native-community/datetimepicker`. En `mobile/package.json`, poner `"main": "expo-router/entry"`. En `mobile/app.json`:
  - nombre "AI Ticket It", `slug` "ai-ticket-it" y `scheme` "aiticketit";
  - `orientation` "portrait";
  - el plugin `expo-router`;
  - el color de fondo de la marca.

  Borrar el `App.js` de la plantilla.
- [X] T003 [P] Instalar `vitest@5` como devDependency. Configurar el lint con `npx expo lint`, que crea `eslint.config.js` con `eslint-config-expo`. Dejar en `mobile/package.json` los scripts `start` (`expo start`), `test` (`vitest run`) y `lint` (`expo lint`). Crear `mobile/vitest.config.js`, que solo incluya `tests/**/*.test.js` y use el entorno `node`.
- [X] T004 [P] Crear `mobile/.env.example` con `EXPO_PUBLIC_API_URL=http://192.168.0.15:3000/api` y un comentario sobre cómo obtener la IP. Verificar que `mobile/.env` quede ignorado por el `.gitignore` de la raíz.
- [X] T005 Crear una pantalla mínima `mobile/app/index.js` ("AI Ticket It — Entradas a un click"). Verificar que `npx expo export --platform android` compile. **Checkpoint manual**: el usuario corre `npx expo start` y abre la app en su Android con Expo Go. Si Expo Go reporta incompatibilidad de SDK, se ajusta antes de seguir (research D1).

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: ninguna historia empieza hasta terminar esta fase.

### Tests de la lógica pura y del cliente (primero, en rojo)

- [X] T006 [P] Escribir `mobile/tests/logica/formato.test.js`:
  - `formatearPrecio`: 0 → "Gratis", 20000 → "$ 20.000", 1500.5 → "$ 1.501" (sin centavos);
  - `formatearFecha` y `formatearFechaHora`: con una zona fija, simulada con `process.env.TZ = 'America/Argentina/Buenos_Aires'` en el test;
  - `textoDiasRestantes`: 0 → "Es hoy", 1 → "Mañana", 10 → "Faltan 10 días", null → null, negativo → null.
- [X] T007 [P] Escribir `mobile/tests/logica/estados.test.js`:
  - los 5 estados tienen etiqueta, colores e ícono;
  - los colores, las etiquetas y los **íconos** son distintos entre sí;
  - un estado desconocido → "Desconocido" en gris.

  En el mismo archivo, probar `contraste(a, b)` de `src/logica/contraste.js`:
  - blanco/negro → 21;
  - mismo color → 1;
  - **todos los pares texto/fondo del tema y de los chips de estado** → ≥ 7;
  - íconos y bordes de controles sobre su fondo → ≥ 3 (SC-006).
- [X] T008 [P] Escribir `mobile/tests/logica/acciones.test.js`, con la tabla de data-model.md, fila por fila:
  - comprador con una compra PENDIENTE de un evento futuro → `cancelar` y `chatear`;
  - organizador con una PENDIENTE → `confirmar`, `rechazar` y `chatear`;
  - organizador con una CONFIRMADA y `diasRestantes` 0 → `registrarIngreso`; con 10 → no;
  - comprador con una UTILIZADA y `yaResenio: false` → `reseniar`; con `true` → no;
  - un tercero → ninguna;
  - el organizador que también es comprador → la unión de las acciones de los dos roles.
- [X] T009 [P] Escribir `mobile/tests/logica/validarEvento.test.js`:
  - un formulario válido → `valido: true`, con precios y cupos convertidos a número;
  - cada campo de texto vacío, sin categoría, fecha pasada, sin tipos, precio "-1" o "abc", cupo "0" o "1.5", y tipos repetidos ("VIP" y " vip ") → `errores` con el campo correspondiente.
- [X] T010 [P] Escribir `mobile/tests/api/cliente.test.js`, con `fetch` simulado:
  - arma la URL con `baseUrl`;
  - agrega `X-Usuario-Id` solo si hay usuario;
  - en un POST manda el JSON y el `Content-Type`;
  - 204 → `null`;
  - 409 `{ error }` → `ErrorApi` con ese `status` y ese `mensaje`;
  - `fetch` que falla o vence el timeout → `ErrorApi` con status 0 y un mensaje de conexión;
  - 401 → llama a `alNoIdentificado` y lanza.

  Verificar que T006 a T010 fallen.

### Implementación

- [X] T011 [P] Implementar `mobile/src/logica/formato.js` (research D6).
- [X] T012 [P] Implementar `mobile/src/logica/contraste.js` (fórmula de luminancia relativa de WCAG) y `mobile/src/logica/estados.js`. Sus colores salen de `mobile/src/tema.js`, así que crear también:
  - `tema.js`, con la paleta `claro` (marca, texto, texto secundario, fondo, superficie, borde, primario y su texto, peligro y su texto, foco), los 5 estados (fondo, texto, borde e ícono) y espaciados, radios y tamaños mínimos táctiles;
  - una lista `PARES_DE_CONTRASTE` que el test recorre;
  - `useTema()`, que hoy devuelve `claro`.

  Ajustar los tonos hasta que el test de T007 pase (research D11b).
- [X] T013 [P] Implementar `mobile/src/logica/acciones.js`.
- [X] T014 [P] Implementar `mobile/src/logica/validarEvento.js`.
- [X] T015 [P] Implementar `mobile/src/api/cliente.js` (`ErrorApi` y `crearCliente`). Correr `npm test`: T006 a T010 en verde.
- [X] T016 Implementar los módulos de endpoints, uno por función, según `specs/002-api-backend/contracts/api.md`:
  - `mobile/src/api/usuarios.js`;
  - `eventos.js` (`listarCategorias`, `buscarEventos`, `obtenerEvento`, `publicarEvento`, `obtenerVentas`, `reseniar`, `misEventos`);
  - `compras.js` (`comprar`, `misCompras`, `obtenerCompra`, `accionCompra`, `mensajes`, `enviarMensaje`);
  - `favoritos.js`.

  Todos reciben el cliente.
- [X] T017 Implementar `mobile/src/contexto/UsuarioContext.js`: provider con `usuario`, `elegir(usuario)` y `salir()`. Crea un único cliente con `baseUrl` de `process.env.EXPO_PUBLIC_API_URL`; `obtenerUsuarioId` lee el usuario actual y `alNoIdentificado` llama a `salir()`. Exponer `useUsuario()` y `useApi()`, que devuelve los módulos de endpoints ya armados con el cliente.
- [X] T018 [P] Implementar `mobile/src/hooks/useRecurso.js`:
  - devuelve `{ datos, cargando, error, recargar }`;
  - carga al ganar el foco, con `useFocusEffect` de `expo-router`;
  - ignora las respuestas de pedidos viejos.

  Implementar también `mobile/src/hooks/usePolling.js`, que repite una función cada N ms solo mientras la pantalla tiene el foco.
- [X] T019 [P] Implementar los componentes base en `mobile/src/componentes/`:
  - `EstadoCarga.js` (cargando, error + Reintentar, vacío + ícono y mensaje);
  - `Boton.js` (variantes primario, secundario y peligro; prop `cargando`);
  - `EtiquetaEstado.js`;
  - `Estrellas.js` (solo lectura y editable);
  - `Pantalla.js` (contenedor con área segura y fondo).
- [X] T020 Implementar `mobile/app/_layout.js`: un `Stack` dentro de `UsuarioProvider`. Si no hay usuario, redirige a `/elegir-usuario`. Las rutas `compra/[id]/reseniar` y `publicar` se presentan como modal. Borrar la `mobile/app/index.js` de prueba de T005, porque la reemplaza `(tabs)/index.js` en US2. Verificar que compile con `npx expo export --platform android`.

**Checkpoint**: la base está lista, con `npm test` y `npm run lint` en verde en `mobile/`.

---

## Phase 3: User Story 1 - Elegir con quién usar la app (Priority: P1) 🎯 MVP

**Independent Test**: se abre la app, se elige a Leo, se ve "Leo Sosa" arriba, se cambia a Ana y se ve "Ana Paz".

- [X] T021 [US1] Implementar `mobile/app/elegir-usuario.js`:
  - el logo y el lema;
  - la lista de usuarios (`GET /usuarios`), cada uno con un círculo de iniciales, nombre y apellido;
  - los estados de `EstadoCarga`; sin conexión, muestra un mensaje que sugiere revisar la IP en `.env`;
  - al tocar un usuario, `elegir(u)` y `router.replace('/')`.
- [X] T022 [US1] Implementar `mobile/app/(tabs)/_layout.js`:
  - las pestañas Explorar, Mis compras, Mis eventos y Favoritos, con íconos de `@expo/vector-icons` y el verde de la marca como color activo;
  - en el encabezado, el nombre del usuario actual y un botón "Cambiar" que lleva a `/elegir-usuario`.

  Crear las pestañas vacías que falten, con un placeholder. Verificar que compile. **Checkpoint manual US1**.

---

## Phase 4: User Story 2 - Explorar, buscar y ver un evento (Priority: P1)

**Independent Test**: buscar "jazz", filtrar por Teatro, ordenar por precio y abrir Noche de Jazz para ver tipos, puntaje y reseñas.

- [X] T023 [P] [US2] Implementar `mobile/src/componentes/TarjetaEvento.js`: imagen, nombre (hasta 2 líneas), fecha (`formatearFecha`), categoría, "desde $" (`formatearPrecio`), organizador con ★ y su puntaje (o "Sin reseñas"), y una cinta "Agotado" si `!hayEntradas`.
- [X] T024 [US2] Implementar `mobile/app/(tabs)/index.js` (Explorar):
  - buscador con espera de 400 ms antes de buscar;
  - chips horizontales de categorías ("Todas" más las del servidor);
  - selector de orden (Fecha, Precio o Puntaje), con el activo resaltado;
  - `FlatList` de `TarjetaEvento`; al tocar una, va a `/evento/[id]`;
  - vacío: "No hay eventos que coincidan".
- [X] T025 [US2] Implementar la parte de información de `mobile/app/evento/[id].js`:
  - imagen grande, nombre, fecha y hora, categoría y descripción;
  - la lista de tipos de entrada con precio y disponibles;
  - el bloque del organizador, con `Estrellas` de su puntaje, la cantidad de reseñas y la lista de `reseniasDelOrganizador` (evento, comprador, estrellas y detalle).

  Verificar que compile. **Checkpoint manual US2**.

---

## Phase 5: User Story 3 - Comprar entradas (Priority: P1)

**Independent Test**: como Sofía, comprar 2 VIP de Rock en el Parque y ver el aviso de compra pendiente.

- [X] T026 [P] [US3] Implementar `mobile/src/componentes/SelectorCantidad.js`, con botones − y + y un número. Respeta mínimo 1 y máximo igual a los disponibles; en el máximo, deshabilita el + y muestra "Quedan N".
- [X] T027 [US3] Agregar la compra en `mobile/app/evento/[id].js`:
  - los tipos de entrada se pueden seleccionar; los agotados se muestran deshabilitados con "Agotado";
  - al elegir uno aparecen el `SelectorCantidad`, el total (precio × cantidad, solo informativo) y el botón "Comprar";
  - si se compra: un aviso "¡Listo! Tu compra quedó pendiente hasta que el organizador confirme el pago", con un botón "Ver compra" que lleva a `/compra/[id]`, y la recarga del evento;
  - si falla: un aviso con el mensaje del servidor.

  Verificar que compile. **Checkpoint manual US3**.

---

## Phase 6: User Story 4 - Ver mis compras y su seguimiento (Priority: P1)

**Independent Test**: como Leo, ver sus 6 compras con su estado y, en la de Jazz, "Faltan 10 días". Abrirla y ver el historial.

- [X] T028 [P] [US4] Implementar `mobile/src/componentes/TarjetaCompra.js`: el evento, "Tipo × cantidad", el total, `EtiquetaEstado` y `textoDiasRestantes`, este último destacado si la compra está confirmada.
- [X] T029 [US4] Implementar `mobile/app/(tabs)/compras.js`: la lista de `misCompras` con `TarjetaCompra`. Al tocar una, va a `/compra/[id]`. Vacío: "Todavía no tenés compras".
- [X] T030 [US4] Implementar `mobile/app/compra/[id]/index.js`:
  - un resumen (evento, tipo, cantidad, total, comprador y organizador), la `EtiquetaEstado` grande y los días restantes;
  - el **historial** como línea de tiempo (estado, quién y `formatearFechaHora`);
  - una zona de acciones según `accionesDisponibles(compra, usuario.id, new Date(), { yaResenio })`.

  Para saber `yaResenio`, si la compra está UTILIZADA, se pide `obtenerEvento` y se busca una reseña con ese evento y ese comprador. En esta fase solo el botón "Chat" lleva a `/compra/[id]/chat`; el resto de las acciones se conectan en US5, US6 y US8. Verificar que compile. **Checkpoint manual US4**.

---

## Phase 7: User Story 5 - Gestionar las ventas de mis eventos (Priority: P1)

**Independent Test**: como Ana, abrir las ventas de Noche de Jazz y confirmar la compra de Sofía. Como Bruno, registrar el ingreso en Risas a Medianoche.

- [X] T031 [US5] Implementar `mobile/app/(tabs)/eventos.js` (Mis eventos):
  - las secciones "Próximos" y "Ya realizados" (estos atenuados), con `TarjetaEvento`; al tocar uno, va a `/ventas/[eventoId]`;
  - un botón flotante "Publicar" que lleva a `/publicar`. Hasta US10, la pantalla de publicar es un placeholder;
  - vacío: "Todavía no organizaste eventos".
- [X] T032 [US5] Implementar `mobile/app/ventas/[eventoId].js`:
  - por tipo de entrada, el nombre, una barra ocupadas/cupo y el texto "N disponibles de M";
  - una fila de chips con la cantidad por estado (con los colores de los estados);
  - la lista de compras (comprador, tipo × cantidad, total y `EtiquetaEstado`); al tocar una, va a `/compra/[id]`.
- [X] T033 [US5] Conectar en `mobile/app/compra/[id]/index.js` los botones "Confirmar pago", "Rechazar" (con un `Alert` de confirmación) y "Registrar ingreso", con `accionCompra(id, accion)`. Si sale bien, se recarga la compra; si falla, se muestra el mensaje del servidor. Verificar que compile. **Checkpoint manual US5**.

**Checkpoint MVP**: el flujo de la demo (comprar → confirmar → ver confirmada) funciona en el celular.

---

## Phase 8: User Story 6 - Cancelar una compra (Priority: P2)

- [X] T034 [US6] Conectar en `mobile/app/compra/[id]/index.js` el botón "Cancelar compra":
  - un `Alert` de confirmación: "Se te reembolsará el total" si la compra está confirmada, o "La compra quedará cancelada" si está pendiente;
  - después, `accionCompra(id, 'cancelar')` y la recarga.

  Verificar que compile. **Checkpoint manual**: Leo cancela Jazz y ve "Reembolsada".

---

## Phase 9: User Story 7 - Chatear dentro de una compra (Priority: P2)

- [X] T035 [US7] Implementar `mobile/app/compra/[id]/chat.js`:
  - `FlatList` de burbujas: las propias a la derecha en verde, las ajenas a la izquierda en gris, con el nombre (solo en las ajenas) y la hora;
  - `usePolling` cada 4000 ms para recargar los mensajes, con un desplazamiento hasta el final cuando llegan nuevos;
  - un campo de texto con el botón "Enviar", deshabilitado si el texto está vacío o hay un envío en curso;
  - `KeyboardAvoidingView`.

  Verificar que compile. **Checkpoint manual**: con dos celulares, o cambiando de usuario, el mensaje del otro aparece solo en 5 s como máximo.

---

## Phase 10: User Story 8 - Reseñar un evento al que fui (Priority: P2)

- [X] T036 [US8] Implementar `mobile/app/compra/[id]/reseniar.js` (modal):
  - `Estrellas` editable (1 a 5, obligatorio) y un comentario opcional (multilínea);
  - "Enviar" con `reseniar(eventoId, { puntuacion, detalle })`, que si sale bien vuelve atrás y si falla muestra el mensaje.

  Conectar el botón "Reseñar evento" en el detalle de la compra. Verificar que compile. **Checkpoint manual**: Leo reseña Impro Show.

---

## Phase 11: User Story 9 - Guardar eventos favoritos (Priority: P3)

- [X] T037 [US9] En `mobile/app/evento/[id].js`, agregar un ícono de corazón en el encabezado: se ve lleno o vacío según `esFavorito` y alterna con `PUT` o `DELETE`, actualizándose de forma optimista y volviendo atrás si falla. Implementar `mobile/app/(tabs)/favoritos.js`, con la lista de `TarjetaEvento` y el vacío "Todavía no marcaste favoritos". Verificar que compile.

---

## Phase 12: User Story 10 - Publicar un evento (Priority: P3)

- [X] T038 [US10] Implementar `mobile/app/publicar.js`:
  - campos de nombre, descripción (multilínea) y URL de imagen (opcional);
  - chips de categoría;
  - fecha y hora con `DateTimePicker` (en Android, primero la fecha y después la hora);
  - una lista de tipos de entrada (nombre, precio y cupo con teclado numérico), con "Agregar tipo" y "Quitar" (deshabilitado si queda uno).

  Antes de enviar, se valida con `validarEvento` y cada error se muestra debajo de su campo. Si `publicarEvento` sale bien, `router.replace('/evento/<id>')`; si falla, se muestra el mensaje. Verificar que compile. **Checkpoint manual**: Leo publica un evento y aparece en Explorar y en Mis eventos.

---

## Phase 13: Polish & Cross-Cutting Concerns

- [X] T039 Recorrido completo en el celular, con el usuario, siguiendo `specs/003-app-mobile/quickstart.md` y los 12 casos de uso. Anotar los problemas encontrados y corregirlos, o registrarlos como pendientes del backend.
- [X] T040 [P] Crear `specs/003-app-mobile/trazabilidad.md`, que asocia cada caso de uso con su pantalla, su endpoint y su checkpoint manual (SC-001).
- [X] T041 [P] Actualizar `CLAUDE.md` (sección manual: estructura de `mobile/`, comandos y la regla de que todo `fetch` va en `src/api/`).
- [X] T042 Correr `npm test` y `npm run lint` en `backend/` y en `mobile/`, y `npx expo export --platform android` en `mobile/`.
- [X] T043 Agregar a `docs/bitacora-ia.md` la entrada de la app: qué resolvió bien la IA, qué hubo que corregir en el celular real, qué pidió el backend y qué tal anduvo Expo Go.
- [ ] T044 **(Opcional, después del MVP y solo si hay tiempo antes del domingo)** Implementar el modo oscuro:
  - agregar la paleta `oscuro` en `mobile/src/tema.js`, con sus pares en `PARES_DE_CONTRASTE` (el test de T007 la cubre);
  - hacer que `useTema()` elija con `useColorScheme()` y que `app.json` use `userInterfaceStyle: "automatic"`;
  - verificar en el celular con el modo oscuro del sistema activado.

---

## Dependencies & Execution Order

- **Setup → Foundational → US1**: obligatorio, en ese orden. T005 incluye la verificación en el celular real.
- **US2 → US3**: la compra vive en el detalle del evento.
- **US4**: depende de US1. Es el destino de "Ver compra" de US3, aunque se puede hacer antes.
- **US5, US6, US7 y US8**: dependen de US4 (el detalle de la compra).
- **US9**: depende de US2. **US10** depende de US5 (el botón Publicar está en Mis eventos).
- **Polish**: depende de todas.

```text
Setup → Foundational → US1 → US2 → US3 ─┐
                          └──→ US4 ─┬→ US5 → US10
                                    ├→ US6
                                    ├→ US7
                                    └→ US8
                         US2 → US9 ───────────→ Polish
```

## Implementation Strategy

1. **MVP**: Setup + Foundational + US1 a US5, que dejan listo el flujo de la
   demo: elegir usuario, explorar, comprar, ver la compra y que el
   organizador la confirme y registre el ingreso.
2. Después US6 a US8 (cancelar, chat y reseñar). Con eso quedan cubiertos
   los 12 casos de uso salvo publicar.
3. Por último US9 y US10, y el cierre.
4. Commit por fase. En cada checkpoint manual se para y espera la
   confirmación del usuario desde el celular.
