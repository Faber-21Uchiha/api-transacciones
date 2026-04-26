import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "faber_aleman@cun.edu.co";
  const name = "FABER ALEMAN";
  const password = "Cun2026*";

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    console.log(`El usuario ya existe con id: ${exists.id}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash }
  });

  const account = await prisma.account.create({
    data: {
      userId: user.id,
      number: "ACC-2026-0015",
      balance: 6500
    }
  });

  console.log(`Usuario creado: ${user.id} - ${user.email}`);
  console.log(`Cuenta creada: ${account.id} - ${account.number} - saldo ${account.balance.toString()}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
