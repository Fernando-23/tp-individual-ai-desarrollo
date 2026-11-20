# tp-individual-ai-desarrollo Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-11-19

## Active Technologies
- JavaScript (ES2024, ES Modules) sobre Node.js 24 (mínimo 22.12) + Express 5.x (ejecución). De desarrollo: Supertest 7.x, más Vitest 5.x y ESLint 10.x, que ya estaban (002-api-backend)
- en memoria (`Map` por agregado), con seed al arrancar. Se pierde al reiniciar (requisito del enunciado) (002-api-backend)
- JavaScript (ES2024) sobre React Native 0.88 / React 19, con Expo SDK 58 + `expo`, `expo-router` (y sus pares, instalados con `npx expo install`), `@react-native-community/datetimepicker` y `@expo/vector-icons` (incluido en Expo). De desarrollo: Vitest 5.x y `eslint-config-expo` (003-app-mobile)
- ninguno. El usuario actual vive en memoria (`UsuarioContext`); los datos vienen de la API (003-app-mobile)

- JavaScript (ES2024, ES Modules) sobre Node.js 24 (mínimo 22.12) + ninguna de ejecución. De desarrollo: Vitest 5.x, ESLint 10.x y `@eslint/js` (001-modelo-dominio)

## Project Structure

```text
backend/
  src/domain/        # reglas puras (feature 001)
  src/services/      # casos de uso: buscan en repos, delegan en el dominio
  src/repositories/  # Map en memoria
  src/routes/        # Express: solo leen la request, llaman a un servicio y presentan
  src/http/          # middlewares (usuario actual, errores) y presentadores
  src/seed/          # datos de demostración (fechas relativas al arranque)
  tests/domain/  tests/api/
mobile/    # React Native + Expo SDK 58 (Expo Go en Android)
  app/               # rutas de Expo Router (una pantalla por archivo)
  src/api/           # cliente HTTP y endpoints: el ÚNICO lugar con fetch
  src/contexto/      # usuario actual (UsuarioContext) + useApi()
  src/hooks/         # useRecurso (cargando/error/datos), usePolling, useTema
  src/componentes/   # componentes accesibles reutilizables
  src/logica/        # lógica pura con tests (formatos, estados, acciones, validación, contraste)
  src/tema.js        # paleta y PARES_DE_CONTRASTE (AAA verificado por test)
  tests/
specs/     # una carpeta por feature de Spec Kit
docs/      # bitacora-ia.md
```

## Commands

Desde `backend/`: npm start (o npm run dev); npm test; npm run lint
Desde `mobile/`: npx expo start; npm test; npm run lint; npx expo export --platform android (verifica que compila)
En PowerShell con scripts bloqueados, usar `npm.cmd` / `npx.cmd`.

## Code Style

JavaScript (ES2024, ES Modules) sobre Node.js 24 (mínimo 22.12): Follow standard conventions

## Recent Changes
- 003-app-mobile: Added JavaScript (ES2024) sobre React Native 0.88 / React 19, con Expo SDK 58 + `expo`, `expo-router` (y sus pares, instalados con `npx expo install`), `@react-native-community/datetimepicker` y `@expo/vector-icons` (incluido en Expo). De desarrollo: Vitest 5.x y `eslint-config-expo`
- 002-api-backend: Added JavaScript (ES2024, ES Modules) sobre Node.js 24 (mínimo 22.12) + Express 5.x (ejecución). De desarrollo: Supertest 7.x, más Vitest 5.x y ESLint 10.x, que ya estaban

- 001-modelo-dominio: Added JavaScript (ES2024, ES Modules) sobre Node.js 24 (mínimo 22.12) + ninguna de ejecución. De desarrollo: Vitest 5.x, ESLint 10.x y `@eslint/js`

<!-- MANUAL ADDITIONS START -->
## Antes de tocar código

- AI Ticket It: TP individual de DDS (UTN FRBA, 2C 2026), hecho con IA.
- Leé `.specify/memory/constitution.md`: dominio, reglas y principios no negociables.
- Toda feature sigue Spec Kit: `specify → clarify → plan → tasks → implement`,
  con revisión humana entre etapas. La feature activa está en `.specify/feature.json`.
- El dominio (`backend/src/domain/`) es puro: sin Express, IO ni `Date.now()`;
  el tiempo entra como parámetro `ahora`.
- Registrá en `docs/bitacora-ia.md` lo que la IA hizo bien, lo que hubo que
  corregir y por qué.
- Antes de dar una tarea por terminada: `npm test` y `npm run lint` en `backend/`.
- El contrato de la API (rutas, vistas JSON y códigos de error) está en
  `specs/002-api-backend/contracts/api.md`: es la referencia para la app mobile.
- Los tests de API usan `appDePrueba()` (seed + reloj fijo) de `backend/tests/api/helpers.js`.

## App mobile

- Expo SDK 58 es posterior al conocimiento del modelo: antes de usar una API de
  Expo o Expo Router, verificá en la documentación versionada
  (https://docs.expo.dev/versions/v58.0.0/) o en los tipos de `node_modules`.
- Instalá dependencias con `npx expo install` (elige versiones compatibles con el SDK).
- Toda pantalla con datos usa `useRecurso` + `EstadoCarga` (cargando, error con
  reintento, vacío). Las listas van dentro de `ZonaLista` (recorte + 32 px).
- Accesibilidad AAA (FR-019): controles ≥ 48 × 48 con rol y etiqueta; colores
  solo desde `useTema()`; todo color nuevo de texto se agrega a
  `PARES_DE_CONTRASTE` para que el test lo verifique.
- La app no decide reglas de negocio: `accionesDisponibles` solo elige qué
  botones mostrar; el servidor tiene la última palabra.
<!-- MANUAL ADDITIONS END -->
