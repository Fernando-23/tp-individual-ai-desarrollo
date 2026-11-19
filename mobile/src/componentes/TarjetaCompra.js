import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTema } from '../hooks/useTema';
import { infoEstado } from '../logica/estados';
import { formatearFecha, formatearPrecio, textoDiasRestantes } from '../logica/formato';
import { espacio, radio, tipografia } from '../tema';
import { EtiquetaEstado } from './EtiquetaEstado';

/**
 * Compra en "Mis compras" (Historia 4): el estado se distingue de un vistazo
 * (SC-003) y, si está confirmada, cuántos días faltan.
 */
export function TarjetaCompra({ compra, onPress }) {
  const tema = useTema();
  const dias = textoDiasRestantes(compra.diasRestantes);
  const etiqueta = [
    compra.evento.nombre,
    formatearFecha(compra.evento.fecha),
    `${compra.cantidad} ${compra.tipoEntrada.nombre}`,
    `Total ${formatearPrecio(compra.total)}`,
    `Estado: ${infoEstado(compra.estado).etiqueta}`,
    dias,
  ].filter(Boolean).join('. ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityHint="Abre el detalle de la compra"
      style={({ pressed }) => [
        estilos.tarjeta,
        { backgroundColor: tema.superficie, borderColor: tema.divisor, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={estilos.encabezado}>
        <Text style={[tipografia.cuerpoFuerte, estilos.nombre, { color: tema.texto }]} numberOfLines={2}>
          {compra.evento.nombre}
        </Text>
        <Ionicons name="chevron-forward" size={22} color={tema.textoSecundario} />
      </View>
      <Text style={[tipografia.chico, { color: tema.textoSecundario }]}>{formatearFecha(compra.evento.fecha)}</Text>
      <Text style={[tipografia.cuerpo, { color: tema.texto }]}>
        {compra.tipoEntrada.nombre} × {compra.cantidad} · {formatearPrecio(compra.total)}
      </Text>
      <View style={estilos.pie}>
        <EtiquetaEstado estado={compra.estado} />
        {dias && (
          <View style={[estilos.dias, { backgroundColor: tema.marca }]}>
            <Ionicons name="hourglass-outline" size={16} color={tema.textoSobreMarca} />
            <Text style={[estilos.diasTexto, { color: tema.textoSobreMarca }]}>{dias}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tarjeta: { padding: espacio.l, borderRadius: radio.m, borderWidth: 1, gap: espacio.xs },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: espacio.s },
  nombre: { flex: 1, fontSize: 17 },
  pie: { flexDirection: 'row', alignItems: 'center', gap: espacio.s, marginTop: espacio.s, flexWrap: 'wrap' },
  dias: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.xs,
    paddingHorizontal: espacio.s,
    paddingVertical: espacio.xs,
    borderRadius: radio.pildora,
  },
  diasTexto: { fontSize: 14, fontWeight: '800' },
});
