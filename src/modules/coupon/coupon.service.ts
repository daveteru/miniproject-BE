import { PrismaClient } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";

export class CouponService {
  constructor(private prisma: PrismaClient) {}

  getCouponsByUser = async (userId: number) => {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError("User not found", 400);
    }

    const coupons = await this.prisma.coupon.findMany({
      where: {
        userId: userId,
        expiredDate: { gt: new Date() },
      },
    });

    return coupons;
  }

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
