# Quickstart: Modelo de dominio

**Requisitos**: Node.js 22.12+ o 24 (se desarrolló con 24.19) y npm.

## Correr los tests y el lint

```bash
cd backend
npm install
npm test          # corre todos los tests de dominio una vez
npm run test:watch  # los vuelve a correr al guardar
npm run lint
```

## Probar una regla a mano

Desde `backend/`, con Node:

```js
// probar.mjs
import { Usuario, Categoria, TipoEntrada, Evento, Compra } from './src/domain/index.js';

const ahora = new Date('2026-11-18T15:00:00-03:00');
const org = new Usuario({ id: 'u1', nombre: 'Ana', apellido: 'Paz' });
const comp = new Usuario({ id: 'u2', nombre: 'Leo', apellido: 'Sosa' });
const platea = new TipoEntrada({ id: 't1', nombre: 'Platea', descripcion: '', precio: 5000, cupo: 3 });
const evento = new Evento({
  id: 'e1', nombre: 'Recital', descripcion: 'En vivo',
  categoria: new Categoria({ id: 'c1', nombre: 'Recitales', descripcion: 'Música en vivo' }),
  fecha: new Date('2026-11-28T21:00:00-03:00'),
  tiposEntrada: [platea], multimedia: [], organizador: org,
});

const compra = Compra.crear({ id: 'k1', comprador: comp, evento, tipoEntrada: platea, cantidad: 2, ahora });
console.log(compra.estado, compra.total, platea.cupoDisponible()); // PENDIENTE 10000 1
compra.confirmar(org, ahora);
console.log(compra.estado, evento.diasRestantes(ahora));            // CONFIRMADA 10
compra.cancelar(comp, ahora);
console.log(compra.estado, platea.cupoDisponible());                // REEMBOLSADA 3
```

```bash
node probar.mjs
```

## Escenarios de la spec que sirven de verificación manual

1. **Cupo**: crear compras hasta agotar el cupo y ver que la siguiente lanza
   `ErrorConflicto`.
2. **Permisos**: que el comprador intente `confirmar` lanza `ErrorPermiso`.
3. **Fechas**: `marcarUtilizada` un día antes del evento lanza
   `ErrorConflicto`; el mismo día a las 00:01 en Buenos Aires funciona.
4. **Reseñas**: reseñar con la compra `CONFIRMADA` falla; después de
   `marcarUtilizada` funciona una sola vez.
