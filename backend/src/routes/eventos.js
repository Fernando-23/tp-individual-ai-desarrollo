import { Router } from 'express';
import * as presentar from '../http/presentadores.js';

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

  // Ventas del evento, solo para su organizador (FR-019).
  router.get('/:id/ventas', usuario.requerirUsuario, (req, res) => {
    res.json(presentar.ventas(servicios.eventos.ventas(req.params.id, req.usuario)));
  });

  return router;
}
