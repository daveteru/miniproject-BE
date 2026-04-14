import { PrismaClient } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";

export class TransactionService {
  constructor(private prisma: PrismaClient) {}

  getTransaction = async (id: number) => {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new ApiError("Transaction not found", 404);
    }

    return transaction;
  };


  createTransaction = async (body: {
    items: { ticketId: number; quantity: number }[];
    userId: number;
    voucherId?: number;
    couponId?: number;
    pointsUsed?: number;
  }) => {
    await this.prisma.$transaction(async (trans) => {
      // ambil semua tiket
      const ticketIds = body.items.map((i) => i.ticketId);
      const tickets = await trans.ticket.findMany({
        where: { id: { in: ticketIds }, deletedAt: null },
      });

      if (tickets.length !== ticketIds.length) {
        throw new ApiError("One or more tickets not found", 404);
      }

      // cek ada ticket gak di db
      for (const item of body.items) {
        const ticket = tickets.find((t) => t.id === item.ticketId)!;
        if (ticket.availableTicket < item.quantity) {
          throw new ApiError(
            `Not enough tickets available for ${ticket.ticketLevel}`,
            400,
          );
        }
      }

      // pengurangan setiap ticket item
      await Promise.all(
        body.items.map((item) =>
          trans.ticket.update({
            where: { id: item.ticketId },
            data: { availableTicket: { decrement: item.quantity } },
          }),
        ),
      );

      // pengurangan voucher amount jika ada voucherId
      if (body.voucherId) {
        const voucher = await trans.voucher.findUnique({
          where: { id: body.voucherId },
        });

        if (!voucher) {
          throw new ApiError("Voucher not found", 404);
        }

        if (voucher.amount <= 0) {
          throw new ApiError("Voucher is no longer available", 400);
        }

        await trans.voucher.update({
          where: { id: body.voucherId },
          data: { amount: { decrement: 1 } },
        });
      }

      await trans.transaction.create({
        data: {
          paymentStatus: "WAITING_FOR_PAYMENT",
          userId: body.userId,
          voucherId: body.voucherId,
          couponId: body.couponId,
          pointsUsed: body.pointsUsed ?? 0,
          expiredAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
          items: {
            create: body.items.map((item) => {
              const ticket = tickets.find((t) => t.id === item.ticketId)!;
              return {
                ticketId: item.ticketId,
                quantity: item.quantity,
                price: ticket.price * item.quantity,
              };
            }),
          },
        },
      });
    });

    return { message: "Transaction created successfully" };
  };
}
