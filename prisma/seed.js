import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const students = [
  { name: "YURY MARCELA BASILIO SANTOS", email: "yury.bacilio@cun.edu.co", initialBalance: 5200 },
  { name: "SEBASTIAN CARCAMO PERALTA", email: "sebastian.carcamo@cun.edu.co", initialBalance: 4900 },
  { name: "DANIEL JOSE CARDENAS ORTEGA", email: "daniel.cardenaso@cun.edu.co", initialBalance: 6100 },
  { name: "JUAN DAVID CARDENAS SANCHEZ", email: "juan.cardenas@cun.edu.co", initialBalance: 7000 },
  { name: "SAUL JULIAN GUTIERREZ ROMAN", email: "saul.gutierrez@cun.edu.co", initialBalance: 4500 },
  { name: "LUIFER ANDRES HERNANDEZ LAMBRAÑO", email: "luifer.hernandez@cun.edu.co", initialBalance: 5300 },
  { name: "JAVIER CAMILO MARTINEZ MEDINA", email: "javier.martinezmme@cun.edu.co", initialBalance: 6800 },
  { name: "ADRIAN JOSE ORTIZ RUBIO", email: "adrian.ortiz@cun.edu.co", initialBalance: 7200 },
  { name: "EDWARD ORVEY OVALLE ARIAS", email: "edward.ovalle@cun.edu.co", initialBalance: 5800 },
  { name: "MARCOS ANTONIO PACHECO BAUTISTA", email: "marcos.pacheco@cun.edu.co", initialBalance: 7600 },
  { name: "BRUS ANGEL PATERNINA BERTEL", email: "brus.paternina@cun.edu.co", initialBalance: 5000 },
  { name: "RAFAEL ANTONIO RODRIGUEZ GAMARRA", email: "rafael.rodriguezgam@cun.edu.co", initialBalance: 4700 },
  { name: "SERGIO ESTEBAN VELOZA GONZALEZ", email: "sergio.velozag@cun.edu.co", initialBalance: 6400 },
  { name: "BRAYAN ANDRES VILORIA NAVARRO", email: "brayan.viloria@cun.edu.co", initialBalance: 6900 },
  { name: "FABER ALEMAN", email: "faber_aleman@cun.edu.co", initialBalance: 6500 }
];

const transferPlan = [
  { from: 0, to: 1, amount: 250, note: "Pago de materiales" },
  { from: 2, to: 3, amount: 180, note: "Reintegro parcial" },
  { from: 4, to: 5, amount: 320, note: "Transferencia de practica" },
  { from: 6, to: 7, amount: 150, note: "Ajuste semanal" },
  { from: 8, to: 9, amount: 410, note: "Pago de servicio" },
  { from: 10, to: 11, amount: 210, note: "Transferencia interna" },
  { from: 12, to: 13, amount: 350, note: "Prueba final de consumo API" }
];

async function main() {
  const defaultPassword = "Cun2026*";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // Limpieza para poder re-ejecutar seed sin errores.
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers = [];
  const createdAccounts = [];

  for (let i = 0; i < students.length; i += 1) {
    const student = students[i];
    const user = await prisma.user.create({
      data: {
        name: student.name,
        email: student.email,
        passwordHash
      }
    });

    const account = await prisma.account.create({
      data: {
        userId: user.id,
        number: `ACC-2026-${String(i + 1).padStart(4, "0")}`,
        balance: student.initialBalance
      }
    });

    createdUsers.push(user);
    createdAccounts.push(account);
  }

  for (const movement of transferPlan) {
    const fromAccount = createdAccounts[movement.from];
    const toAccount = createdAccounts[movement.to];
    const actorUser = createdUsers[movement.from];

    await prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: fromAccount.id },
        data: { balance: { decrement: movement.amount } }
      });
      await tx.account.update({
        where: { id: toAccount.id },
        data: { balance: { increment: movement.amount } }
      });
      await tx.transaction.create({
        data: {
          fromAccountId: fromAccount.id,
          toAccountId: toAccount.id,
          amount: movement.amount,
          note: movement.note,
          createdById: actorUser.id
        }
      });
    });
  }

  console.log("Seed completado.");
  console.log(`Usuarios creados: ${createdUsers.length}`);
  console.log(`Contrasena temporal para todos: ${defaultPassword}`);
}

main()
  .catch((error) => {
    console.error("Error ejecutando seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
