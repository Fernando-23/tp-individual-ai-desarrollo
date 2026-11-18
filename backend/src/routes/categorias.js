import { Router } from 'express';
import * as presentar from '../http/presentadores.js';

/** GET /api/categorias (FR-006). */
export function crearRutasCategorias({ servicios }) {
  const router = Router();

  router.get('/', (req, res) => {
    res.json(servicios.catalogo.categorias().map(presentar.categoria));
  });

  return router;
}
