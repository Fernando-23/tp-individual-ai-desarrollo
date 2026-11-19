/**
 * Validación del formulario de publicar (FR-018): atrapa en la app lo evidente
 * antes de enviar. El servidor vuelve a validar todo.
 * Devuelve { valido, errores: { campo: mensaje }, datos } con `datos` listo
 * para POST /api/eventos.
 */
const ENTERO = /^\d+$/;
const normalizar = (texto) => texto.trim().toLowerCase().replace(/\s+/g, ' ');

export function validarEvento(formulario, ahora) {
  const errores = {};
  const nombre = (formulario.nombre ?? '').trim();
  const descripcion = (formulario.descripcion ?? '').trim();
  const imagen = (formulario.imagen ?? '').trim();

  if (!nombre) errores.nombre = 'Poné un nombre para el evento';
  if (!descripcion) errores.descripcion = 'Contá de qué se trata el evento';
  if (!formulario.categoriaId) errores.categoriaId = 'Elegí una categoría';
  if (!(formulario.fecha instanceof Date) || Number.isNaN(formulario.fecha.getTime())) {
    errores.fecha = 'Elegí la fecha y la hora';
  } else if (formulario.fecha.getTime() <= ahora.getTime()) {
    errores.fecha = 'La fecha tiene que ser futura';
  }
  if (imagen && !/^https?:\/\/\S+$/.test(imagen)) {
    errores.imagen = 'La imagen tiene que ser una dirección que empiece con http:// o https://';
  }

  const tipos = formulario.tiposEntrada ?? [];
  if (tipos.length === 0) errores.tiposEntrada = 'Agregá al menos un tipo de entrada';

  const vistos = new Set();
  const tiposEntrada = tipos.map((tipo, i) => {
    const nombreTipo = (tipo.nombre ?? '').trim();
    const precio = String(tipo.precio ?? '').trim();
    const cupo = String(tipo.cupo ?? '').trim();

    if (!nombreTipo) {
      errores[`tipos.${i}.nombre`] = 'Poné un nombre (por ejemplo, General)';
    } else if (vistos.has(normalizar(nombreTipo))) {
      errores[`tipos.${i}.nombre`] = 'Nombre repetido: cada tipo tiene que llamarse distinto';
    }
    vistos.add(normalizar(nombreTipo));

    if (!ENTERO.test(precio)) errores[`tipos.${i}.precio`] = 'Precio en pesos, sin puntos ni signos (0 si es gratis)';
    if (!ENTERO.test(cupo) || Number(cupo) < 1) errores[`tipos.${i}.cupo`] = 'Cupo: un número entero mayor a 0';

    return { nombre: nombreTipo, descripcion: (tipo.descripcion ?? '').trim(), precio: Number(precio), cupo: Number(cupo) };
  });

  const valido = Object.keys(errores).length === 0;
  return {
    valido,
    errores,
    datos: valido
      ? {
          nombre,
          descripcion,
          categoriaId: formulario.categoriaId,
          fecha: formulario.fecha.toISOString(),
          multimedia: imagen ? [imagen] : [],
          tiposEntrada,
        }
      : null,
  };
}
