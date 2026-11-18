/**
 * Arranque del backend: crea los repositorios en memoria, carga los datos de
 * demostración, arma la app y escucha en todas las interfaces, para que el
 * celular pueda conectarse por la red local (research D13).
 */
import { networkInterfaces } from 'node:os';
import { crearApp } from './app.js';
import { crearRepositorios } from './repositories/repositorioEnMemoria.js';
import { cargarDatosDemo } from './seed/datosDemo.js';

const PUERTO = Number(process.env.PORT ?? 3000);

function ipsDeLaRedLocal() {
  return Object.values(networkInterfaces())
    .flat()
    .filter((red) => red && red.family === 'IPv4' && !red.internal)
    .map((red) => red.address);
}

const repositorios = crearRepositorios();
const resumen = cargarDatosDemo(repositorios, new Date());
const app = crearApp({ repositorios });

app.listen(PUERTO, '0.0.0.0', () => {
  console.log(`AI Ticket It escuchando en el puerto ${PUERTO}`);
  console.log(`  Local:      http://localhost:${PUERTO}/api`);
  for (const ip of ipsDeLaRedLocal()) {
    console.log(`  Red local:  http://${ip}:${PUERTO}/api   ← usar esta en EXPO_PUBLIC_API_URL`);
  }
  console.log(
    `Datos de demostración cargados: ${resumen.usuarios} usuarios, ${resumen.eventos} eventos, ${resumen.compras} compras`,
  );
});
