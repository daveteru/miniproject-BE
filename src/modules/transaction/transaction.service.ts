import {
  PaymentStatus,
  PrismaClient,
  Role,
} from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";

export class TransactionService {
  constructor(
    private prisma: PrismaClient,
    private cloudinary: CloudinaryService,
  ) {}

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
    eventId?: number;
    couponId?: number | null;
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

      if (body.pointsUsed) {
        const points = await trans.point.findMany({
          where: { userId: body.userId, isused: false },
        });

        if (!points.length) {
          throw new ApiError("Points not found", 404);
        }

        await trans.point.updateMany({
          where: { userId: body.userId },
          data: { isused: true },
        });
      }
      if (body.couponId) {
        const coupon = await trans.coupon.findUnique({
          where: { id: body.couponId },
        });

        if (!coupon) throw new ApiError("Coupon not found", 404);
        if (coupon.isused) throw new ApiError("Coupon already used", 400);

        await trans.coupon.update({
          where: { id: body.couponId },
          data: { isused: true },
        });
      }

      await trans.transaction.create({
        data: {
          paymentStatus: "WAITING_FOR_PAYMENT",
          userId: body.userId,
          voucherId: body.voucherId,
          couponId: body.couponId,
          eventId: body.eventId,
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

  getTransactionByUserId = async (id: number, page: number, take: number) => {
    const transaction = await this.prisma.transaction.findMany({
      where: { userId: id },
      skip: (page - 1) * take,
      take,
      orderBy: { id: "desc" },
      select: {
        id: true,
        expiredAt: true,
        paymentProof: true,
        paymentStatus: true,
        pointsUsed: true,
        coupon: {
          select: {
            id: true,
            amount: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            artist: true,
            location: true,
            city: true,
            startDate: true,
          },
        },
        voucher: {
          select: {
            discamount: true,
          },
        },
        items: {
          include: {
            ticket: {
              select: {
                ticketLevel: true,
                price: true,
              },
            },
          },
        },
      },
    });

    const total = await this.prisma.transaction.count({
      where: { userId: id },
    });

    const data = transaction.map((tx) => {
      const allitems = tx.items.reduce((sum, item) => sum + item.price, 0);
      const discount = tx.voucher?.discamount ?? 0;
      const point = tx.pointsUsed;
      const total = allitems - discount - point;
      const coupondisocunt = total * ((tx.coupon?.amount ?? 0) / 100);
      return {
        ...tx,
        totalbeforecoupon: total,
        coupondisc: coupondisocunt,
        totalPrice: total - coupondisocunt,
      };
    });

    return { data, meta: { page, take, total } };
  };

  uploadPaymentProof = async (id: number, file: Express.Multer.File) => {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });
    if (!transaction) throw new ApiError("Transaction not found", 404);

    const result = await this.cloudinary.upload(file);
    await this.prisma.transaction.update({
      where: { id },
      data: {
        paymentProof: result.secure_url,
        paymentStatus: "WAITING_FOR_CONFIRM",
      },
    });

    return { message: "Payment proof uploaded successfully" };
  };

  checkAttendance = async (body: { userId: number; eventId: number }) => {
    const { userId, eventId } = body;
    const attendance = await this.prisma.transaction.findMany({
      where: {
        userId,
        eventId,
        paymentStatus: "PAID",
      },
    });
    return attendance;
  };

  getPendingTransactions = async (organizerId: number) => {
    const organizer = await this.prisma.user.findUnique({
      where: {
        id: organizerId,
      },
    });

    if (!organizer) throw new ApiError("User not found", 404);

    if (organizer.role !== Role.ORGANIZER)
      throw new ApiError("User is not an organizer", 400);

    const pendingTransactions = await this.prisma.transaction.findMany({
      where: {
        event: {
          organizerId,
        },
        paymentStatus: PaymentStatus.WAITING_FOR_CONFIRM,
      },
      include: {
        items: {
          omit: {
            id: true,
          },
        },
        uuid: false,
      },
    });

    if (!pendingTransactions) throw new ApiError("No transactions found", 404);

    return pendingTransactions;
  };

  acceptTransaction = async (id: number) => {
    const transaction = await this.prisma.transaction.findUnique({
      where: {
        id,
      },
    });

    if (!transaction) throw new ApiError("Transaction not found", 404);

    await this.prisma.transaction.update({
      where: {
        id,
      },
      data: {
        paymentStatus: PaymentStatus.PAID,
      },
    });

    return { message: "Transaction accept successful" };
  };

  rejectTransaction = async (id: number) => {
    const transaction = await this.prisma.transaction.findUnique({
      where: {
        id,
      },
    });

    if (!transaction) throw new ApiError("Transaction not found", 404);

    await this.prisma.$transaction(async (tx) => {
      
    })
  };
}
