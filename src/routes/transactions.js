import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  const { fromAccountId, toAccountId, amount, note } = req.body;
  const numAmount = Number(amount);

  if (!fromAccountId || !toAccountId || fromAccountId === toAccountId || numAmount <= 0) {
    return res.status(400).json({ error: "Datos de transferencia invalidos" });
  }

  const [fromAccount, toAccount] = await Promise.all([
    prisma.account.findUnique({ where: { id: Number(fromAccountId) } }),
    prisma.account.findUnique({ where: { id: Number(toAccountId) } })
  ]);

  if (!fromAccount || !toAccount) {
    return res.status(404).json({ error: "Cuenta origen o destino no existe" });
  }
  if (fromAccount.userId !== req.user.id) {
    return res.status(403).json({ error: "La cuenta origen no pertenece al usuario" });
  }
  if (Number(fromAccount.balance) < numAmount) {
    return res.status(409).json({ error: "Saldo insuficiente" });
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: fromAccount.id },
      data: { balance: { decrement: numAmount } }
    });
    await tx.account.update({
      where: { id: toAccount.id },
      data: { balance: { increment: numAmount } }
    });
    return tx.transaction.create({
      data: {
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        amount: numAmount,
        note,
        createdById: req.user.id
      }
    });
  });

  return res.status(201).json(result);
});

router.get("/me", requireAuth, async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { createdById: req.user.id },
    orderBy: { createdAt: "desc" }
  });
  return res.json(transactions);
});

export default router;
