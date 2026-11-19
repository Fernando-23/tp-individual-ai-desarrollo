import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTema } from '../hooks/useTema';

/**
 * Contenedor de pantalla con el fondo del tema. Los encabezados de las
 * pestañas y del stack ya respetan la barra de estado; acá se agrega el
 * margen inferior del sistema cuando la pantalla no tiene pestañas abajo.
 */
export function Pantalla({ children, margenInferior = false, estilo }) {
  const tema = useTema();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        estilos.pantalla,
        { backgroundColor: tema.fondo, paddingBottom: margenInferior ? insets.bottom : 0 },
        estilo,
      ]}
    >
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
});
