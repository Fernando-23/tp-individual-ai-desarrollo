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

  // Publicar un evento: el usuario actual queda como organizador (FR-023).
  router.post('/', usuario.requerirUsuario, (req, res) => {
    const evento = servicios.eventos.publicar(req.body, req.usuario);
    res.status(201).json(vistas.eventoDetalle(evento, req.usuario));
  });

  // Reseñar un evento al que se asistió (FR-022).
  router.post('/:id/resenias', usuario.requerirUsuario, (req, res) => {
    const resenia = servicios.eventos.reseniar(req.params.id, req.body, req.usuario);
    res.status(201).json(presentar.resenia(resenia));
  });

  // Ventas del evento, solo para su organizador (FR-019).
  router.get('/:id/ventas', usuario.requerirUsuario, (req, res) => {
    res.json(presentar.ventas(servicios.eventos.ventas(req.params.id, req.usuario)));
  });

  return router;
}
