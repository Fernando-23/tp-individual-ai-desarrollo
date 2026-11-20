import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApi, useUsuario } from '../../../src/contexto/UsuarioContext';
import { usePolling } from '../../../src/hooks/usePolling';
import { useRecurso } from '../../../src/hooks/useRecurso';
import { useTema } from '../../../src/hooks/useTema';
import { avisarError } from '../../../src/componentes/avisos';
import { EstadoCarga } from '../../../src/componentes/EstadoCarga';
import { ZonaLista } from '../../../src/componentes/ZonaLista';
import { formatearHora } from '../../../src/logica/formato';
import { espacio, radio, TAMANO_TACTIL, tipografia } from '../../../src/tema';

const INTERVALO_MS = 4000;

/**
 * Historia 7: chat de la compra entre comprador y organizador (FR-014).
 * Mientras está en pantalla, se actualiza solo cada 4 s (decisión Q1: A).
 */
export default function Chat() {
  const { id, evento } = useLocalSearchParams();
  const api = useApi();
  const { usuario } = useUsuario();
  const tema = useTema();
  const insets = useSafeAreaInsets();
  const lista = useRef(null);
  const contenedor = useRef(null);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [tecladoAbierto, setTecladoAbierto] = useState(false);
  const [desplazamiento, setDesplazamiento] = useState(0);

  // Con el teclado abierto: sin el margen de la barra de navegación (quedaba una
  // franja blanca) y la lista baja hasta el último mensaje.
  useEffect(() => {
    const mostrar = Keyboard.addListener('keyboardDidShow', () => {
      setTecladoAbierto(true);
      lista.current?.scrollToEnd({ animated: true });
    });
    const ocultar = Keyboard.addListener('keyboardDidHide', () => setTecladoAbierto(false));
    return () => {
      mostrar.remove();
      ocultar.remove();
    };
  }, []);

  // El desplazamiento del teclado es la posición real de la pantalla bajo el
  // encabezado, medida (sin números fijos que dependen del celular).
  const medir = useCallback(() => {
    contenedor.current?.measureInWindow((_x, y) => setDesplazamiento(y));
  }, []);

  const cargar = useCallback(() => api.compras.mensajes(id), [api, id]);
  const { datos: mensajes, cargando, error, recargar } = useRecurso(cargar);
  usePolling(recargar, INTERVALO_MS);

  const puedeEnviar = texto.trim().length > 0 && !enviando;

  async function enviar() {
    if (!puedeEnviar) return;
    setEnviando(true);
    try {
      await api.compras.enviarMensaje(id, texto.trim());
      setTexto('');
      await recargar();
    } catch (e) {
      avisarError(e, 'No se pudo enviar el mensaje');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      ref={contenedor}
      onLayout={medir}
      style={[estilos.pantalla, { backgroundColor: tema.fondo }]}
      behavior="padding"
      keyboardVerticalOffset={desplazamiento}
    >
      {evento ? (
        <View style={[estilos.contexto, { borderBottomColor: tema.divisor }]}>
          <Ionicons name="ticket-outline" size={18} color={tema.textoSecundario} />
          <Text style={[tipografia.chico, estilos.contextoTexto, { color: tema.textoSecundario }]} numberOfLines={1}>
            {evento}
          </Text>
        </View>
      ) : null}

      <ZonaLista>
        <EstadoCarga
          cargando={cargando}
          error={error}
          hayDatos={!!mensajes}
          vacio={mensajes?.length === 0}
          mensajeVacio="Todavía no hay mensajes. Escribí una consulta sobre el evento, el acceso o un cambio de fecha."
          iconoVacio="chatbubbles-outline"
          alReintentar={recargar}
        >
          <FlatList
            ref={lista}
            data={mensajes ?? []}
            keyExtractor={(m, i) => `${m.enviado}-${i}`}
            style={estilos.flex}
            contentContainerStyle={estilos.lista}
            onContentSizeChange={() => lista.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => {
              const propio = item.usuario.id === usuario.id;
              return (
                <View
                  style={[estilos.burbuja, propio ? estilos.propia : estilos.ajena, { backgroundColor: propio ? tema.burbujaPropia : tema.burbujaAjena }]}
                  accessible
                  accessibilityLabel={`${propio ? 'Vos' : `${item.usuario.nombre} ${item.usuario.apellido}`}, a las ${formatearHora(item.enviado)}: ${item.mensaje}`}
                >
                  {!propio && (
                    <Text style={[estilos.autor, { color: tema.textoBurbujaAjena }]}>
                      {item.usuario.nombre} {item.usuario.apellido}
                    </Text>
                  )}
                  <Text style={[tipografia.cuerpo, { color: propio ? tema.textoBurbujaPropia : tema.textoBurbujaAjena }]}>{item.mensaje}</Text>
                  <Text style={[estilos.hora, { color: propio ? tema.textoBurbujaPropia : tema.textoSecundario }]}>{formatearHora(item.enviado)}</Text>
                </View>
              );
            }}
          />
        </EstadoCarga>
      </ZonaLista>

      <View style={[estilos.barra, { backgroundColor: tema.superficie, borderTopColor: tema.divisor, paddingBottom: (tecladoAbierto ? 0 : insets.bottom) + espacio.s }]}>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Escribí un mensaje"
          placeholderTextColor={tema.textoSecundario}
          accessibilityLabel="Mensaje"
          multiline
          maxLength={500}
          style={[estilos.entrada, { color: tema.texto, borderColor: tema.borde, backgroundColor: tema.fondo }]}
        />
        <Pressable
          onPress={enviar}
          disabled={!puedeEnviar}
          accessibilityRole="button"
          accessibilityLabel="Enviar mensaje"
          accessibilityState={{ disabled: !puedeEnviar, busy: enviando }}
          style={[estilos.enviar, { backgroundColor: tema.primario, opacity: puedeEnviar ? 1 : 0.5 }]}
        >
          <Ionicons name="send" size={22} color={tema.textoSobrePrimario} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  flex: { flex: 1 },
  contexto: { flexDirection: 'row', alignItems: 'center', gap: espacio.s, paddingHorizontal: espacio.l, paddingVertical: espacio.s, borderBottomWidth: 1 },
  contextoTexto: { flex: 1, fontWeight: '700' },
  lista: { padding: espacio.l, gap: espacio.s },
  burbuja: { maxWidth: '82%', padding: espacio.m, borderRadius: radio.l, gap: 2 },
  propia: { alignSelf: 'flex-end', borderBottomRightRadius: radio.s },
  ajena: { alignSelf: 'flex-start', borderBottomLeftRadius: radio.s },
  autor: { fontSize: 13, fontWeight: '800' },
  hora: { fontSize: 12, alignSelf: 'flex-end' },
  barra: { flexDirection: 'row', alignItems: 'flex-end', gap: espacio.s, paddingHorizontal: espacio.m, paddingTop: espacio.s, borderTopWidth: 1 },
  entrada: { flex: 1, minHeight: TAMANO_TACTIL, maxHeight: 120, fontSize: 16, paddingHorizontal: espacio.m, paddingVertical: espacio.s, borderRadius: radio.l, borderWidth: 1.5 },
  enviar: { width: TAMANO_TACTIL, height: TAMANO_TACTIL, borderRadius: TAMANO_TACTIL / 2, alignItems: 'center', justifyContent: 'center' },
});
