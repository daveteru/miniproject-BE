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
        expiredDate: { gt: new Date() },
      },
    });

    const result = total._sum.amount;

    if (!result) {
      return { points: 0 };
    }

    return { points: result };
  };

  getPoints = async (id: number) => {
    const points = await this.prisma.point.findUnique({
      where: { id },
    });

    if (!points) {
      throw new ApiError("Points not found", 404);
    }

    return points;
  };
}
