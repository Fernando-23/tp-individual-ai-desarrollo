import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApi } from '../../src/contexto/UsuarioContext';
import { useRecurso } from '../../src/hooks/useRecurso';
import { useTema } from '../../src/hooks/useTema';
import { EstadoCarga } from '../../src/componentes/EstadoCarga';
import { EtiquetaEstado } from '../../src/componentes/EtiquetaEstado';
import { Pantalla } from '../../src/componentes/Pantalla';
import { ESTADOS, infoEstado } from '../../src/logica/estados';
import { formatearFecha, formatearPrecio } from '../../src/logica/formato';
import { espacio, radio, TAMANO_TACTIL, tipografia } from '../../src/tema';

/** Historia 5 / caso de uso 2: ventas de un evento para su organizador (FR-015). */
export default function Ventas() {
  const { eventoId } = useLocalSearchParams();
  const api = useApi();
  const router = useRouter();
  const tema = useTema();
  const cargar = useCallback(() => api.eventos.ventas(eventoId), [api, eventoId]);
  const { datos: ventas, cargando, error, recargar } = useRecurso(cargar);

  return (
    <Pantalla margenInferior>
      <EstadoCarga cargando={cargando} error={error} hayDatos={!!ventas} alReintentar={recargar}>
        {ventas && (
          <ScrollView contentContainerStyle={estilos.contenido}>
            <View>
              <Text style={[tipografia.titulo, { color: tema.texto }]} accessibilityRole="header">
                {ventas.evento.nombre}
              </Text>
              <Text style={[tipografia.cuerpo, { color: tema.textoSecundario }]}>{formatearFecha(ventas.evento.fecha)}</Text>
            </View>

            <Text style={[tipografia.subtitulo, { color: tema.texto }]} accessibilityRole="header">
              Entradas
            </Text>
            {ventas.tiposEntrada.map((t) => {
              const proporcion = t.cupo === 0 ? 0 : t.ocupadas / t.cupo;
              return (
                <View
                  key={t.id}
                  style={[estilos.tarjeta, { backgroundColor: tema.superficie, borderColor: tema.divisor }]}
                  accessible
                  accessibilityLabel={`${t.nombre}: ${t.disponibles} disponibles de ${t.cupo}. ${t.ocupadas} ocupadas. Precio ${formatearPrecio(t.precio)}`}
                >
                  <View style={estilos.filaEntre}>
                    <Text style={[tipografia.cuerpoFuerte, { color: tema.texto }]}>{t.nombre}</Text>
                    <Text style={[tipografia.cuerpo, { color: tema.textoSecundario }]}>{formatearPrecio(t.precio)}</Text>
                  </View>
                  <View style={[estilos.barra, { backgroundColor: tema.divisor, borderColor: tema.borde }]}>
                    <View style={[estilos.relleno, { width: `${Math.round(proporcion * 100)}%`, backgroundColor: tema.primario }]} />
                  </View>
                  <Text style={[tipografia.cuerpo, { color: tema.texto }]}>
                    <Text style={estilos.fuerte}>{t.disponibles} disponibles</Text> de {t.cupo} · {t.ocupadas} ocupadas
                  </Text>
                </View>
              );
            })}

            <Text style={[tipografia.subtitulo, { color: tema.texto }]} accessibilityRole="header">
              Compras por estado
            </Text>
            <View style={estilos.conteos}>
              {Object.keys(ESTADOS).map((estado) => (
                <View
                  key={estado}
                  style={[estilos.conteo, { backgroundColor: infoEstado(estado).fondo, borderColor: infoEstado(estado).texto }]}
                  accessible
                  accessibilityLabel={`${infoEstado(estado).etiqueta}: ${ventas.cantidadPorEstado[estado]}`}
                >
                  <Ionicons name={infoEstado(estado).icono} size={18} color={infoEstado(estado).texto} />
                  <Text style={[estilos.conteoTexto, { color: infoEstado(estado).texto }]}>
                    {infoEstado(estado).etiqueta}: {ventas.cantidadPorEstado[estado]}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={[tipografia.subtitulo, { color: tema.texto }]} accessibilityRole="header">
              Compras
            </Text>
            {ventas.compras.length === 0 ? (
              <Text style={[tipografia.cuerpo, { color: tema.textoSecundario }]}>Todavía no hay compras para este evento.</Text>
            ) : (
              ventas.compras.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => router.push(`/compra/${c.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Compra de ${c.comprador.nombre} ${c.comprador.apellido}: ${c.cantidad} ${c.tipoEntrada.nombre}, ${formatearPrecio(c.total)}. Estado: ${infoEstado(c.estado).etiqueta}`}
                  accessibilityHint="Abre la compra para confirmarla, rechazarla o registrar el ingreso"
                  style={({ pressed }) => [estilos.compra, { backgroundColor: tema.superficie, borderColor: tema.divisor, opacity: pressed ? 0.9 : 1 }]}
                >
                  <View style={estilos.compraTexto}>
                    <Text style={[tipografia.cuerpoFuerte, { color: tema.texto }]}>
                      {c.comprador.nombre} {c.comprador.apellido}
                    </Text>
                    <Text style={[tipografia.chico, { color: tema.textoSecundario }]}>
                      {c.tipoEntrada.nombre} × {c.cantidad} · {formatearPrecio(c.total)}
                    </Text>
                    <EtiquetaEstado estado={c.estado} />
                  </View>
                  <Ionicons name="chevron-forward" size={22} color={tema.textoSecundario} />
                </Pressable>
              ))
            )}
          </ScrollView>
        )}
      </EstadoCarga>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacio.l, gap: espacio.m },
  tarjeta: { padding: espacio.l, borderRadius: radio.m, borderWidth: 1, gap: espacio.s },
  filaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  barra: { height: 12, borderRadius: 6, overflow: 'hidden', borderWidth: 1 },
  relleno: { height: '100%' },
  fuerte: { fontWeight: '800' },
  conteos: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.s },
  conteo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.xs,
    paddingHorizontal: espacio.m,
    paddingVertical: espacio.s,
    borderRadius: radio.pildora,
    borderWidth: 1,
  },
  conteoTexto: { fontSize: 14, fontWeight: '700' },
  compra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.m,
    minHeight: TAMANO_TACTIL,
    padding: espacio.l,
    borderRadius: radio.m,
    borderWidth: 1,
  },
  compraTexto: { flex: 1, gap: espacio.xs },
});
