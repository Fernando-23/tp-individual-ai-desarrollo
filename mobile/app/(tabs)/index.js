import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApi } from '../../src/contexto/UsuarioContext';
import { useRecurso } from '../../src/hooks/useRecurso';
import { useTema } from '../../src/hooks/useTema';
import { Chip } from '../../src/componentes/Chip';
import { EstadoCarga } from '../../src/componentes/EstadoCarga';
import { Pantalla } from '../../src/componentes/Pantalla';
import { TarjetaEvento } from '../../src/componentes/TarjetaEvento';
import { espacio, radio, TAMANO_TACTIL } from '../../src/tema';

const ORDENES = [
  { clave: 'fecha', texto: 'Fecha' },
  { clave: 'precio', texto: 'Precio' },
  { clave: 'puntaje', texto: 'Puntaje' },
];

/** Historia 2: explorar, buscar, filtrar por categoría y ordenar (FR-009). */
export default function Explorar() {
  const api = useApi();
  const router = useRouter();
  const tema = useTema();
  const [texto, setTexto] = useState('');
  const [textoBuscado, setTextoBuscado] = useState('');
  const [categoria, setCategoria] = useState(null);
  const [orden, setOrden] = useState('fecha');

  // Espera 400 ms desde la última tecla antes de buscar.
  useEffect(() => {
    const id = setTimeout(() => setTextoBuscado(texto.trim()), 400);
    return () => clearTimeout(id);
  }, [texto]);

  const cargarCategorias = useCallback(() => api.eventos.categorias(), [api]);
  const { datos: categorias } = useRecurso(cargarCategorias);

  const cargarEventos = useCallback(
    () => api.eventos.buscar({ texto: textoBuscado, categoria, orden }),
    [api, textoBuscado, categoria, orden],
  );
  const { datos: eventos, cargando, error, recargar } = useRecurso(cargarEventos);

  return (
    <Pantalla>
      <View style={estilos.filtros}>
        <View style={[estilos.buscador, { backgroundColor: tema.superficie, borderColor: tema.borde }]}>
          <Ionicons name="search" size={20} color={tema.textoSecundario} />
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Buscar por nombre o descripción"
            placeholderTextColor={tema.textoSecundario}
            accessibilityLabel="Buscar eventos"
            returnKeyType="search"
            style={[estilos.entrada, { color: tema.texto }]}
          />
          {texto.length > 0 && (
            <Pressable onPress={() => setTexto('')} accessibilityRole="button" accessibilityLabel="Borrar búsqueda" style={estilos.borrar}>
              <Ionicons name="close-circle" size={22} color={tema.textoSecundario} />
            </Pressable>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.chips} accessibilityLabel="Categorías">
          <Chip texto="Todas" seleccionado={categoria === null} onPress={() => setCategoria(null)} accessibilityLabel="Todas las categorías" />
          {(categorias ?? []).map((c) => (
            <Chip key={c.id} texto={c.nombre} seleccionado={categoria === c.id} onPress={() => setCategoria(c.id)} />
          ))}
        </ScrollView>

        <View style={estilos.orden} accessibilityLabel="Ordenar por">
          <Text style={[estilos.ordenTitulo, { color: tema.textoSecundario }]}>Ordenar por</Text>
          {ORDENES.map((o) => (
            <Chip
              key={o.clave}
              texto={o.texto}
              seleccionado={orden === o.clave}
              onPress={() => setOrden(o.clave)}
              accessibilityLabel={`Ordenar por ${o.texto.toLowerCase()}`}
            />
          ))}
        </View>
      </View>

      <EstadoCarga
        cargando={cargando}
        error={error}
        hayDatos={!!eventos}
        vacio={eventos?.length === 0}
        mensajeVacio="No hay eventos que coincidan con tu búsqueda."
        iconoVacio="search-outline"
        alReintentar={recargar}
      >
        <FlatList
          data={eventos ?? []}
          keyExtractor={(e) => e.id}
          contentContainerStyle={estilos.lista}
          renderItem={({ item }) => <TarjetaEvento evento={item} onPress={() => router.push(`/evento/${item.id}`)} />}
          keyboardShouldPersistTaps="handled"
        />
      </EstadoCarga>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  filtros: { paddingTop: espacio.m, gap: espacio.s },
  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.s,
    marginHorizontal: espacio.l,
    paddingHorizontal: espacio.m,
    minHeight: TAMANO_TACTIL,
    borderRadius: radio.m,
    borderWidth: 1.5,
  },
  entrada: { flex: 1, fontSize: 16, paddingVertical: espacio.s },
  borrar: { minWidth: TAMANO_TACTIL, minHeight: TAMANO_TACTIL, alignItems: 'center', justifyContent: 'center' },
  chips: { gap: espacio.s, paddingHorizontal: espacio.l },
  orden: { flexDirection: 'row', alignItems: 'center', gap: espacio.s, paddingHorizontal: espacio.l, flexWrap: 'wrap' },
  ordenTitulo: { fontSize: 14, fontWeight: '700' },
  lista: { padding: espacio.l, gap: espacio.l },
});
