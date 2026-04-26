import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  const accounts = await prisma.account.findMany({
    where: { userId: req.user.id },
    select: { id: true, number: true, balance: true, createdAt: true }
  });
  return res.json(accounts);
});

router.get("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const account = await prisma.account.findFirst({
    where: { id, userId: req.user.id },
    select: { id: true, number: true, balance: true, createdAt: true }
  });
  if (!account) return res.status(404).json({ error: "Cuenta no encontrada" });
  return res.json(account);
});

export default router;
