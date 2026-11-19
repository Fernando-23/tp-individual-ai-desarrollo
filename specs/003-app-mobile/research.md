# Research: App mobile de AI Ticket It

**Feature**: `003-app-mobile` · **Fecha**: 2026-11-19

Cada decisión incluye la alternativa descartada y el motivo, como pide la
constitución (Flujo de Trabajo con IA).

## D1. Expo SDK 58 + Expo Go en Android

- **Decision**: Expo SDK 58, la última estable (salió el 29/09/2026), que
  trae React Native 0.88 y React 19. La app se prueba en el celular Android
  del usuario con **Expo Go**, desde la Play Store. El proyecto se crea con
  `create-expo-app` y la plantilla `blank` (JavaScript). Las dependencias se
  agregan con `npx expo install`, que elige las versiones compatibles con el
  SDK.
- **Rationale**: la Expo Go de la Play Store solo soporta el SDK más
  reciente, así que usar el último garantiza que el QR abra la app.
  `expo install` evita versiones incompatibles.
- **Alternatives considered**:
  - SDK anteriores: Expo Go no los abriría.
  - React Native "pelado" (sin Expo): requiere Android Studio y compilar en
    cada cambio.
  - Plantilla `default`: viene en TypeScript, y la constitución fija
    JavaScript (Principio VII).
- **Verificación**: la primera tarea de implementación abre la app vacía en
  el celular. Si Expo Go reporta una incompatibilidad, se ajusta el SDK
  antes de seguir.

## D2. Navegación con Expo Router

- **Decision**: Expo Router, con navegación basada en archivos dentro de
  `mobile/app/`. Hay pestañas para lo principal (Explorar, Mis compras, Mis
  eventos, Favoritos) y un stack para los detalles (evento, compra, chat,
  ventas, publicar).
- **Rationale**: es la navegación recomendada por Expo y está construida
  sobre React Navigation. Cada pantalla es un archivo, así que el mapa de la
  app es la estructura de carpetas, fácil de mostrar en el video.
- **Alternatives considered**: React Navigation configurado a mano. Hace lo
  mismo con más código de configuración.

## D3. Estado: un contexto para el usuario y un hook por pantalla

- **Decision**:
  - `UsuarioContext` guarda el usuario actual elegido.
  - Cada pantalla carga sus datos con un hook propio,
    `useRecurso(cargar, deps)`, que devuelve `{ datos, cargando, error,
    recargar }` y vuelve a cargar cada vez que la pantalla gana el foco
    (`useFocusEffect`). Así, después de comprar o cancelar, las demás
    pantallas muestran datos frescos al volver (casos borde de la spec).
- **Rationale**: los datos viven en el servidor, así que la app no necesita
  una caché compleja. Con ~30 líneas se cubren los estados cargando, error
  y vacío que exige la constitución (Principio VI).
- **Alternatives considered**: Redux, Zustand o React Query. Son
  dependencias y conceptos de más para este volumen (Principio IX).

## D4. Un único cliente HTTP en `src/api/`

- **Decision**: `src/api/cliente.js` envuelve `fetch` y se encarga de:
  - tomar la URL base de `process.env.EXPO_PUBLIC_API_URL`;
  - agregar `X-Usuario-Id` del usuario actual;
  - aplicar un timeout de 8 s con `AbortController`;
  - convertir las respuestas de error en un `ErrorApi { status, mensaje }`,
    con el `error` en español del servidor, o "No hay conexión con el
    servidor" si no hay respuesta.

  Encima de él, `src/api/eventos.js`, `compras.js`, etc. exponen una
  función por endpoint de `specs/002-api-backend/contracts/api.md`.
- **Rationale**: lo exige el Principio VI ("toda llamada HTTP en `api/`").
  También centraliza el caso borde "el usuario dejó de existir": ante un
  401, se vuelve a la pantalla de elegir usuario.
- **Alternatives considered**: llamar a `fetch` desde cada pantalla (lo
  prohíbe la constitución) o usar axios (una dependencia más para lo que
  `fetch` ya hace).

## D5. La app no decide reglas: solo sugiere acciones

- **Decision**: `src/logica/acciones.js` exporta
  `accionesDisponibles(compra, usuarioId, ahora)`, una función pura que
  devuelve qué botones mostrar (cancelar, confirmar, rechazar, registrar
  ingreso, reseñar, chatear) según el rol y el estado (FR-013). El servidor
  sigue siendo quien decide: si rechaza, la app muestra su mensaje (FR-003).
- **Rationale**: muestra solo lo que tiene sentido, sin duplicar la
  autoridad de las reglas.
- **Alternatives considered**: que el servidor devuelva `acciones` en cada
  compra. Es más robusto, pero cambia el backend. Queda anotado como
  posible mejora en una feature del backend, como pidió el usuario
  ("algunas cosas del back surgirán más adelante").
- **Cómo saber si ya reseñó**: el detalle del evento trae
  `reseniasDelOrganizador`; la app busca una reseña con ese evento y ese
  comprador. No requiere cambios en el servidor.

## D6. Formatos con `Intl`, en funciones puras

- **Decision**: `src/logica/formato.js` tiene `formatearPrecio`
  (`"$ 20.000"`, `"Gratis"`), `formatearFecha` (`"sáb 28 nov, 21:00"`) y
  `textoDiasRestantes` (`"Faltan 10 días"`, `"Mañana"`, `"Es hoy"`). Usan
  `Intl.NumberFormat` e `Intl.DateTimeFormat` con `es-AR`, que el motor
  Hermes de React Native soporta en Android.
- **Rationale**: son funciones puras, testeables con Vitest (Principio I
  para mobile). `diasRestantes` ya viene calculado por el servidor en hora
  de Buenos Aires: la app solo lo convierte en texto, no lo calcula
  (Principio VIII).
- **Alternatives considered**: `date-fns` o `dayjs`. Son dependencias para
  algo que `Intl` resuelve.

## D7. Tests: Vitest para la lógica pura

- **Decision**: `mobile/tests/logica/*.test.js` prueba con Vitest:
  - `formato.js`;
  - `estados.js` (etiqueta y color de los 5 estados);
  - `acciones.js`;
  - `validarEvento.js` (validación del formulario de publicar);
  - `cliente.js`, con `fetch` simulado (headers, errores, timeout).

  No se testean componentes visuales: la constitución los declara
  opcionales.
- **Rationale**: es la misma herramienta que en el backend. Las funciones
  puras no necesitan React Native para testearse.
- **Alternatives considered**: `jest-expo` con Testing Library. Sirve para
  componentes, pero requiere más configuración y es más lento, para tests
  que la constitución no exige.

## D8. Chat: consulta periódica mientras está en pantalla

- **Decision**: la pantalla del chat pide los mensajes cada **4 segundos**
  solo mientras tiene el foco (`useFocusEffect` con `setInterval` y limpieza
  al salir). Al enviar, recarga en el acto.
- **Rationale**: cumple la decisión del usuario (Q1: A, FR-014) sin tocar el
  backend.
- **Alternatives considered**: WebSockets o Server-Sent Events. Son tiempo
  real "de verdad", pero requieren cambios en el servidor y otra tecnología
  que explicar (Principio IX).

## D9. Selector de fecha nativo para publicar

- **Decision**: `@react-native-community/datetimepicker`, que viene
  incluido en Expo Go, para elegir la fecha y la hora del evento.
- **Rationale**: evita fechas mal escritas y es el selector nativo de
  Android.
- **Alternatives considered**: campos de texto "AAAA-MM-DD HH:MM". Son
  propensos a errores y peores para mostrar en la demo.

## D10. Lint con la configuración oficial de Expo

- **Decision**: ESLint con `eslint-config-expo` (flat config), instalado con
  `npx expo lint`.
- **Rationale**: entiende JSX, los hooks de React y los imports de Expo sin
  configuración propia. Cumple el Principio VII ("lint sin errores").
- **Alternatives considered**: `@eslint/js` solo, como en el backend. No
  entiende JSX ni las reglas de hooks.

## D11. Identidad visual

- **Decision**: `src/tema.js` define la paleta:
  - **verde de la marca** (el del logo del enunciado), para acciones
    principales y acentos;
  - **texto** casi negro y **fondos** claros;
  - **un color por estado de compra**: PENDIENTE ámbar, CONFIRMADA verde,
    UTILIZADA azul, CANCELADA gris y REEMBOLSADA violeta.

  Cada estado se muestra siempre como una etiqueta con texto e ícono, nunca
  solo con color (FR-004).
- **Rationale**: tiene coherencia con el enunciado y es accesible.
- **Alternatives considered**: una librería de componentes de UI (React
  Native Paper, NativeBase). Agrega peso y un estilo genérico. Con unos
  pocos componentes propios alcanza.

## D11b. Accesibilidad AAA y tema intercambiable (pedido del usuario, 2026-11-19)

- **Decision**:
  - **Contraste verificado por test**: `src/logica/contraste.js` calcula el
    contraste según la fórmula de WCAG. Un test recorre todos los pares
    texto/fondo declarados en el tema y exige ≥ 7:1 (≥ 3:1 para íconos y
    bordes de controles).
  - **El verde de la marca** (claro) se usa como **fondo** con texto oscuro,
    nunca como color de texto sobre blanco. Los botones primarios usan un
    verde oscuro con texto blanco.
  - **Estados**: chip de fondo claro con texto oscuro, un **ícono distinto
    por estado** y tonos de una paleta segura para daltonismo (inspirada en
    Okabe–Ito: ámbar, verde azulado, azul, gris y violeta).
  - **Áreas táctiles**: `Boton` y los controles tocables tienen
    `minHeight: 48` y un `hitSlop` en los íconos.
  - **Lectores de pantalla**: `accessibilityRole`, `accessibilityLabel` y
    `accessibilityState` (`disabled` / `busy`) en los controles. Las
    etiquetas de estado se leen como "Estado: Confirmada".
  - **Tamaño de texto**: no se desactiva `allowFontScaling` y no hay alturas
    fijas en contenedores de texto.
  - **Tema**: los colores se leen con un hook `useTema()` que devuelve la
    paleta actual. Hoy hay solo `claro`, pero un modo oscuro se agrega
    definiendo `oscuro` y eligiendo con `useColorScheme()`. Queda como
    tarea opcional después del MVP.
- **Rationale**: lo pidió el usuario (UX + AAA), y la constitución ya exigía
  "color y texto" para los estados. Tener el contraste verificado por un test
  hace que el criterio sea medible (SC-006) y no una impresión.
- **Alternatives considered**:
  - Un modo daltónico aparte: si la paleta base ya distingue los estados
    con ícono y texto y usa tonos seguros, un segundo modo no aporta y suma
    trabajo.
  - Modo oscuro en el MVP: la entrega es el domingo, así que va después,
    solo si sobra tiempo.

## D12. Configuración de red

- **Decision**: `mobile/.env` con
  `EXPO_PUBLIC_API_URL=http://<ip-de-la-pc>:3000/api`. No se versiona, porque
  `.env*` ya está en el `.gitignore` de la raíz. En cambio, `mobile/.env.example`
  sí se versiona.
- **Rationale**: la IP cambia según la red. Así no se toca el código
  (FR-001).
- **Plan B**: si la red de la facultad o del hogar aísla los dispositivos,
  se puede usar `npx expo start --tunnel` para Metro. La API igual necesita
  ser accesible: en ese caso, se usa el hotspot del celular para la PC.
  Queda documentado en el quickstart.

## Requisitos del backend detectados

No hace falta ningún cambio para esta feature. Como mejoras posibles para una
feature futura del backend:
- `acciones` disponibles en cada compra (D5);
- `yaResenie` en el detalle del evento (D5).

## Sin NEEDS CLARIFICATION pendientes
