import { StyleSheet, Text, View } from 'react-native';

// Pantalla mínima de T005: solo verifica que la app abre en Expo Go.
// Se reemplaza por las pestañas en US2.
export default function Inicio() {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo} accessibilityRole="header">AI Ticket It</Text>
      <Text style={estilos.lema}>Entradas a un click</Text>
      <Text style={estilos.detalle}>API: {process.env.EXPO_PUBLIC_API_URL ?? 'sin configurar'}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F8F6', padding: 24 },
  titulo: { fontSize: 32, fontWeight: '800', color: '#111111' },
  lema: { fontSize: 16, letterSpacing: 2, color: '#3A3A3A', marginTop: 8 },
  detalle: { fontSize: 14, color: '#3A3A3A', marginTop: 24, textAlign: 'center' },
});
