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
