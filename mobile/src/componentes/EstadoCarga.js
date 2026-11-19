import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTema } from '../hooks/useTema';
import { espacio, tipografia } from '../tema';
import { Boton } from './Boton';

/**
 * Los cuatro estados de toda pantalla con datos (FR-002, constitución VI):
 * cargando, error con reintento, vacío con mensaje, o el contenido.
 * Si ya hay datos y se está recargando, se muestra el contenido (sin parpadeo).
 */
export function EstadoCarga({
  cargando,
  error,
  vacio = false,
  mensajeVacio = 'No hay nada para mostrar',
  iconoVacio = 'file-tray-outline',
  alReintentar,
  hayDatos,
  children,
}) {
  const tema = useTema();

  if (cargando && !hayDatos) {
    return (
      <View style={estilos.centro} accessible accessibilityLabel="Cargando" accessibilityRole="progressbar">
        <ActivityIndicator size="large" color={tema.primario} />
      </View>
    );
  }

  if (error && !hayDatos) {
    return (
      <View style={estilos.centro} accessibilityLiveRegion="polite">
        <Ionicons name="cloud-offline-outline" size={48} color={tema.textoSecundario} />
        <Text style={[tipografia.cuerpoFuerte, estilos.texto, { color: tema.texto }]}>No pudimos cargar esto</Text>
        <Text style={[tipografia.cuerpo, estilos.texto, { color: tema.textoSecundario }]}>{error.mensaje ?? error.message}</Text>
        {alReintentar && <Boton titulo="Reintentar" icono="refresh" onPress={alReintentar} />}
      </View>
    );
  }

  if (vacio) {
    return (
      <View style={estilos.centro}>
        <Ionicons name={iconoVacio} size={48} color={tema.textoSecundario} />
        <Text style={[tipografia.cuerpo, estilos.texto, { color: tema.textoSecundario }]}>{mensajeVacio}</Text>
      </View>
    );
  }

  return children;
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: espacio.xl, gap: espacio.m },
  texto: { textAlign: 'center' },
});
