import { Alert } from 'react-native';

/** Muestra el mensaje del servidor ante una operación rechazada (FR-003). */
export function avisarError(error, titulo = 'No se pudo completar') {
  Alert.alert(titulo, error?.mensaje ?? error?.message ?? 'Ocurrió un error inesperado.');
}

/** Pide confirmación antes de una acción destructiva (FR-007). Devuelve una promesa booleana. */
export function confirmar({ titulo, mensaje, textoConfirmar, destructivo = true }) {
  return new Promise((resolver) => {
    Alert.alert(
      titulo,
      mensaje,
      [
        { text: 'Volver', style: 'cancel', onPress: () => resolver(false) },
        { text: textoConfirmar, style: destructivo ? 'destructive' : 'default', onPress: () => resolver(true) },
      ],
      { cancelable: true, onDismiss: () => resolver(false) },
    );
  });
}
