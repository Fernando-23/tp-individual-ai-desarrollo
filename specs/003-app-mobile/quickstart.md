# Quickstart: App mobile de AI Ticket It

## Requisitos

- Node.js 22.12+ en la PC.
- Un celular Android con **Expo Go** (Play Store), que soporte el SDK 58.
- La PC y el celular en la **misma red Wi-Fi**.

## 1. Levantar el backend

```bash
cd backend
npm install
npm start
```

Anotar la URL "Red local" que imprime, por ejemplo
`http://192.168.0.15:3000/api`. Si aparecen varias, usar la de la placa
Wi-Fi (se confirma con `ipconfig`).

Para verificar desde el celular, abrir esa URL más `/salud` en el navegador:
debe responder `{"ok":true}`. Si no responde, hay que permitir Node.js en el
firewall de Windows para las redes privadas.

## 2. Configurar y levantar la app

```bash
cd mobile
npm install
cp .env.example .env      # y poner la URL del paso 1 en EXPO_PUBLIC_API_URL
npx expo start
```

Escanear el QR con **Expo Go**. La app abre en la pantalla para elegir el
usuario.

Si se cambia `.env`, reiniciar con `npx expo start -c`. La opción `-c`
limpia la caché, que guarda las variables de entorno.

## 3. Tests y lint de la app

```bash
cd mobile
npm test        # lógica pura con Vitest
npm run lint
```

## 4. Recorrido de demo sugerido (flujo del video)

1. Elegir a **Sofía** → Explorar → *Rock en el Parque* → VIP × 2 → Comprar.
   La compra queda **pendiente**.
2. Cambiar a **Ana** → Mis eventos → *Rock en el Parque* → ventas → la
   compra de Sofía → **Confirmar**.
3. Cambiar a **Sofía** → Mis compras → la compra figura **Confirmada · Faltan
   30 días** → Chat → "¿A qué hora abren?".
4. Cambiar a **Ana** → la compra → Chat: el mensaje aparece solo → responder.
5. Para mostrar el ingreso y la reseña: cambiar a **Bruno** → *Risas a
   Medianoche* (es hoy) → la compra de Sofía → **Registrar ingreso**.
   Después, como **Leo** → Mis compras → *Impro Show* (utilizada) →
   **Reseñar**.

## Problemas comunes

| Síntoma | Causa y solución |
|---|---|
| PowerShell: "la ejecución de scripts está deshabilitada" al correr `npm` o `npx` | Política de ejecución de Windows. Sin cambiarla, usar `npm.cmd start` y `npx.cmd expo start` |
| Chrome del celular: "no puede proporcionar una conexión segura" al abrir `/salud` | Chrome fuerza https y el backend de desarrollo es http. No afecta a la app: escribir `http://` explícito y elegir "Continuar al sitio" |
| "No hay conexión con el servidor" | IP equivocada en `.env`, backend apagado o firewall. Probar `/salud` desde el navegador del celular |
| Expo Go: "Project is incompatible" | Versión de Expo Go distinta del SDK: actualizar Expo Go desde la Play Store |
| El QR no conecta con Metro | La red aísla los dispositivos: usar `npx expo start --tunnel`, o el hotspot del celular |
