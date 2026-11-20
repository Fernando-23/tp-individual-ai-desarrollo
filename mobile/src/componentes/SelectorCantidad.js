import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTema } from '../hooks/useTema';
import { espacio, radio, TAMANO_TACTIL } from '../tema';

/**
 * Cantidad de entradas entre 1 y `maximo` (FR-011): no deja superar los
 * disponibles y lo explica. Botones de 48 × 48 con etiquetas accesibles.
 */
export function SelectorCantidad({ valor, maximo, onCambiar }) {
  const tema = useTema();

  const boton = (icono, etiqueta, nuevoValor, habilitado) => (
    <Pressable
      onPress={() => onCambiar(nuevoValor)}
      disabled={!habilitado}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityState={{ disabled: !habilitado }}
      style={[
        estilos.boton,
        { borderColor: habilitado ? tema.primario : tema.borde, opacity: habilitado ? 1 : 0.5, backgroundColor: tema.superficie },
      ]}
    >
      <Ionicons name={icono} size={24} color={habilitado ? tema.primario : tema.textoSecundario} />
    </Pressable>
  );

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.fila}>
        {boton('remove', 'Una entrada menos', valor - 1, valor > 1)}
        <Text
          style={[estilos.valor, { color: tema.texto }]}
          accessibilityLiveRegion="polite"
          accessibilityLabel={`${valor} ${valor === 1 ? 'entrada' : 'entradas'}`}
        >
          {valor}
        </Text>
        {boton('add', 'Una entrada más', valor + 1, valor < maximo)}
      </View>
      {valor >= maximo && (
        <Text style={[estilos.aviso, { color: tema.textoSecundario }]} accessibilityLiveRegion="polite">
          {maximo === 1 ? 'Queda 1 sola entrada' : `Quedan ${maximo} entradas: es el máximo`}
        </Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: espacio.xs },
  fila: { flexDirection: 'row', alignItems: 'center', gap: espacio.l },
  boton: {
    width: TAMANO_TACTIL,
    height: TAMANO_TACTIL,
    borderRadius: radio.m,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valor: { fontSize: 24, fontWeight: '800', minWidth: 36, textAlign: 'center' },
  aviso: { fontSize: 14, fontWeight: '600' },
});
