import { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApi } from '../../src/contexto/UsuarioContext';
import { useRecurso } from '../../src/hooks/useRecurso';
import { EstadoCarga } from '../../src/componentes/EstadoCarga';
import { Pantalla } from '../../src/componentes/Pantalla';
import { TarjetaEvento } from '../../src/componentes/TarjetaEvento';
import { ZonaLista } from '../../src/componentes/ZonaLista';
import { espacio } from '../../src/tema';

/** Historia 9: eventos marcados como favoritos (FR-017). */
export default function Favoritos() {
  const api = useApi();
  const router = useRouter();
  const cargar = useCallback(() => api.favoritos.listar(), [api]);
  const { datos: eventos, cargando, error, recargar } = useRecurso(cargar);

  return (
    <Pantalla>
      <ZonaLista>
        <EstadoCarga
          cargando={cargando}
          error={error}
          hayDatos={!!eventos}
          vacio={eventos?.length === 0}
          mensajeVacio="Todavía no marcaste favoritos. Tocá el corazón en un evento para guardarlo acá."
          iconoVacio="heart-outline"
          alReintentar={recargar}
        >
          <FlatList
            data={eventos ?? []}
            keyExtractor={(e) => e.id}
            style={estilos.flex}
            contentContainerStyle={estilos.lista}
            renderItem={({ item }) => (
              <TarjetaEvento evento={item} atenuado={item.yaSeRealizo} onPress={() => router.push(`/evento/${item.id}`)} />
            )}
          />
        </EstadoCarga>
      </ZonaLista>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  lista: { padding: espacio.l, gap: espacio.l },
});
