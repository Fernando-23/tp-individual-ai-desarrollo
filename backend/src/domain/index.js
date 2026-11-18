/**
 * API pública del dominio de AI Ticket It.
 * Contrato: specs/001-modelo-dominio/contracts/dominio.md
 * Lo que no se exporta acá es interno y puede cambiar.
 */

// Entidades
export { Usuario } from './usuario.js';
export { Categoria, normalizarNombre } from './categoria.js';
export { Evento } from './evento.js';
export { TipoEntrada } from './tipoEntrada.js';
export { Compra } from './compra.js';
export { Resenia } from './resenia.js';

// Valores
export { CambioEstadoCompra } from './cambioEstadoCompra.js';
export { Mensaje } from './mensaje.js';

// Estados y reglas
export { EstadoCompra, TRANSICIONES } from './estadoCompra.js';

// Funciones puras
export { puntajeOrganizador } from './reputacion.js';
export { diaCalendario, diasEntre } from './fechas.js';

// Errores
export { ErrorDeDominio, ErrorValidacion, ErrorPermiso, ErrorConflicto } from './errores.js';
