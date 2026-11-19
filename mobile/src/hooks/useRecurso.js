import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

/**
 * Carga los datos de una pantalla cada vez que gana el foco (research D3), así
 * después de comprar, cancelar o confirmar, al volver se ven datos frescos.
 * Devuelve { datos, cargando, error, recargar, setDatos }.
 * `cargar` debe ser estable (useCallback) o cambiar solo cuando cambian sus datos.
 */
export function useRecurso(cargar) {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: null });
  const pedidoActual = useRef(0);

  const recargar = useCallback(async () => {
    const numero = ++pedidoActual.current;
    setEstado((previo) => ({ ...previo, cargando: true, error: null }));
    try {
      const datos = await cargar();
      // Si mientras tanto se lanzó otro pedido, esta respuesta vieja se ignora.
      if (numero === pedidoActual.current) setEstado({ datos, cargando: false, error: null });
    } catch (error) {
      if (numero === pedidoActual.current) setEstado((previo) => ({ ...previo, cargando: false, error }));
    }
  }, [cargar]);

  useFocusEffect(
    useCallback(() => {
      recargar();
    }, [recargar]),
  );

  const setDatos = useCallback((actualizar) => {
    setEstado((previo) => ({
      ...previo,
      datos: typeof actualizar === 'function' ? actualizar(previo.datos) : actualizar,
    }));
  }, []);

  return { ...estado, recargar, setDatos };
}
