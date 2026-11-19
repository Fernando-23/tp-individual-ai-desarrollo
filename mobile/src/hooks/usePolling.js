import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

/**
 * Repite `accion` cada `intervaloMs` solo mientras la pantalla está en foco
 * (chat que se actualiza solo, FR-014; research D8). Al salir, se detiene.
 */
export function usePolling(accion, intervaloMs) {
  useFocusEffect(
    useCallback(() => {
      const id = setInterval(accion, intervaloMs);
      return () => clearInterval(id);
    }, [accion, intervaloMs]),
  );
}
