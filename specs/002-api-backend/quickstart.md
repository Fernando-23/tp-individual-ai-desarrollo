# Quickstart: Backend de AI Ticket It

**Requisitos**: Node.js 22.12+ (se desarrolló con 24.19) y npm.

## Levantar el servidor

```bash
cd backend
npm install
npm start        # o npm run dev para recargar al guardar
```

Al arrancar imprime algo como:

```text
AI Ticket It escuchando en el puerto 3000
  Local:      http://localhost:3000/api
  Red local:  http://192.168.0.15:3000/api   ← usar esta en EXPO_PUBLIC_API_URL
Datos de demostración cargados: 4 usuarios, 8 eventos, 11 compras
```

El puerto se cambia con la variable `PORT`.

Si la PC tiene adaptadores virtuales (WSL, VirtualBox, VPN), aparecen varias
líneas "Red local". Hay que usar la de la placa Wi-Fi: suele ser
`192.168.x.x`, y en Windows se confirma con `ipconfig`.

## Tests y lint

```bash
cd backend
npm test
npm run lint
```

## Recorrido rápido con curl (Git Bash)

```bash
API=http://localhost:3000/api

curl -s $API/usuarios
curl -s "$API/eventos?texto=jazz"
curl -s "$API/eventos?orden=precio"

# Leo ve sus compras: k-001 CONFIRMADA con diasRestantes 10
curl -s $API/mis-compras -H "X-Usuario-Id: u-leo"

# Ana ve las ventas de Noche de Jazz y confirma la compra pendiente de Sofía
curl -s $API/eventos/e-jazz/ventas -H "X-Usuario-Id: u-ana"
curl -s -X POST $API/compras/k-002/confirmar -H "X-Usuario-Id: u-ana"

# Sofía compra 2 VIP de Rock en el Parque
curl -s -X POST $API/compras -H "X-Usuario-Id: u-sofi" -H "Content-Type: application/json" \
  -d '{"eventoId":"e-rock","tipoEntradaId":"t-rock-vip","cantidad":2}'

# Errores: sin usuario → 401; Leo intenta confirmar → 403
curl -s -i -X POST $API/compras/k-002/confirmar | head -1
curl -s -X POST $API/compras/k-003/confirmar -H "X-Usuario-Id: u-leo"
```

## Probar desde el celular

1. Conectar la PC y el celular a la misma red Wi-Fi.
2. Abrir en el navegador del celular la URL "Red local" que imprime el
   servidor, más `/salud`. Debe responder `{"ok":true}`.
3. Si no responde, revisar el firewall de Windows: hay que permitir Node.js
   en las redes privadas.
