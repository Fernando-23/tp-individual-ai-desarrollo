# tp-individual-ai-desarrollo Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-11-18

## Active Technologies
- JavaScript (ES2024, ES Modules) sobre Node.js 24 (mínimo 22.12) + Express 5.x (ejecución). De desarrollo: Supertest 7.x, más Vitest 5.x y ESLint 10.x, que ya estaban (002-api-backend)
- en memoria (`Map` por agregado), con seed al arrancar. Se pierde al reiniciar (requisito del enunciado) (002-api-backend)

- JavaScript (ES2024, ES Modules) sobre Node.js 24 (mínimo 22.12) + ninguna de ejecución. De desarrollo: Vitest 5.x, ESLint 10.x y `@eslint/js` (001-modelo-dominio)

## Project Structure

```text
backend/   # Node + Express (src/domain, luego routes/services/repositories) y tests/
mobile/    # React Native con Expo (feature futura)
specs/     # una carpeta por feature de Spec Kit
docs/      # bitacora-ia.md
```

## Commands

Desde `backend/`: npm test; npm run lint

## Code Style

JavaScript (ES2024, ES Modules) sobre Node.js 24 (mínimo 22.12): Follow standard conventions

## Recent Changes
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
<!-- MANUAL ADDITIONS END -->
