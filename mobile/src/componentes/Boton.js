import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTema } from '../hooks/useTema';
import { espacio, radio, TAMANO_TACTIL, tipografia } from '../tema';

/**
 * Botón accesible (FR-006, FR-019): mínimo 48 de alto, rol y estado para
 * lectores de pantalla, y deshabilitado mientras la acción está en curso.
 * variante: 'primario' | 'secundario' | 'peligro'
 */
export function Boton({
  titulo,
  onPress,
  variante = 'primario',
  cargando = false,
  deshabilitado = false,
  icono,
  accessibilityLabel,
  accessibilityHint,
  estilo,
}) {
  const tema = useTema();
  const inactivo = deshabilitado || cargando;
  const colores = {
    primario: { fondo: tema.primario, texto: tema.textoSobrePrimario, borde: tema.primario },
    peligro: { fondo: tema.peligro, texto: tema.textoSobrePeligro, borde: tema.peligro },
    secundario: { fondo: tema.superficie, texto: tema.primario, borde: tema.primario },
  }[variante];

  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? titulo}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      style={({ pressed }) => [
        estilos.boton,
        { backgroundColor: colores.fondo, borderColor: colores.borde, opacity: inactivo ? 0.55 : pressed ? 0.85 : 1 },
        estilo,
      ]}
    >
      <View style={estilos.contenido}>
        {cargando ? (
          <ActivityIndicator color={colores.texto} />
        ) : (
          icono && <Ionicons name={icono} size={20} color={colores.texto} />
        )}
        <Text style={[tipografia.cuerpoFuerte, { color: colores.texto }]}>{titulo}</Text>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    minHeight: TAMANO_TACTIL,
    paddingHorizontal: espacio.l,
    paddingVertical: espacio.m,
    borderRadius: radio.m,
    borderWidth: 2,
    justifyContent: 'center',
  },
  contenido: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: espacio.s },
});
