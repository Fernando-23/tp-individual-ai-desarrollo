# Implementation Plan: Backend de AI Ticket It de punta a punta

**Branch**: `002-api-backend` | **Date**: 2026-11-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-api-backend/spec.md`

## Summary

Se expone el dominio de la feature 001 como una API REST de Express 5 para
la app mobile. La API cubre los 12 casos de uso del enunciado, la elección
del usuario actual (`X-Usuario-Id`) y los favoritos.

El enfoque técnico (detalle en [research.md](./research.md)):
- **Capas** routes → services → repositories (`Map` en memoria) → domain.
- **App armada por inyección**: `crearApp({ repositorios, reloj,
  generarId })`. Cada test crea su propia app con un reloj fijo.
- **Seed armado con operaciones del dominio**, con ids legibles y fechas
  relativas al arranque.
- **Un middleware de errores** que traduce las clases del dominio a
  400/401/403/404/409.
- **Rutas con verbos de negocio** para los cambios de estado de una compra.

Todo se desarrolla con TDD en Vitest + Supertest.

## Technical Context

**Language/Version**: JavaScript (ES2024, ES Modules) sobre Node.js 24 (mínimo 22.12)
**Primary Dependencies**: Express 5.x (ejecución). De desarrollo: Supertest 7.x, más Vitest 5.x y ESLint 10.x, que ya estaban
**Storage**: en memoria (`Map` por agregado), con seed al arrancar. Se pierde al reiniciar (requisito del enunciado)
**Testing**: Vitest + Supertest (`backend/tests/api/`) y Vitest para el seed y los servicios puros
**Target Platform**: Node.js en la PC del desarrollador, escuchando en `0.0.0.0:3000` para la red local
**Project Type**: web-service (backend de una app mobile)
**Performance Goals**: respuesta instantánea con el volumen de la demo: decenas de eventos, menos de 1 s (SC-004)
**Constraints**: sin auth real; sin pasarela de pago; las reglas solo en el dominio (FR-026); errores `{ error }` en español
**Scale/Scope**: 22 endpoints, 5 servicios, 4 repositorios, seed con 4 usuarios, 8 eventos y 11 compras

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verificación inicial y post-diseño:

- [x] **I. Test-First** — Cada endpoint tiene tests de API escritos y en rojo antes de implementar. Cada test usa una app con repositorios nuevos (`crearApp`) y un reloj fijo.
- [x] **II. Capas** — routes → services → repositories → domain. Las rutas no tocan repositorios y las reglas siguen en `domain/` (incluida la regla nueva de "no comprar un evento ya realizado").
- [x] **III. Memoria + seed** — `cargarDatosDemo(repos, ahora)` es determinístico, con fechas relativas, y cubre los 12 casos de uso (tabla en data-model.md).
- [x] **IV. Contrato de API** — `/api`, recursos en plural kebab-case, `{ error }` en español, formato documentado en `contracts/api.md`. Agrega el 401 (ver Complexity Tracking).
- [x] **V. Identidad simple** — `X-Usuario-Id`, autorización verificada en el servidor (por el dominio y por los servicios para las ventas), sin pasarela de pago.
- [x] **VI. Mobile (Expo)** — N/A en esta feature. El servidor escucha en `0.0.0.0` e imprime la URL para `EXPO_PUBLIC_API_URL`.
- [x] **VII. JavaScript + lint** — JavaScript ESM, lint sin errores, nombres en español.
- [x] **VIII. Fechas** — ISO UTC en la API. `diasRestantes` y "ya se realizó" vienen del dominio (hora de Buenos Aires). El reloj se inyecta.
- [x] **IX. Simplicidad** — Una sola dependencia de ejecución nueva (Express, exigida por el enunciado) y una de desarrollo (Supertest). Sin cors, dotenv ni nodemon (research D12).
- [x] **Flujo IA** — 14 decisiones con su alternativa descartada en research.md. La bitácora se actualiza.

Resultado: **PASS**, con una desviación justificada.

## Requisitos derivados durante el diseño

Se registran para que la spec y el código no diverjan:

1. **`GET /api/mis-eventos`**: el organizador necesita listar sus eventos,
   incluidos los pasados, para elegir de cuál ver las ventas. El catálogo
   solo muestra los próximos (FR-007). Es necesario para FR-019.
2. **No comprar un evento que ya empezó** (→ 409). Faltaba en la feature
   001. Se agrega a `Compra.crear` en el dominio, con su test, porque es una
   regla de negocio (Principio II).
3. **`GET /api/salud`**: permite verificar desde el celular que la red llega
   a la PC (quickstart).

## Project Structure

### Documentation (this feature)

```text
specs/002-api-backend/
├── spec.md
├── plan.md              # Este archivo
├── research.md          # Decisiones D1–D14
├── data-model.md        # Repositorios, servicios, vistas y contenido del seed
├── quickstart.md        # Levantar, curl, probar desde el celular
├── contracts/
│   └── api.md           # Endpoints, vistas JSON y códigos de error
├── checklists/
│   └── requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
backend/
├── package.json                  # + express; + supertest (dev); scripts start y dev
├── src/
│   ├── domain/                   # feature 001 (+ regla "evento ya realizado" en compra.js)
│   ├── app.js                    # crearApp({ repositorios, reloj, generarId })
│   ├── server.js                 # PORT, seed, listen 0.0.0.0, imprime las URLs
│   ├── http/
│   │   ├── errores.js            # ErrorNoIdentificado + middleware manejarErrores + 404 de ruta
│   │   ├── usuarioActual.js      # middlewares requerirUsuario y usuarioOpcional
│   │   └── presentadores.js      # dominio → JSON (contracts/api.md)
│   ├── repositories/
│   │   └── repositorioEnMemoria.js  # RepositorioEnMemoria + crearRepositorios()
│   ├── services/
│   │   ├── errores.js            # ErrorNoEncontrado
│   │   ├── busqueda.js           # normalizarTexto (sin acentos)
│   │   ├── usuariosService.js
│   │   ├── catalogoService.js
│   │   ├── eventosService.js
│   │   ├── comprasService.js
│   │   └── favoritosService.js
│   ├── routes/
│   │   ├── index.js              # monta todas las rutas en /api
│   │   ├── usuarios.js  categorias.js  eventos.js
│   │   ├── compras.js   misRecursos.js
│   └── seed/
│       └── datosDemo.js          # cargarDatosDemo(repos, ahora)
└── tests/
    ├── domain/                   # feature 001 (+ test de la regla nueva)
    └── api/
        ├── helpers.js            # appDePrueba(): app con seed y reloj fijo; como(usuarioId)
        ├── seed.test.js
        ├── errores.test.js       # 401, 404 de ruta, JSON inválido, 500
        ├── catalogo.test.js      # US2
        ├── compras.test.js       # US3
        ├── ventas.test.js        # US4
        ├── cancelacion.test.js   # US5
        ├── mensajes.test.js      # US6
        ├── resenias.test.js      # US7
        ├── publicacion.test.js   # US8
        └── favoritos.test.js     # FR-024
```

**Structure Decision**: se completa `backend/` con las capas del
Principio II. Las rutas `mis-*` van juntas en `misRecursos.js`, porque todas
dependen del usuario actual y no de un id en la URL. Los tests de API se
apoyan en el seed real con un reloj fijo, así los escenarios de la spec se
escriben sobre datos conocidos (`u-leo`, `k-001`…), y cada test crea su
propia app.

## Complexity Tracking

| Violación | Por qué hace falta | Alternativa más simple descartada porque |
|---|---|---|
| Código **401** además de 400/403/404/409 del Principio IV | FR-025 exige distinguir "usuario no identificado" de "dato inválido" y de "sin permiso". 401 es el código estándar | Usar 400 o 403 mezclaría causas que la spec pide separar, y la app no podría reaccionar ("elegí un usuario") sin leer el texto del mensaje |
