import {
  PaymentStatus,
  PrismaClient,
  Role,
  Usage,
} from "../../generated/prisma/client.js";
import { PaginationQueryParams } from "../../types/pagination.js";
import { ApiError } from "../../utils/api-error.js";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";
import { MailService } from "../mail/mail.service.js";

export class TransactionService {
  constructor(
    private prisma: PrismaClient,
    private cloudinaryService: CloudinaryService,
    private mailService: MailService,
  ) {}

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

      let deductedPoints = null;
      if (body.pointsUsed) {
        deductedPoints = await trans.point.create({
          data: {
            userId: body.userId,
            amount: -body.pointsUsed,
            expiredDate: new Date("9999-12-17T00:00:00"),
          },
        });
      }
      if (body.couponId) {
        const coupon = await trans.coupon.findUnique({
          where: { id: body.couponId },
        });

        if (!coupon) throw new ApiError("Coupon not found", 404);
        if (coupon.usage !== Usage.FREE)
          throw new ApiError("Coupon already used", 400);

        await trans.coupon.update({
          where: { id: body.couponId },
          data: { usage: Usage.HOLD },
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
          pointsId: deductedPoints && deductedPoints?.id,
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
      const couponDiscount = total * ((tx.coupon?.amount ?? 0) / 100);
      return {
        ...tx,
        totalbeforecoupon: total,
        coupondisc: couponDiscount,
        totalPrice: total - couponDiscount,
      };
    });

    return { data, meta: { page, take, total } };
  };

  uploadPaymentProof = async (id: number, file: Express.Multer.File) => {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });
    if (!transaction) throw new ApiError("Transaction not found", 404);

    const result = await this.cloudinaryService.upload(file);
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

  getOrganizerTransactions = async (
    organizerId: number,
    { page, take }: PaginationQueryParams,
  ) => {
    const organizer = await this.prisma.user.findUnique({
      where: {
        id: organizerId,
      },
    });

    if (!organizer) throw new ApiError("User not found", 404);

    if (organizer.role !== Role.ORGANIZER)
      throw new ApiError("User is not an organizer", 400);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        event: {
          organizerId,
        },
      },
      skip: (page - 1) * take,
      take,
      orderBy: { id: "desc" },
      include: {
        items: {
          select: {
            ticket: {
              select: {
                ticketLevel: true,
              },
            },
            price: true,
            quantity: true,
          },
        },
        user: {
          select: {
            email: true,
          },
        },
        voucher: {
          select: {
            discamount: true,
          },
        },
        coupon: {
          select: {
            amount: true,
          },
        },
        event: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!transactions) throw new ApiError("No transactions found", 404);

    const total = await this.prisma.transaction.count({
      where: {
        event: {
          organizerId,
        },
      },
    });

    const data = transactions.map((trans) => {
      const totalPrice = trans.items.reduce((sum, item) => sum + item.price, 0);
      const tickets = trans.items.map((transItems) => {
        return {
          level: transItems.ticket.ticketLevel,
          amount: transItems.quantity,
        };
      });

      const voucher = trans.voucher?.discamount ? trans.voucher.discamount : 0;
      const coupon = trans.coupon?.amount ? trans.coupon.amount : 0;
      const couponDiscount = totalPrice * (coupon / 100);
      const finalPrice =
        totalPrice - voucher - trans.pointsUsed - couponDiscount;

      return {
        uuid: trans.uuid,
        eventName: trans.event?.name,
        email: trans.user.email,
        createdAt: trans.createdAt,
        tickets,
        totalPrice: totalPrice,
        voucher,
        coupon,
        points: trans.pointsUsed,
        finalPrice,
        paymentStatus: trans.paymentStatus,
        paymentProof: trans.paymentProof,
      };
    });

    return { data, meta: { page, take, total } };
  };

  acceptTransaction = async (uuid: string) => {
    const transaction = await this.prisma.transaction.findUnique({
      where: {
        uuid,
      },
      include: {
        event: true,
        points: true,
      },
    });

    if (!transaction) throw new ApiError("Transaction not found", 404);

    if (transaction.paymentStatus !== PaymentStatus.WAITING_FOR_CONFIRM)
      throw new ApiError("Incorrect payment status", 400);

    const user = await this.prisma.user.findUnique({
      where: {
        id: transaction.userId,
      },
    });

    if (!user) throw new ApiError("User not found", 404);

    await this.prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: {
          uuid,
        },
        data: {
          paymentStatus: PaymentStatus.PAID,
        },
      });
      if (transaction.couponId) {
        await tx.coupon.update({
          where: {
            id: transaction.couponId,
          },
          data: {
            usage: Usage.USED,
          },
        });
      }
      if (transaction.voucherId) {
        await tx.voucher.update({
          where: {
            id: transaction.voucherId,
          },
          data: {
            amount: { increment: 1 },
          },
        });
      }
    });

    await this.mailService.sendMail({
      to: user.email,
      subject: "FRNTROW* - Your Payment Has Been Approved",
      templateName: "transaction-accepted",
      context: { username: user.fullName, eventName: transaction.event?.name },
    });

    return { message: "Transaction accept successful" };
  };

  rejectTransaction = async (uuid: string) => {
    const transaction = await this.prisma.transaction.findUnique({
      where: {
        uuid,
      },
      include: {
        event: true,
        points: true,
        items: true,
      },
    });

    if (!transaction) throw new ApiError("Transaction not found", 404);

    if (transaction.paymentStatus !== PaymentStatus.WAITING_FOR_CONFIRM)
      throw new ApiError("Incorrect payment status", 400);

    const user = await this.prisma.user.findUnique({
      where: {
        id: transaction.userId,
      },
    });

    if (!user) throw new ApiError("User not found", 404);

    await this.prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: {
          uuid,
        },
        data: {
          paymentStatus: PaymentStatus.REJECTED,
        },
      });
      await Promise.all(
        transaction.items.map((item) =>
          tx.ticket.update({
            where: { id: item.ticketId },
            data: { availableTicket: { increment: item.quantity } },
          }),
        ),
      );
      if (transaction.couponId) {
        await tx.coupon.update({
          where: {
            id: transaction.couponId,
          },
          data: {
            usage: Usage.FREE,
          },
        });
      }
      if (transaction.pointsId) {
        await tx.point.updateMany({
          where: {
            id: transaction.pointsId,
          },
          data: {
            usage: Usage.USED,
          },
        });
      }
      if (transaction.voucherId) {
        await tx.voucher.update({
          where: {
            id: transaction.voucherId,
          },
          data: {
            amount: { increment: 1 },
          },
        });
      }
    });

    await this.mailService.sendMail({
      to: user.email,
      subject: "FRNTROW* - Your Payment Has Been Rejected",
      templateName: "transaction-rejected",
      context: {
        username: user.fullName,
        eventName: transaction.event ? transaction.event.name : "",
      },
    });

    return { message: "Transaction rejection successful" };
  };
}
