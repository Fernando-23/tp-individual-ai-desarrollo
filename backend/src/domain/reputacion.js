/**
 * Puntaje de un organizador: promedio de las puntuaciones de las reseñas de
 * todos sus eventos (FR-022). Devuelve null si no tiene reseñas: "sin puntaje"
 * no es lo mismo que 0.
 * Quien llama le pasa los eventos de ese organizador.
 */
export function puntajeOrganizador(eventos) {
  const puntuaciones = eventos.flatMap((evento) => evento.resenias.map((r) => r.puntuacion));
  if (puntuaciones.length === 0) {
    return null;
  }
  const suma = puntuaciones.reduce((total, p) => total + p, 0);
  return suma / puntuaciones.length;
}
