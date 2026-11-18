/**
 * Datos de demostración (constitución, Principio III; spec 002, FR-003 a FR-005).
 *
 * Todo se crea con operaciones del dominio (Compra.crear, confirmar,
 * marcarUtilizada, reseniar…), así que el seed respeta las mismas reglas que
 * la app: si se armara algo imposible, fallaría al arrancar.
 * Las fechas son relativas a `ahora`, para que la demo funcione cualquier día.
 * El contenido está documentado en specs/002-api-backend/data-model.md.
 */
import { Categoria } from '../domain/categoria.js';
import { Compra } from '../domain/compra.js';
import { Evento } from '../domain/evento.js';
import { diaCalendario } from '../domain/fechas.js';
import { TipoEntrada } from '../domain/tipoEntrada.js';
import { Usuario } from '../domain/usuario.js';

const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

export const IDS_DEMO = Object.freeze({
  usuarios: Object.freeze(['u-ana', 'u-bruno', 'u-leo', 'u-sofi']),
  organizadores: Object.freeze(['u-ana', 'u-bruno']),
  compradores: Object.freeze(['u-leo', 'u-sofi']),
});

/** Carga los datos de demostración en los repositorios y devuelve un resumen. */
export function cargarDatosDemo(repositorios, ahora) {
  const en = (ms) => new Date(ahora.getTime() + ms);
  const usuarios = crearUsuarios(repositorios);
  const categorias = crearCategorias(repositorios);
  const eventos = crearEventos(repositorios, { usuarios, categorias, en, ahora });
  crearCompras(repositorios, { usuarios, eventos, en });

  const { leo } = usuarios;
  leo.agregarFavorito(eventos.rock);
  leo.agregarFavorito(eventos.hamlet);

  return {
    usuarios: repositorios.usuarios.todos().length,
    eventos: repositorios.eventos.todos().length,
    compras: repositorios.compras.todos().length,
  };
}

function crearUsuarios(repos) {
  const crear = (id, nombre, apellido) => repos.usuarios.guardar(new Usuario({ id, nombre, apellido }));
  return {
    ana: crear('u-ana', 'Ana', 'Paz'),
    bruno: crear('u-bruno', 'Bruno', 'Díaz'),
    leo: crear('u-leo', 'Leo', 'Sosa'),
    sofi: crear('u-sofi', 'Sofía', 'Ruiz'),
  };
}

function crearCategorias(repos) {
  const crear = (id, nombre, descripcion) =>
    repos.categorias.guardar(new Categoria({ id, nombre, descripcion }));
  return {
    recitales: crear('c-recitales', 'Recitales', 'Música en vivo'),
    teatro: crear('c-teatro', 'Teatro', 'Obras en sala'),
    deportes: crear('c-deportes', 'Deportes', 'Partidos y competencias'),
    conferencias: crear('c-conferencias', 'Conferencias', 'Charlas y jornadas'),
    festivales: crear('c-festivales', 'Festivales', 'Varios artistas, una jornada'),
    standUp: crear('c-stand-up', 'Stand Up', 'Humor en vivo'),
  };
}

/**
 * Fecha del evento "de hoy": dentro de 2 horas, salvo que eso ya caiga en el
 * día siguiente de Buenos Aires; en ese caso, dentro de 1 minuto (research D11).
 */
function horaDeHoy(ahora) {
  const enDosHoras = new Date(ahora.getTime() + 2 * HORA);
  return diaCalendario(enDosHoras) === diaCalendario(ahora)
    ? enDosHoras
    : new Date(ahora.getTime() + MINUTO);
}

function crearEventos(repos, { usuarios, categorias, en, ahora }) {
  const crear = ({ id, nombre, descripcion, categoria, fecha, organizador, tipos }) =>
    repos.eventos.guardar(new Evento({
      id,
      nombre,
      descripcion,
      categoria,
      fecha,
      organizador,
      multimedia: [`https://picsum.photos/seed/${id}/800/450`],
      tiposEntrada: tipos.map(([sufijo, nombreTipo, precio, cupo, desc]) => new TipoEntrada({
        id: `t-${id.slice(2)}-${sufijo}`,
        nombre: nombreTipo,
        descripcion: desc,
        precio,
        cupo,
      })),
    }));

  const { ana, bruno } = usuarios;
  return {
    jazz: crear({
      id: 'e-jazz', nombre: 'Noche de Jazz', organizador: ana, categoria: categorias.recitales,
      descripcion: 'Un cuarteto de jazz con standards y composiciones propias, en un club íntimo.',
      fecha: en(10 * DIA),
      tipos: [['general', 'General', 8000, 150, 'Ubicación libre'], ['vip', 'VIP', 20000, 20, 'Mesa junto al escenario']],
    }),
    hamlet: crear({
      id: 'e-hamlet', nombre: 'Hamlet', organizador: bruno, categoria: categorias.teatro,
      descripcion: 'La tragedia de Shakespeare en una puesta contemporánea.',
      fecha: en(5 * DIA),
      tipos: [['platea', 'Platea', 12000, 100, 'Butacas en planta baja'], ['pullman', 'Pullman', 9000, 80, 'Primer piso']],
    }),
    rock: crear({
      id: 'e-rock', nombre: 'Rock en el Parque', organizador: ana, categoria: categorias.festivales,
      descripcion: 'Festival al aire libre con seis bandas de rock nacional.',
      fecha: en(30 * DIA),
      tipos: [['campo', 'Campo', 15000, 500, 'De pie'], ['vip', 'VIP', 35000, 50, 'Sector exclusivo con barra']],
    }),
    standup: crear({
      id: 'e-standup', nombre: 'Risas a Medianoche', organizador: bruno, categoria: categorias.standUp,
      descripcion: 'Tres comediantes, una noche: humor de observación y anécdotas.',
      fecha: horaDeHoy(ahora),
      tipos: [['general', 'General', 6000, 120, 'Ubicación libre']],
    }),
    charla: crear({
      id: 'e-charla', nombre: 'IA y Desarrollo de Software', organizador: ana, categoria: categorias.conferencias,
      descripcion: 'Charla abierta sobre cómo usar IA para desarrollar software con criterio.',
      fecha: en(15 * DIA),
      tipos: [['general', 'General', 0, 200, 'Entrada libre con inscripción']],
    }),
    clasico: crear({
      id: 'e-clasico', nombre: 'Clásico de Barrio', organizador: bruno, categoria: categorias.deportes,
      descripcion: 'El partido más esperado de la liga barrial.',
      fecha: en(3 * DIA),
      tipos: [['popular', 'Popular', 5000, 300, 'Tribuna popular'], ['platea', 'Platea', 10000, 100, 'Platea techada']],
    }),
    tango: crear({
      id: 'e-tango', nombre: 'Tango bajo las Estrellas', organizador: ana, categoria: categorias.recitales,
      descripcion: 'Orquesta típica y milonga al aire libre.',
      fecha: en(-7 * DIA),
      tipos: [['general', 'General', 7000, 100, 'Ubicación libre']],
    }),
    impro: crear({
      id: 'e-impro', nombre: 'Impro Show', organizador: bruno, categoria: categorias.teatro,
      descripcion: 'Teatro de improvisación con sugerencias del público.',
      fecha: en(-14 * DIA),
      tipos: [['general', 'General', 5000, 80, 'Ubicación libre']],
    }),
  };
}

function crearCompras(repos, { usuarios, eventos, en }) {
  const { ana, bruno, leo, sofi } = usuarios;
  const tipo = (evento, nombre) => evento.tiposEntrada.find((t) => t.nombre === nombre);
  const comprar = (id, comprador, evento, nombreTipo, cantidad, cuando) =>
    repos.compras.guardar(Compra.crear({
      id, comprador, evento, tipoEntrada: tipo(evento, nombreTipo), cantidad, ahora: cuando,
    }));
  const despuesDe = (evento, ms) => new Date(evento.fecha.getTime() + ms);

  // Eventos futuros
  const k001 = comprar('k-001', leo, eventos.jazz, 'VIP', 2, en(-3 * DIA));
  k001.confirmar(ana, en(-2 * DIA));
  k001.enviarMensaje(leo, '¿A qué hora abren las puertas?', en(-2 * DIA));
  k001.enviarMensaje(ana, 'A las 20:00. ¡Los esperamos!', en(-2 * DIA + HORA));

  comprar('k-002', sofi, eventos.jazz, 'General', 4, en(-1 * DIA));

  const k003 = comprar('k-003', leo, eventos.hamlet, 'Platea', 2, en(-1 * DIA));
  k003.enviarMensaje(leo, '¿Puedo pagar por transferencia?', en(-1 * DIA));

  const k004 = comprar('k-004', sofi, eventos.hamlet, 'Pullman', 1, en(-4 * DIA));
  k004.cancelar(sofi, en(-2 * DIA));

  const k005 = comprar('k-005', leo, eventos.rock, 'Campo', 3, en(-6 * DIA));
  k005.confirmar(ana, en(-5 * DIA));
  k005.cancelar(leo, en(-1 * DIA));

  const k006 = comprar('k-006', sofi, eventos.standup, 'General', 2, en(-2 * DIA));
  k006.confirmar(bruno, en(-1 * DIA));

  // Eventos pasados: compras usadas el día del evento
  const k007 = comprar('k-007', leo, eventos.tango, 'General', 2, en(-20 * DIA));
  const k008 = comprar('k-008', sofi, eventos.tango, 'General', 1, en(-20 * DIA));
  for (const compra of [k007, k008]) {
    compra.confirmar(ana, en(-19 * DIA));
    compra.marcarUtilizada(ana, despuesDe(eventos.tango, 30 * MINUTO));
  }

  const k009 = comprar('k-009', leo, eventos.impro, 'General', 2, en(-25 * DIA));
  const k010 = comprar('k-010', sofi, eventos.impro, 'General', 1, en(-25 * DIA));
  for (const compra of [k009, k010]) {
    compra.confirmar(bruno, en(-24 * DIA));
    compra.marcarUtilizada(bruno, despuesDe(eventos.impro, 30 * MINUTO));
  }

  const k011 = comprar('k-011', leo, eventos.charla, 'General', 1, en(-3 * DIA));
  k011.rechazar(ana, en(-2 * DIA));

  // Reseñas: Ana queda con 4,5 y Bruno con 3. Leo todavía puede reseñar Impro (k-009).
  eventos.tango.reseniar({ id: 'r-1', comprador: leo, puntuacion: 5, detalle: 'Una noche mágica, gran sonido.' });
  eventos.tango.reseniar({ id: 'r-2', comprador: sofi, puntuacion: 4, detalle: 'Muy lindo, faltaban sillas.' });
  eventos.impro.reseniar({ id: 'r-3', comprador: sofi, puntuacion: 3, detalle: 'Divertido pero corto.' });
}
