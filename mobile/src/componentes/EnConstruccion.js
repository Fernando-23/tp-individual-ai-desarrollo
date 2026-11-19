import { EstadoCarga } from './EstadoCarga';
import { Pantalla } from './Pantalla';

/** Marcador temporal para las pantallas de historias todavía no implementadas. */
export function EnConstruccion({ que }) {
  return (
    <Pantalla>
      <EstadoCarga vacio iconoVacio="construct-outline" mensajeVacio={`${que}: llega en una próxima historia.`} />
    </Pantalla>
  );
}
