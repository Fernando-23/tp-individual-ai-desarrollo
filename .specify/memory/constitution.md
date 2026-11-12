<!--
SYNC IMPACT REPORT
==================
Version change: (template) → 1.0.0 (ratificación inicial; antes del primer commit: VII ajustado a
  JavaScript, y confirmación manual de compras por el organizador según aclaración docente del 2026-10-22)
Producto: AI Ticket It — plataforma de venta de entradas para eventos
Stack: Node + Express (backend) · React Native con Expo (mobile) · persistencia en memoria
Principios definidos: I a IX (nuevos)
Secciones agregadas: Dominio del Sistema, Restricciones Técnicas, Flujo de Trabajo con IA
Secciones eliminadas: ninguna
Templates:
  ✅ .specify/templates/plan-template.md — Constitution Check con los 9 principios
  ✅ .specify/templates/tasks-template.md — tests obligatorios para dominio y API (Principio I)
  ✅ .specify/templates/spec-template.md — sin cambios requeridos (ya exige historias testeables)
  ⚠  .specify/templates/commands/*.md — no existen en este repo; nada que revisar
  ⚠  README.md / CLAUDE.md — todavía no existen; crearlos cuando se defina la estructura
TODOs diferidos: ninguno
-->

# AI Ticket It — Constitution

## Dominio del Sistema

### Objetivo

AI Ticket It conecta a **organizadores** que publican eventos (recitales, teatro,
festivales, conferencias, deportes) con **compradores** que quieren descubrir
eventos y comprar entradas desde el celular. Cada compra se sigue hasta el día
del evento, tiene un chat entre comprador y organizador, y al terminar el evento
el asistente puede reseñarlo para construir la reputación del organizador.

Es el Trabajo Práctico Individual de Desarrollo con IA (DDS, UTN FRBA, 2C 2026).
El producto se construye usando IA como herramienta principal de desarrollo.

### Roles de Usuario

Ambos roles son el mismo `Usuario`: una persona puede organizar eventos y
comprar entradas de otros. El rol depende de la relación con el evento o la
compra, no de un atributo fijo.

**Comprador**

- Busca eventos por texto, los explora por categoría y los ordena por precio,
  fecha o puntaje del organizador.
- Guarda eventos favoritos.
- Compra un tipo de entrada en una cantidad que no supere el cupo disponible.
- Ve sus compras con su estado y, si están confirmadas, los días que faltan
  para el evento.
- Chatea con el organizador dentro de cada compra.
- Cancela una compra para obtener el reembolso, cuando las reglas lo permiten.
- Reseña el evento (puntaje y comentario) cuando su entrada fue utilizada.

**Organizador**

- Crea eventos con descripción, categoría, fecha, multimedia y uno o más tipos
  de entrada, cada uno con precio y cupo.
- Ve las compras de cada evento con su estado y las entradas que quedan
  disponibles por tipo.
- Confirma manualmente, una por una, las compras pendientes de pago de sus
  eventos.
- Responde los mensajes de cada compra.

### Entidades del Dominio

El diagrama del enunciado es la base del modelo. Se puede extender (por
ejemplo, con identificadores o un lugar del evento), pero toda desviación
DEBE quedar justificada en el `plan.md` de la feature que la introduce.

- **Usuario**: nombre, apellido, eventos favoritos.
- **Categoria**: nombre, descripción. Es un catálogo precargado.
- **Evento**: nombre, descripción, categoría, fecha y hora, tipos de entrada,
  multimedia (URLs), organizador. Expone `tuPrecioEstaEntre(min, max)`.
- **TipoEntrada**: nombre (General, Platea, VIP…), descripción, precio, cupo.
  Expone `hayCupoPara(cantidad)`.
- **Compra**: comprador, evento, tipo de entrada, cantidad, total, estado,
  mensajes. Expone `actualizarEstado(estado)`.
- **EstadoCompra**: `PENDIENTE` · `CONFIRMADA` · `UTILIZADA` · `CANCELADA` ·
  `REEMBOLSADA`.
- **CambioEstadoCompra**: compra, estado nuevo, quién lo hizo, fecha y hora.
- **Mensaje**: usuario, texto, fecha de envío.
- **Resenia**: comprador, evento, detalle, puntuación.

### Restricciones de Dominio

- Una compra NO PUEDE superar el cupo disponible del tipo de entrada. El cupo
  disponible es el cupo total menos las entradas de las compras `PENDIENTE`,
  `CONFIRMADA` o `UTILIZADA`. Las compras canceladas o reembolsadas liberan
  su cupo.
- El total de una compra DEBE calcularse en el servidor
  (`precio × cantidad`); nunca se acepta desde el cliente.
- Un comprador NO PUEDE cancelar una compra `UTILIZADA` ni una compra cuyo
  evento ya se realizó.
- Solo se puede reseñar un evento si el comprador tiene una compra
  `UTILIZADA` de ese evento. Hay a lo sumo una reseña por comprador y evento.
- El puntaje de un organizador es el promedio de las reseñas de todos sus
  eventos.
- Todo cambio de estado de una compra DEBE registrar un `CambioEstadoCompra`
  (quién y cuándo). Las transiciones válidas se definen en una única función
  de dominio. No se cambia el estado asignando el campo directamente.
- Toda compra nace `PENDIENTE`. Solo el organizador del evento puede pasarla
  a `CONFIRMADA`, de a una compra por vez. No hay confirmación automática ni
  pasarela de pago (aclaración del docente, 2026-10-22).
- En el chat de una compra solo pueden escribir su comprador y el organizador
  del evento. Pueden hacerlo en cualquier estado de la compra.
- Un evento DEBE tener al menos un tipo de entrada, con precio ≥ 0 y cupo > 0.

## Core Principles

### I. Test-First en Dominio y API (NON-NEGOTIABLE)

Las reglas de negocio y los endpoints DEBEN desarrollarse con TDD: test
primero, verlo fallar (rojo), implementar (verde) y refactorizar.

- Cada restricción de dominio de esta constitución DEBE tener al menos un test
  que la ejercite.
- Los tests de API DEBEN levantar la app de Express con un repositorio en
  memoria nuevo para cada test (sin estado compartido entre tests).
- En mobile, la lógica no visual (formateo, cálculo de días restantes,
  validaciones de formulario) DEBE estar en funciones puras testeadas. Los
  tests de componentes son opcionales.

**Rationale**: el código lo genera una IA. Los tests son la forma objetiva de
verificar que hace lo que la spec pide y no lo que el modelo supuso.

### II. Arquitectura en Capas en el Backend

El backend DEBE respetar estas capas, con dependencias siempre hacia abajo:

```
routes/        ← HTTP: valida la entrada, llama al servicio, arma la respuesta
services/      ← casos de uso: orquesta repositorios y dominio
repositories/  ← acceso a datos (en memoria), detrás de una interfaz
domain/        ← entidades y reglas puras: sin Express, sin IO
```

- `domain/` NO DEBE importar Express ni repositorios.
- Las rutas NO DEBEN acceder a los repositorios directamente.
- Las reglas de negocio (cupo, cancelación, transiciones, reseñas) viven en
  `domain/` como métodos de las entidades o funciones puras, no en las rutas.

**Rationale**: la lógica se testea sin levantar un servidor, y la persistencia
en memoria se puede reemplazar por una base real sin tocar el dominio.

### III. Persistencia en Memoria con Seed Reproducible

- Los datos viven en memoria del proceso del backend y se pierden al
  reiniciarlo. Es un requisito del enunciado, no una deuda técnica.
- Al iniciar, el backend DEBE cargar un **seed** determinístico con usuarios,
  categorías, eventos futuros y pasados, y compras en todos los estados. Así
  cada flujo, incluidas las reseñas y la cancelación, se puede demostrar
  apenas arranca la app.
- Las fechas del seed DEBEN calcularse relativas al momento de arranque
  (por ejemplo, "dentro de 10 días"), para que el seed no envejezca.

**Rationale**: la entrega es un video demo. El seed hace que la demo sea
repetible, sin preparar datos a mano antes de grabar.

### IV. Contrato de API

- Toda la API vive bajo `/api`, habla JSON y usa recursos en **plural y
  kebab-case** (`/api/eventos`, `/api/compras/:id/mensajes`).
- Errores: cuerpo `{ "error": "<mensaje en español>" }` con `400` validación,
  `403` sin permiso sobre el recurso, `404` inexistente y `409` conflicto de
  estado o de cupo.
- Toda entrada DEBE validarse en el servidor, aunque el cliente ya la haya
  validado.
- Búsqueda, filtros y ordenamiento de eventos se resuelven en el servidor con
  query params.
- El formato de cada request y response DEBE documentarse en el contrato de
  la feature (`specs/<feature>/contracts/`), que es la referencia común de
  backend y mobile.

**Rationale**: un contrato predecible reduce los errores de integración entre
dos apps que la IA genera por separado.

### V. Identidad Simple, sin Autenticación Real

- No hay registro, login ni contraseñas. El usuario actual se elige en la app
  entre los usuarios del seed y viaja en cada request en el header
  `X-Usuario-Id`.
- Aun así, el servidor DEBE verificar la autorización: solo el organizador ve
  las compras de su evento, y solo las partes de una compra leen o escriben su
  chat.
- No se integra ninguna pasarela de pago (Mercado Pago u otra). El pago se
  da por hecho cuando el organizador confirma la compra pendiente, y el
  reembolso es solo un cambio de estado.

**Rationale**: la autenticación y los pagos no son parte de los casos de uso
pedidos, y el docente confirmó que no hace falta una pasarela. Así el foco
queda en el dominio, y se puede cambiar de usuario durante la demo para
mostrar las dos vistas.

### VI. Mobile Primero con React Native (Expo)

- El frontend DEBE ser React Native con **Expo** y ejecutarse en un
  dispositivo móvil (Expo Go en el celular o un emulador).
- La URL del backend DEBE configurarse por variable de entorno
  (`EXPO_PUBLIC_API_URL`), porque desde el celular `localhost` no apunta a la
  PC.
- Toda llamada HTTP DEBE vivir en un módulo `api/`. Las pantallas no hacen
  `fetch` directo.
- Cada pantalla con datos remotos DEBE manejar los estados **cargando**,
  **error** y **vacío**, además del éxito.
- Los estados de compra DEBEN distinguirse con claridad (color y texto, no
  solo color).

**Rationale**: los requisitos técnicos piden una app mobile local. Expo es la
forma gratuita y más directa de correrla en un celular real.

### VII. JavaScript y Calidad de Código

- Backend y mobile se escriben en **JavaScript**. No se usa TypeScript: el
  enunciado no lo pide y se prioriza no sumar herramientas.
- Lint DEBE pasar sin errores antes de dar una tarea por terminada.
- Prohibido usar `eslint-disable` sin un comentario que lo justifique.
- Los nombres del dominio se escriben en español, como en el enunciado
  (`Compra`, `TipoEntrada`, `hayCupoPara`).

**Rationale**: sin tipado estático, los tests (Principio I) y la validación
en el servidor (Principio IV) son los que atrapan campos inventados o
contratos desalineados entre las dos apps.

### VIII. Fechas y Zona Horaria

- Las fechas viajan en la API como ISO 8601 en UTC.
- Los cálculos que dependen del día calendario ("días que faltan", "el evento
  ya se realizó") DEBEN hacerse en la zona `America/Argentina/Buenos_Aires`.
  Esa lógica DEBE estar en funciones puras testeadas.

**Rationale**: los errores de "un día de diferencia" son silenciosos y
aparecen justo en dos casos de uso: los días restantes y el bloqueo de la
cancelación.

### IX. Simplicidad y Herramientas Gratuitas

- Solo se usan herramientas, librerías y servicios gratuitos, sin
  suscripciones (requisito del enunciado).
- Toda dependencia nueva DEBE justificarse en el plan. Se prefiere la
  biblioteca estándar y lo que ya trae Expo.
- No se construye nada que ningún caso de uso pida (YAGNI).

**Rationale**: menos piezas significa menos código generado que revisar y que
explicar en el video.

## Restricciones Técnicas

| Aspecto | Decisión |
|---|---|
| Backend | Node.js + Express, JavaScript |
| Frontend | React Native con Expo, JavaScript |
| Persistencia | En memoria, con seed al arrancar |
| Tests | Vitest + Supertest en el backend; tests de lógica pura en mobile |
| Ejecución | Local: backend en la PC, app en el celular por la red local |
| Costo | Cero: solo herramientas y planes gratuitos |

## Flujo de Trabajo con IA

- Toda feature sigue Spec-Driven Development con Spec Kit:
  `specify → clarify → plan → tasks → implement`, con **revisión humana**
  entre cada etapa. La spec describe el negocio y el plan, la tecnología.
- Cada `plan.md` DEBE registrar las decisiones relevantes con su alternativa
  descartada y el motivo. Son el insumo para explicar el flujo en el video.
- Se DEBE mantener una bitácora en `docs/bitacora-ia.md` con lo que la IA
  resolvió bien, lo que hubo que corregir y por qué, y las dificultades
  encontradas. Es la base de la conclusión final de la entrega.
- El código generado no se acepta sin entenderlo: antes de cerrar una feature,
  su flujo debe poder explicarse de punta a punta (backend, mobile y UI).

## Governance

Esta constitución prevalece sobre cualquier otra convención del repositorio.
Para modificarla hay que:

1. Actualizar la versión con versionado semántico: MAJOR si se quita o
   redefine un principio, MINOR si se agrega uno o se amplía su alcance,
   PATCH si son aclaraciones.
2. Actualizar el Sync Impact Report y los templates afectados en
   `.specify/templates/`.
3. Registrar el motivo del cambio en la bitácora de IA.

Cada `plan.md` DEBE pasar el Constitution Check antes de la fase de
investigación y de nuevo después del diseño. Toda violación se justifica en la
tabla de Complexity Tracking del plan.

**Version**: 1.0.0 | **Ratified**: 2026-11-11 | **Last Amended**: 2026-11-11
