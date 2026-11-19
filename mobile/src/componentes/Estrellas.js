import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTema } from '../hooks/useTema';
import { TAMANO_TACTIL } from '../tema';

const formatear = (n) => String(Math.round(n * 10) / 10).replace('.', ',');

/**
 * Puntaje de 1 a 5. Solo lectura: medias estrellas. Editable: 5 botones
 * de 48 × 48, cada uno con su etiqueta accesible (FR-016, FR-019).
 */
export function Estrellas({ valor, tamano = 18, editable = false, onCambiar }) {
  const tema = useTema();

  if (!editable) {
    if (valor === null || valor === undefined) return null;
    return (
      <View style={estilos.fila} accessible accessibilityLabel={`Puntaje ${formatear(valor)} de 5`}>
        {[1, 2, 3, 4, 5].map((n) => {
          const nombre = valor >= n ? 'star' : valor >= n - 0.5 ? 'star-half' : 'star-outline';
          return <Ionicons key={n} name={nombre} size={tamano} color={tema.estrella} />;
        })}
      </View>
    );
  }

  return (
    <View style={estilos.fila} accessibilityRole="radiogroup" accessibilityLabel="Puntuación">
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          onPress={() => onCambiar(n)}
          accessibilityRole="radio"
          accessibilityLabel={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
          accessibilityState={{ checked: valor === n }}
          style={estilos.botonEstrella}
        >
          <Ionicons name={valor >= n ? 'star' : 'star-outline'} size={36} color={valor >= n ? tema.estrella : tema.borde} />
        </Pressable>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center' },
  botonEstrella: { minWidth: TAMANO_TACTIL, minHeight: TAMANO_TACTIL, alignItems: 'center', justifyContent: 'center' },
});
