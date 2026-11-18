import { Router } from 'express';
import * as presentar from '../http/presentadores.js';

/**
 * Rutas /api/mis-*: dependen del usuario actual (X-Usuario-Id), no de un id en
 * la URL, así nadie puede pedir los datos de otro (research D9).
 */
export function crearRutasMisRecursos({ servicios, usuario, vistas, reloj }) {
  const router = Router();
  // Solo sobre estos prefijos: aplicado a todo el router, cualquier ruta
  // inexistente respondería 401 en lugar de 404.
  router.use(['/mis-favoritos', '/mis-compras', '/mis-eventos'], usuario.requerirUsuario);

  // Mis compras (FR-016)
  router.get('/mis-compras', (req, res) => {
    const ahora = reloj();
    res.json(servicios.compras.misCompras(req.usuario).map((c) => presentar.compraResumen(c, ahora)));
  });

  // Favoritos (FR-024)
  router.get('/mis-favoritos', (req, res) => {
    res.json(servicios.favoritos.listar(req.usuario).map(vistas.eventoResumen));
  });
  router.put('/mis-favoritos/:eventoId', (req, res) => {
    servicios.favoritos.marcar(req.usuario, req.params.eventoId);
    res.status(204).end();
  });
  router.delete('/mis-favoritos/:eventoId', (req, res) => {
    servicios.favoritos.desmarcar(req.usuario, req.params.eventoId);
    res.status(204).end();
  });

  return router;
}
