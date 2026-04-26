import type { Request, Response } from "express";
import { expiredTransactionsCron } from "../../src/jobs/transactionExpiryCron.js";

export default async function handler(req: Request, res: Response) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    await expiredTransactionsCron();
    res.status(200).json({ message: "Transaction expiry cron completed" });
  } catch (error) {
    console.error("[CRON] transaction-expiry failed:", error);
    res.status(500).json({ message: "Cron failed" });
  }
}
