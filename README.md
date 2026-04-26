# API de Transacciones (Ejercicio)

Proyecto base para evaluar consumo de API con autenticacion, CRUD y transferencias entre cuentas.

## 1) Requisitos

- Node.js 20+
- PostgreSQL

## 2) Configuracion

1. Copiar variables:
   - Windows PowerShell: `copy .env.example .env`
2. Editar `DATABASE_URL` y `JWT_SECRET` en `.env`.
3. Instalar dependencias:
   - `npm install`
4. Generar cliente Prisma y migrar:
   - `npx prisma generate`
   - `npx prisma migrate dev --name init`
5. Ejecutar API:
   - `npm run dev`

## 3) Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /accounts/me`
- `GET /accounts/:id`
- `POST /transactions`
- `GET /transactions/me`

Ver contrato completo en `docs/openapi.yaml`.
Guia funcional paso a paso en `docs/GUIA_CONSUMO_API.md`.

## 4) Reglas de negocio de transferencia

- Usuario debe estar autenticado.
- Cuenta origen debe pertenecer al usuario autenticado.
- Cuenta origen y destino deben existir.
- Monto debe ser mayor a 0.
- Debe existir saldo suficiente.
- Debito y credito se ejecutan dentro de una transaccion de base de datos.

## 5) Postman

Importar `docs/postman_collection.json` y ejecutar en este orden:

1. Register
2. Login (guarda token automaticamente)
3. Mis cuentas
4. Transferencia

## 6) Rubrica sugerida (100 pts)

- Autenticacion y seguridad basica: 25 pts
- Correcto consumo de endpoints: 25 pts
- Manejo de errores HTTP: 20 pts
- Validaciones de negocio: 20 pts
- Calidad de codigo/documentacion: 10 pts
# api-transacciones
