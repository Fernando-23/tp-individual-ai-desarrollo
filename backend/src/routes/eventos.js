import { Router } from 'express';

/** Rutas de /api/eventos: catálogo y detalle (contracts/api.md). */
export function crearRutasEventos({ servicios, usuario, vistas }) {
  const router = Router();

  // Catálogo con filtros y órdenes (FR-007 a FR-013).
  router.get('/', (req, res) => {
    res.json(servicios.catalogo.buscar(req.query).map(vistas.eventoResumen));
  });

  // Detalle, también de eventos pasados (FR-014).
  router.get('/:id', usuario.usuarioOpcional, (req, res) => {
    const evento = servicios.catalogo.buscarEvento(req.params.id);
    res.json(vistas.eventoDetalle(evento, req.usuario));
  });

  return router;
}
