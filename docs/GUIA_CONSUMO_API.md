# Guia de Consumo - API Transacciones

Esta guia explica como autenticarte, consultar cuentas y ejecutar transferencias de forma correcta.

## 1) URL base

- Local: `http://localhost:3000`
- Health check: `GET /health`

## 2) Autenticacion

La API usa JWT en header:

- `Authorization: Bearer <token>`

Primero debes hacer login para obtener el token.

## 3) Flujo recomendado de uso

1. Registrar usuario (`POST /auth/register`) o usar uno existente.
2. Iniciar sesion (`POST /auth/login`) y guardar `token`.
3. Consultar cuentas (`GET /accounts/me`) para obtener `fromAccountId`.
4. Obtener cuenta destino (de otro usuario) para `toAccountId`.
5. Ejecutar transferencia (`POST /transactions`).
6. Consultar historial (`GET /transactions/me`).

## 4) Endpoints con ejemplos

### 4.1 Registrar usuario

- **Metodo:** `POST /auth/register`
- **Body:**

```json
{
  "name": "Usuario Demo",
  "email": "demo@correo.com",
  "password": "123456"
}
```

- **Respuesta esperada:** `201`

```json
{
  "id": 16,
  "name": "Usuario Demo",
  "email": "demo@correo.com"
}
```

### 4.2 Login

- **Metodo:** `POST /auth/login`
- **Body:**

```json
{
  "email": "faber_aleman@cun.edu.co",
  "password": "Cun2026*"
}
```

- **Respuesta esperada:** `200`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "user": {
    "id": 15,
    "name": "FABER ALEMAN",
    "email": "faber_aleman@cun.edu.co",
    "role": "USER"
  }
}
```

### 4.3 Mis cuentas

- **Metodo:** `GET /accounts/me`
- **Header:** `Authorization: Bearer <token>`
- **Respuesta esperada:** `200`

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

### 4.4 Transferencia

- **Metodo:** `POST /transactions`
- **Header:** `Authorization: Bearer <token>`
- **Body:**

```json
{
  "fromAccountId": 15,
  "toAccountId": 1,
  "amount": 120,
  "note": "Pago de prueba"
}
```

- **Respuesta esperada:** `201`

```json
{
  "transactionId": 8,
  "amountSent": 120,
  "fromAccount": {
    "id": 15,
    "number": "ACC-2026-0015",
    "ownerName": "FABER ALEMAN",
    "balanceBefore": 6500,
    "balanceAfter": 6380
  },
  "toAccount": {
    "id": 1,
    "number": "ACC-2026-0001",
    "ownerName": "YURY MARCELA BASILIO SANTOS",
    "balanceBefore": 5200,
    "balanceAfter": 5320
  },
  "note": "Pago de prueba",
  "createdAt": "2026-04-26T15:15:10.000Z"
}
```

### 4.5 Historial

- **Metodo:** `GET /transactions/me`
- **Header:** `Authorization: Bearer <token>`
- **Respuesta esperada:** `200`

```json
[
  {
    "id": 8,
    "fromAccountId": 15,
    "toAccountId": 1,
    "amount": "120",
    "note": "Pago de prueba",
    "createdById": 15,
    "createdAt": "2026-04-26T15:15:10.000Z"
  }
]
```

## 5) Reglas de negocio de transferencias

- El usuario debe estar autenticado.
- La cuenta origen debe pertenecer al usuario autenticado.
- La cuenta origen y destino deben existir.
- `amount` debe ser mayor que `0`.
- El saldo de la cuenta origen debe ser suficiente.
- Debito y credito se ejecutan en una transaccion atomica de base de datos.

## 6) Catalogo de errores

- `400 Bad Request`:
  - datos de transferencia invalidos (`fromAccountId == toAccountId`, `amount <= 0`, campos faltantes)
  - datos invalidos de registro
- `401 Unauthorized`:
  - token ausente, token invalido o credenciales invalidas
- `403 Forbidden`:
  - la cuenta origen no pertenece al usuario autenticado
- `404 Not Found`:
  - cuenta origen o destino no existe
- `409 Conflict`:
  - saldo insuficiente o email ya registrado
- `500 Internal Server Error`:
  - error no controlado del servidor

## 7) Pruebas minimas en Postman

1. **Happy path:** login -> cuentas -> transferencia valida -> historial
2. **Saldo insuficiente:** transferir monto mayor al saldo (`409`)
3. **Cuenta inexistente:** usar `toAccountId` no existente (`404`)
4. **Token invalido:** enviar token alterado (`401`)
5. **Cuenta no propia:** usar `fromAccountId` de otro usuario (`403`)

## 8) Endpoints de administrador

Solo usuarios con rol `ADMIN` pueden usar:

- `GET /admin/users`: lista todos los usuarios y sus cuentas.
- `GET /admin/accounts`: lista todas las cuentas con su propietario.
- `GET /admin/transactions`: lista global de transferencias.

Admin seed por defecto:

- `email`: `admin@cun.edu.co`
- `password`: `Admin2026*`

## 9) Recursos de documentacion

- Contrato OpenAPI: `docs/openapi.yaml`
- Coleccion Postman: `docs/postman_collection.json`
