/**
 * Forma comparable de un texto para la búsqueda (FR-008): sin acentos,
 * en minúsculas y sin espacios de más. "  JÁZZ " → "jazz".
 */
export function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** ¿Alguno de los campos contiene el texto buscado? Un texto vacío coincide con todo. */
export function coincideTexto(textoBuscado, ...campos) {
  const buscado = normalizarTexto(textoBuscado ?? '');
  if (buscado === '') {
    return true;
  }
  return campos.some((campo) => normalizarTexto(campo).includes(buscado));
}
