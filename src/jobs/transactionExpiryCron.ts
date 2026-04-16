import { PaymentStatus } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";

export async function expiredTransactionsCron() {
  const now = new Date();
    console.log(`[CRON] Running at ${new Date().toISOString()}`)


  const expiredTransactions = await prisma.transaction.findMany({
    where: {
      paymentStatus: PaymentStatus.WAITING_FOR_PAYMENT,
      expiredAt: { lt: now },
    },
    include: { items: true },
  });

  if (expiredTransactions.length === 0) return;

  await prisma.$transaction(async (tx) => {
    for (const transaction of expiredTransactions) {
      // restore ticket stock for each item
      await Promise.all(
        transaction.items.map((item) =>
          tx.ticket.update({
            where: { id: item.ticketId },
            data: { availableTicket: { increment: item.quantity } },
          }),
        ),
      );

      // mark transaction as expired
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { paymentStatus: PaymentStatus.EXPIRED },
      });
    }
  });
}
