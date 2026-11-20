import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTema } from '../hooks/useTema';
import { espacio, radio, TAMANO_TACTIL, tipografia } from '../tema';

/**
 * Campo de formulario con etiqueta visible y error debajo (FR-018, FR-019):
 * el error se anuncia y el borde se vuelve más grueso, no solo de otro color.
 */
export function Campo({ etiqueta, error, opcional = false, multiline = false, estilo, ...props }) {
  const tema = useTema();
  return (
    <View style={[estilos.campo, estilo]}>
      <Text style={[tipografia.cuerpoFuerte, { color: tema.texto }]}>
        {etiqueta}
        {opcional ? <Text style={{ color: tema.textoSecundario, fontWeight: '400' }}> (opcional)</Text> : null}
      </Text>
      <TextInput
        accessibilityLabel={opcional ? `${etiqueta}, opcional` : etiqueta}
        accessibilityHint={error}
        placeholderTextColor={tema.textoSecundario}
        multiline={multiline}
        style={[
          estilos.entrada,
          multiline && estilos.multilinea,
          { color: tema.texto, backgroundColor: tema.superficie, borderColor: error ? tema.error : tema.borde, borderWidth: error ? 2.5 : 1.5 },
        ]}
        {...props}
      />
      {error ? (
        <Text style={[tipografia.chico, { color: tema.error }]} accessibilityLiveRegion="polite">
          ⚠ {error}
        </Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: { gap: espacio.xs },
  entrada: { minHeight: TAMANO_TACTIL, fontSize: 16, paddingHorizontal: espacio.m, paddingVertical: espacio.s, borderRadius: radio.m },
  multilinea: { minHeight: 100, textAlignVertical: 'top' },
});
