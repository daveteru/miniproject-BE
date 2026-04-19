import { Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { PaginationQueryParams } from "../../types/pagination.js";
import { ApiError } from "../../utils/api-error.js";

export class CouponService {
  constructor(private prisma: PrismaClient) {}

  getCouponsByUser = async (
    userId: number,
    { page, take, sortBy, sortOrder }: PaginationQueryParams,
  ) => {
    const whereClause: Prisma.CouponWhereInput = {
      expiredDate: { gt: new Date() },
      isused: false,
    };

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError("User not found", 400);
    }

    whereClause.userId = userId;

    const coupons = await this.prisma.coupon.findMany({
      where: whereClause,
      skip: (page - 1) * take,
      take: take,
      orderBy: { [sortBy]: sortOrder },
    });

    const total = await this.prisma.coupon.count({ where: whereClause });

    return {
      data: coupons,
      meta: { page, take, total },
    };
  };

  getCoupon = async (id: number) => {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new ApiError("Coupon not found", 404);
    }

    return coupon;
  };
  getallCoupon = async (id: number) => {
    const coupon = await this.prisma.coupon.findMany({
      where: { userId : id , isused:false,
        expiredDate: { gt: new Date() }
      },
    });

    if (!coupon) {
      throw new ApiError("Coupon not found", 404);
    }

    return coupon;
  };
}
