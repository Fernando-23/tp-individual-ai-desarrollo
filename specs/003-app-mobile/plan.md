# Implementation Plan: App mobile de AI Ticket It

**Branch**: `003-app-mobile` | **Date**: 2026-11-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-app-mobile/spec.md`

## Summary

Se construye una app React Native con Expo (SDK 58), que corre en Expo Go
sobre el Android del usuario y consume la API de la feature 002. Cubre las
10 historias de la spec: los 12 casos de uso, la elección del usuario y los
favoritos.

El enfoque técnico (detalle en [research.md](./research.md)):
- **Navegación por archivos** con Expo Router: pestañas más pantallas de
  detalle.
- **Estado mínimo**: un contexto para el usuario y un hook `useRecurso` por
  pantalla, que maneja cargando, error y vacío y recarga al volver.
- **Un único cliente HTTP** en `src/api/`.
- **Lógica pura testeada con Vitest** (formatos, estados, acciones
  disponibles, validación, cliente).
- **El chat consulta cada 4 s** mientras está en pantalla.
- **Componentes propios**, con la paleta del logo del enunciado.

## Technical Context

**Language/Version**: JavaScript (ES2024) sobre React Native 0.88 / React 19, con Expo SDK 58
**Primary Dependencies**: `expo`, `expo-router` (y sus pares, instalados con `npx expo install`), `@react-native-community/datetimepicker` y `@expo/vector-icons` (incluido en Expo). De desarrollo: Vitest 5.x y `eslint-config-expo`
**Storage**: ninguno. El usuario actual vive en memoria (`UsuarioContext`); los datos vienen de la API
**Testing**: Vitest para `mobile/src/logica/` y `mobile/src/api/cliente.js`. Las pantallas se verifican a mano en el celular, con el recorrido de quickstart.md
**Target Platform**: Android con Expo Go (SDK 58), en orientación vertical
**Project Type**: mobile-app (cliente de la API de la feature 002)
**Performance Goals**: una compra en menos de 30 s y 4 toques (SC-002); el chat refleja un mensaje en 5 s como máximo
**Constraints**: misma red Wi-Fi que el backend; sin persistencia, login ni offline; todo `fetch` en `src/api/`
**Scale/Scope**: 12 pantallas, ~10 componentes compartidos y 5 módulos de lógica pura

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Test-First** — En mobile, la constitución exige tests de la lógica no visual: formato, días restantes (texto), validación, acciones disponibles y cliente HTTP, escritos en rojo antes de implementar. Los tests de componentes son opcionales y no se hacen.
- [x] **II. Capas** — N/A para el backend: no se toca. En la app, la separación análoga es pantallas (`app/`) → hooks y contexto → `src/api/` → servidor, con la lógica pura aparte.
- [x] **III. Memoria + seed** — La demo usa el seed de la feature 002. El recorrido del quickstart está armado sobre esos datos.
- [x] **IV. Contrato de API** — La app consume `contracts/api.md` de la feature 002 sin desviarse. El mapa de pantallas está en `contracts/pantallas.md`.
- [x] **V. Identidad simple** — Elegir el usuario manda `X-Usuario-Id`. Ante un 401, se vuelve a elegir. Sin pantallas de pago.
- [x] **VI. Mobile (Expo)** — Expo y Expo Go; `EXPO_PUBLIC_API_URL`; todo `fetch` en `src/api/`; cargando, error y vacío en cada pantalla (`useRecurso` más el componente `EstadoCarga`); estados con color y texto.
- [x] **VII. JavaScript + lint** — JavaScript, `eslint-config-expo`, nombres en español.
- [x] **VIII. Fechas** — Las fechas llegan en ISO UTC y se muestran en la zona del dispositivo. Los días restantes vienen calculados por el servidor (hora de Buenos Aires); la app solo arma el texto.
- [x] **IX. Simplicidad** — Sin librerías de estado, UI, fechas ni HTTP. Solo se agregan Expo Router (navegación oficial), el datetimepicker (incluido en Expo Go), Vitest y la configuración de lint de Expo, todo justificado en research.
- [x] **Flujo IA** — 12 decisiones con su alternativa descartada en research.md. La bitácora se actualiza.

Resultado: **PASS**, sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/003-app-mobile/
├── spec.md · plan.md · research.md · data-model.md · quickstart.md
├── contracts/pantallas.md   # mapa de pantallas, endpoints y acciones
├── checklists/requirements.md
└── tasks.md                 # /speckit-tasks
```

### Source Code (repository root)

```text
mobile/
├── package.json             # scripts: start (expo start), test (vitest run), lint (expo lint)
├── app.json                 # nombre "AI Ticket It", scheme, orientación vertical, colores
├── .env.example             # EXPO_PUBLIC_API_URL=http://192.168.x.x:3000/api
├── eslint.config.js         # eslint-config-expo
├── app/                     # rutas (Expo Router), ver contracts/pantallas.md
│   ├── _layout.js           # Stack raíz + UsuarioProvider + redirección si no hay usuario
│   ├── elegir-usuario.js
│   ├── (tabs)/_layout.js    # pestañas + usuario actual en el encabezado
│   ├── (tabs)/index.js      # Explorar
│   ├── (tabs)/compras.js
│   ├── (tabs)/eventos.js
│   ├── (tabs)/favoritos.js
│   ├── evento/[id].js
│   ├── compra/[id]/index.js
│   ├── compra/[id]/chat.js
│   ├── compra/[id]/reseniar.js
│   ├── ventas/[eventoId].js
│   └── publicar.js
├── src/
│   ├── api/                 # cliente.js + usuarios, eventos, compras, favoritos
│   ├── contexto/UsuarioContext.js
│   ├── hooks/useRecurso.js · usePolling.js
│   ├── componentes/         # EstadoCarga, EtiquetaEstado, TarjetaEvento, TarjetaCompra,
│   │                        # Boton, Estrellas, SelectorCantidad, Encabezado…
│   ├── logica/              # formato, estados, acciones, validarEvento (puras)
│   └── tema.js              # colores, espaciados, tipografía
└── tests/logica/            # Vitest: formato, estados, acciones, validarEvento, cliente
```

**Structure Decision**: `mobile/` es un proyecto hermano de `backend/`
(research de la feature 001, D11), creado con `create-expo-app` y la
plantilla `blank`. Las rutas viven en `app/` (convención de Expo Router) y
todo lo demás en `src/`. Los tests solo cubren `src/logica` y
`src/api/cliente.js`, que es lo que exige el Principio I para mobile.

## Orden de implementación (insumo para /speckit-tasks)

1. **Setup**:
   - crear el proyecto y agregar Expo Router, Vitest y el lint;
   - **abrir la app vacía en el celular** (verifica el SDK y la red antes de
     escribir pantallas).
2. **Fundacional**:
   - lógica pura y cliente HTTP, con TDD;
   - tema y componentes base;
   - `UsuarioContext`, `useRecurso` y el layout raíz.
3. **US1** Elegir usuario → **US2** Explorar y detalle → **US3** Comprar →
   **US4** Mis compras y detalle → **US5** Mis eventos y ventas (acciones
   del organizador). Con esto queda el MVP del flujo de la demo.
4. **US6** Cancelar → **US7** Chat → **US8** Reseñar → **US9** Favoritos →
   **US10** Publicar.
5. **Cierre**:
   - recorrido completo en el celular (quickstart) y trazabilidad;
   - CLAUDE.md y bitácora.

## Complexity Tracking

Sin violaciones a la constitución: no hay nada que justificar.
