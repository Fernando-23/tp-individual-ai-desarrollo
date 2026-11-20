import { useCallback, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApi } from '../../src/contexto/UsuarioContext';
import { useRecurso } from '../../src/hooks/useRecurso';
import { useTema } from '../../src/hooks/useTema';
import { avisarError } from '../../src/componentes/avisos';
import { Boton } from '../../src/componentes/Boton';
import { EstadoCarga } from '../../src/componentes/EstadoCarga';
import { Estrellas } from '../../src/componentes/Estrellas';
import { Pantalla } from '../../src/componentes/Pantalla';
import { SelectorCantidad } from '../../src/componentes/SelectorCantidad';
import { formatearFecha, formatearPrecio } from '../../src/logica/formato';
import { espacio, radio, TAMANO_TACTIL, tipografia } from '../../src/tema';

const puntajeTexto = (n) => String(Math.round(n * 10) / 10).replace('.', ',');

/** Historias 2 y 3: detalle del evento y compra de entradas (FR-010, FR-011). */
export default function DetalleEvento() {
  const { id } = useLocalSearchParams();
  const api = useApi();
  const router = useRouter();
  const tema = useTema();
  const cargar = useCallback(() => api.eventos.obtener(id), [api, id]);
  const { datos: evento, cargando, error, recargar, setDatos } = useRecurso(cargar);

  /** Historia 9: favorito optimista; si el servidor falla, vuelve atrás (FR-017). */
  async function alternarFavorito() {
    const eraFavorito = evento.esFavorito;
    setDatos((e) => ({ ...e, esFavorito: !eraFavorito }));
    try {
      if (eraFavorito) await api.favoritos.desmarcar(evento.id);
      else await api.favoritos.marcar(evento.id);
    } catch (e) {
      setDatos((ev) => ({ ...ev, esFavorito: eraFavorito }));
      avisarError(e, 'No se pudo actualizar tus favoritos');
    }
  }

  const [tipoId, setTipoId] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [comprando, setComprando] = useState(false);

  const tipo = evento?.tiposEntrada.find((t) => t.id === tipoId) ?? null;

  function elegirTipo(t) {
    setTipoId(t.id);
    setCantidad(1);
  }

  async function comprar() {
    setComprando(true);
    try {
      const compra = await api.compras.comprar({ eventoId: evento.id, tipoEntradaId: tipo.id, cantidad });
      setTipoId(null);
      recargar();
      Alert.alert(
        '¡Listo!',
        'Tu compra quedó pendiente hasta que el organizador confirme el pago. Podés seguirla en "Mis compras".',
        [
          { text: 'Seguir explorando', style: 'cancel' },
          { text: 'Ver compra', onPress: () => router.push(`/compra/${compra.id}`) },
        ],
      );
    } catch (e) {
      avisarError(e, 'No se pudo comprar');
      recargar(); // por ejemplo, si otro compró las últimas entradas
    } finally {
      setComprando(false);
    }
  }

  return (
    <Pantalla margenInferior>
      <EstadoCarga cargando={cargando} error={error} hayDatos={!!evento} alReintentar={recargar}>
        {evento && (
          <ScrollView contentContainerStyle={estilos.contenido}>
            {evento.imagen ? (
              <Image source={{ uri: evento.imagen }} style={estilos.imagen} accessibilityLabel={`Imagen de ${evento.nombre}`} />
            ) : null}

            <View style={estilos.bloque}>
              <View style={estilos.filaTitulo}>
                <Text style={[tipografia.titulo, estilos.titulo, { color: tema.texto }]} accessibilityRole="header">
                  {evento.nombre}
                </Text>
                <Pressable
                  onPress={alternarFavorito}
                  accessibilityRole="button"
                  accessibilityLabel={evento.esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  accessibilityState={{ selected: !!evento.esFavorito }}
                  style={[estilos.corazon, { borderColor: evento.esFavorito ? tema.peligro : tema.borde, backgroundColor: tema.superficie }]}
                >
                  <Ionicons name={evento.esFavorito ? 'heart' : 'heart-outline'} size={26} color={evento.esFavorito ? tema.peligro : tema.textoSecundario} />
                </Pressable>
              </View>
              <View style={estilos.fila}>
                <Ionicons name="calendar" size={18} color={tema.primario} />
                <Text style={[tipografia.cuerpoFuerte, { color: tema.texto }]}>{formatearFecha(evento.fecha)}</Text>
              </View>
              <View style={estilos.fila}>
                <Ionicons name="pricetag" size={18} color={tema.primario} />
                <Text style={[tipografia.cuerpo, { color: tema.texto }]}>{evento.categoria.nombre}</Text>
              </View>
              <Text style={[tipografia.cuerpo, estilos.descripcion, { color: tema.texto }]}>{evento.descripcion}</Text>
            </View>

            <View style={estilos.bloque}>
              <Text style={[tipografia.subtitulo, { color: tema.texto }]} accessibilityRole="header">
                Entradas
              </Text>
              {evento.yaSeRealizo && (
                <Text style={[tipografia.cuerpo, { color: tema.textoSecundario }]}>
                  Este evento ya se realizó: no se venden más entradas.
                </Text>
              )}
              {evento.tiposEntrada.map((t) => {
                const agotado = t.disponibles === 0;
                const seleccionado = t.id === tipoId;
                const habilitado = !agotado && !evento.yaSeRealizo;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => elegirTipo(t)}
                    disabled={!habilitado}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: seleccionado, disabled: !habilitado }}
                    accessibilityLabel={`${t.nombre}, ${formatearPrecio(t.precio)}, ${agotado ? 'agotado' : `quedan ${t.disponibles}`}`}
                    style={[
                      estilos.tipo,
                      {
                        backgroundColor: tema.superficie,
                        borderColor: seleccionado ? tema.primario : tema.borde,
                        borderWidth: seleccionado ? 3 : 1,
                        opacity: habilitado ? 1 : 0.6,
                      },
                    ]}
                  >
                    <Ionicons
                      name={seleccionado ? 'radio-button-on' : 'radio-button-off'}
                      size={24}
                      color={habilitado ? tema.primario : tema.textoSecundario}
                    />
                    <View style={estilos.tipoTexto}>
                      <Text style={[tipografia.cuerpoFuerte, { color: tema.texto }]}>{t.nombre}</Text>
                      {t.descripcion ? (
                        <Text style={[tipografia.chico, { color: tema.textoSecundario }]}>{t.descripcion}</Text>
                      ) : null}
                      <Text style={[tipografia.chico, { color: agotado ? tema.error : tema.textoSecundario }]}>
                        {agotado ? 'Agotado' : `Quedan ${t.disponibles}`}
                      </Text>
                    </View>
                    <Text style={[tipografia.cuerpoFuerte, { color: tema.texto }]}>{formatearPrecio(t.precio)}</Text>
                  </Pressable>
                );
              })}

              {tipo && (
                <View style={[estilos.compra, { backgroundColor: tema.superficie, borderColor: tema.primario }]}>
                  <Text style={[tipografia.cuerpoFuerte, { color: tema.texto }]}>¿Cuántas entradas {tipo.nombre}?</Text>
                  <SelectorCantidad valor={cantidad} maximo={tipo.disponibles} onCambiar={setCantidad} />
                  <View style={estilos.total}>
                    <Text style={[tipografia.cuerpo, { color: tema.textoSecundario }]}>Total</Text>
                    <Text style={[tipografia.titulo, { color: tema.texto }]} accessibilityLiveRegion="polite">
                      {formatearPrecio(tipo.precio * cantidad)}
                    </Text>
                  </View>
                  <Boton
                    titulo={`Comprar ${cantidad} ${cantidad === 1 ? 'entrada' : 'entradas'}`}
                    icono="cart"
                    onPress={comprar}
                    cargando={comprando}
                    accessibilityLabel={`Comprar ${cantidad} ${cantidad === 1 ? 'entrada' : 'entradas'} ${tipo.nombre}, total ${formatearPrecio(tipo.precio * cantidad)}`}
                  />
                  <Text style={[tipografia.chico, { color: tema.textoSecundario }]}>
                    La compra queda pendiente hasta que el organizador confirme el pago.
                  </Text>
                </View>
              )}
            </View>

            <View style={estilos.bloque}>
              <Text style={[tipografia.subtitulo, { color: tema.texto }]} accessibilityRole="header">
                Organiza {evento.organizador.nombre} {evento.organizador.apellido}
              </Text>
              {evento.organizador.puntaje === null ? (
                <Text style={[tipografia.cuerpo, { color: tema.textoSecundario }]}>Todavía no tiene reseñas.</Text>
              ) : (
                <View style={estilos.fila}>
                  <Estrellas valor={evento.organizador.puntaje} />
                  <Text style={[tipografia.cuerpoFuerte, { color: tema.texto }]}>
                    {puntajeTexto(evento.organizador.puntaje)} · {evento.organizador.cantidadResenias}{' '}
                    {evento.organizador.cantidadResenias === 1 ? 'reseña' : 'reseñas'}
                  </Text>
                </View>
              )}
              {evento.reseniasDelOrganizador.map((r) => (
                <View key={r.id} style={[estilos.resenia, { backgroundColor: tema.superficie, borderColor: tema.divisor }]}>
                  <View style={estilos.fila}>
                    <Estrellas valor={r.puntuacion} tamano={16} />
                    <Text style={[tipografia.chico, { color: tema.textoSecundario }]}>
                      {r.comprador.nombre} · {r.evento.nombre}
                    </Text>
                  </View>
                  {r.detalle ? <Text style={[tipografia.cuerpo, { color: tema.texto }]}>{r.detalle}</Text> : null}
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </EstadoCarga>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  contenido: { paddingBottom: espacio.xxl },
  imagen: { width: '100%', aspectRatio: 16 / 9 },
  bloque: { paddingHorizontal: espacio.l, paddingTop: espacio.l, gap: espacio.s },
  fila: { flexDirection: 'row', alignItems: 'center', gap: espacio.s, flexWrap: 'wrap' },
  filaTitulo: { flexDirection: 'row', alignItems: 'flex-start', gap: espacio.m },
  titulo: { flex: 1 },
  corazon: {
    width: TAMANO_TACTIL,
    height: TAMANO_TACTIL,
    borderRadius: TAMANO_TACTIL / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  descripcion: { marginTop: espacio.xs, lineHeight: 23 },
  tipo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.m,
    minHeight: TAMANO_TACTIL + 12,
    padding: espacio.m,
    borderRadius: radio.m,
  },
  tipoTexto: { flex: 1, gap: 2 },
  compra: { gap: espacio.m, padding: espacio.l, borderRadius: radio.m, borderWidth: 2, marginTop: espacio.s },
  total: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  resenia: { gap: espacio.xs, padding: espacio.m, borderRadius: radio.m, borderWidth: 1 },
});
