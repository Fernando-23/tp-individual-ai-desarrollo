import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApi, useUsuario } from '../src/contexto/UsuarioContext';
import { useRecurso } from '../src/hooks/useRecurso';
import { useTema } from '../src/hooks/useTema';
import { EstadoCarga } from '../src/componentes/EstadoCarga';
import { espacio, radio, TAMANO_TACTIL, tipografia } from '../src/tema';

const iniciales = (u) => `${u.nombre[0] ?? ''}${u.apellido[0] ?? ''}`.toUpperCase();

/** Historia 1: elegir con qué usuario usar la app (FR-008). Sin contraseñas. */
export default function ElegirUsuario() {
  const api = useApi();
  const { elegir } = useUsuario();
  const router = useRouter();
  const tema = useTema();
  const insets = useSafeAreaInsets();
  const cargar = useCallback(() => api.usuarios.listar(), [api]);
  const { datos: usuarios, cargando, error, recargar } = useRecurso(cargar);

  function alElegir(usuario) {
    elegir(usuario);
    router.replace('/');
  }

  return (
    <View style={[estilos.pantalla, { backgroundColor: tema.fondo }]}>
      <View style={[estilos.marca, { backgroundColor: tema.marca, paddingTop: insets.top + espacio.xl }]}>
        <Text style={[estilos.logo, { color: tema.textoSobreMarca }]} accessibilityRole="header">
          AI Ticket It
        </Text>
        <Text style={[estilos.lema, { color: tema.textoSobreMarca }]}>ENTRADAS A UN CLICK</Text>
      </View>

      <Text style={[tipografia.subtitulo, estilos.titulo, { color: tema.texto }]} accessibilityRole="header">
        ¿Con quién querés entrar?
      </Text>
      <Text style={[tipografia.cuerpo, estilos.ayuda, { color: tema.textoSecundario }]}>
        Elegí un usuario de prueba. Podés cambiarlo cuando quieras.
      </Text>

      <EstadoCarga
        cargando={cargando}
        error={error}
        hayDatos={!!usuarios}
        vacio={usuarios?.length === 0}
        mensajeVacio="El servidor no tiene usuarios cargados."
        alReintentar={recargar}
      >
        <FlatList
          data={usuarios ?? []}
          keyExtractor={(u) => u.id}
          contentContainerStyle={[estilos.lista, { paddingBottom: insets.bottom + espacio.l }]}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => alElegir(item)}
              accessibilityRole="button"
              accessibilityLabel={`Entrar como ${item.nombre} ${item.apellido}`}
              style={({ pressed }) => [
                estilos.tarjeta,
                { backgroundColor: tema.superficie, borderColor: tema.borde, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <View style={[estilos.avatar, { backgroundColor: tema.primario }]}>
                <Text style={[estilos.iniciales, { color: tema.textoSobrePrimario }]}>{iniciales(item)}</Text>
              </View>
              <Text style={[tipografia.cuerpoFuerte, estilos.nombre, { color: tema.texto }]}>
                {item.nombre} {item.apellido}
              </Text>
              <Ionicons name="chevron-forward" size={24} color={tema.textoSecundario} />
            </Pressable>
          )}
        />
      </EstadoCarga>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  marca: { alignItems: 'center', paddingBottom: espacio.xl, borderBottomLeftRadius: radio.l, borderBottomRightRadius: radio.l },
  logo: { fontSize: 34, fontWeight: '900' },
  lema: { fontSize: 14, fontWeight: '700', letterSpacing: 3, marginTop: espacio.xs },
  titulo: { marginTop: espacio.xl, marginHorizontal: espacio.l },
  ayuda: { marginTop: espacio.xs, marginHorizontal: espacio.l },
  lista: { padding: espacio.l, gap: espacio.m },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.m,
    minHeight: TAMANO_TACTIL + 16,
    padding: espacio.m,
    borderRadius: radio.m,
    borderWidth: 1,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  iniciales: { fontSize: 18, fontWeight: '800' },
  nombre: { flex: 1 },
});
