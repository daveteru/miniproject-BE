import { PrismaClient } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";

export class PointsService {
  constructor(private prisma: PrismaClient) {}

  getPointsByUser = async (userId: number) => {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError("User not found", 400);
    }

    const total = await this.prisma.point.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        userId: userId,
        usage: "FREE",
        expiredDate: { gt: new Date() },
      },
    });

    const result = total._sum.amount;

    if (!result) {
      return { totalPoints: 0 };
    }

    return { totalPoints: result };
  };
}
