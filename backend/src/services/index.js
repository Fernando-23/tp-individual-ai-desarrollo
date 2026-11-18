import { crearUsuariosService } from './usuariosService.js';

/**
 * Arma los servicios con sus dependencias. Los servicios orquestan
 * repositorios y dominio; las reglas de negocio quedan en domain/ (FR-026).
 */
export function crearServicios(dependencias) {
  return {
    usuarios: crearUsuariosService(dependencias),
  };
}
