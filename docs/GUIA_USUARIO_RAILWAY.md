# Guia consumo de api

Esta guia explica, paso a paso, como un usuario debe consumir la API desplegada en Railway.

## 1) URL base (produccion)

- `https://api-transacciones-production.up.railway.app`

## 2) Flujo obligatorio del usuario

1. Iniciar sesion.
2. Cambiar su contrasena.
3. Identificar el `id` del companero destino.
4. Verificar su saldo actual.
5. Transferir dinero.

## 3) Paso 1 - Login

- **Endpoint:** `POST /auth/login`
- **URL completa:** `https://api-transacciones-production.up.railway.app/auth/login`
- **Body:**

```json
{
  "email": "correo@cun.edu.co",
  "password": "Cun2026*"
}
```

- Guarda el `token` de la respuesta para los siguientes pasos.

## 4) Paso 2 - Cambiar contrasena

- **Endpoint:** `POST /auth/change-password`
- **Header:** `Authorization: Bearer <token>`
- **Body:**

```json
{
  "currentPassword": "Cun2026*",
  "newPassword": "Cun2026*Nueva"
}
```

## 5) Tabla de usuarios (ID, Nombre y AccountID)

Usa esta tabla para identificar el `toAccountId` correcto al transferir.

| ID | Nombre | AccountID |
|---:|---|---:|
| 32 | YURY MARCELA BASILIO SANTOS | 31 |
| 33 | SEBASTIAN CARCAMO PERALTA | 32 |
| 34 | DANIEL JOSE CARDENAS ORTEGA | 33 |
| 35 | JUAN DAVID CARDENAS SANCHEZ | 34 |
| 36 | SAUL JULIAN GUTIERREZ ROMAN | 35 |
| 37 | LUIFER ANDRES HERNANDEZ LAMBRAÑO | 36 |
| 38 | JAVIER CAMILO MARTINEZ MEDINA | 37 |
| 39 | ADRIAN JOSE ORTIZ RUBIO | 38 |
| 40 | EDWARD ORVEY OVALLE ARIAS | 39 |
| 41 | MARCOS ANTONIO PACHECO BAUTISTA | 40 |
| 42 | BRUS ANGEL PATERNINA BERTEL | 41 |
| 43 | RAFAEL ANTONIO RODRIGUEZ GAMARRA | 42 |
| 44 | SERGIO ESTEBAN VELOZA GONZALEZ | 43 |
| 45 | BRAYAN ANDRES VILORIA NAVARRO | 44 |
| 46 | FABER ALEMAN | 45 |

## 6) Paso 3 - Verificar saldo

- **Endpoint:** `GET /accounts/me`
- **Header:** `Authorization: Bearer <token>`
- **URL completa:** `https://api-transacciones-production.up.railway.app/accounts/me`

Respuesta esperada:

```json
[
  {
    "id": 15,
    "number": "ACC-2026-0015",
    "balance": "6500",
    "createdAt": "2026-04-26T15:11:30.000Z"
  }
]
```

> `id` es tu `fromAccountId` para transferir.

## 7) Paso 4 - Transferir dinero

- **Endpoint:** `POST /transactions`
- **Header:** `Authorization: Bearer <token>`
- **Body ejemplo (de Faber a Yury):**

```json
{
  "fromAccountId": 15,
  "toAccountId": 1,
  "amount": 120,
  "note": "Transferencia de prueba"
}
```

La respuesta incluye:

- nombre del propietario origen y destino
- monto enviado
- saldo antes y despues en ambas cuentas

## 8) Verificar historial personal

- **Endpoint:** `GET /transactions/me`
- **Header:** `Authorization: Bearer <token>`

## 9) Errores comunes

- `401`: token invalido o credenciales incorrectas.
- `403`: intentas transferir desde una cuenta que no es tuya.
- `404`: cuenta destino no existe.
- `409`: saldo insuficiente.
