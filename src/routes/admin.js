import { Router } from "express";
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
      passwordChangedAt: true,
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

export default router;
