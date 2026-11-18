---

description: "Lista de tareas de la feature 002-api-backend"
---

# Tasks: Backend de AI Ticket It de punta a punta

**Input**: documentos de diseño en `/specs/002-api-backend/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md),
[research.md](./research.md), [data-model.md](./data-model.md),
[contracts/api.md](./contracts/api.md), [quickstart.md](./quickstart.md)

**Tests**: obligatorios (constitución, Principio I). En cada historia, los
tests de API van primero y DEBEN fallar antes de implementar.

**Organization**: una fase por historia de la spec (US1 a US8). Los
favoritos (FR-024) van con US2, porque son parte de explorar el catálogo.

## Format: `[ID] [P?] [Story] Description`

## Convenciones para todas las tareas

- **Rutas**: son relativas a la raíz del repo.
- **Tests de API**:
  - usan `appDePrueba()` de `backend/tests/api/helpers.js`, que crea una app
    nueva con el seed cargado y un reloj fijo
    (`AHORA = 2026-11-18T15:00:00-03:00`);
  - usan `como(usuarioId)` para mandar el header `X-Usuario-Id`;
  - nunca comparten estado entre sí.
- **Las rutas no contienen reglas**: validan la forma del pedido, llaman a
  un servicio y presentan el resultado. Las reglas viven en `domain/`
  (FR-026).
- **Formas de respuesta y códigos**: los que fija `contracts/api.md`.

---

## Phase 1: Setup

- [X] T001 Desde `backend/`, instalar `express@5` como dependencia y `supertest@7` como devDependency. Agregar a `backend/package.json` los scripts `start` (`node src/server.js`) y `dev` (`node --watch src/server.js`).
- [X] T002 En `backend/eslint.config.js`, declarar los globals de Node que usa `src/server.js` (`process` y `console`, como `readonly`) solo para `src/server.js` y `src/http/errores.js`. No agregar el paquete `globals`. Verificar que `npm run lint` pase.

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: ninguna historia empieza hasta terminar esta fase.

- [X] T003 [P] Escribir `backend/tests/api/repositorio.test.js` para `RepositorioEnMemoria`:
  - `guardar` devuelve la entidad;
  - `buscarPorId` devuelve la entidad o `undefined`;
  - `todos` respeta el orden de inserción;
  - `filtrar` funciona;
  - `crearRepositorios()` devuelve 4 repositorios independientes.
- [X] T004 [P] Escribir `backend/tests/domain/compra.eventoRealizado.test.js` (requisito derivado 2): `Compra.crear` con `ahora >= evento.fecha` → `ErrorConflicto`, sin registrar la compra en el tipo de entrada. Con `ahora` un minuto antes del evento, funciona.
- [X] T005 [P] Implementar `backend/src/repositories/repositorioEnMemoria.js` (`RepositorioEnMemoria`, `crearRepositorios`).
- [X] T006 Agregar a `backend/src/domain/compra.js`, en `Compra.crear`, después de validar los datos y antes de validar el cupo: `if (evento.yaSeRealizo(ahora)) throw new ErrorConflicto('El evento ya se realizó: no se pueden comprar entradas')`. Correr todos los tests de dominio.
- [X] T007 [P] Implementar `backend/src/services/errores.js` (`ErrorNoEncontrado extends ErrorDeDominio`) y `backend/src/services/busqueda.js`:
  - `normalizarTexto(texto)`: NFD, sin diacríticos, minúsculas y espacios colapsados;
  - `coincideTexto(textoBuscado, ...campos)`.
- [X] T008 Implementar `backend/src/http/errores.js`:
  - `ErrorNoIdentificado`;
  - `rutaNoEncontrada` (404 `{ error }`);
  - `manejarErrores(err, req, res, next)`, con la tabla de research D7;
  - el JSON mal formado (`err.type === 'entity.parse.failed'`) → 400;
  - cualquier otro error → 500 genérico y `console.error`.
- [X] T009 Implementar `backend/src/http/usuarioActual.js` con `crearMiddlewaresUsuario(usuariosRepo)`, que devuelve:
  - `requerirUsuario`, que lanza `ErrorNoIdentificado` si falta el header o el usuario no existe;
  - `usuarioOpcional`, que deja `req.usuario` en `null` si falta el header.
- [X] T010 Implementar `backend/src/http/presentadores.js` según `contracts/api.md` y data-model.md: `usuario`, `categoria`, `organizador`, `eventoResumen`, `eventoDetalle`, `resenia`, `compraResumen`, `compraDetalle`, `mensaje` y `ventas`. Todas las fechas salen con `toISOString()`.
- [X] T011 Escribir `backend/tests/api/seed.test.js` (US1, escenario 2; FR-003 a FR-005; SC-005):
  - **cantidades**: 4 usuarios, 6 categorías, 8 eventos, 11 compras;
  - **estados**: hay al menos una compra en cada uno de los 5;
  - **evento de hoy**: `e-standup` es hoy (`esElDiaDelEvento`) y todavía no empezó;
  - **eventos pasados**: `e-tango` y `e-impro` ya se realizaron;
  - **puntajes**: Ana 4,5 y Bruno 3;
  - **reseña pendiente**: `k-009` está UTILIZADA y Leo no reseñó Impro;
  - **determinismo**: dos cargas con el mismo `ahora` producen los mismos ids y estados;
  - **arranque nocturno**: con `ahora` a las 23:30 de Buenos Aires, `e-standup` sigue siendo hoy.
- [X] T012 Implementar `backend/src/seed/datosDemo.js`, con `cargarDatosDemo(repositorios, ahora)` según la tabla de data-model.md, usando operaciones del dominio y horas relativas (research D11). Exportar también `IDS_DEMO`, con los ids que usan los tests. Correr T011 en verde.
- [X] T013 Implementar `backend/src/app.js`, con `crearApp({ repositorios, reloj = () => new Date(), generarId = () => crypto.randomUUID() })`:
  - `express.json()`;
  - el router de `src/routes/index.js` montado en `/api`;
  - `GET /api/salud`;
  - `rutaNoEncontrada` y `manejarErrores`.

  Crear también `src/routes/index.js` con un router vacío para extender.
- [X] T014 Crear `backend/tests/api/helpers.js` con:
  - `AHORA`;
  - `appDePrueba({ ahora = AHORA } = {})`: repositorios nuevos, seed cargado, reloj fijo, `generarId` con contador → `{ app, repositorios }`;
  - `como(usuarioId)`: devuelve `{ 'X-Usuario-Id': usuarioId }`.
- [X] T015 Escribir `backend/tests/api/errores.test.js` y verificar que pase (FR-002, FR-025):
  - `GET /api/salud` → 200;
  - una ruta inexistente → 404 `{ error }`;
  - un JSON mal formado en un POST → 400 `{ error }`;
  - una ruta 🔒 sin header → 401, y con un usuario inexistente → 401. Usar `GET /api/mis-compras`, aunque devuelva 404 hasta US3: el test de 401 se activa en T026.

**Checkpoint**: la app arranca con el seed y los errores tienen forma.

---

## Phase 3: User Story 1 - Arrancar con datos de demostración y elegir el usuario (Priority: P1) 🎯 MVP

**Goal**: listar los usuarios y cargar los datos de demostración al arrancar (FR-001 a FR-005).

**Independent Test**: `GET /api/usuarios` devuelve los 4 usuarios del seed, y el servidor real arranca con los datos.

- [X] T016 [US1] Escribir en `backend/tests/api/usuarios.test.js`: `GET /api/usuarios` → 200 con 4 usuarios `{ id, nombre, apellido }`, entre ellos `u-ana` y `u-leo` (escenario 1).
- [X] T017 [US1] Implementar `backend/src/services/usuariosService.js` (`listar`) y `backend/src/routes/usuarios.js`, y montarlo en `src/routes/index.js`. Las rutas reciben los servicios desde `crearApp`.
- [X] T018 [US1] Implementar `backend/src/server.js`:
  1. lee `PORT` (por defecto 3000);
  2. crea los repositorios y carga `cargarDatosDemo(repos, new Date())`;
  3. llama a `crearApp`;
  4. hace `listen` en `0.0.0.0`;
  5. imprime la URL local, las IPs de la red local (`os.networkInterfaces()`, solo IPv4 no internas) y el resumen del seed.
- [X] T019 [US1] Correr `npm test` y `npm run lint` en `backend/`.

---

## Phase 4: User Story 2 - Explorar, buscar y ordenar eventos (+ favoritos) (Priority: P1)

**Goal**: categorías, catálogo con filtros y órdenes, detalle con reputación y favoritos (FR-006 a FR-014, FR-024).

**Independent Test**: con el seed, búsquedas, filtros y órdenes devuelven exactamente los ids esperados.

- [ ] T020 [P] [US2] Escribir `backend/tests/api/catalogo.test.js` (escenarios 1 a 9 de la Historia 2):
  - `GET /api/categorias` → 6.
  - **Catálogo**: `GET /api/eventos` devuelve los 6 próximos, sin `e-tango` ni `e-impro`, ordenados por fecha (`e-standup` primero).
  - **Búsqueda de texto**: `texto=jazz`, `texto=JÁZZ` y `texto=  jazz ` → `[e-jazz]`; `texto=xyz` → `[]`.
  - **Filtros**:
    - `categoria=c-teatro` → `[e-hamlet]`;
    - `categoria=c-recitales&texto=noche` → `[e-jazz]`;
    - `categoria=c-nada` → 400;
    - `precioMin=30000` → `[e-rock]`;
    - `precioMax=0` → `[e-charla]`;
    - `precioMin=abc` → 400.
  - **Órdenes**:
    - `orden=precio`: `e-charla` primero (precioDesde 0) y ascendente;
    - `orden=puntaje`: los eventos de Ana (4,5) antes que los de Bruno (3);
    - `orden=raro` → 400.
  - **Resumen**: incluye `precioDesde`, `hayEntradas`, `organizador.puntaje` e `imagen`.
  - **Detalle**:
    - `GET /api/eventos/e-jazz` trae `tiposEntrada` con `disponibles`, `reseniasDelOrganizador` (las 2 de Tango) y `organizador.puntaje` 4,5;
    - `e-tango` (pasado) → 200;
    - `e-nada` → 404;
    - `esFavorito` es `null` sin header y `true` para `u-leo` en `e-rock`.
- [ ] T021 [P] [US2] Escribir `backend/tests/api/favoritos.test.js` (FR-024):
  - `GET /api/mis-favoritos` como Leo → `[e-rock, e-hamlet]`, en el orden en que se marcaron;
  - `PUT /api/mis-favoritos/e-jazz` → 204, y vuelve a aparecer en la lista;
  - un segundo `PUT` al mismo evento no lo duplica;
  - `DELETE` → 204 y desaparece; un `DELETE` de algo que no está → 204;
  - con `e-nada` → 404;
  - sin header → 401.

  Verificar que T020 y T021 fallen.
- [ ] T022 [US2] Implementar `backend/src/services/catalogoService.js`:
  - `categorias()`;
  - `buscar({ texto, categoria, precioMin, precioMax, orden }, ahora)`: valida los parámetros (`ErrorValidacion`), filtra los próximos (`!yaSeRealizo`), aplica `coincideTexto` y `tuPrecioEstaEntre` (los lados abiertos son 0 e `Infinity`) y ordena con desempate por fecha y nombre;
  - `puntajeDe(organizador)` y `reseniasDe(organizador)`;
  - `detalle(id, usuario)`, que lanza `ErrorNoEncontrado`.
- [ ] T023 [US2] Implementar `backend/src/services/favoritosService.js` (`listar`, `marcar` y `desmarcar`, con `ErrorNoEncontrado` si el evento no existe).
- [ ] T024 [US2] Implementar:
  - `backend/src/routes/categorias.js`;
  - `GET /api/eventos` y `GET /api/eventos/:id` (este con `usuarioOpcional`) en `backend/src/routes/eventos.js`;
  - las rutas de favoritos en `backend/src/routes/misRecursos.js`.

  Montar todo en `src/routes/index.js`.
- [ ] T025 [US2] Correr `npm test` y `npm run lint`: T020 y T021 en verde.

---

## Phase 5: User Story 3 - Comprar entradas y seguir mis compras (Priority: P1)

**Goal**: comprar, listar mis compras y ver el detalle (FR-015 a FR-017).

**Independent Test**: Sofía compra, se rechaza un pedido que supera el cupo y Leo ve sus compras con `diasRestantes`.

- [ ] T026 [P] [US3] Escribir `backend/tests/api/compras.test.js` (escenarios 1 a 5 de la Historia 3):
  - **Compra válida**: `POST /api/compras` como Sofía `{ e-rock, t-rock-vip, 2 }` → 201, `estado` PENDIENTE, `total` 70000; después, `disponibles` de VIP en el detalle baja en 2.
  - **Sin cupo**: pedir más que lo disponible → 409 y los disponibles no cambian.
  - **Datos inválidos** → 400: `cantidad: "2"` o `0`; `eventoId` o `tipoEntradaId` inexistentes; un tipo de otro evento.
  - **Evento ya realizado**: comprar para `e-tango` → 409.
  - **Mis compras**: `GET /api/mis-compras` como Leo trae solo las suyas, ordenadas por fecha del evento. `k-001` tiene `diasRestantes` 10 y las no confirmadas tienen `null`.
  - **Detalle**: `GET /api/compras/k-001` como Leo → 200 con `historial` y `mensajes`; como Ana (organizadora) → 200; como Sofía → 403; `k-nada` → 404.

  Activar el test de 401 de T015. Verificar que falle.
- [ ] T027 [US3] Implementar en `backend/src/services/comprasService.js`:
  - `comprar({ eventoId, tipoEntradaId, cantidad }, usuario, ahora)`: busca el evento y el tipo (400 si no existen en el body) y llama a `Compra.crear` con `generarId`;
  - `misCompras(usuario)`;
  - `detalle(id, usuario)`: lanza 404 si no existe y `ErrorPermiso` si no es el comprador ni el organizador.
- [ ] T028 [US3] Implementar en `backend/src/routes/compras.js` las rutas `POST /api/compras` y `GET /api/compras/:id`, y `GET /api/mis-compras` en `misRecursos.js`.
- [ ] T029 [US3] Correr `npm test` y `npm run lint`.

---

## Phase 6: User Story 4 - Gestionar las ventas de mi evento (Priority: P1)

**Goal**: ventas del evento, mis eventos, confirmar, rechazar y registrar el ingreso (FR-019, FR-020).

**Independent Test**: Ana ve las ventas de Jazz y confirma `k-002`; Bruno registra el ingreso de `k-006`.

- [ ] T030 [P] [US4] Escribir `backend/tests/api/ventas.test.js` (escenarios 1 a 7 de la Historia 4):
  - **Ventas**: `GET /api/eventos/e-jazz/ventas` como Ana → 200, con `tiposEntrada` (VIP: cupo 20, ocupadas 2, disponibles 18; General: ocupadas 4), `cantidadPorEstado` (PENDIENTE 1, CONFIRMADA 1) y `compras` con el comprador. Como Leo → 403; `e-nada` → 404.
  - **Mis eventos**: `GET /api/mis-eventos` como Ana → sus 4 eventos (incluido `e-tango`, pasado), por fecha.
  - **Confirmar**: `POST /api/compras/k-002/confirmar` como Ana → 200 CONFIRMADA, y el historial termina con Ana. Como Sofía → 403. Confirmar `k-001` (ya confirmada) → 409.
  - **Rechazar**: `rechazar` `k-003` como Bruno → 200 CANCELADA, y los disponibles de Platea vuelven.
  - **Registrar ingreso**: `registrar-ingreso` `k-006` como Bruno → 200 UTILIZADA; `k-001` como Ana (el evento es en 10 días) → 409 con un mensaje que menciona "día del evento".
  - **Inexistente**: `k-nada` → 404.

  Verificar que falle.
- [ ] T031 [US4] Implementar en `backend/src/services/eventosService.js` los métodos `ventas(id, usuario)` (404, y `ErrorPermiso` si no es el organizador) y `misEventos(usuario)`. Implementar en `comprasService.js` `cambiarEstado(id, accion, usuario, ahora)`, que mapea `confirmar | rechazar | cancelar | registrar-ingreso` al atajo del dominio.
- [ ] T032 [US4] Implementar `GET /api/eventos/:id/ventas`, `GET /api/mis-eventos` y `POST /api/compras/:id/:accion` (validando que `accion` sea una de las 4; si no, 404 de ruta).
- [ ] T033 [US4] Correr `npm test` y `npm run lint`.

---

## Phase 7: User Story 5 - Cancelar y obtener el reembolso (Priority: P2)

- [ ] T034 [P] [US5] Escribir `backend/tests/api/cancelacion.test.js` (escenarios 1 a 4):
  - Leo cancela `k-001` → 200 REEMBOLSADA, y los disponibles de VIP vuelven a 20;
  - Sofía cancela `k-002` → CANCELADA;
  - Sofía cancela `k-008` (UTILIZADA) → 409;
  - Sofía cancela `k-001` (ajena) → 403;
  - con `appDePrueba({ ahora })` posterior al evento Jazz, cancelar `k-001` → 409 ("ya se realizó").
- [ ] T035 [US5] Verificar que pase. Ya debería pasar con `cambiarEstado` de US4: si no, corregir y anotar el motivo en la bitácora.

---

## Phase 8: User Story 6 - Chatear dentro de una compra (Priority: P2)

- [ ] T036 [P] [US6] Escribir `backend/tests/api/mensajes.test.js` (escenarios 1 a 4):
  - `GET /api/compras/k-001/mensajes` como Ana → los 2 del seed, en orden;
  - `POST` como Leo `{ mensaje: 'Gracias' }` → 201 con `usuario.id` u-leo y `enviado` igual a AHORA en ISO, y aparece al final;
  - como Sofía (GET o POST) → 403;
  - `mensaje: '   '` → 400;
  - `k-nada` → 404.

  Verificar que falle.
- [ ] T037 [US6] Implementar `mensajes(id, usuario)` y `enviarMensaje(id, texto, usuario, ahora)` en `comprasService.js`, y las rutas `GET` y `POST /api/compras/:id/mensajes`. Correr los tests.

---

## Phase 9: User Story 7 - Reseñar un evento (Priority: P2)

- [ ] T038 [P] [US7] Escribir `backend/tests/api/resenias.test.js` (escenarios 1 a 3):
  - `POST /api/eventos/e-impro/resenias` como Leo `{ puntuacion: 5, detalle: 'Genial' }` → 201, y después el puntaje de Bruno en `GET /api/eventos/e-hamlet` es 4 (promedio de 3 y 5);
  - como Ana (sin compra) → 403;
  - Sofía sobre Impro (ya reseñó) → 409;
  - `puntuacion: 6` → 400;
  - `e-nada` → 404.

  Verificar que falle.
- [ ] T039 [US7] Implementar `reseniar(eventoId, datos, usuario)` en `eventosService.js` (genera el id) y `POST /api/eventos/:id/resenias`. Correr los tests.

---

## Phase 10: User Story 8 - Publicar un evento (Priority: P3)

- [ ] T040 [P] [US8] Escribir `backend/tests/api/publicacion.test.js` (escenarios 1 a 3):
  - **Publicar**: `POST /api/eventos` como Leo, con General ($5000, 200) y VIP ($15000, 20), categoría `c-recitales` y fecha +20 días → 201 con `organizador.id` u-leo y los ids generados. Aparece en `GET /api/eventos?texto=<nombre>`.
  - **Comprar**: Sofía compra de ese evento → 201.
  - **Datos inválidos** → 400: sin tipos; `categoriaId: 'c-nada'`; fecha pasada; fecha inválida; precio negativo.
  - **Sin header** → 401.

  Verificar que falle.
- [ ] T041 [US8] Implementar `publicar(datos, usuario, ahora)` en `eventosService.js`:
  - valida la forma del body (arreglos, tipos);
  - busca la categoría (400 si no existe);
  - exige que la fecha sea futura (`ErrorValidacion`);
  - crea los `TipoEntrada` y el `Evento` con `generarId`, y guarda.

  Agregar la ruta `POST /api/eventos`. Correr los tests.

---

## Phase 11: Polish & Cross-Cutting Concerns

- [ ] T042 Arrancar el servidor real (`npm start`) en segundo plano y recorrer el quickstart con curl:
  - usuarios;
  - búsqueda;
  - mis compras de Leo;
  - ventas de Ana y confirmación de `k-002`;
  - compra de Sofía;
  - 401 y 403.

  Verificar que el servidor imprime las URLs. Después, detenerlo.
- [ ] T043 [P] Crear `specs/002-api-backend/trazabilidad.md`, que asocia cada FR y cada escenario de la spec con su test de API, y cada caso de uso con el endpoint que lo resuelve (SC-001 a SC-003).
- [ ] T044 [P] Actualizar `CLAUDE.md` (sección manual: comandos `npm start` y `npm run dev`, y estructura de `backend/src`).
- [ ] T045 Correr `npm test` y `npm run lint` finales y anotar la cantidad de tests.
- [ ] T046 Agregar a `docs/bitacora-ia.md` la entrada de la implementación de la 002: qué salió bien, qué hubo que corregir y la regla de dominio que faltaba.

---

## Dependencies & Execution Order

- **Setup → Foundational → US1**: obligatorio.
- **US2 y US3**: dependen de US1, y son independientes entre sí.
- **US4**: depende de US3 (rutas de compras).
- **US5**: depende de US4 (usa la ruta de acciones).
- **US6 y US8**: dependen de US3.
- **US7**: depende de US2, porque verifica el puntaje en el detalle.
- **Polish**: depende de todas las historias.

```text
Setup → Foundational → US1 ─┬→ US2 ──────→ US7 ─┐
                            └→ US3 ─┬→ US4 → US5 ┼→ Polish
                                    ├→ US6 ──────┤
                                    └→ US8 ──────┘
```

## Implementation Strategy

1. **MVP**: Foundational + US1 + US2 + US3, que ya permiten explorar y
   comprar.
2. Después US4, el flujo completo del organizador.
3. Después US5 a US8.
4. Commit por fase.
