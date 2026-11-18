/**
 * Presentadores: dominio → JSON, con las formas de
 * specs/002-api-backend/contracts/api.md. Funciones puras, sin reglas de negocio.
 * Todas las fechas salen en ISO 8601 UTC (constitución, Principio VIII).
 */
import { EstadoCompra } from '../domain/estadoCompra.js';

const iso = (fecha) => fecha.toISOString();

export function usuario(u) {
  return { id: u.id, nombre: u.nombre, apellido: u.apellido };
}

export function categoria(c) {
  return { id: c.id, nombre: c.nombre, descripcion: c.descripcion };
}

/** `reputacion` = { puntaje: number | null, cantidadResenias: number } */
export function organizador(u, reputacion) {
  return { ...usuario(u), puntaje: reputacion.puntaje, cantidadResenias: reputacion.cantidadResenias };
}

/** Precio más bajo de los tipos de entrada: representa al evento (FR-012, FR-013). */
export function precioDesde(evento) {
  return Math.min(...evento.tiposEntrada.map((tipo) => tipo.precio));
}

export function eventoResumen(evento, { reputacion, ahora }) {
  return {
    id: evento.id,
    nombre: evento.nombre,
    categoria: { id: evento.categoria.id, nombre: evento.categoria.nombre },
    fecha: iso(evento.fecha),
    imagen: evento.multimedia[0] ?? null,
    organizador: organizador(evento.organizador, reputacion),
    precioDesde: precioDesde(evento),
    hayEntradas: evento.tiposEntrada.some((tipo) => tipo.cupoDisponible() > 0),
    yaSeRealizo: evento.yaSeRealizo(ahora),
  };
}

export function eventoDetalle(evento, { reputacion, resenias, esFavorito, ahora }) {
  return {
    ...eventoResumen(evento, { reputacion, ahora }),
    descripcion: evento.descripcion,
    multimedia: [...evento.multimedia],
    tiposEntrada: evento.tiposEntrada.map((tipo) => ({
      id: tipo.id,
      nombre: tipo.nombre,
      descripcion: tipo.descripcion,
      precio: tipo.precio,
      cupo: tipo.cupo,
      disponibles: tipo.cupoDisponible(),
    })),
    reseniasDelOrganizador: resenias.map(resenia),
    esFavorito,
  };
}

export function resenia(r) {
  return {
    id: r.id,
    evento: { id: r.evento.id, nombre: r.evento.nombre },
    comprador: usuario(r.comprador),
    puntuacion: r.puntuacion,
    detalle: r.detalle,
  };
}

export function compraResumen(compra, ahora) {
  return {
    id: compra.id,
    evento: { id: compra.evento.id, nombre: compra.evento.nombre, fecha: iso(compra.evento.fecha) },
    tipoEntrada: { id: compra.tipoEntrada.id, nombre: compra.tipoEntrada.nombre },
    cantidad: compra.cantidad,
    total: compra.total,
    estado: compra.estado,
    // Solo para compras confirmadas (caso de uso 1, FR-016).
    diasRestantes: compra.estado === EstadoCompra.CONFIRMADA ? compra.evento.diasRestantes(ahora) : null,
  };
}

export function compraDetalle(compra, ahora) {
  return {
    ...compraResumen(compra, ahora),
    comprador: usuario(compra.comprador),
    organizador: usuario(compra.evento.organizador),
    historial: compra.historial.map((cambio) => ({
      estado: cambio.estado,
      quien: usuario(cambio.quien),
      fechaHora: iso(cambio.fechaHora),
    })),
    mensajes: compra.mensajes.map(mensaje),
  };
}

export function mensaje(m) {
  return { usuario: usuario(m.usuario), mensaje: m.mensaje, enviado: iso(m.enviado) };
}

export function ventas(evento) {
  const compras = evento.compras();
  const cantidadPorEstado = Object.fromEntries(Object.values(EstadoCompra).map((estado) => [estado, 0]));
  compras.forEach((compra) => { cantidadPorEstado[compra.estado] += 1; });

  return {
    evento: { id: evento.id, nombre: evento.nombre, fecha: iso(evento.fecha) },
    tiposEntrada: evento.tiposEntrada.map((tipo) => {
      const disponibles = tipo.cupoDisponible();
      return { id: tipo.id, nombre: tipo.nombre, precio: tipo.precio, cupo: tipo.cupo, ocupadas: tipo.cupo - disponibles, disponibles };
    }),
    cantidadPorEstado,
    compras: compras.map((compra) => ({
      id: compra.id,
      comprador: usuario(compra.comprador),
      tipoEntrada: { id: compra.tipoEntrada.id, nombre: compra.tipoEntrada.nombre },
      cantidad: compra.cantidad,
      total: compra.total,
      estado: compra.estado,
      creada: iso(compra.historial[0].fechaHora),
    })),
  };
}
