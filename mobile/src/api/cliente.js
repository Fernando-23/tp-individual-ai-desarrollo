/**
 * Único cliente HTTP de la app (constitución, Principio VI; research D4).
 * Toda llamada al servidor pasa por acá: URL base, usuario actual, timeout y
 * errores en español.
 */
export class ErrorApi extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.status = status; // 0 = sin conexión
    this.mensaje = mensaje;
  }
}

const SIN_CONEXION = 'No hay conexión con el servidor. Revisá que el backend esté encendido y que el celular esté en la misma red Wi-Fi.';
const SIN_RESPUESTA = 'El servidor no respondió a tiempo. Probá de nuevo.';
const INESPERADO = 'Ocurrió un error inesperado. Probá de nuevo.';

export function crearCliente({
  baseUrl,
  obtenerUsuarioId,
  alNoIdentificado = () => {},
  fetch: fetchImpl = globalThis.fetch,
  timeoutMs = 8000,
}) {
  async function pedir(method, ruta, cuerpo) {
    const headers = { Accept: 'application/json' };
    const usuarioId = obtenerUsuarioId();
    if (usuarioId) headers['X-Usuario-Id'] = usuarioId;
    if (cuerpo !== undefined) headers['Content-Type'] = 'application/json';

    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), timeoutMs);
    let respuesta;
    try {
      respuesta = await fetchImpl(`${baseUrl}${ruta}`, {
        method,
        headers,
        body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
        signal: controlador.signal,
      });
    } catch (error) {
      throw new ErrorApi(0, error?.name === 'AbortError' ? SIN_RESPUESTA : SIN_CONEXION);
    } finally {
      clearTimeout(temporizador);
    }

    if (respuesta.status === 204) return null;

    let datos = null;
    try {
      datos = await respuesta.json();
    } catch {
      datos = null;
    }

    if (!respuesta.ok) {
      if (respuesta.status === 401) alNoIdentificado();
      throw new ErrorApi(respuesta.status, datos?.error ?? INESPERADO);
    }
    return datos;
  }

  return {
    get: (ruta) => pedir('GET', ruta),
    post: (ruta, cuerpo = {}) => pedir('POST', ruta, cuerpo),
    put: (ruta) => pedir('PUT', ruta),
    delete: (ruta) => pedir('DELETE', ruta),
  };
}
