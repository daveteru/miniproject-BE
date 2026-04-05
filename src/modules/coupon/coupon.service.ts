import { PrismaClient } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";

export class CouponService {
  constructor(private prisma: PrismaClient) {}

  getCoupon = async (id: number) => {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new ApiError("Coupon not found", 404);
    }

    return coupon;
  };
}
