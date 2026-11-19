import { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApi } from '../../src/contexto/UsuarioContext';
import { useRecurso } from '../../src/hooks/useRecurso';
import { EstadoCarga } from '../../src/componentes/EstadoCarga';
import { Pantalla } from '../../src/componentes/Pantalla';
import { TarjetaCompra } from '../../src/componentes/TarjetaCompra';
import { espacio } from '../../src/tema';

/** Historia 4: mis compras con su estado y los días que faltan (caso de uso 1). */
export default function MisCompras() {
  const api = useApi();
  const router = useRouter();
  const cargar = useCallback(() => api.compras.misCompras(), [api]);
  const { datos: compras, cargando, error, recargar } = useRecurso(cargar);

  return (
    <Pantalla>
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
          contentContainerStyle={estilos.lista}
          refreshing={cargando}
          onRefresh={recargar}
          renderItem={({ item }) => <TarjetaCompra compra={item} onPress={() => router.push(`/compra/${item.id}`)} />}
        />
      </EstadoCarga>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  lista: { padding: espacio.l, gap: espacio.m },
});
