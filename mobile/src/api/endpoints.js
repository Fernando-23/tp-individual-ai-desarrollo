/**
 * Una función por endpoint de specs/002-api-backend/contracts/api.md.
 * Las pantallas usan estas funciones (vía useApi), nunca fetch directo.
 */
const enc = encodeURIComponent;

function query(parametros) {
  const partes = Object.entries(parametros)
    .filter(([, valor]) => valor !== undefined && valor !== null && valor !== '')
    .map(([clave, valor]) => `${enc(clave)}=${enc(valor)}`);
  return partes.length ? `?${partes.join('&')}` : '';
}

export function crearEndpoints(cliente) {
  return {
    usuarios: {
      listar: () => cliente.get('/usuarios'),
    },
    eventos: {
      categorias: () => cliente.get('/categorias'),
      buscar: ({ texto, categoria, orden } = {}) => cliente.get(`/eventos${query({ texto, categoria, orden })}`),
      obtener: (id) => cliente.get(`/eventos/${enc(id)}`),
      publicar: (datos) => cliente.post('/eventos', datos),
      ventas: (id) => cliente.get(`/eventos/${enc(id)}/ventas`),
      reseniar: (id, { puntuacion, detalle }) => cliente.post(`/eventos/${enc(id)}/resenias`, { puntuacion, detalle }),
      misEventos: () => cliente.get('/mis-eventos'),
    },
    compras: {
      comprar: ({ eventoId, tipoEntradaId, cantidad }) => cliente.post('/compras', { eventoId, tipoEntradaId, cantidad }),
      misCompras: () => cliente.get('/mis-compras'),
      obtener: (id) => cliente.get(`/compras/${enc(id)}`),
      /** accion: 'confirmar' | 'rechazar' | 'cancelar' | 'registrar-ingreso' */
      accion: (id, accion) => cliente.post(`/compras/${enc(id)}/${accion}`),
      mensajes: (id) => cliente.get(`/compras/${enc(id)}/mensajes`),
      enviarMensaje: (id, mensaje) => cliente.post(`/compras/${enc(id)}/mensajes`, { mensaje }),
    },
    favoritos: {
      listar: () => cliente.get('/mis-favoritos'),
      marcar: (eventoId) => cliente.put(`/mis-favoritos/${enc(eventoId)}`),
      desmarcar: (eventoId) => cliente.delete(`/mis-favoritos/${enc(eventoId)}`),
    },
  };
}
