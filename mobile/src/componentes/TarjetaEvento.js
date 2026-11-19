import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTema } from '../hooks/useTema';
import { formatearFecha, formatearPrecio } from '../logica/formato';
import { espacio, radio, tipografia } from '../tema';

const textoPuntaje = (org) =>
  org.puntaje === null ? 'Sin reseñas' : `${String(Math.round(org.puntaje * 10) / 10).replace('.', ',')} ★`;

/**
 * Tarjeta de un evento del catálogo (Historia 2, escenario 1): imagen, nombre,
 * fecha, categoría, precio "desde", organizador con su puntaje y si está agotado.
 */
export function TarjetaEvento({ evento, onPress, atenuado = false }) {
  const tema = useTema();
  const precio = evento.precioDesde === 0 ? 'Gratis' : `Desde ${formatearPrecio(evento.precioDesde)}`;
  const etiqueta = [
    evento.nombre,
    formatearFecha(evento.fecha),
    evento.categoria.nombre,
    evento.hayEntradas ? precio : 'Agotado',
    `Organiza ${evento.organizador.nombre} ${evento.organizador.apellido}, ${textoPuntaje(evento.organizador)}`,
  ].join('. ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityHint="Abre el detalle del evento"
      style={({ pressed }) => [
        estilos.tarjeta,
        { backgroundColor: tema.superficie, borderColor: tema.divisor, opacity: atenuado ? 0.75 : pressed ? 0.9 : 1 },
      ]}
    >
      {evento.imagen ? (
        <Image source={{ uri: evento.imagen }} style={estilos.imagen} accessibilityIgnoresInvertColors />
      ) : (
        <View style={[estilos.imagen, { backgroundColor: tema.marca }]} />
      )}
      {!evento.hayEntradas && (
        <View style={[estilos.cinta, { backgroundColor: tema.peligro }]}>
          <Text style={[estilos.cintaTexto, { color: tema.textoSobrePeligro }]}>AGOTADO</Text>
        </View>
      )}
      <View style={estilos.cuerpo}>
        <Text style={[tipografia.subtitulo, { color: tema.texto }]} numberOfLines={2}>
          {evento.nombre}
        </Text>
        <View style={estilos.fila}>
          <Ionicons name="calendar-outline" size={16} color={tema.textoSecundario} />
          <Text style={[tipografia.chico, { color: tema.textoSecundario }]}>{formatearFecha(evento.fecha)}</Text>
          <Text style={[tipografia.chico, { color: tema.textoSecundario }]}>· {evento.categoria.nombre}</Text>
        </View>
        <View style={[estilos.fila, estilos.pie]}>
          <Text style={[tipografia.cuerpoFuerte, { color: tema.primario }]}>{evento.hayEntradas ? precio : 'Agotado'}</Text>
          <Text style={[tipografia.chico, { color: tema.textoSecundario }]} numberOfLines={1}>
            {evento.organizador.nombre} · {textoPuntaje(evento.organizador)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tarjeta: { borderRadius: radio.m, borderWidth: 1, overflow: 'hidden' },
  imagen: { width: '100%', aspectRatio: 16 / 7 },
  cinta: { position: 'absolute', top: espacio.m, left: espacio.m, paddingHorizontal: espacio.s, paddingVertical: espacio.xs, borderRadius: radio.s },
  cintaTexto: { fontWeight: '800', letterSpacing: 1 },
  cuerpo: { padding: espacio.m, gap: espacio.xs },
  fila: { flexDirection: 'row', alignItems: 'center', gap: espacio.xs, flexWrap: 'wrap' },
  pie: { justifyContent: 'space-between', marginTop: espacio.xs },
});
