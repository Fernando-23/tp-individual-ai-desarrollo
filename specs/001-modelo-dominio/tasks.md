---

description: "Lista de tareas de la feature 001-modelo-dominio"
---

# Tasks: Modelo de dominio de AI Ticket It

**Input**: documentos de diseño en `/specs/001-modelo-dominio/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md),
[research.md](./research.md), [data-model.md](./data-model.md),
[contracts/dominio.md](./contracts/dominio.md), [quickstart.md](./quickstart.md)

**Tests**: obligatorios (constitución, Principio I). En cada historia, las
tareas de test van **primero** y DEBEN fallar (rojo) antes de implementar.

**Organization**: las tareas se agrupan por historia de usuario de la spec
(US1 a US5), para que cada una se implemente y verifique como un incremento.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin dependencias
  pendientes).
- **[Story]**: historia de la spec a la que pertenece (US1 a US5).
- Todas las rutas son relativas a la raíz del repo.

## Convenciones para todas las tareas

- JavaScript ESM. Los tests importan `describe`, `it` y `expect` desde
  `vitest`. Los mensajes de error van en español.
- El dominio no usa `new Date()` sin argumentos, `Date.now()`, `Math.random`,
  `console`, `fs` ni `express`. El tiempo entra como `ahora` (research D6).
- Las fechas de los tests se escriben con el offset explícito de Buenos Aires,
  por ejemplo `new Date('2026-11-18T15:00:00-03:00')`, usando el helper `en()`
  de los builders.
- Las colecciones expuestas (`favoritos`, `compras`, `historial`, `mensajes`,
  `resenias`) se devuelven como copias congeladas
  (`Object.freeze([...arr])`), para que no se puedan modificar desde afuera.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: crear el proyecto `backend/` con sus herramientas.

- [X] T001 Crear las carpetas `backend/src/domain/` y `backend/tests/domain/`, y un `.gitignore` en la raíz que ignore `node_modules/` y `coverage/`
- [X] T002 Crear `backend/package.json`:
  - `"name": "ai-ticket-it-backend"`, `"private": true`, `"type": "module"`;
  - `"engines": { "node": ">=22.12" }`;
  - scripts `test` (`vitest run`), `test:watch` (`vitest`) y `lint` (`eslint .`).

  Después, instalar como devDependencies `vitest@5`, `eslint@10` y `@eslint/js@10` con `npm install -D`, desde `backend/`.
- [X] T003 [P] Crear `backend/eslint.config.js` (flat config):
  - `js.configs.recommended` de `@eslint/js`;
  - `languageOptions: { ecmaVersion: 'latest', sourceType: 'module' }`;
  - ignorar `node_modules/` y `coverage/`.

  Verificar que `npm run lint` corre sin errores.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: errores, fechas, validaciones y el enum de estados que usan
todas las historias.

**⚠️ CRITICAL**: ninguna historia empieza hasta terminar esta fase.

- [X] T004 [P] Escribir `backend/tests/domain/errores.test.js`:
  - `ErrorValidacion`, `ErrorPermiso` y `ErrorConflicto` son `instanceof ErrorDeDominio` e `instanceof Error`;
  - conservan el `message` recibido;
  - su `name` es el nombre de la clase.

  Verificar que falla.
- [X] T005 [P] Escribir `backend/tests/domain/fechas.test.js`:
  - `diaCalendario(new Date('2026-11-19T02:59:00Z'))` es `'2026-11-18'` y `diaCalendario(new Date('2026-11-19T03:00:00Z'))` es `'2026-11-19'` (medianoche en Buenos Aires);
  - `diasEntre`: mismo día → 0, aunque sea de 00:01 a 23:59; día siguiente → 1, aunque sea de 23:59 a 00:01; pasado → negativo; cruces de mes y de año (31/12 → 1/1 = 1).

  Verificar que falla.
- [X] T006 [P] Escribir `backend/tests/domain/estadoCompra.test.js`:
  - `EstadoCompra` tiene exactamente las 5 claves, con valor igual a la clave, y está congelado;
  - `ESTADOS_QUE_OCUPAN_CUPO` contiene `PENDIENTE`, `CONFIRMADA` y `UTILIZADA`.

  Verificar que falla.
- [X] T007 [P] Implementar `backend/src/domain/errores.js`: `ErrorDeDominio extends Error`, y `ErrorValidacion`, `ErrorPermiso` y `ErrorConflicto`, que la extienden y fijan `this.name` (research D8).
- [X] T008 [P] Implementar `backend/src/domain/fechas.js` (research D7):
  - `diaCalendario(fecha)`, con `Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' })`;
  - `diasEntre(desde, hasta)`, que parsea los dos `YYYY-MM-DD` y resta con `Date.UTC`, dividiendo por 86 400 000;
  - exportar la constante `ZONA_HORARIA`.
- [X] T009 [P] Implementar `backend/src/domain/estadoCompra.js` con `EstadoCompra` (objeto congelado) y `ESTADOS_QUE_OCUPAN_CUPO` (Set). Las `TRANSICIONES` se agregan en US2.
- [X] T010 Implementar `backend/src/domain/validaciones.js`, con helpers internos que lanzan `ErrorValidacion` con el nombre del campo en el mensaje:
  - `textoNoVacio(valor, campo)`, que devuelve el texto recortado;
  - `texto(valor, campo)`, que permite vacío pero exige string;
  - `enteroMayorA(valor, minimo, campo)` y `numeroNoNegativo(valor, campo)`;
  - `instanciaDe(valor, Clase, campo)`, `fechaValida(valor, campo)` e `idValido(valor)`.

  Depende de T007.
- [X] T011 Correr `npm test` y `npm run lint` en `backend/`: T004 a T006 en verde, lint sin errores.

**Checkpoint**: base lista. Empiezan las historias.

---

## Phase 3: User Story 1 - Comprar sin superar el cupo y a precio correcto (Priority: P1) 🎯 MVP

**Goal**: se pueden crear usuarios, categorías, tipos de entrada y eventos, y
registrar compras que respetan el cupo y calculan su total (FR-002, FR-004 a
FR-009, FR-025, FR-027).

**Independent Test**: con un evento y un tipo de entrada de cupo 3, se crean
compras: 4 entradas → `ErrorConflicto`; 3 → OK, disponible 0; total =
precio × cantidad; estado `PENDIENTE` con un registro de historial.

### Tests for User Story 1 (MANDATORY — Constitution I) ⚠️

- [X] T012 [US1] Crear `backend/tests/domain/builders.js` con fábricas de datos válidos por defecto que aceptan overrides:
  - `en(textoFechaHoraBA)`, que devuelve `new Date(texto + '-03:00')`;
  - `crearUsuario`, `crearCategoria`, `crearTipoEntrada` y `crearEvento` (fecha por defecto: `en('2026-11-28T21:00:00')`, con un tipo "General" de cupo 100);
  - `crearCompra({ evento, tipoEntrada, comprador, cantidad, ahora })`, que usa `Compra.crear`;
  - ids incrementales (`u1`, `e1`, …) para que los tests sean determinísticos.
- [X] T013 [P] [US1] Escribir `backend/tests/domain/usuario.test.js`:
  - crea con `id`, `nombre` y `apellido`;
  - `ErrorValidacion` si alguno falta, está vacío o tiene solo espacios (FR-025);
  - `favoritos` arranca vacío.
- [X] T014 [P] [US1] Escribir `backend/tests/domain/categoria.test.js`:
  - crea con `id`, `nombre` y `descripcion`, y `ErrorValidacion` si faltan;
  - `normalizarNombre('  Recitales ')` es igual a `normalizarNombre('recitales')` (base de FR-027).
- [X] T015 [P] [US1] Escribir `backend/tests/domain/tipoEntrada.test.js`. Validaciones de FR-002:
  - precio negativo, `NaN` o string → `ErrorValidacion`;
  - cupo 0, negativo o 1,5 → `ErrorValidacion`;
  - precio 0 es válido.

  Cupo (US1, escenarios 1 a 4; FR-004 y FR-005):
  - `cupoDisponible()` arranca igual a `cupo` y baja con cada compra;
  - `hayCupoPara(n)` es verdadero si `n` es igual al disponible y falso si `n` es el disponible + 1;
  - al pasar una compra a `CANCELADA` o `REEMBOLSADA` el cupo vuelve. Esto requiere US2: dejarlo como `it.todo` y activarlo en T031.
- [X] T016 [P] [US1] Escribir `backend/tests/domain/compra.crear.test.js` (US1, escenarios 1 a 5; FR-006 a FR-009; casos borde):
  - 4 Platea a $5.000 → `PENDIENTE`, total 20 000, quedan 96;
  - 4 con 3 disponibles → `ErrorConflicto` y el disponible sigue en 3;
  - exactamente 3 con 3 disponibles → OK;
  - cantidad 0, −1, 1,5 o `'2'` → `ErrorValidacion`;
  - tipo de entrada de otro evento → `ErrorValidacion`;
  - el historial tiene 1 registro con `estado: PENDIENTE`, `quien: comprador` y `fechaHora: ahora`;
  - si se cambia `tipoEntrada.precio` después, `compra.total` no cambia;
  - dos compras que juntas superan el cupo: la segunda falla;
  - `new Compra(...)` directo lanza `Error` (solo se crea con `Compra.crear`).

  Verificar que todo T013 a T016 falla.

### Implementation for User Story 1

- [X] T017 [P] [US1] Implementar `backend/src/domain/usuario.js`: clase `Usuario` con `id`, `nombre` y `apellido` validados (con `validaciones.js`), y `#favoritos = []` con un getter `favoritos` que devuelve una copia congelada.
- [X] T018 [P] [US1] Implementar `backend/src/domain/categoria.js`: clase `Categoria` y `normalizarNombre(nombre)`, que recorta, pasa a minúsculas y colapsa los espacios.
- [X] T019 [P] [US1] Implementar `backend/src/domain/tipoEntrada.js`, clase `TipoEntrada`:
  - valida `precio` y `cupo` según FR-002;
  - `#compras = []`, con el getter `compras` (copia congelada);
  - el método `registrarCompra(compra)` es de uso interno de `Compra.crear`: documentarlo con un comentario;
  - `cupoDisponible()` y `hayCupoPara(cantidad)`, según research D5 (usa `compra.ocupaCupo()`).
- [X] T020 [US1] Implementar `backend/src/domain/cambioEstadoCompra.js`: clase `CambioEstadoCompra({ compra, estado, quien, fechaHora })`, con instancias congeladas (`Object.freeze(this)`).
- [X] T021 [US1] Implementar `backend/src/domain/evento.js`, clase `Evento` (versión mínima):
  - guarda `id`, `nombre`, `descripcion`, `categoria`, `fecha`, `tiposEntrada` (copia congelada), `multimedia` (copia congelada) y `organizador`;
  - `incluyeTipo(tipoEntrada)`, que compara por `id`;
  - `compras()`, con el `flatMap` de las compras de sus tipos.

  Las validaciones completas son de US5 (T045).
- [X] T022 [US1] Implementar `backend/src/domain/compra.js`, clase `Compra`:
  - el constructor exige un `Symbol` privado del módulo; si no lo recibe, lanza `Error('Usá Compra.crear')`;
  - campos `#estado` y `#historial`, con getters de solo lectura;
  - `mensajes` arranca vacío;
  - `ocupaCupo()`.

  `static crear({ id, comprador, evento, tipoEntrada, cantidad, ahora })` sigue los pasos de data-model.md:
  1. Valida los datos (`instanciaDe`, `enteroMayorA(cantidad, 0)`, `fechaValida(ahora)`).
  2. Valida que `evento.incluyeTipo(tipoEntrada)`; si no, `ErrorValidacion`.
  3. Si `!tipoEntrada.hayCupoPara(cantidad)`, lanza `ErrorConflicto` con un mensaje que incluya el disponible.
  4. Fija `total = precio × cantidad`.
  5. Crea la compra en estado `PENDIENTE` y agrega el `CambioEstadoCompra` inicial a nombre del comprador.
  6. Llama a `tipoEntrada.registrarCompra(this)`.
- [X] T023 [US1] Correr `npm test` y `npm run lint` en `backend/`: todo T013 a T016 en verde (salvo el `it.todo`), lint limpio.

**Checkpoint**: MVP del dominio. Se puede comprar respetando el cupo.

---

## Phase 4: User Story 2 - Seguir el ciclo de vida de una compra (Priority: P1)

**Goal**: estados, transiciones con permisos y condiciones, historial
completo y días que faltan para el evento (FR-010 a FR-018, FR-016b).

**Independent Test**: sobre una compra se prueban las 5 transiciones válidas
con su actor, todas las inválidas, los permisos, las condiciones de fecha y el
historial.

### Tests for User Story 2 (MANDATORY — Constitution I) ⚠️

- [X] T024 [P] [US2] Escribir `backend/tests/domain/transiciones.test.js`:
  - `TRANSICIONES` tiene exactamente las 5 filas `{ desde, hacia, rol }` de la tabla FR-016b de la spec, fila por fila;
  - está congelada;
  - `UTILIZADA`, `CANCELADA` y `REEMBOLSADA` no aparecen como `desde`.
- [X] T025 [P] [US2] Escribir `backend/tests/domain/evento.fechas.test.js`, para un evento el `2026-11-28T21:00` en Buenos Aires:
  - `yaSeRealizo`: falso a las 20:59 del 28 y verdadero a las 21:00 y después;
  - `esElDiaDelEvento`: falso el 27 a las 23:59, verdadero el 28 a las 00:01 y verdadero el 29;
  - `diasRestantes`: 10 desde el 18, 1 desde el 27 a las 23:59, 0 desde el 28 a las 00:01, −1 desde el 29 (FR-018).
- [X] T026 [P] [US2] Escribir `backend/tests/domain/compra.estados.test.js`. Cubrir los 13 escenarios de la Historia 2 y FR-010 a FR-017:
  - **Transiciones válidas:** las 5, con su actor, vía `actualizarEstado` y vía cada atajo.
  - **`cancelar`:** pasa `PENDIENTE` a `CANCELADA` y `CONFIRMADA` a `REEMBOLSADA`, y libera el cupo.
  - **`rechazar`:** solo funciona sobre una compra `PENDIENTE`.
  - **Permisos:** que el comprador intente `confirmar`, o un tercero intente cualquier transición, lanza `ErrorPermiso`.
  - **Transiciones inexistentes** (por ejemplo `PENDIENTE → UTILIZADA`, o cualquier transición desde un estado final): `ErrorConflicto`.
  - **Condiciones de fecha:**
    - cancelar después de que el evento se realizó → `ErrorConflicto`;
    - `marcarUtilizada` el día anterior → `ErrorConflicto`;
    - `marcarUtilizada` el mismo día a las 00:01 → OK.
  - **Estado inválido:** `actualizarEstado('PAGADA', …)` → `ErrorValidacion`.
  - **Historial:** después de `PENDIENTE → CONFIRMADA → UTILIZADA` tiene 3 registros en orden, con `quien` y `fechaHora` correctos, y `estado` siempre coincide con el último registro (SC-003).
  - **Rechazos sin efectos:** una transición rechazada no agrega historial ni cambia el estado.
  - **Inmutabilidad:** `compra.estado = 'X'` lanza `TypeError`.
  - **Comprador que también organiza:** puede rechazar su propia pendiente aunque el evento ya se haya realizado (fila del organizador sin condición).

  Verificar que T024 a T026 fallan.

### Implementation for User Story 2

- [X] T027 [US2] Agregar a `backend/src/domain/evento.js` los métodos `yaSeRealizo(ahora)` (`ahora >= fecha`), `esElDiaDelEvento(ahora)` (`diasEntre(ahora, fecha) <= 0`) y `diasRestantes(ahora)` (`diasEntre(ahora, fecha)`), usando `fechas.js`.
- [X] T028 [US2] Agregar a `backend/src/domain/estadoCompra.js` las `TRANSICIONES`:
  - un arreglo congelado de 5 filas congeladas `{ desde, hacia, rol, condicion, motivo }`, según data-model.md;
  - `condicion(compra, ahora)` devuelve un booleano;
  - `motivo` es el texto en español para el `ErrorConflicto` (por ejemplo, "el evento ya se realizó").
- [X] T029 [US2] Implementar en `backend/src/domain/compra.js`:
  - `rolesDe(quien)`, privado, que devuelve un Set con `'comprador'` y/o `'organizador'`, comparando por `id`;
  - `actualizarEstado(nuevoEstado, quien, ahora)`, con los 5 pasos de data-model.md: valida el estado, busca filas `desde → hacia`, filtra por rol, evalúa las condiciones y aplica el cambio con su `CambioEstadoCompra`.

  Los mensajes de error van en español y nombran los estados.
- [X] T030 [US2] Implementar en `backend/src/domain/compra.js` los atajos `confirmar`, `rechazar`, `marcarUtilizada` y `cancelar`. `cancelar` elige `REEMBOLSADA` si el estado es `CONFIRMADA` y `CANCELADA` en cualquier otro caso. Todos delegan en `actualizarEstado`, sin reglas propias (research D4).
- [X] T031 [US2] Activar el `it.todo` de liberación de cupo en `backend/tests/domain/tipoEntrada.test.js`, usando `cancelar`.
- [X] T032 [US2] Correr `npm test` y `npm run lint` en `backend/`: US1 y US2 en verde.

**Checkpoint**: ciclo de vida completo. US1 sigue verde.

---

## Phase 5: User Story 3 - Reseñar y reputación del organizador (Priority: P2)

**Goal**: reseñas solo con compra `UTILIZADA`, una por comprador y evento, y
puntaje del organizador como promedio (FR-019 a FR-022).

**Independent Test**: con compras utilizadas y no utilizadas se intentan
reseñas, y se calcula el puntaje de un organizador con 2 eventos.

### Tests for User Story 3 (MANDATORY — Constitution I) ⚠️

- [X] T033 [P] [US3] Escribir `backend/tests/domain/resenias.test.js`. Cubrir los escenarios 1 a 6 de la Historia 3 y los casos borde:
  - **Reseñas válidas:**
    - con una compra `UTILIZADA`, se crea y queda en `evento.resenias`;
    - `detalle` vacío es válido.
  - **Rechazos:**
    - con la compra solo `CONFIRMADA` → `ErrorPermiso`;
    - sin compras → `ErrorPermiso`;
    - una segunda reseña del mismo comprador, aunque tenga otra compra utilizada → `ErrorConflicto`;
    - puntuación 0, 6, 4,5 o `'4'` → `ErrorValidacion`.
  - **`puntajeOrganizador`:**
    - con reseñas 5, 4 y 3 en dos eventos → 4;
    - sin reseñas → `null`;
    - con eventos sin reseñas mezclados → no cuentan.

  Verificar que falla.

### Implementation for User Story 3

- [X] T034 [P] [US3] Implementar `backend/src/domain/resenia.js`: clase `Resenia({ id, comprador, evento, detalle, puntuacion })`, que valida que `puntuacion` sea un entero de 1 a 5 y que `detalle` sea un string (puede estar vacío). Sus instancias se congelan.
- [X] T035 [P] [US3] Implementar `backend/src/domain/reputacion.js`: `puntajeOrganizador(eventos)` aplana `evento.resenias` y devuelve el promedio de `puntuacion`, o `null` si no hay reseñas.
- [X] T036 [US3] Agregar a `backend/src/domain/evento.js`:
  - `#resenias = []`, con el getter `resenias` (copia congelada);
  - `reseniar({ id, comprador, puntuacion, detalle })`, que aplica en orden las reglas de data-model.md: permiso, después duplicado, después validación de la `Resenia`.
- [X] T037 [US3] Correr `npm test` y `npm run lint` en `backend/`: US1 a US3 en verde.

---

## Phase 6: User Story 4 - Chatear dentro de una compra (Priority: P3)

**Goal**: solo el comprador y el organizador escriben, en cualquier estado,
con mensajes no vacíos y ordenados (FR-023, FR-024).

**Independent Test**: sobre una compra, cada actor intenta escribir. Se
verifica quién puede, el orden y el contenido.

### Tests for User Story 4 (MANDATORY — Constitution I) ⚠️

- [X] T038 [P] [US4] Escribir `backend/tests/domain/compra.mensajes.test.js`. Cubrir los escenarios 1 a 5 de la Historia 4:
  - el comprador escribe y el organizador responde: quedan 2 mensajes en orden, con `usuario`, `mensaje` y `enviado === ahora`;
  - un tercero → `ErrorPermiso`;
  - con la compra `CANCELADA` o `UTILIZADA`, se acepta;
  - `''` o `'   '` → `ErrorValidacion`;
  - `'  hola  '` se guarda como `'hola'`;
  - `compra.mensajes` no se puede modificar desde afuera.

  Verificar que falla.

### Implementation for User Story 4

- [X] T039 [P] [US4] Implementar `backend/src/domain/mensaje.js`: clase `Mensaje({ usuario, mensaje, enviado })`, con el texto validado y recortado, e instancias congeladas.
- [X] T040 [US4] Implementar en `backend/src/domain/compra.js`:
  - `enviarMensaje(quien, texto, ahora)`, con permiso por `rolesDe` (`ErrorPermiso` si no tiene rol); crea el `Mensaje` y lo agrega;
  - el getter `mensajes`, que devuelve una copia congelada.
- [X] T041 [US4] Correr `npm test` y `npm run lint` en `backend/`: US1 a US4 en verde.

---

## Phase 7: User Story 5 - Publicar eventos válidos y filtrarlos por precio (Priority: P3)

**Goal**: validación completa de eventos, `tuPrecioEstaEntre` y favoritos
(FR-001 a FR-003, FR-026).

**Independent Test**: se intentan crear eventos inválidos, se consulta el
rango de precios y se agregan y quitan favoritos.

### Tests for User Story 5 (MANDATORY — Constitution I) ⚠️

- [X] T042 [P] [US5] Escribir `backend/tests/domain/evento.validaciones.test.js`. Cada uno de estos casos lanza `ErrorValidacion`:
  - sin tipos de entrada (`[]` o ausente);
  - `nombre` o `descripcion` vacíos;
  - `categoria` o `organizador` que no son instancias;
  - `fecha` inválida;
  - `multimedia` que no es un arreglo de strings;
  - dos tipos con el mismo nombre según `normalizarNombre` ("VIP" y " vip ").

  Además, `multimedia` vacío es válido (FR-001, FR-002).
- [X] T043 [P] [US5] Escribir `backend/tests/domain/evento.precio.test.js` (escenarios 3 y 4, FR-003), para un evento con precios de $3.000 y $12.000:
  - entre 10 000 y 15 000 → verdadero;
  - entre 4 000 y 10 000 → falso;
  - los límites son inclusivos (12 000 a 12 000 → verdadero);
  - con `min > max` → falso.
- [X] T044 [P] [US5] Escribir `backend/tests/domain/usuario.favoritos.test.js` (escenario 5, FR-026):
  - agregar dos veces deja 1;
  - quitar lo saca;
  - quitar algo que no está no falla;
  - `esFavorito` es verdadero o falso según corresponda;
  - `favoritos` no se puede modificar desde afuera.

  Verificar que T042 a T044 fallan.

### Implementation for User Story 5

- [X] T045 [US5] Completar el constructor de `backend/src/domain/evento.js` con las validaciones de FR-001 y FR-002 que cubre T042, usando `validaciones.js` y `normalizarNombre`.
- [X] T046 [US5] Agregar `tuPrecioEstaEntre(min, max)` a `backend/src/domain/evento.js`: si `min > max`, falso; si no, verdadero cuando algún `tipo.precio` está en `[min, max]`.
- [X] T047 [P] [US5] Agregar a `backend/src/domain/usuario.js` los métodos `agregarFavorito`, `quitarFavorito` y `esFavorito`, que comparan por `evento.id`.
- [X] T048 [US5] Correr `npm test` y `npm run lint` en `backend/`: US1 a US5 en verde.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T049 [P] Escribir `backend/tests/domain/index.test.js` (test del contrato): importa desde `../../src/domain/index.js` cada nombre listado en `specs/001-modelo-dominio/contracts/dominio.md` y verifica que esté definido. Verificar que falla.
- [X] T050 Implementar `backend/src/domain/index.js`, que reexporta exactamente la API de `contracts/dominio.md`. Correr T049 en verde.
- [X] T051 [P] Crear `specs/001-modelo-dominio/trazabilidad.md` con dos tablas:
  1. Las 9 restricciones de dominio de la constitución, cada una con su FR y el archivo y el test que la cubre (SC-001).
  2. Los 12 casos de uso del enunciado, cada uno con los FR que usa (SC-004).

  Si algo queda sin cubrir, agregar el test que falta.
- [X] T052 Verificar la pureza del dominio buscando en `backend/src/domain/`:
  - no hay `Date.now`, `new Date()` sin argumentos, `Math.random`, `console`, `from 'fs'`, `from 'node:fs'` ni `express`;
  - los tests de `backend/tests/domain/` no usan `vi.useFakeTimers`.
- [X] T053 Ejecutar el script de `specs/001-modelo-dominio/quickstart.md` como archivo temporal fuera del repo, importando por ruta absoluta. Verificar que imprime `PENDIENTE 10000 1`, `CONFIRMADA 10` y `REEMBOLSADA 3`. Si difiere, corregir el código o el quickstart.
- [X] T054 Correr `npm test` y `npm run lint` finales en `backend/`, y anotar la cantidad de tests.
- [X] T055 Agregar a `docs/bitacora-ia.md` la entrada de la implementación: qué hizo bien la IA, qué hubo que corregir y cuántos tests quedaron.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: no tiene dependencias.
- **Foundational (Fase 2)**: depende de Setup y bloquea todas las historias.
- **US1 (Fase 3)**: depende de Foundational. Es la base de las demás, porque
  crea las entidades y las compras.
- **US2 (Fase 4)**: depende de US1 (`Compra`).
- **US3 (Fase 5)**: depende de US2, porque necesita `marcarUtilizada` para
  tener compras `UTILIZADA`.
- **US4 (Fase 6)**: depende de US1 (y de US2 solo para el test "en cualquier
  estado"). Se puede hacer en paralelo con US3.
- **US5 (Fase 7)**: depende de US1. Se puede hacer en paralelo con US2, US3 y
  US4, pero toca `evento.js` y `usuario.js`, así que conviene hacerla después
  para no pisar cambios.
- **Polish (Fase 8)**: depende de todas las historias.

```text
Setup → Foundational → US1 ─┬─→ US2 ─┬─→ US3 ─┐
                            │        └─→ US4 ─┼─→ Polish
                            └──────→ US5 ─────┘
```

### Within Each User Story

- Los tests se escriben primero y DEBEN fallar.
- Después van los valores (Mensaje, Resenia, CambioEstadoCompra), luego las
  entidades y luego los métodos que las combinan.
- La historia se cierra corriendo `npm test` y `npm run lint` en verde.

### Parallel Opportunities

- Fase 2: los tests T004 a T006 en paralelo; después T007 a T009 en paralelo.
- US1: los tests T013 a T016 en paralelo (después de T012); después T017 a
  T019 en paralelo.
- US2: los tests T024 a T026 en paralelo.
- US3: T034 y T035 en paralelo.
- US5: los tests T042 a T044 en paralelo.
- Polish: T049 y T051 en paralelo.

## Parallel Example: User Story 1

```text
# Después de T012 (builders), escribir los 4 tests juntos:
Task: "T013 usuario.test.js"
Task: "T014 categoria.test.js"
Task: "T015 tipoEntrada.test.js"
Task: "T016 compra.crear.test.js"

# Con los tests en rojo, implementar las 3 clases independientes juntas:
Task: "T017 usuario.js"
Task: "T018 categoria.js"
Task: "T019 tipoEntrada.js"
# Después, en secuencia: T020 → T021 → T022 → T023
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Fase 1 (Setup) y Fase 2 (Foundational).
2. Fase 3 (US1): ya se puede comprar respetando el cupo y el precio.
3. **Parar y validar**: correr los tests de US1. Es el corazón del negocio.

### Incremental Delivery

1. US1, después US2: el núcleo P1 completo (compras y su ciclo de vida).
2. US3: reseñas y reputación.
3. US4: chat.
4. US5: validaciones completas de eventos y favoritos.
5. Polish: contrato, trazabilidad, quickstart y bitácora.

Cada paso deja los tests anteriores en verde. Conviene hacer un commit por
historia terminada.
