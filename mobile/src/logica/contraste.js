/**
 * Contraste entre dos colores según WCAG 2.x (de 1 a 21).
 * AAA exige 7:1 para texto normal; los íconos y bordes de controles, 3:1.
 */
function canal(valor8bits) {
  const c = valor8bits / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminancia(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

export function contraste(colorA, colorB) {
  const [claro, oscuro] = [luminancia(colorA), luminancia(colorB)].sort((a, b) => b - a);
  return (claro + 0.05) / (oscuro + 0.05);
}
