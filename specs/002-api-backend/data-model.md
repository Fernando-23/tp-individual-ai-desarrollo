# Data Model: Backend de AI Ticket It de punta a punta

**Feature**: `002-api-backend` · **Fecha**: 2026-11-18

Las entidades son las de la feature 001 (`specs/001-modelo-dominio/data-model.md`).
Este documento define:

- cómo se guardan en memoria;
- qué vistas se arman para la API;
- qué contienen los datos de demostración.

## Repositorios en memoria

`RepositorioEnMemoria` (`src/repositories/repositorioEnMemoria.js`) envuelve
un `Map<id, entidad>`:

| Método | Hace |
|---|---|
| `guardar(entidad)` | `map.set(entidad.id, entidad)` y devuelve la entidad |
| `buscarPorId(id)` | La entidad o `undefined` |
| `todos()` | Arreglo en orden de inserción |
| `filtrar(predicado)` | `todos().filter(predicado)` |

`crearRepositorios()` devuelve `{ usuarios, categorias, eventos, compras }`,
cuatro instancias nuevas. Las reseñas viven en `Evento` y los mensajes en
`Compra` (feature 001).

## Servicios

| Servicio | Responsabilidad | Usa |
|---|---|---|
| `usuariosService` | listar usuarios; resolver el usuario actual | `usuarios` |
| `catalogoService` | categorías; buscar, filtrar y ordenar eventos; detalle; puntaje del organizador | `categorias`, `eventos` |
| `eventosService` | publicar; mis eventos; ventas; reseñar | `eventos`, `categorias` |
| `comprasService` | comprar; mis compras; detalle; acciones de estado; mensajes | `eventos`, `compras` |
| `favoritosService` | listar, marcar y desmarcar | `eventos` |

Todos reciben `{ repositorios, reloj, generarId }`. Lanzan
`ErrorNoEncontrado` cuando no existe el recurso de la URL, y
`ErrorValidacion` cuando una referencia del body no existe.

**Puntaje del organizador**: `puntajeOrganizador(eventosDe(organizador))`,
donde `eventosDe` filtra `repositorios.eventos` por `organizador.id`.

## Regla de dominio agregada

`Compra.crear` rechaza con `ErrorConflicto` comprar para un evento que ya
empezó (`evento.yaSeRealizo(ahora)`). Faltaba en la feature 001 y se
descubrió al diseñar `POST /api/compras` (ver plan).

## Vistas (presentadores, `src/http/presentadores.js`)

Son funciones puras de dominio → JSON. Las formas exactas están en
`contracts/api.md`:

- `usuario(u)`, `categoria(c)`, `organizador(u, puntaje, cantidad)`;
- `eventoResumen(evento, { puntaje, ahora })`, que incluye `precioDesde`,
  `hayEntradas` e `imagen`;
- `eventoDetalle(evento, { puntaje, resenias, esFavorito, ahora })`;
- `resenia(r)`;
- `compraResumen(compra, ahora)`. `diasRestantes` solo se completa si la
  compra está `CONFIRMADA`;
- `compraDetalle(compra, ahora)`;
- `mensaje(m)`;
- `ventas(evento)`, donde `ocupadas = cupo − disponibles` y
  `cantidadPorEstado` cuenta las compras en cada uno de los 5 estados.

Todas las fechas salen con `toISOString()`.

## Datos de demostración (`src/seed/datosDemo.js`)

`cargarDatosDemo(repositorios, ahora)` usa ids fijos y horas relativas a
`ahora`. La notación `+10d` significa `ahora + 10 días`.

### Usuarios

| id | Nombre | Rol en la demo |
|---|---|---|
| `u-ana` | Ana Paz | Organizadora (Recitales, Festivales, Conferencias) |
| `u-bruno` | Bruno Díaz | Organizador (Teatro, Stand Up, Deportes) |
| `u-leo` | Leo Sosa | Comprador |
| `u-sofi` | Sofía Ruiz | Compradora |

### Categorías

`c-recitales` Recitales · `c-teatro` Teatro · `c-deportes` Deportes ·
`c-conferencias` Conferencias · `c-festivales` Festivales · `c-stand-up` Stand Up

### Eventos

| id | Nombre | Org. | Categoría | Fecha | Tipos (precio / cupo) |
|---|---|---|---|---|---|
| `e-jazz` | Noche de Jazz | Ana | Recitales | +10d | General 8000/150 · VIP 20000/20 |
| `e-hamlet` | Hamlet | Bruno | Teatro | +5d | Platea 12000/100 · Pullman 9000/80 |
| `e-rock` | Rock en el Parque | Ana | Festivales | +30d | Campo 15000/500 · VIP 35000/50 |
| `e-standup` | Risas a Medianoche | Bruno | Stand Up | **hoy** (+2h, ver research D11) | General 6000/120 |
| `e-charla` | IA y Desarrollo de Software | Ana | Conferencias | +15d | General 0/200 |
| `e-clasico` | Clásico de Barrio | Bruno | Deportes | +3d | Popular 5000/300 · Platea 10000/100 |
| `e-tango` | Tango bajo las Estrellas | Ana | Recitales | **−7d** | General 7000/100 |
| `e-impro` | Impro Show | Bruno | Teatro | **−14d** | General 5000/80 |

Cada evento tiene una descripción y una URL de imagen de ejemplo.

### Compras

| id | Comprador | Evento / tipo | Cant. | Estado final | Recorrido (hora) |
|---|---|---|---|---|---|
| `k-001` | Leo | Jazz / VIP | 2 | CONFIRMADA | creada −3d, confirmada −2d |
| `k-002` | Sofía | Jazz / General | 4 | PENDIENTE | creada −1d |
| `k-003` | Leo | Hamlet / Platea | 2 | PENDIENTE | creada −1d |
| `k-004` | Sofía | Hamlet / Pullman | 1 | CANCELADA | creada −4d, cancelada por ella −2d |
| `k-005` | Leo | Rock / Campo | 3 | REEMBOLSADA | creada −6d, confirmada −5d, cancelada −1d |
| `k-006` | Sofía | Stand up / General | 2 | CONFIRMADA | creada −2d, confirmada −1d (Bruno registra el ingreso en la demo) |
| `k-007` | Leo | Tango / General | 2 | UTILIZADA | creada −20d, confirmada −19d, ingreso fecha+30min |
| `k-008` | Sofía | Tango / General | 1 | UTILIZADA | ídem |
| `k-009` | Leo | Impro / General | 2 | UTILIZADA, **sin reseña** | creada −25d, confirmada −24d, ingreso fecha+30min |
| `k-010` | Sofía | Impro / General | 1 | UTILIZADA | ídem |
| `k-011` | Leo | Charla / General | 1 | CANCELADA (rechazada por Ana) | creada −3d, rechazada −2d |

### Reseñas

| Evento | Comprador | Puntaje | Detalle |
|---|---|---|---|
| Tango | Leo | 5 | "Una noche mágica, gran sonido." |
| Tango | Sofía | 4 | "Muy lindo, faltaban sillas." |
| Impro | Sofía | 3 | "Divertido pero corto." |

Puntajes resultantes: **Ana 4,5** (2 reseñas) y **Bruno 3** (1 reseña). Leo
puede reseñar Impro en la demo.

### Mensajes

- `k-001`: Leo (−2d): "¿A qué hora abren las puertas?". Ana (−2d + 1h): "A
  las 20:00. ¡Los esperamos!".
- `k-003`: Leo (−1d): "¿Puedo pagar por transferencia?".

### Favoritos

Leo tiene marcados Rock en el Parque y Hamlet.

### Cobertura de los casos de uso con el seed (SC-001)

| Caso de uso | Cómo se muestra con el seed |
|---|---|
| 1 | Leo ve `k-001` (CONFIRMADA, faltan 10 días) y las demás en otros estados |
| 2 | Ana abre las ventas de Jazz: 1 pendiente, 1 confirmada, disponibles por tipo |
| 3 | Buscar "jazz", o filtrar por Teatro |
| 4 | Cualquier usuario publica un evento |
| 5 y 6 | Chat de `k-001` (Leo y Ana) |
| 7 y 8 | Leo cancela `k-001` → REEMBOLSADA; Sofía no puede cancelar `k-008` (UTILIZADA) |
| 9 | Leo reseña Impro (`k-009`) |
| 10 | El detalle de Jazz muestra las reseñas de Tango (Ana) |
| 11 | Ordenar por precio (Charla $0 primero), fecha (Stand up hoy primero) o puntaje (los eventos de Ana primero) |
| 12 | Sofía compra Rock / VIP |
| Confirmar y rechazar | Ana confirma o rechaza `k-002`; Bruno registra el ingreso de `k-006` hoy |
