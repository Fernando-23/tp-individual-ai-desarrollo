# Implementation Plan: Modelo de dominio de AI Ticket It

**Branch**: `001-modelo-dominio` | **Date**: 2026-11-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-modelo-dominio/spec.md`

## Summary

La feature implementa la capa `domain/` del backend: las 9 clases del
diagrama del enunciado y todas las reglas de negocio de la spec, como
JavaScript puro, sin Express, sin IO y sin reloj del sistema.

El enfoque técnico (detalle en [research.md](./research.md)):
- **Clases que calcan el diagrama**: conservan los métodos `tuPrecioEstaEntre`,
  `hayCupoPara` y `actualizarEstado`.
- **Una tabla de transiciones** idéntica a la de la spec (FR-016b), consultada
  por `actualizarEstado`, que es el único punto de cambio de estado.
- **Cupo disponible calculado** a partir de las compras, en lugar de un
  contador.
- **Tiempo inyectado** como parámetro `ahora`.
- **Zona horaria con `Intl`**.
- **Tres clases de error**, que la capa HTTP traducirá a 400, 403 y 409.

Todo se desarrolla con TDD en Vitest.

## Technical Context

**Language/Version**: JavaScript (ES2024, ES Modules) sobre Node.js 24 (mínimo 22.12)
**Primary Dependencies**: ninguna de ejecución. De desarrollo: Vitest 5.x, ESLint 10.x y `@eslint/js`
**Storage**: N/A (el dominio no persiste; los repositorios en memoria son de la feature siguiente)
**Testing**: Vitest (`backend/tests/domain/`), con *builders* de datos de prueba
**Target Platform**: Node.js en la PC del desarrollador (local)
**Project Type**: web-service (backend de una app mobile). Esta feature es solo su biblioteca de dominio
**Performance Goals**: N/A. Escala de un TP: decenas de eventos y cientos de compras en memoria
**Constraints**: dominio puro (sin `express`, `fs`, `Date.now()` ni aleatoriedad); fechas por día en `America/Argentina/Buenos_Aires`
**Scale/Scope**: 9 entidades y valores, 1 máquina de estados de 5 transiciones, 27 requisitos funcionales

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verificación inicial y post-diseño (las dos pasan):

- [x] **I. Test-First** — Cada restricción de dominio de la constitución y cada FR tiene su test, escrito y en rojo antes de implementar (tasks lo ordena así).
- [x] **II. Capas** — Solo se crea `backend/src/domain/`. No importa Express, repositorios ni `fs`; las dependencias apuntan hacia adentro.
- [x] **III. Memoria + seed** — N/A en esta feature: el dominio no almacena. El seed llega con los repositorios (feature 002). No es una violación: la constitución lo exige "al iniciar el backend", y esta feature no arranca un backend.
- [x] **IV. Contrato de API** — N/A para HTTP. El contrato del módulo está en `contracts/dominio.md`, con la tabla de errores para 400/403/409.
- [x] **V. Identidad simple** — La autorización por rol (comprador u organizador) vive en el dominio y se compara por `id`. Sin pasarela de pago: el organizador confirma (FR-012).
- [x] **VI. Mobile (Expo)** — N/A en esta feature.
- [x] **VII. JavaScript + lint** — JavaScript ESM, ESLint con `@eslint/js` recomendado, nombres de dominio en español.
- [x] **VIII. Fechas** — `fechas.js` con funciones puras testeadas, incluidos los bordes de medianoche en Buenos Aires. `ahora` inyectado (research D6, D7).
- [x] **IX. Simplicidad** — Cero dependencias de ejecución. Solo 3 de desarrollo, gratuitas y justificadas en research D10. Sin patrón State ni librerías de fechas.
- [x] **Flujo IA** — 11 decisiones con su alternativa descartada en research.md. La bitácora se actualiza al cerrar el plan.

Resultado: **PASS**, sin violaciones que justificar.

## Project Structure

### Documentation (this feature)

```text
specs/001-modelo-dominio/
├── spec.md              # Qué y por qué (con Clarifications)
├── plan.md              # Este archivo
├── research.md          # Decisiones D1–D11 con alternativas
├── data-model.md        # Clases, campos, reglas, máquina de estados, desvíos del diagrama
├── quickstart.md        # Cómo correr tests y probar una regla a mano
├── contracts/
│   └── dominio.md       # API pública del módulo y tabla de errores → HTTP
├── checklists/
│   └── requirements.md  # Checklist de calidad de la spec
└── tasks.md             # Lo genera /speckit-tasks (todavía no existe)
```

### Source Code (repository root)

```text
backend/
├── package.json             # "type": "module"; scripts: test, test:watch, lint
├── eslint.config.js         # flat config con @eslint/js recomendado
├── src/
│   └── domain/
│       ├── index.js             # exporta la API pública (contracts/dominio.md)
│       ├── errores.js           # ErrorDeDominio, ErrorValidacion, ErrorPermiso, ErrorConflicto
│       ├── validaciones.js      # helpers internos: textoNoVacio, enteroPositivo…
│       ├── fechas.js            # diaCalendario, diasEntre (Buenos Aires)
│       ├── estadoCompra.js      # EstadoCompra, TRANSICIONES
│       ├── usuario.js
│       ├── categoria.js         # Categoria, normalizarNombre
│       ├── tipoEntrada.js
│       ├── evento.js
│       ├── compra.js
│       ├── cambioEstadoCompra.js
│       ├── mensaje.js
│       ├── resenia.js
│       └── reputacion.js        # puntajeOrganizador
└── tests/
    └── domain/
        ├── builders.js          # crearUsuario(), crearEvento(), en(fechaBA)… para tests legibles
        ├── fechas.test.js
        ├── usuario.test.js
        ├── evento.test.js       # validaciones, tuPrecioEstaEntre, días
        ├── tipoEntrada.test.js  # cupo disponible
        ├── compra.crear.test.js # cupo, total, estado inicial
        ├── compra.estados.test.js  # tabla de transiciones completa, permisos, historial
        ├── compra.mensajes.test.js
        ├── resenias.test.js     # reseñar y puntajeOrganizador
        └── transiciones.test.js # verifica que TRANSICIONES coincide con FR-016b fila por fila
```

`mobile/` no se crea en esta feature.

**Structure Decision**: dos proyectos hermanos en la raíz (`backend/` ahora y
`mobile/` más adelante), cada uno con su `package.json` (research D11). Dentro
de `backend/` se respeta la capa del Principio II: esta feature solo llena
`src/domain/`, y las carpetas `routes/`, `services/` y `repositories/` se
crean en las features que las usan. Los tests replican la estructura de
`src/` dentro de `tests/`, para separar los tests de dominio de los futuros
tests de API.

## Orden sugerido de implementación (insumo para /speckit-tasks)

1. **Setup**: `backend/package.json`, ESLint, Vitest y un test vacío que
   corre.
2. **Fundacional**:
   - `errores.js` y `validaciones.js`;
   - `fechas.js` (con tests de medianoche en Buenos Aires);
   - `builders.js`.
3. **Historia 1 (P1), comprar sin superar el cupo**: `Usuario`, `Categoria`,
   `TipoEntrada`, `Evento` (validaciones mínimas) y `Compra.crear`.
4. **Historia 2 (P1), ciclo de vida**: `estadoCompra.js`,
   `actualizarEstado`, atajos e historial. El test `transiciones.test.js` va
   primero.
5. **Historia 3 (P2), reseñas**: `Evento.reseniar` y `puntajeOrganizador`.
6. **Historia 4 (P3), chat**: `Compra.enviarMensaje`.
7. **Historia 5 (P3), eventos y favoritos**: el resto de las validaciones de
   `Evento`, `tuPrecioEstaEntre` y los favoritos.
8. **Cierre**: `index.js` según el contrato, lint limpio, quickstart
   verificado y bitácora.

## Complexity Tracking

Sin violaciones a la constitución: no hay nada que justificar.
