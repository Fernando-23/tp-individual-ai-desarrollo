# Bitácora de uso de IA

Registro de lo que la IA resolvió bien, lo que hubo que corregir y por qué, y
las dificultades del proceso. Es la base de la conclusión final del video.

## 2026-11-11 — Setup y constitución

- **Setup de Spec Kit**: se copiaron las skills y `.specify/` desde el repo de
  la charla (`utn-genai-talk-exercises`). La IA detectó restos del otro
  proyecto (la constitución, el `feature.json` y el Constitution Check del
  plan-template) y los limpió.
- **Problema encontrado**: los scripts PowerShell de Spec Kit fallaban en
  Windows PowerShell 5.1 porque estaban en UTF-8 sin BOM y tenían caracteres
  como `✓`. La IA lo diagnosticó al correr el primer hook y les agregó el BOM.
  Lección: las herramientas generadas para un entorno no siempre andan en otro.
- **Constitución v1.0.0**: la IA la redactó a partir del enunciado. Decisiones
  propuestas por la IA y revisadas:
  - Sin login: el usuario actual viaja en el header `X-Usuario-Id`.
  - Seed con fechas relativas al arranque, para que la demo sea repetible.
  - Expo para correr la app en el celular.
  - Cálculo de días en la zona horaria de Buenos Aires.
- **Corrección humana**: la IA eligió TypeScript. Se cambió a **JavaScript**
  para no sumar herramientas que el enunciado no pide.
- **Aclaración del docente (2026-10-22, consulta de un compañero)**: no hace
  falta una pasarela de pago, y las compras pendientes se confirman a mano.
  Lo que la IA había dejado abierto ("quién confirma una compra") se resolvió
  con la respuesta del docente, no con un supuesto del modelo. Se interpretó
  que el "admin" de la respuesta es el **organizador del evento**, porque el
  dominio no tiene un rol de administrador.

## 2026-11-18 — Spec 001: modelo de dominio

- Se pidió arrancar por el backend implementando el diagrama de clases. En vez
  de escribir código directo, la IA siguió el flujo de la constitución y
  escribió primero la spec (`specs/001-modelo-dominio/spec.md`): 5 historias,
  los requisitos y una tabla de transiciones de estado.
- La IA dejó 3 preguntas abiertas en lugar de suponer, todas sobre el ciclo de
  vida de la compra. Decisiones tomadas (todas las opciones recomendadas):
  - Cancelar una `PENDIENTE` la deja `CANCELADA`; cancelar una `CONFIRMADA`
    pasa directo a `REEMBOLSADA`, porque el pago es simulado.
  - `UTILIZADA` la marca el organizador al controlar el ingreso, desde el día
    del evento. Así solo reseña quien asistió de verdad.
  - El organizador puede rechazar una `PENDIENTE` (queda `CANCELADA`) para
    que no bloquee cupo para siempre.
- Detalle a revisar: la IA escribió primero 6 marcadores para 3 preguntas
  (el límite de Spec Kit es 3) y lo corrigió en la validación del checklist.

## 2026-11-18 — Plan 001: modelo de dominio

- La IA propuso 11 decisiones técnicas con su alternativa descartada
  (`specs/001-modelo-dominio/research.md`). Las más defendibles en el video:
  - La tabla de transiciones del código es la misma de la spec. Un test
    verifica que coincidan fila por fila.
  - El cupo disponible se calcula a partir de las compras, sin contador que
    se pueda desincronizar.
  - El tiempo entra como parámetro (`ahora`), así los tests de "el día del
    evento a medianoche" son determinísticos.
  - No hay librerías de fechas: Node 24 trae las zonas horarias (se verificó
    antes de decidir).
- La IA documentó cada desvío respecto del diagrama del enunciado (ids,
  historial dentro de la compra, `actualizarEstado` con quién y cuándo,
  puntuación entera).
- **Corrección**: el script de Spec Kit generó un `CLAUDE.md` con una
  estructura inventada (`frontend/`, `tests/` en la raíz). Se corrigió a mano.

## 2026-11-18 — Implementación 001: modelo de dominio

- **Resultado**: 55 tareas completas. La capa `backend/src/domain/` tiene las
  9 clases del diagrama con 167 tests en 16 archivos, todos en verde, y el
  lint sin errores. No tiene dependencias de ejecución.
- **TDD real**: en cada historia los tests se escribieron primero y se los
  vio fallar (rojo) antes de implementar.
- **Lo que hizo bien la IA**:
  - siguió las tareas en orden y respetó las decisiones del plan (tabla de
    transiciones, cupo calculado, `ahora` inyectado, estado privado);
  - agregó un test que compara la tabla de transiciones del código con la de
    la spec fila por fila, y otro que verifica que `index.js` expone
    exactamente el contrato.
- **Para mirar con ojo crítico**:
  - casi todo pasó a verde en el primer intento. Eso es bueno, pero los tests
    y el código los escribió el mismo modelo, así que pueden compartir el
    mismo malentendido. Por eso la trazabilidad
    (`specs/001-modelo-dominio/trazabilidad.md`) vincula cada test con la spec
    escrita antes, y no con el código.
  - `npm audit` reporta un ReDoS en `picomatch`, que entra por Vitest. La
    "solución" automática bajaba Vitest dos versiones mayores. Se decidió no
    aplicarla: es una herramienta de desarrollo que solo procesa nuestros
    propios patrones de archivos, y no llega a la app.
- **Pendiente detectado al hacer la trazabilidad**: para ordenar eventos por
  precio (caso de uso 11) hay que decidir qué precio representa a un evento
  (¿el mínimo?). Queda para la spec de ese caso de uso.
