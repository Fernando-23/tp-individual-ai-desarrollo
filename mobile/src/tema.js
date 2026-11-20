/**
 * Tema visual (research D11 y D11b). Datos puros: sin React Native, para que
 * los tests puedan verificar el contraste de cada par (SC-006).
 * Para agregar un modo oscuro (T044): definir `oscuro` con las mismas claves,
 * sumar sus pares a PARES_DE_CONTRASTE y elegirlo en hooks/useTema.js.
 */

export const claro = Object.freeze({
  // Marca: el verde del logo del enunciado. Se usa como FONDO con texto oscuro,
  // nunca como color de texto sobre blanco (no llega al contraste).
  marca: '#6CD443',
  textoSobreMarca: '#0B1F05',

  fondo: '#F7F8F6',
  superficie: '#FFFFFF',
  texto: '#111111',
  textoSecundario: '#3D3D3D',
  borde: '#767676', // bordes de controles: ≥ 3:1 sobre superficie
  divisor: '#E2E4E0', // decorativo, no transmite información

  primario: '#14532D', // botones principales (verde oscuro)
  textoSobrePrimario: '#FFFFFF',
  peligro: '#8B1A1A',
  textoSobrePeligro: '#FFFFFF',
  error: '#8B1A1A',
  foco: '#1D4ED8',
  estrella: '#7A4F00', // ámbar oscuro: ícono de puntaje

  // Chat
  burbujaPropia: '#DDF5E8',
  textoBurbujaPropia: '#0B3D22',
  burbujaAjena: '#ECEEEA',
  textoBurbujaAjena: '#111111',
});

/**
 * Estados de compra: fondo claro + texto oscuro + ícono distinto por estado.
 * Tonos de una paleta apta para daltonismo (ámbar, verde azulado, azul, gris, violeta).
 */
export const coloresEstado = Object.freeze({
  PENDIENTE: { fondo: '#FFF1CC', texto: '#5C3D00' },
  CONFIRMADA: { fondo: '#D8F3E6', texto: '#0A4A2C' },
  UTILIZADA: { fondo: '#DCEAFF', texto: '#0A3570' },
  CANCELADA: { fondo: '#E9E9E9', texto: '#2B2B2B' },
  REEMBOLSADA: { fondo: '#F1E3FB', texto: '#4A1670' },
  DESCONOCIDO: { fondo: '#E9E9E9', texto: '#2B2B2B' },
});

export const espacio = Object.freeze({ xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 });
export const radio = Object.freeze({ s: 8, m: 12, l: 20, pildora: 999 });

/** Mínimo táctil (FR-019): 48 × 48. */
export const TAMANO_TACTIL = 48;

export const tipografia = Object.freeze({
  titulo: { fontSize: 26, fontWeight: '800' },
  subtitulo: { fontSize: 19, fontWeight: '700' },
  cuerpo: { fontSize: 16, fontWeight: '400' },
  cuerpoFuerte: { fontSize: 16, fontWeight: '700' },
  chico: { fontSize: 14, fontWeight: '500' },
});

/** Pares que el test de contraste recorre (SC-006). tipo: 'texto' (≥ 7) o 'control' (≥ 3). */
const texto = (nombre, frente, fondo) => ({ nombre, frente, fondo, minimo: 7, tipo: 'texto' });
const control = (nombre, frente, fondo) => ({ nombre, frente, fondo, minimo: 3, tipo: 'control' });

export const PARES_DE_CONTRASTE = Object.freeze([
  texto('texto / fondo', claro.texto, claro.fondo),
  texto('texto / superficie', claro.texto, claro.superficie),
  texto('textoSecundario / fondo', claro.textoSecundario, claro.fondo),
  texto('textoSecundario / superficie', claro.textoSecundario, claro.superficie),
  texto('textoSobreMarca / marca', claro.textoSobreMarca, claro.marca),
  texto('textoSobrePrimario / primario', claro.textoSobrePrimario, claro.primario),
  texto('textoSobrePeligro / peligro', claro.textoSobrePeligro, claro.peligro),
  texto('error / superficie', claro.error, claro.superficie),
  texto('error / fondo', claro.error, claro.fondo),
  texto('primario como texto / superficie', claro.primario, claro.superficie),
  texto('textoBurbujaPropia / burbujaPropia', claro.textoBurbujaPropia, claro.burbujaPropia),
  texto('textoBurbujaAjena / burbujaAjena', claro.textoBurbujaAjena, claro.burbujaAjena),
  ...Object.entries(coloresEstado).map(([estado, c]) => texto(`estado ${estado}`, c.texto, c.fondo)),
  control('borde / superficie', claro.borde, claro.superficie),
  control('borde / fondo', claro.borde, claro.fondo),
  control('primario / fondo (botón)', claro.primario, claro.fondo),
  control('foco / superficie', claro.foco, claro.superficie),
  control('estrella / superficie', claro.estrella, claro.superficie),
  control('estrella / fondo', claro.estrella, claro.fondo),
]);
