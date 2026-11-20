import { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApi } from '../../src/contexto/UsuarioContext';
import { useRecurso } from '../../src/hooks/useRecurso';
import { EstadoCarga } from '../../src/componentes/EstadoCarga';
import { Pantalla } from '../../src/componentes/Pantalla';
import { TarjetaCompra } from '../../src/componentes/TarjetaCompra';
import { ZonaLista } from '../../src/componentes/ZonaLista';
import { espacio } from '../../src/tema';

/** Historia 4: mis compras con su estado y los días que faltan (caso de uso 1). */
export default function MisCompras() {
  const api = useApi();
  const router = useRouter();
  const cargar = useCallback(() => api.compras.misCompras(), [api]);
  const { datos: compras, cargando, error, recargar } = useRecurso(cargar);

  return (
    <Pantalla>
      <ZonaLista>
        <EstadoCarga
          cargando={cargando}
          error={error}
          hayDatos={!!compras}
          vacio={compras?.length === 0}
          mensajeVacio="Todavía no tenés compras. Explorá eventos para comprar tus entradas."
          iconoVacio="ticket-outline"
          alReintentar={recargar}
        >
          <FlatList
            data={compras ?? []}
            keyExtractor={(c) => c.id}
            style={estilos.flex}
            contentContainerStyle={estilos.lista}
            refreshing={cargando}
            onRefresh={recargar}
            renderItem={({ item }) => <TarjetaCompra compra={item} onPress={() => router.push(`/compra/${item.id}`)} />}
          />
        </EstadoCarga>
      </ZonaLista>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  lista: { padding: espacio.l, gap: espacio.m },
});
