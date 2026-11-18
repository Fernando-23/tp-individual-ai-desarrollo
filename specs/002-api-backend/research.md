# Research: Backend de AI Ticket It de punta a punta

**Feature**: `002-api-backend` · **Fecha**: 2026-11-18

Cada decisión incluye la alternativa descartada y el motivo, como pide la
constitución (Flujo de Trabajo con IA).

## D1. Express 5 + Supertest

- **Decision**: Express 5.x (dependencia de ejecución) y Supertest 7.x (solo
  de desarrollo) para los tests de API.
- **Rationale**:
  - El enunciado exige Node + Express.
  - Express 5 propaga solo los errores de los handlers `async` al middleware
    de errores, así que no hace falta envolver cada ruta en `try/catch`.
  - Supertest prueba la app sin abrir un puerto real.
- **Alternatives considered**:
  - Express 4: obliga a envolver cada handler `async`.
  - Usar `fetch` contra un servidor levantado: más lento, y hay que manejar
    puertos en los tests.

## D2. `crearApp(dependencias)`: la app se arma con lo que se le inyecta

- **Decision**: `src/app.js` exporta `crearApp({ repositorios, reloj,
  generarId })`, que devuelve la app de Express sin escuchar ningún puerto.
  `src/server.js` es el único que:
  1. lee el puerto;
  2. crea los repositorios;
  3. carga el seed;
  4. llama a `listen`.
- **Rationale**: cada test crea su propia app, con repositorios nuevos y un
  reloj fijo (constitución, Principio I: sin estado compartido entre tests).
  El reloj inyectado mantiene la idea de la feature 001 (`ahora`
  determinístico) también en la capa HTTP.
- **Alternatives considered**: una app y unos repositorios globales (un
  singleton). Se descartó porque los tests se contaminarían entre sí y no se
  podría fijar la hora.

## D3. Capas: routes → services → repositories → domain

- **Decision**:
  - `routes/` lee la request, llama a un servicio y responde con un
    presentador.
  - `services/` busca en los repositorios (404 si algo no existe), invoca al
    dominio y guarda.
  - `repositories/` son `Map` en memoria.
  - `http/` tiene los middlewares (usuario actual, errores) y los
    presentadores (dominio → JSON).
- **Rationale**: es lo que exige el Principio II. Además, las rutas quedan de
  pocas líneas, fáciles de mostrar en el video.
- **Alternatives considered**: lógica en las rutas. La constitución lo
  prohíbe y mezclaría HTTP con negocio.

## D4. Repositorios en memoria con `Map`, uno por agregado

- **Decision**: cuatro repositorios: `usuarios`, `categorias`, `eventos` y
  `compras`. Cada uno es una clase `RepositorioEnMemoria` con `guardar`,
  `buscarPorId`, `todos` y `filtrar`. Las reseñas viven dentro del `Evento`
  y los mensajes dentro de la `Compra` (así lo diseñó la feature 001), así
  que no tienen repositorio propio.
- **Rationale**: los objetos del dominio ya mantienen sus relaciones (el
  `TipoEntrada` conoce sus compras, el `Evento` sus reseñas). Guardar las
  instancias vivas en un `Map` es la "persistencia en memoria" del enunciado,
  sin mapeos.
- **Alternatives considered**: guardar objetos planos y reconstruir el
  dominio en cada pedido. Habría que serializar estados privados (historial)
  y se duplicaría trabajo sin ninguna ganancia, porque nada sale del proceso.

## D5. Ids: legibles en el seed, UUID para lo nuevo

- **Decision**:
  - Los datos del seed tienen ids fijos y legibles (`u-ana`, `e-jazz`,
    `k-001`…), para que la demo y los tests puedan referirse a ellos.
  - Lo que se crea en tiempo de ejecución usa `crypto.randomUUID()`, a
    través de `generarId`, que es inyectable (los tests usan un contador).
- **Rationale**: SC-005 pide dos arranques idénticos, y los ids fijos lo
  garantizan. En la demo es más claro ver `u-ana` que un UUID.
- **Alternatives considered**: UUID para todo. Los ids cambiarían en cada
  arranque y la app no podría recordar "el usuario Ana" de forma estable.

## D6. Usuario actual en el header `X-Usuario-Id` → 401 si falta

- **Decision**: un middleware `usuarioActual` lee `X-Usuario-Id`, busca el
  usuario y lo deja en `req.usuario`. Se aplica a las rutas que lo necesitan
  (FR-002). Si el header falta o el usuario no existe, responde
  **401** `{ "error": "Elegí un usuario válido…" }`.
- **Rationale**:
  - La constitución (Principio V) fija el header.
  - FR-025 pide distinguir "usuario no identificado" de "sin permiso", y el
    código estándar para lo primero es 401.
- **Alternatives considered**: devolver 400 o 403. Se descartó porque se
  confundiría con "dato inválido" o "sin permiso", que FR-025 pide
  diferenciar.
- **Nota**: la constitución enumera 400, 403, 404 y 409. El 401 es un
  agregado y queda justificado en *Complexity Tracking* del plan.

## D7. Errores: un middleware traduce por clase

- **Decision**: el middleware `manejarErrores` traduce cada error a un código
  y a una respuesta `{ error }`:

  | Error | Código |
  |---|---|
  | `ErrorValidacion` | 400 |
  | `ErrorNoIdentificado` (nuevo, de `http/`) | 401 |
  | `ErrorPermiso` | 403 |
  | `ErrorNoEncontrado` (nuevo, en `services/`) | 404 |
  | `ErrorConflicto` | 409 |
  | JSON mal formado | 400 |
  | Cualquier otro | 500 |

  En el caso 500, el mensaje es genérico en español y el error real se
  registra en la consola del servidor. Las rutas inexistentes devuelven 404
  `{ error }`.
- **Rationale**: los errores del dominio ya traen el tipo (feature 001, D8).
  Una sola tabla resuelve FR-025 en un solo lugar.
- **Alternatives considered**: que cada ruta elija su código. Se repetiría la
  lógica y sería fácil equivocarse.

## D8. Rutas: recursos en plural y acciones con verbo de negocio

- **Decision**: rutas bajo `/api`, en plural y kebab-case (ver
  `contracts/api.md`). Los cambios de estado de una compra son
  `POST /api/compras/:id/{confirmar|rechazar|cancelar|registrar-ingreso}`.
- **Rationale**: son las mismas palabras que el dominio y la spec
  (`confirmar`, `rechazar`, `cancelar`, `marcarUtilizada`). Así la ruta dice
  qué hace y quién la usa, y en el video se lee sola. `cancelar` resuelve
  `CANCELADA` o `REEMBOLSADA` en el dominio, algo que un `PATCH` con el
  estado destino no podría expresar.
- **Alternatives considered**: `PATCH /api/compras/:id { estado }`. Obliga a
  la app a conocer la tabla de transiciones y a elegir entre `CANCELADA` y
  `REEMBOLSADA`, reglas que son del dominio.

## D9. "Mis" recursos: `/api/mis-compras`, `/api/mis-eventos`, `/api/mis-favoritos`

- **Decision**: lo que depende del usuario actual vive bajo rutas `mis-*`:
  - `mis-compras` (FR-016);
  - `mis-eventos`, los eventos que organiza, incluidos los pasados. Hace
    falta para elegir de qué evento ver las ventas (FR-019), porque el
    catálogo solo muestra los próximos;
  - `mis-favoritos` (FR-024).
- **Rationale**: el usuario sale del header, no de la URL. Así no hay que
  validar que `/usuarios/:id/compras` coincida con el header.
- **Alternatives considered**: `/api/usuarios/:id/compras`. Se descartó
  porque se podría pedir el id de otro y habría que chequear en cada ruta
  que sea el mismo.
- **Requisito derivado**: `GET /api/mis-eventos` no figura literalmente en la
  spec, pero es necesario para el caso de uso 2. Se registra en el plan.

## D10. Búsqueda sin acentos con `normalize('NFD')`

- **Decision**: la búsqueda pasa el texto y los campos por
  `normalize('NFD').replace(/\p{Diacritic}/gu, '')`, `toLowerCase()` y
  colapso de espacios, y compara con `includes`.
- **Rationale**: cumple FR-008 ("JAZZ", "jázz" y "jazz" dan lo mismo) con la
  biblioteca estándar.
- **Alternatives considered**: una librería de búsqueda difusa (Fuse.js).
  Excede lo pedido (Principio IX).

## D11. Seed: armado con operaciones del dominio, fechas relativas

- **Decision**: `src/seed/datosDemo.js` exporta `cargarDatosDemo(repos,
  ahora)`, que crea todo con las mismas operaciones del dominio (`new Evento`,
  `Compra.crear`, `confirmar`, `marcarUtilizada`, `reseniar`,
  `enviarMensaje`). Cada operación recibe una hora relativa a `ahora`: una
  compra "de hace 20 días" usa `ahora − 20 días`.
- **Rationale**:
  - Las compras de demo pasan por las mismas reglas que las reales: si el
    seed armara algo imposible (por ejemplo, superar el cupo), fallaría al
    arrancar.
  - Cumple FR-004 (fechas relativas) y SC-005 (determinístico, porque solo
    depende de `ahora`).
- **Evento de hoy**: su fecha es `ahora + 2 h`. Si eso cae en el día
  calendario siguiente de Buenos Aires (arranque después de las 22:00), se
  usa `ahora + 1 min`, que sigue siendo hoy. Así siempre se puede mostrar
  "registrar ingreso" (FR-003).
- **Alternatives considered**: un JSON estático con estados y fechas fijas.
  Envejece (las fechas quedarían en el pasado) y se saltearía la validación
  del dominio.

## D12. Sin CORS ni otras dependencias

- **Decision**: no se agrega `cors`, `morgan`, `dotenv` ni `nodemon`. El
  puerto sale de `process.env.PORT` (por defecto 3000) y el modo desarrollo
  usa `node --watch`.
- **Rationale**: React Native en el celular no aplica la política CORS del
  navegador, y Node 24 trae `--watch` y `process.loadEnvFile`
  (Principio IX). Si más adelante se usa Expo Web, se agrega `cors` en ese
  momento, con justificación.
- **Alternatives considered**: agregar `cors` "por las dudas". Es una
  dependencia sin un caso de uso que la pida.

## D13. Escuchar en `0.0.0.0` y mostrar la IP local al arrancar

- **Decision**: `server.js` escucha en `0.0.0.0` e imprime las URLs de la red
  local (`http://192.168.x.x:3000/api`), obtenidas con `os.networkInterfaces()`.
- **Rationale**: el celular con Expo necesita la IP de la PC en
  `EXPO_PUBLIC_API_URL` (Principio VI). Mostrarla al arrancar evita tener que
  buscarla a mano durante la demo.
- **Alternatives considered**: escuchar solo en `localhost`. Desde el celular
  sería inaccesible.

## D14. Fechas en la API: ISO 8601 en UTC

- **Decision**: los presentadores convierten cada `Date` con `toISOString()`.
  La entrada (por ejemplo, la fecha de un evento nuevo) se acepta en ISO 8601
  con offset y se valida que sea una fecha real.
- **Rationale**: es lo que fija el Principio VIII. La app las muestra en
  hora local.

## Sin NEEDS CLARIFICATION pendientes
