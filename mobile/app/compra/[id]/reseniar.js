import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApi } from '../../../src/contexto/UsuarioContext';
import { useTema } from '../../../src/hooks/useTema';
import { avisarError } from '../../../src/componentes/avisos';
import { Boton } from '../../../src/componentes/Boton';
import { Estrellas } from '../../../src/componentes/Estrellas';
import { Pantalla } from '../../../src/componentes/Pantalla';
import { espacio, radio, tipografia } from '../../../src/tema';

const TEXTOS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

/** Historia 8: reseñar un evento al que se asistió (FR-016). */
export default function Reseniar() {
  const { eventoId, nombre } = useLocalSearchParams();
  const api = useApi();
  const router = useRouter();
  const tema = useTema();
  const [puntuacion, setPuntuacion] = useState(0);
  const [detalle, setDetalle] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    setEnviando(true);
    try {
      await api.eventos.reseniar(eventoId, { puntuacion, detalle: detalle.trim() });
      Alert.alert('¡Gracias por tu reseña!', 'Ayuda a otras personas a elegir sus próximos eventos.', [
        { text: 'Listo', onPress: () => router.back() },
      ]);
    } catch (e) {
      avisarError(e, 'No se pudo enviar la reseña');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Pantalla margenInferior>
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <Text style={[tipografia.titulo, { color: tema.texto }]} accessibilityRole="header">
          ¿Qué te pareció {nombre ?? 'el evento'}?
        </Text>
        <Text style={[tipografia.cuerpo, { color: tema.textoSecundario }]}>Tocá las estrellas para puntuar de 1 a 5.</Text>

        <Estrellas editable valor={puntuacion} onCambiar={setPuntuacion} />
        <Text style={[tipografia.cuerpoFuerte, { color: tema.texto }]} accessibilityLiveRegion="polite">
          {puntuacion ? `${puntuacion} de 5 · ${TEXTOS[puntuacion]}` : 'Sin puntuar todavía'}
        </Text>

        <Text style={[tipografia.cuerpoFuerte, { color: tema.texto }]}>Comentario (opcional)</Text>
        <TextInput
          value={detalle}
          onChangeText={setDetalle}
          placeholder="Contá cómo fue tu experiencia"
          placeholderTextColor={tema.textoSecundario}
          accessibilityLabel="Comentario, opcional"
          multiline
          maxLength={500}
          style={[estilos.comentario, { color: tema.texto, borderColor: tema.borde, backgroundColor: tema.superficie }]}
        />

        <Boton
          titulo="Enviar reseña"
          icono="send"
          onPress={enviar}
          cargando={enviando}
          deshabilitado={puntuacion === 0}
          accessibilityHint={puntuacion === 0 ? 'Primero elegí una puntuación' : undefined}
        />
      </ScrollView>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacio.l, gap: espacio.l },
  comentario: { minHeight: 120, textAlignVertical: 'top', fontSize: 16, padding: espacio.m, borderRadius: radio.m, borderWidth: 1.5 },
});
