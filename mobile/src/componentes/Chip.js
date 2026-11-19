import { Pressable, StyleSheet, Text } from 'react-native';
import { useTema } from '../hooks/useTema';
import { espacio, radio, TAMANO_TACTIL } from '../tema';

/** Opción seleccionable (categorías, orden, tipo de entrada). 48 de alto como mínimo. */
export function Chip({ texto, seleccionado, onPress, accessibilityLabel }) {
  const tema = useTema();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? texto}
      accessibilityState={{ selected: seleccionado }}
      style={[
        estilos.chip,
        seleccionado
          ? { backgroundColor: tema.primario, borderColor: tema.primario }
          : { backgroundColor: tema.superficie, borderColor: tema.borde },
      ]}
    >
      <Text style={[estilos.texto, { color: seleccionado ? tema.textoSobrePrimario : tema.texto }]}>{texto}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  chip: {
    minHeight: TAMANO_TACTIL,
    paddingHorizontal: espacio.l,
    borderRadius: radio.pildora,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  texto: { fontSize: 15, fontWeight: '700' },
});
