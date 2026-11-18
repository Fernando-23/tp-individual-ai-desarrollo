import { Router } from 'express';
import * as presentar from '../http/presentadores.js';

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

  return router;
}
