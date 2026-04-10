import { PrismaClient, Voucher } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";

export class VoucherService {
  constructor(private prisma: PrismaClient) {}

  getVoucher = async (id: number) => {
    const voucher = await this.prisma.voucher.findUnique({
      where: { id },
    });

    if (!voucher) {
      throw new ApiError("Voucher not found", 404);
    }

    return voucher;
  };

  createVoucher = async (body: Omit<Voucher, "id">) => {
    const event = await this.prisma.event.findUnique({
      where: { id: body.eventId!, deletedAt: null },
    });

    if (!event) {
      throw new ApiError("Event not found", 404);
    }

    const organizer = await this.prisma.user.findUnique({
      where: { id: body.organizerID },
    });

    if (!organizer) {
      throw new ApiError("Organizer not found", 404);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: body.userId },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    await this.prisma.voucher.create({
      data: {
        amount: body.amount,
        expiredDate: new Date(body.expiredDate),
        userId: body.userId,
        organizerID: body.organizerID,
        eventId: body.eventId,
      },
    });

    return { message: "Voucher creation successful" };
  };
}
