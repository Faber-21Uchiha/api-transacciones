import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      mustChangePassword: true,
      passwordChangedAt: true,
      lastLoginAt: true,
      createdAt: true,
      accounts: {
        select: { id: true, number: true, balance: true, createdAt: true }
      }
    },
    orderBy: { id: "asc" }
  });
  return res.json(users);
});

router.get("/accounts", async (_req, res) => {
  const accounts = await prisma.account.findMany({
    select: {
      id: true,
      number: true,
      balance: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true, role: true } }
    },
    orderBy: { id: "asc" }
  });
  return res.json(accounts);
});

router.get("/transactions", async (_req, res) => {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      amount: true,
      note: true,
      createdAt: true,
      createdBy: { select: { id: true, name: true, email: true } },
      fromAccount: {
        select: {
          id: true,
          number: true,
          user: { select: { id: true, name: true, email: true } }
        }
      },
      toAccount: {
        select: {
          id: true,
          number: true,
          user: { select: { id: true, name: true, email: true } }
        }
      }
    }
  });
  return res.json(transactions);
});

router.post("/users/:id/reset-password", async (req, res) => {
  const userId = Number(req.params.id);
  const { temporaryPassword } = req.body;

  if (!Number.isInteger(userId) || userId <= 0 || !temporaryPassword || temporaryPassword.length < 6) {
    return res.status(400).json({ error: "Datos invalidos para reset de contrasena" });
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return res.status(404).json({ error: "cuenta destino no existe." });

  const hash = await bcrypt.hash(temporaryPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: hash,
      mustChangePassword: true
    }
  });

  return res.json({
    message: "Contrasena temporal aplicada",
    userId,
    email: target.email,
    mustChangePassword: true
  });
});

export default router;
