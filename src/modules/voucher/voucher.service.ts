import { PrismaClient } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";

export class VoucherService {
  constructor(private prisma: PrismaClient) {}

  getVoucher = async (id: number) => {
    const user = await this.prisma.voucher.findUnique({
      where: { id },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return user;
  };
}
