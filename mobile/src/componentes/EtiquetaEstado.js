import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { infoEstado } from '../logica/estados';
import { espacio, radio } from '../tema';

/**
 * Estado de una compra con color, ícono y texto (FR-004): se distingue sin
 * depender del color. Un lector de pantalla lee "Estado: Confirmada".
 */
export function EtiquetaEstado({ estado, grande = false }) {
  const info = infoEstado(estado);
  return (
    <View
      accessible
      accessibilityLabel={`Estado: ${info.etiqueta}`}
      style={[estilos.chip, grande && estilos.grande, { backgroundColor: info.fondo, borderColor: info.texto }]}
    >
      <Ionicons name={info.icono} size={grande ? 20 : 16} color={info.texto} />
      <Text style={[estilos.texto, grande && estilos.textoGrande, { color: info.texto }]}>{info.etiqueta}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: espacio.xs,
    paddingHorizontal: espacio.s,
    paddingVertical: espacio.xs,
    borderRadius: radio.pildora,
    borderWidth: 1,
  },
  grande: { paddingHorizontal: espacio.m, paddingVertical: espacio.s },
  texto: { fontSize: 14, fontWeight: '700' },
  textoGrande: { fontSize: 16 },
});
