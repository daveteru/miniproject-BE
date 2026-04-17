import { PaymentStatus } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";

export async function expiredTransactionsCron() {
  const now = new Date();
  console.log(`[CRON] check Expiration running at ${new Date().toISOString()}`);

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
      if (transaction.voucherId) {
        await tx.voucher.update({
          where: { id: transaction.voucherId },
          data: { amount: { increment: 1 } },
        });
      }
      if (transaction.pointsUsed) {
        await tx.point.updateMany({
          where: { userId: transaction.userId },
          data: { amount: { increment: transaction.pointsUsed } },
        });
      }
      // mark transaction as expired
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { paymentStatus: PaymentStatus.EXPIRED },
      });
    }
  });
}
