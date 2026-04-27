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
    prisma.account.findUnique({
      where: { id: Number(fromAccountId) },
      include: { user: { select: { id: true, name: true, email: true } } }
    }),
    prisma.account.findUnique({
      where: { id: Number(toAccountId) },
      include: { user: { select: { id: true, name: true, email: true } } }
    })
  ]);

  if (!fromAccount || !toAccount) {
    return res.status(404).json({ error: "cuenta destino no existe." });
  }
  if (fromAccount.userId !== req.user.id) {
    return res.status(403).json({ error: "intentas transferir desde una cuenta que no es tuya." });
  }
  if (Number(fromAccount.balance) < numAmount) {
    return res.status(409).json({ error: "saldo insuficiente." });
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedFrom = await tx.account.update({
      where: { id: fromAccount.id },
      data: { balance: { decrement: numAmount } }
    });
    const updatedTo = await tx.account.update({
      where: { id: toAccount.id },
      data: { balance: { increment: numAmount } }
    });
    const transaction = await tx.transaction.create({
      data: {
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        amount: numAmount,
        note,
        createdById: req.user.id
      }
    });
    return { transaction, updatedFrom, updatedTo };
  });

  return res.status(201).json({
    transactionId: result.transaction.id,
    amountSent: numAmount,
    fromAccount: {
      id: fromAccount.id,
      number: fromAccount.number,
      ownerName: fromAccount.user.name,
      balanceBefore: Number(fromAccount.balance),
      balanceAfter: Number(result.updatedFrom.balance)
    },
    toAccount: {
      id: toAccount.id,
      number: toAccount.number,
      ownerName: toAccount.user.name,
      balanceBefore: Number(toAccount.balance),
      balanceAfter: Number(result.updatedTo.balance)
    },
    note: result.transaction.note,
    createdAt: result.transaction.createdAt
  });
});

router.get("/me", requireAuth, async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { createdById: req.user.id },
    orderBy: { createdAt: "desc" }
  });
  return res.json(transactions);
});

export default router;
