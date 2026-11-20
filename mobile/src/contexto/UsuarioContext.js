import { createContext, useContext, useMemo, useState } from 'react';
import { crearCliente } from '../api/cliente';
import { crearEndpoints } from '../api/endpoints';

/**
 * Usuario actual (constitución, Principio V) y acceso a la API.
 * No se persiste: se elige al abrir la app (spec, Assumptions).
 */
const UsuarioContext = createContext(null);

export function UsuarioProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  // El cliente se rearma cuando cambia el usuario: así cada pedido lleva el
  // X-Usuario-Id correcto, y las pantallas (cuyos `cargar` dependen de `api`)
  // vuelven a pedir sus datos solas al cambiar de usuario.
  const api = useMemo(() => {
    const cliente = crearCliente({
      baseUrl: process.env.EXPO_PUBLIC_API_URL,
      obtenerUsuarioId: () => usuario?.id ?? null,
      // Si el servidor no reconoce al usuario (por ejemplo, se reinició), se vuelve a elegir.
      alNoIdentificado: () => setUsuario(null),
    });
    return crearEndpoints(cliente);
  }, [usuario]);

  const valor = useMemo(
    () => ({ usuario, elegir: setUsuario, salir: () => setUsuario(null), api }),
    [usuario, api],
  );

  return <UsuarioContext.Provider value={valor}>{children}</UsuarioContext.Provider>;
}

export function useUsuario() {
  const contexto = useContext(UsuarioContext);
  if (!contexto) throw new Error('useUsuario debe usarse dentro de UsuarioProvider');
  return contexto;
}

/** Atajo para las pantallas: los endpoints ya armados con el cliente del usuario actual. */
export function useApi() {
  return useUsuario().api;
}
