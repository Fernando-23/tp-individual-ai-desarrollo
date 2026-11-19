import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { UsuarioProvider, useUsuario } from '../src/contexto/UsuarioContext';
import { useTema } from '../src/hooks/useTema';

/**
 * Raíz de la navegación: Stack con las pestañas y las pantallas de detalle.
 * Sin usuario elegido, siempre se vuelve a /elegir-usuario (FR-008 y caso
 * borde "el usuario dejó de existir": el cliente HTTP borra el usuario ante un 401).
 */
function Navegacion() {
  const { usuario } = useUsuario();
  const segmentos = useSegments();
  const router = useRouter();
  const tema = useTema();

  useEffect(() => {
    if (!usuario && segmentos[0] !== 'elegir-usuario') {
      router.replace('/elegir-usuario');
    }
  }, [usuario, segmentos, router]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: tema.marca },
          headerTintColor: tema.textoSobreMarca,
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: tema.fondo },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="elegir-usuario" options={{ headerShown: false }} />
        <Stack.Screen name="evento/[id]" options={{ title: 'Evento' }} />
        <Stack.Screen name="compra/[id]/index" options={{ title: 'Compra' }} />
        <Stack.Screen name="compra/[id]/chat" options={{ title: 'Chat' }} />
        <Stack.Screen name="compra/[id]/reseniar" options={{ title: 'Reseñar', presentation: 'modal' }} />
        <Stack.Screen name="ventas/[eventoId]" options={{ title: 'Ventas' }} />
        <Stack.Screen name="publicar" options={{ title: 'Publicar evento', presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function Raiz() {
  return (
    <UsuarioProvider>
      <Navegacion />
    </UsuarioProvider>
  );
}
