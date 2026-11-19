import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApi, useUsuario } from '../../../src/contexto/UsuarioContext';
import { useRecurso } from '../../../src/hooks/useRecurso';
import { useTema } from '../../../src/hooks/useTema';
import { avisarError, confirmar } from '../../../src/componentes/avisos';
import { Boton } from '../../../src/componentes/Boton';
import { EstadoCarga } from '../../../src/componentes/EstadoCarga';
import { EtiquetaEstado } from '../../../src/componentes/EtiquetaEstado';
import { Pantalla } from '../../../src/componentes/Pantalla';
import { accionesDisponibles } from '../../../src/logica/acciones';
import { infoEstado } from '../../../src/logica/estados';
import { formatearFecha, formatearFechaHora, formatearPrecio, textoDiasRestantes } from '../../../src/logica/formato';
import { espacio, radio, tipografia } from '../../../src/tema';

/**
 * Historias 4 a 8: detalle de una compra, su historial y las acciones que le
 * corresponden al usuario según su rol y el estado (FR-012, FR-013).
 */
export default function DetalleCompra() {
  const { id } = useLocalSearchParams();
  const api = useApi();
  const { usuario } = useUsuario();
  const router = useRouter();
  const tema = useTema();
  const [enCurso, setEnCurso] = useState(null);

  const cargar = useCallback(async () => {
    const compra = await api.compras.obtener(id);
    // ¿Ya reseñó? Se ve en las reseñas del organizador (research D5).
    let yaResenio = false;
    if (compra.estado === 'UTILIZADA' && compra.comprador.id === usuario.id) {
      const evento = await api.eventos.obtener(compra.evento.id);
      yaResenio = evento.reseniasDelOrganizador.some(
        (r) => r.evento.id === compra.evento.id && r.comprador.id === usuario.id,
      );
    }
    return { compra, yaResenio };
  }, [api, id, usuario.id]);
  const { datos, cargando, error, recargar } = useRecurso(cargar);

  const compra = datos?.compra;
  const acciones = compra ? accionesDisponibles(compra, usuario.id, new Date(), { yaResenio: datos.yaResenio }) : new Set();
  const esOrganizador = compra?.organizador.id === usuario.id;
  const esComprador = compra?.comprador.id === usuario.id;

  async function ejecutar(accion, pregunta) {
    if (pregunta && !(await confirmar(pregunta))) return;
    setEnCurso(accion);
    try {
      await api.compras.accion(id, accion);
      await recargar();
    } catch (e) {
      avisarError(e);
      recargar();
    } finally {
      setEnCurso(null);
    }
  }

  const dias = compra ? textoDiasRestantes(compra.diasRestantes) : null;

  return (
    <Pantalla margenInferior>
      <EstadoCarga cargando={cargando} error={error} hayDatos={!!datos} alReintentar={recargar}>
        {compra && (
          <ScrollView contentContainerStyle={estilos.contenido}>
            <Pressable
              onPress={() => router.push(`/evento/${compra.evento.id}`)}
              accessibilityRole="link"
              accessibilityLabel={`Evento ${compra.evento.nombre}. Ver el evento`}
            >
              <Text style={[tipografia.titulo, { color: tema.texto }]}>{compra.evento.nombre}</Text>
              <Text style={[tipografia.cuerpo, estilos.enlace, { color: tema.primario }]}>
                {formatearFecha(compra.evento.fecha)} · Ver evento
              </Text>
            </Pressable>

            <View style={estilos.fila}>
              <EtiquetaEstado estado={compra.estado} grande />
              {dias && (
                <View style={[estilos.dias, { backgroundColor: tema.marca }]}>
                  <Text style={[estilos.diasTexto, { color: tema.textoSobreMarca }]}>{dias}</Text>
                </View>
              )}
            </View>

            <View style={[estilos.tarjeta, { backgroundColor: tema.superficie, borderColor: tema.divisor }]}>
              <Dato etiqueta="Entradas" valor={`${compra.tipoEntrada.nombre} × ${compra.cantidad}`} />
              <Dato etiqueta="Total" valor={formatearPrecio(compra.total)} />
              <Dato etiqueta="Comprador" valor={`${compra.comprador.nombre} ${compra.comprador.apellido}${esComprador ? ' (vos)' : ''}`} />
              <Dato etiqueta="Organizador" valor={`${compra.organizador.nombre} ${compra.organizador.apellido}${esOrganizador ? ' (vos)' : ''}`} />
            </View>

            {compra.estado === 'PENDIENTE' && esComprador && !esOrganizador && (
              <Text style={[tipografia.cuerpo, { color: tema.textoSecundario }]}>
                El organizador va a confirmar la compra cuando reciba el pago. Si tenés dudas, escribile por el chat.
              </Text>
            )}

            <View style={estilos.acciones}>
              {acciones.has('confirmar') && (
                <Boton titulo="Confirmar pago" icono="checkmark-circle" cargando={enCurso === 'confirmar'} deshabilitado={!!enCurso}
                  onPress={() => ejecutar('confirmar')} accessibilityHint="Marca la compra como pagada" />
              )}
              {acciones.has('registrarIngreso') && (
                <Boton titulo="Registrar ingreso" icono="enter" cargando={enCurso === 'registrar-ingreso'} deshabilitado={!!enCurso}
                  onPress={() => ejecutar('registrar-ingreso')} accessibilityHint="Marca las entradas como utilizadas" />
              )}
              {acciones.has('rechazar') && (
                <Boton titulo="Rechazar compra" icono="close-circle" variante="peligro" cargando={enCurso === 'rechazar'} deshabilitado={!!enCurso}
                  onPress={() => ejecutar('rechazar', {
                    titulo: '¿Rechazar la compra?',
                    mensaje: 'La compra quedará cancelada y sus entradas vuelven a estar disponibles.',
                    textoConfirmar: 'Rechazar',
                  })} />
              )}
              {acciones.has('cancelar') && (
                <Boton titulo="Cancelar compra" icono="trash" variante="peligro" cargando={enCurso === 'cancelar'} deshabilitado={!!enCurso}
                  onPress={() => ejecutar('cancelar', compra.estado === 'CONFIRMADA'
                    ? { titulo: '¿Cancelar la compra?', mensaje: `Se te reembolsará el total de ${formatearPrecio(compra.total)}.`, textoConfirmar: 'Cancelar y reembolsar' }
                    : { titulo: '¿Cancelar la compra?', mensaje: 'La compra quedará cancelada.', textoConfirmar: 'Cancelar compra' })} />
              )}
              {acciones.has('reseniar') && (
                <Boton titulo="Reseñar el evento" icono="star" variante="secundario"
                  onPress={() => router.push({ pathname: '/compra/[id]/reseniar', params: { id, eventoId: compra.evento.id, nombre: compra.evento.nombre } })} />
              )}
              {acciones.has('chatear') && (
                <Boton titulo={esOrganizador && !esComprador ? 'Chat con el comprador' : 'Chat con el organizador'} icono="chatbubbles" variante="secundario"
                  onPress={() => router.push(`/compra/${id}/chat`)} />
              )}
            </View>

            <Text style={[tipografia.subtitulo, { color: tema.texto }]} accessibilityRole="header">
              Historial
            </Text>
            <View style={estilos.historial}>
              {compra.historial.map((cambio, i) => (
                <View
                  key={`${cambio.estado}-${i}`}
                  style={estilos.paso}
                  accessible
                  accessibilityLabel={`${infoEstado(cambio.estado).etiqueta}, por ${cambio.quien.nombre} ${cambio.quien.apellido}, el ${formatearFechaHora(cambio.fechaHora)}`}
                >
                  <View style={[estilos.punto, { backgroundColor: infoEstado(cambio.estado).texto }]} />
                  <View style={estilos.pasoTexto}>
                    <EtiquetaEstado estado={cambio.estado} />
                    <Text style={[tipografia.chico, { color: tema.textoSecundario }]}>
                      {cambio.quien.nombre} {cambio.quien.apellido} · {formatearFechaHora(cambio.fechaHora)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </EstadoCarga>
    </Pantalla>
  );
}

function Dato({ etiqueta, valor }) {
  const tema = useTema();
  return (
    <View style={estilos.dato}>
      <Text style={[tipografia.chico, { color: tema.textoSecundario }]}>{etiqueta}</Text>
      <Text style={[tipografia.cuerpoFuerte, estilos.datoValor, { color: tema.texto }]}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacio.l, gap: espacio.l },
  enlace: { textDecorationLine: 'underline', marginTop: espacio.xs },
  fila: { flexDirection: 'row', alignItems: 'center', gap: espacio.s, flexWrap: 'wrap' },
  dias: { paddingHorizontal: espacio.m, paddingVertical: espacio.s, borderRadius: radio.pildora },
  diasTexto: { fontSize: 16, fontWeight: '800' },
  tarjeta: { padding: espacio.l, borderRadius: radio.m, borderWidth: 1, gap: espacio.m },
  dato: { flexDirection: 'row', justifyContent: 'space-between', gap: espacio.m },
  datoValor: { flexShrink: 1, textAlign: 'right' },
  acciones: { gap: espacio.m },
  historial: { gap: espacio.m },
  paso: { flexDirection: 'row', gap: espacio.m, alignItems: 'flex-start' },
  punto: { width: 12, height: 12, borderRadius: 6, marginTop: 8 },
  pasoTexto: { flex: 1, gap: espacio.xs },
});
