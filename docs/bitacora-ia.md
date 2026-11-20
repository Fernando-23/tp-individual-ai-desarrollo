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

## 2026-11-18 — Spec 002: backend de punta a punta

- La IA agrupó los 12 casos de uso en 8 historias priorizadas, más una
  historia de "datos de demostración" pensada para el video (incluye un
  evento que es hoy y una compra utilizada sin reseñar).
- Preguntas resueltas (opciones recomendadas): el catálogo muestra solo
  eventos próximos; para ordenar se usa el precio más bajo del evento; los
  favoritos se incluyen aunque no estén en los 12 casos de uso.
- **Error de la IA**: durante varias respuestas afirmó que el repo "no tiene
  remoto" sin haberlo verificado nunca. Al pedirle un push, lo chequeó y
  `origin` existía (vacío). Lección: verificar antes de afirmar, incluso
  sobre datos "obvios" del entorno.

## 2026-11-18 — Plan, tareas e implementación 002 (sin revisión intermedia)

- **Contexto**: el usuario tuvo que irse y pidió seguir. Plan, tareas e
  implementación se hicieron **sin la revisión humana entre etapas** que pide
  la constitución, por instrucción explícita del usuario. Para compensar,
  cada etapa quedó en su propio commit, así se puede revisar y revertir por
  separado.
- **Resultado**: 46 tareas completas y 282 tests en verde (169 de dominio y
  113 de API). Lint limpio. El servidor real se probó con curl.
- **Decisiones que conviene revisar** (están en el plan y en research):
  - Se agregó el código **401** para "usuario no identificado", que no está
    en la lista de la constitución. Quedó justificado en el Complexity
    Tracking del plan.
  - Los cambios de estado son **rutas con verbos** (`/confirmar`,
    `/registrar-ingreso`) en lugar de un `PATCH` del estado.
  - Se agregó **`GET /api/mis-eventos`**, que no estaba en la spec pero hace
    falta para elegir de qué evento ver las ventas.
- **Hallazgo**: al diseñar `POST /api/compras` la IA detectó que el dominio
  de la feature 001 **permitía comprar entradas de un evento que ya pasó**.
  Se agregó la regla a `Compra.crear`, con su test. La spec 001 no lo había
  previsto.
- **Bug que atrapó un test**: el middleware de usuario aplicado a todo un
  router convertía cualquier ruta inexistente en 401 en lugar de 404. El test
  de "ruta inexistente → 404" lo detectó y se limitó a las rutas `/mis-*`.
- **Ajuste de un test**: un test del catálogo dependía de la historia de
  publicar eventos (US8). Se reescribió para que US2 fuera independiente.
- Las historias de cancelación (US5) pasaron sin código nuevo: ya las cubría
  la ruta de acciones de US4, como estaba previsto en las tareas.

## 2026-11-19 — Spec y plan 003: app mobile

- Decisiones del usuario: el chat se actualiza solo cada pocos segundos
  (opción A); la app corre en su celular Android con Expo Go.
- Antes de elegir la versión, la IA consultó npm: el SDK 58 de Expo es el
  último (salió el 29/09/2026). Lo eligió porque la Expo Go de la Play Store
  solo abre el SDK más reciente. La primera tarea de implementación verifica
  esto en el celular real antes de escribir pantallas.
- El plan deja el backend sin tocar. Las mejoras posibles (`acciones` y
  `yaResenie` calculados por el servidor) quedaron anotadas para una feature
  futura del backend, como anticipó el usuario.

## 2026-11-19 — Accesibilidad AAA en la app (pedido del usuario)

- Antes de implementar, el usuario pidió cuidar la UX y la accesibilidad
  (AAA), con la idea de agregar modos daltónico y oscuro después del MVP si
  hay tiempo, porque la entrega es el domingo.
- Decisión: la AAA entra en el MVP (contraste ≥ 7:1 verificado por un test,
  áreas táctiles de 48, etiquetas para lectores de pantalla, texto escalable).
  El "modo daltónico" se reemplazó por una paleta base que ya es segura para
  daltonismo, con ícono y texto en cada estado: así no hace falta un modo
  aparte. El modo oscuro quedó como tarea opcional (T044), facilitada porque
  todos los colores salen de un tema.

## 2026-11-19 — Implementación 003: app mobile (Expo)

- **Resultado**: las 10 historias implementadas y verificadas por el usuario
  en su Android con Expo Go (SDK 58). La app tiene 85 tests de lógica pura,
  lint limpio y el bundle de Android compila. Ninguna pantalla usa `fetch`
  directo ni colores escritos a mano.
- **Lo que hizo bien la IA**:
  - leyó la documentación del SDK 58 (es posterior a su conocimiento)
    antes de escribir la navegación, y verificó las APIs en los tipos
    instalados en `node_modules` (por ejemplo, el selector de fecha usa
    `onValueChange` en la 9.2.1);
  - la accesibilidad AAA se volvió **medible**: un test calcula el contraste
    de cada par de colores (el mínimo de texto es 8,72:1);
  - el "modo daltónico" se resolvió con una paleta segura más ícono y texto
    en cada estado, sin un modo aparte.
- **Lo que hubo que corregir y cómo se detectó**:
  - *Conflicto de versiones* (`react-dom` 19.3.1 contra `react` 19.3.0): lo
    detectó un `npm install` que falló. Se resolvió con `npx expo install
    react-dom`.
  - *PowerShell bloquea `npm.ps1`*: no se cambió la política de seguridad;
    se usa `npm.cmd`.
  - *Lint de React 19* ("no leer refs durante el render"): se rediseñó el
    contexto del usuario. Además, ahora cada pantalla recarga sola al cambiar
    de usuario.
  - *Tarjetas que se dibujaban sobre los filtros al deslizar* (Android): lo
    vio el usuario en el celular. Se resolvió con un contenedor que recorta la
    lista y 32 px de separación, que pidió el usuario.
  - *"Se actualiza solo" en el chat*: el usuario lo encontró raro (es un
    detalle técnico) y se sacó.
  - *Franja blanca sobre el teclado*: el desplazamiento era un número fijo
    (100). Ahora se mide en pantalla con `measureInWindow`.
  - *Error introducido por la propia corrección anterior*: la IA llamó a
    `measureInWindow` sobre el `ref` de `KeyboardAvoidingView`, que apunta a un
    componente de React y no a una vista nativa ("undefined is not a
    function"). Compilaba y pasaba el lint; lo encontró el usuario al abrir el
    chat. Se arregló midiendo una `View` común que lo envuelve.
- **Reflexión**: el código compiló y los tests pasaron casi siempre al primer
  intento, pero **5 de los 7 problemas solo aparecieron en el celular real o
  en la mirada del usuario**. Ningún test automático los habría detectado.
  Para la UI, la verificación humana en el dispositivo no se pudo reemplazar.
