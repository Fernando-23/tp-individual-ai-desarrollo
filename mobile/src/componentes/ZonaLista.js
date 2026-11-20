import { StyleSheet, View } from 'react-native';
import { useTema } from '../hooks/useTema';
import { espacio } from '../tema';

/**
 * Separa los controles fijos de arriba (filtros, botón Publicar) de una lista
 * que se desliza:
 * - recorta la lista en su borde (en Android las tarjetas se dibujaban por
 *   encima de los controles al deslizar);
 * - deja 32 px de separación: 16 bajo los controles + línea divisoria + 16 al
 *   comienzo de la lista (que pone la propia lista con su padding).
 */
export function EncabezadoFijo({ children }) {
  const tema = useTema();
  return (
    <View style={[estilos.encabezado, { backgroundColor: tema.fondo, borderBottomColor: tema.divisor }]}>{children}</View>
  );
}

export function ZonaLista({ children }) {
  return <View style={estilos.zona}>{children}</View>;
}

const estilos = StyleSheet.create({
  encabezado: {
    paddingTop: espacio.m,
    paddingBottom: espacio.l,
    gap: espacio.s,
    borderBottomWidth: 1,
    zIndex: 1,
  },
  zona: { flex: 1, overflow: 'hidden' },
});
