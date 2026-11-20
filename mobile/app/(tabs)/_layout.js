import { Pressable, StyleSheet, Text } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useUsuario } from '../../src/contexto/UsuarioContext';
import { useTema } from '../../src/hooks/useTema';
import { espacio, radio, TAMANO_TACTIL } from '../../src/tema';

/** Usuario actual visible en el encabezado, con "Cambiar" (FR-008). */
function UsuarioActual() {
  const { usuario, salir } = useUsuario();
  const tema = useTema();
  return (
    <Pressable
      onPress={salir}
      accessibilityRole="button"
      accessibilityLabel={`Usando la app como ${usuario.nombre} ${usuario.apellido}. Cambiar de usuario`}
      style={[estilos.chip, { backgroundColor: tema.superficie, borderColor: tema.textoSobreMarca }]}
    >
      <Ionicons name="person-circle" size={22} color={tema.textoSobreMarca} />
      <Text style={[estilos.nombre, { color: tema.textoSobreMarca }]} numberOfLines={1}>
        {usuario.nombre}
      </Text>
      <Text style={[estilos.cambiar, { color: tema.primario }]}>Cambiar</Text>
    </Pressable>
  );
}

const icono = (nombre) =>
  function IconoPestania({ color, focused }) {
    return <Ionicons name={focused ? nombre : `${nombre}-outline`} size={24} color={color} />;
  };

export default function PestaniasLayout() {
  const { usuario } = useUsuario();
  const tema = useTema();
  if (!usuario) return <Redirect href="/elegir-usuario" />;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: tema.marca },
        headerTintColor: tema.textoSobreMarca,
        headerTitleStyle: { fontWeight: '800' },
        headerRight: () => <UsuarioActual />,
        tabBarActiveTintColor: tema.primario,
        tabBarInactiveTintColor: tema.textoSecundario,
        tabBarLabelStyle: { fontSize: 13, fontWeight: '700' },
        tabBarStyle: { backgroundColor: tema.superficie, borderTopColor: tema.borde },
        sceneStyle: { backgroundColor: tema.fondo },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Explorar', tabBarIcon: icono('compass') }} />
      <Tabs.Screen name="compras" options={{ title: 'Mis compras', tabBarIcon: icono('ticket') }} />
      <Tabs.Screen name="eventos" options={{ title: 'Mis eventos', tabBarIcon: icono('calendar') }} />
      <Tabs.Screen name="favoritos" options={{ title: 'Favoritos', tabBarIcon: icono('heart') }} />
    </Tabs>
  );
}

const estilos = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.xs,
    minHeight: TAMANO_TACTIL - 8,
    maxWidth: 220,
    marginRight: espacio.m,
    paddingHorizontal: espacio.m,
    borderRadius: radio.pildora,
    borderWidth: 1,
  },
  nombre: { fontSize: 15, fontWeight: '700', flexShrink: 1 },
  cambiar: { fontSize: 14, fontWeight: '800', textDecorationLine: 'underline' },
});
