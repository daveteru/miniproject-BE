import { Router } from "express";
import { expiredTransactionsCron } from "./transactionExpiryCron.js";
const router = Router();

router.post("/expired-transactions", async (req, res) => {
  const secret = req.headers["x-cron-secret"];

  if (secret !== process.env.CRON_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await expiredTransactionsCron();
    res.status(200).json({ ok: true, ran_at: new Date().toISOString() });
  } catch (err) {
    console.error("[CRON] Failed:", err);
    res.status(500).json({ error: "Cron job failed" });
  }
});

export default router;