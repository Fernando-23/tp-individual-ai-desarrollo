import { claro } from '../tema';

/**
 * Paleta actual. Hoy hay solo `claro`; para el modo oscuro (T044) se elige
 * acá con useColorScheme() de react-native, sin tocar las pantallas.
 */
export function useTema() {
  return claro;
}
