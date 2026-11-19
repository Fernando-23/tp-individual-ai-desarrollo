import { useCallback } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useApi } from '../../src/contexto/UsuarioContext';
import { useRecurso } from '../../src/hooks/useRecurso';
import { useTema } from '../../src/hooks/useTema';
import { Boton } from '../../src/componentes/Boton';
import { EstadoCarga } from '../../src/componentes/EstadoCarga';
import { Pantalla } from '../../src/componentes/Pantalla';
import { TarjetaEvento } from '../../src/componentes/TarjetaEvento';
import { espacio, tipografia } from '../../src/tema';

/** Historia 5: eventos que organiza el usuario; desde acá se ven sus ventas y se publica. */
export default function MisEventos() {
  const api = useApi();
  const router = useRouter();
  const tema = useTema();
  const cargar = useCallback(() => api.eventos.misEventos(), [api]);
  const { datos: eventos, cargando, error, recargar } = useRecurso(cargar);

  const secciones = [
    { titulo: 'Próximos', data: (eventos ?? []).filter((e) => !e.yaSeRealizo) },
    { titulo: 'Ya realizados', data: (eventos ?? []).filter((e) => e.yaSeRealizo) },
  ].filter((s) => s.data.length > 0);

  return (
    <Pantalla>
      <View style={estilos.publicar}>
        <Boton titulo="Publicar un evento" icono="add-circle" onPress={() => router.push('/publicar')} />
      </View>
      <EstadoCarga
        cargando={cargando}
        error={error}
        hayDatos={!!eventos}
        vacio={eventos?.length === 0}
        mensajeVacio="Todavía no organizaste eventos. Publicá el primero con el botón de arriba."
        iconoVacio="calendar-outline"
        alReintentar={recargar}
      >
        <SectionList
          sections={secciones}
          keyExtractor={(e) => e.id}
          contentContainerStyle={estilos.lista}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text style={[tipografia.subtitulo, estilos.seccion, { color: tema.texto }]} accessibilityRole="header">
              {section.titulo}
            </Text>
          )}
          renderItem={({ item }) => (
            <View style={estilos.item}>
              <TarjetaEvento evento={item} atenuado={item.yaSeRealizo} onPress={() => router.push(`/ventas/${item.id}`)} />
            </View>
          )}
        />
      </EstadoCarga>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  publicar: { paddingHorizontal: espacio.l, paddingTop: espacio.l },
  lista: { padding: espacio.l },
  seccion: { marginTop: espacio.s, marginBottom: espacio.m },
  item: { marginBottom: espacio.l },
});
