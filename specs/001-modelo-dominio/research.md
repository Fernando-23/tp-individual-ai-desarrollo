# Research: Modelo de dominio de AI Ticket It

**Feature**: `001-modelo-dominio` · **Fecha**: 2026-11-18

Cada decisión incluye la alternativa descartada y el motivo, como pide la
constitución (Flujo de Trabajo con IA).

## D1. Sistema de módulos: ESM

- **Decision**: ES Modules (`"type": "module"`, `import`/`export`).
- **Rationale**: es el estándar actual de JavaScript, Vitest lo usa de forma
  nativa y es la misma sintaxis que va a usar la app de Expo. Se escribe
  igual en las dos apps.
- **Alternatives considered**: CommonJS (`require`). Se descartó porque mezcla
  dos sintaxis en el repo y Vitest y ESLint 10 ya asumen ESM.

## D2. Dominio rico con clases, como en el diagrama

- **Decision**: una clase por entidad del diagrama (`Evento`, `TipoEntrada`,
  `Compra`…). Los métodos del diagrama se conservan con su nombre
  (`tuPrecioEstaEntre`, `hayCupoPara`, `actualizarEstado`) y cada clase valida
  sus propias invariantes en el constructor.
- **Rationale**: el enunciado y la materia trabajan con un diagrama de clases.
  Si el código lo calca, es fácil de explicar en el video y de comparar con el
  diagrama. Las reglas quedan junto a los datos que protegen.
- **Alternatives considered**: objetos planos más funciones sueltas (modelo
  "anémico"). Se descartó porque las reglas quedarían dispersas y sería fácil
  saltearlas, por ejemplo cambiando `compra.estado` a mano.

## D3. El estado de la compra solo cambia por `actualizarEstado`

- **Decision**: `estado` e `historial` son campos privados (`#estado`,
  `#historial`) con getters de solo lectura. El único camino para cambiar el
  estado es `actualizarEstado(nuevoEstado, quien, ahora)`.
- **Rationale**: cumple FR-010 y SC-003 por construcción. No existe forma de
  cambiar el estado sin dejar el registro en el historial.
- **Alternatives considered**: campos públicos y la disciplina de "no
  tocarlos". Se descartó porque un código generado por IA puede asignar el
  campo directamente sin que nada lo frene.

## D4. Las transiciones son una tabla de datos

- **Decision**: `TRANSICIONES` es un arreglo congelado que replica FR-016b,
  con filas `{ desde, hacia, rol, condicion }`. `actualizarEstado` la
  consulta en tres pasos:
  1. ¿Existe la transición `desde → hacia`? Si no, `ErrorConflicto`.
  2. ¿Alguno de los roles de `quien` (comprador u organizador) la puede hacer?
     Si no, `ErrorPermiso`.
  3. ¿Se cumple su condición (evento no realizado, día del evento)? Si no,
     `ErrorConflicto` con el motivo.
- **Rationale**: la tabla del código es la misma de la spec, así que una
  regla se revisa comparando dos tablas. El orden de los chequeos da los
  mensajes que piden FR-017 y SC-005.
- **Alternatives considered**: un `switch` por estado, o el patrón State con
  una clase por estado. El `switch` esconde la tabla entre ramas. El patrón
  State son 5 clases para 5 filas, y se descartó por simplicidad
  (Principio IX).
- **Atajos con intención**: `confirmar`, `cancelar`, `rechazar` y
  `marcarUtilizada` solo eligen el estado destino y delegan en
  `actualizarEstado`. Por ejemplo, `cancelar` va a `CANCELADA` si la compra
  está pendiente y a `REEMBOLSADA` si está confirmada (FR-014). No contienen
  reglas propias.

## D5. Cupo disponible calculado, no acumulado

- **Decision**: cada `TipoEntrada` conoce sus compras (las registra
  `Compra.crear`), y `cupoDisponible()` se calcula como `cupo − Σ cantidad` de
  las compras que ocupan cupo (`PENDIENTE`, `CONFIRMADA`, `UTILIZADA`).
  `hayCupoPara(n)` es `n ≤ cupoDisponible()`.
- **Rationale**: al cancelar o reembolsar, el cupo se libera solo, sin
  actualizar ningún contador. Es imposible que un contador quede
  desincronizado con las compras (SC-002).
- **Alternatives considered**: un contador `vendidas` que se suma al comprar
  y se resta al cancelar. Se descartó porque cada transición tendría que
  acordarse de tocarlo, y con un olvido se venden entradas de más. El costo de
  recorrer las compras es despreciable en memoria y a esta escala.

## D6. El tiempo entra como parámetro (`ahora`)

- **Decision**: toda regla que depende de la fecha recibe `ahora` (un `Date`)
  como parámetro: crear una compra, cancelar, marcar utilizada, días
  restantes y mensajes. El dominio nunca llama a `new Date()` ni a
  `Date.now()`.
- **Rationale**: el dominio queda puro y los tests son determinísticos, por
  ejemplo "es el día del evento a las 23:59 en Buenos Aires". La capa de
  servicios (feature siguiente) pasa la hora real.
- **Alternatives considered**: usar el reloj del sistema en el dominio y
  falsearlo en los tests con `vi.useFakeTimers()`. Se descartó porque es
  estado global, oculta la dependencia y es fácil olvidarse de restaurarlo.

## D7. Zona horaria con `Intl`, sin librerías

- **Decision**: `fechas.js` obtiene el día calendario en
  `America/Argentina/Buenos_Aires` con
  `Intl.DateTimeFormat('en-CA', { timeZone })`, que devuelve `YYYY-MM-DD`.
  Los días restantes son la diferencia entre dos días calendario,
  calculada con `Date.UTC`.
- **Rationale**: Node 24 trae los datos de zonas horarias completos (se
  verificó en esta máquina), así que no hace falta ninguna dependencia
  (Principio IX). No se asume que Argentina no tiene horario de verano: se
  usa la zona IANA.
- **Alternatives considered**: `date-fns-tz` o `luxon`. Se descartaron porque
  son dependencias para dos funciones. Restar 3 horas fijas a UTC también se
  descartó: es frágil si la zona cambia y oculta la intención.

## D8. Errores tipados para que la API elija el código HTTP

- **Decision**: tres clases que extienden `ErrorDeDominio`:
  `ErrorValidacion` (datos inválidos), `ErrorPermiso` (el usuario no puede
  hacerlo) y `ErrorConflicto` (el estado o el cupo no lo permiten). Los
  mensajes están en español.
- **Rationale**: FR-017 y SC-005 piden distinguir el motivo. La capa HTTP
  (feature siguiente) traduce cada clase a 400, 403 o 409 sin leer textos.
- **Alternatives considered**: devolver `{ ok, error }` en lugar de lanzar
  excepciones. Se descartó porque en JavaScript es fácil ignorar un retorno,
  mientras que una excepción no se puede ignorar.

## D9. Identidad por `id`

- **Decision**: toda entidad recibe un `id` (string) en su constructor. El
  dominio compara usuarios por `id` (por ejemplo, para saber si `quien` es el
  organizador). Los ids los asignan los repositorios en la feature siguiente.
  En los tests los asignan los *builders*.
- **Rationale**: comparar por referencia funciona en memoria, pero se rompe
  en cuanto un objeto se reconstruye. Por `id` funciona siempre.
- **Alternatives considered**: generar UUIDs dentro del dominio. Se descartó
  porque introduce aleatoriedad en el dominio y vuelve los tests no
  determinísticos.

## D10. Herramientas: Vitest + ESLint, solo como dependencias de desarrollo

- **Decision**: Vitest 5.x para los tests y ESLint 10.x con
  `@eslint/js` (configuración recomendada, *flat config*) para el lint. Ambas
  versiones se verificaron compatibles con Node 24. El dominio no tiene
  dependencias de ejecución.
- **Rationale**: Vitest corre ESM sin configuración y es rápido en modo
  *watch*. Los tests importan `describe`, `it` y `expect` desde `vitest` de
  forma explícita, así que no hace falta declarar globals en ESLint.
- **Alternatives considered**: Jest, que necesita configuración extra para
  ESM. También el test runner nativo de Node (`node --test`), que es una
  opción válida y sin dependencias, pero la constitución ya fijó Vitest y su
  salida y su modo *watch* son más cómodos para mostrar en el video.

## D11. Estructura del repositorio

- **Decision**: dos proyectos hermanos, `backend/` (ahora) y `mobile/`
  (feature futura), cada uno con su `package.json`. Esta feature solo crea
  `backend/` y, dentro, solo `src/domain/` y `tests/domain/`.
- **Rationale**: son dos apps con herramientas distintas (Node vs Expo). No
  hace falta un monorepo con *workspaces* para eso (Principio IX).
- **Alternatives considered**: npm workspaces con un paquete `shared/`. Se
  descartó por ahora, porque el contrato se documenta en `contracts/` (la
  constitución ya lo resolvió así) y no hay código para compartir.

## Sin NEEDS CLARIFICATION pendientes

El contexto técnico quedó definido por la constitución, el pedido del usuario
y estas decisiones.
