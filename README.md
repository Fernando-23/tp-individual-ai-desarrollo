# AI Ticket It — Entradas a un click

Plataforma de venta de entradas para eventos: los **organizadores** publican
eventos con distintos tipos de entrada y gestionan sus ventas, y los
**compradores** exploran, compran, chatean con el organizador y reseñan los
eventos a los que asistieron.

Es el **Trabajo Práctico Individual de Desarrollo con IA** de Desarrollo de
Software (UTN FRBA, 2C 2026). Se construyó usando IA como herramienta principal
de desarrollo, con Spec-Driven Development y revisión humana entre etapas
(ver [Cómo se construyó](#cómo-se-construyó)).

## Qué incluye

Los 12 casos de uso del enunciado, más la elección del usuario y los
favoritos:

| Comprador | Organizador |
|---|---|
| Buscar eventos por texto, explorarlos por categoría y ordenarlos por precio, fecha o puntaje del organizador | Publicar un evento con varios tipos de entrada, cada uno con su precio y cupo |
| Ver un evento con sus entradas disponibles y las reseñas del organizador | Ver las ventas de cada evento: estado de las compras y entradas disponibles por tipo |
| Comprar sin superar el cupo | Confirmar el pago de una compra pendiente o rechazarla |
| Seguir sus compras: estado y días que faltan | Registrar el ingreso el día del evento |
| Cancelar y obtener el reembolso | Responder mensajes en el chat de cada compra |
| Chatear con el organizador dentro de la compra | |
| Reseñar un evento después de asistir | |

Una compra pasa por los estados `PENDIENTE → CONFIRMADA → UTILIZADA`, o
termina `CANCELADA` o `REEMBOLSADA`. Las reglas exactas (quién puede hacer cada
cambio y cuándo) están en la
[spec del dominio](specs/001-modelo-dominio/spec.md) (FR-016b).

## Stack

| Parte | Tecnología |
|---|---|
| Backend | Node.js 24 + Express 5, JavaScript (ES Modules) |
| App mobile | React Native 0.88 + Expo SDK 58 (Expo Router), JavaScript |
| Persistencia | En memoria, con datos de demostración que se cargan al arrancar |
| Tests | Vitest + Supertest |

No usa servicios pagos ni requiere cuentas: la app corre en un celular con
**Expo Go**, contra el backend en la PC, por la red local.

## Estructura

```text
backend/            API REST
  src/domain/         reglas de negocio puras (clases del diagrama del enunciado)
  src/services/       casos de uso: buscan en los repositorios y delegan en el dominio
  src/repositories/   persistencia en memoria (Map)
  src/routes/ src/http/  Express: rutas, usuario actual, errores y presentadores
  src/seed/           datos de demostración
  tests/              tests de dominio y de API
mobile/             app React Native + Expo
  app/                pantallas (Expo Router: una por archivo)
  src/                cliente HTTP, contexto, hooks, componentes, lógica y tema
  tests/              tests de la lógica y del cliente HTTP
specs/              una carpeta por feature: spec, plan, tareas y trazabilidad
docs/bitacora-ia.md registro del uso de la IA (aciertos, errores y decisiones)
.specify/           constitución del proyecto y plantillas de Spec Kit
```

## Cómo correrlo

**Requisitos:**
- Node.js 22.12 o superior;
- un celular **Android** con **Expo Go** (Play Store);
- la PC y el celular en la **misma red Wi-Fi**.

> En Windows, si PowerShell bloquea los scripts ("la ejecución de scripts está
> deshabilitada"), usá `npm.cmd` y `npx.cmd` en lugar de `npm` y `npx`.

### 1. Backend

```bash
cd backend
npm install
npm start
```

Al arrancar, el backend imprime su URL en la red local, por ejemplo
`http://192.168.0.3:3000/api`. Si aparecen varias, usá la de la placa Wi-Fi
(se confirma con `ipconfig`).

### 2. App

```bash
cd mobile
npm install
cp .env.example .env
```

En `mobile/.env`, poné la URL del paso anterior:

```text
EXPO_PUBLIC_API_URL=http://192.168.0.3:3000/api
```

Después:

```bash
npx expo start -c
```

Escaneá el código QR con **Expo Go**. La app abre en la pantalla para elegir
usuario.

Si la app no conecta, abrí `http://<ip>:3000/api/salud` en el navegador del
celular. Si no responde, revisá el firewall de Windows (hay que permitir
Node.js en las redes privadas). Tenés más ayuda en el
[quickstart de la app](specs/003-app-mobile/quickstart.md).

## Datos de demostración

No hay login. Se elige con quién usar la app, y se puede cambiar desde arriba
a la derecha.

| Usuario | Rol en la demo |
|---|---|
| **Ana Paz** | Organiza *Noche de Jazz*, *Rock en el Parque*, *IA y Desarrollo de Software* y *Tango bajo las Estrellas* (ya realizado) |
| **Bruno Díaz** | Organiza *Hamlet*, *Clásico de Barrio*, *Impro Show* (ya realizado) y *Risas a Medianoche*, que **es hoy** |
| **Leo Sosa** | Comprador, con compras en todos los estados. Puede reseñar *Impro Show* |
| **Sofía Ruiz** | Compradora, con una compra pendiente para *Noche de Jazz* |

Las fechas se calculan a partir del momento en que arranca el backend, así que
la demo funciona cualquier día. Al reiniciar el backend, los datos vuelven al
estado inicial.

**Recorrido sugerido:**
1. Sofía compra 2 VIP de *Rock en el Parque*.
2. Ana confirma el pago.
3. Sofía ve la compra confirmada con los días que faltan y escribe en el chat.
4. Ana responde y el mensaje aparece solo.
5. Bruno registra el ingreso en *Risas a Medianoche*.
6. Leo reseña *Impro Show*.

## Tests y calidad

```bash
cd backend && npm test && npm run lint     # 282 tests (dominio + API)
cd mobile  && npm test && npm run lint     # 85 tests (lógica + cliente HTTP)
cd mobile  && npx expo export --platform android   # verifica que la app compila
```

**Accesibilidad:** la app apunta a WCAG **AAA**.
- **Contraste:** todo texto tiene un contraste de al menos 7:1, y un test lo
  verifica sobre cada par de colores de la paleta.
- **Controles:** todos miden al menos 48 × 48 y tienen etiquetas para lectores
  de pantalla.
- **Color:** los estados de compra se distinguen con color, ícono y texto,
  nunca solo con color.

## API

El contrato completo (rutas, formato de las respuestas y códigos de error)
está en [specs/002-api-backend/contracts/api.md](specs/002-api-backend/contracts/api.md).

- El usuario actual viaja en el header `X-Usuario-Id`.
- Los errores responden `{ "error": "<mensaje en español>" }` con código 400
  (dato inválido), 401 (usuario no identificado), 403 (sin permiso), 404 (no
  existe) o 409 (conflicto de estado o de cupo).

## Cómo se construyó

El proyecto siguió **Spec-Driven Development** con
[Spec Kit](https://github.com/github/spec-kit). Cada feature pasó por estas
etapas, con revisión humana entre una y otra:

```text
specify → clarify → plan → tasks → implement
```

| Feature | Qué entrega | Documentación |
|---|---|---|
| 001 | Modelo de dominio y reglas de negocio | [specs/001-modelo-dominio](specs/001-modelo-dominio/) |
| 002 | API REST, persistencia en memoria y datos de demostración | [specs/002-api-backend](specs/002-api-backend/) |
| 003 | App mobile | [specs/003-app-mobile](specs/003-app-mobile/) |

**Documentación clave:**
- [Constitución](.specify/memory/constitution.md): las reglas no negociables
  del proyecto (dominio, capas, tests primero, contrato de la API, fechas,
  simplicidad).
- `research.md` de cada feature: las decisiones técnicas, cada una con su
  alternativa descartada.
- `trazabilidad.md` de cada feature: qué test o pantalla cubre cada requisito
  y caso de uso.
- [Bitácora de IA](docs/bitacora-ia.md): qué resolvió bien la IA, qué hubo
  que corregir y por qué. Es la base de la reflexión final del trabajo.

**Aclaración del docente aplicada:** no hay pasarela de pago. El organizador
confirma manualmente las compras pendientes.
