import { crearCatalogoService } from './catalogoService.js';
import { crearComprasService } from './comprasService.js';
import { crearFavoritosService } from './favoritosService.js';
import { crearUsuariosService } from './usuariosService.js';

/**
 * Arma los servicios con sus dependencias. Los servicios orquestan
 * repositorios y dominio; las reglas de negocio quedan en domain/ (FR-026).
 */
export function crearServicios(dependencias) {
  const catalogo = crearCatalogoService(dependencias);
  return {
    usuarios: crearUsuariosService(dependencias),
    catalogo,
    favoritos: crearFavoritosService({ ...dependencias, catalogo }),
    compras: crearComprasService(dependencias),
  };
}
