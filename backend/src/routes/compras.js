import { Router } from 'express';
import * as presentar from '../http/presentadores.js';
import { ACCIONES } from '../services/comprasService.js';

/** Rutas de /api/compras (contracts/api.md). Todas exigen usuario actual. */
export function crearRutasCompras({ servicios, usuario, reloj }) {
  const router = Router();
  router.use(usuario.requerirUsuario);

  const detalle = (compra) => presentar.compraDetalle(compra, reloj());

  // Comprar (FR-015)
  router.post('/', (req, res) => {
    const compra = servicios.compras.comprar(req.body, req.usuario);
    res.status(201).json(detalle(compra));
  });

  // Detalle con historial y chat (FR-017)
  router.get('/:id', (req, res) => {
    res.json(detalle(servicios.compras.detalle(req.params.id, req.usuario)));
  });

  // Cambios de estado con verbo de negocio (FR-018, FR-020; research D8)
  router.post('/:id/:accion', (req, res, next) => {
    if (!Object.hasOwn(ACCIONES, req.params.accion)) {
      return next(); // acción desconocida → 404 de ruta
    }
    const compra = servicios.compras.cambiarEstado(req.params.id, req.params.accion, req.usuario);
    res.json(detalle(compra));
  });

  return router;
}
