import { PrismaClient } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";

export class PointsService {
  constructor(private prisma: PrismaClient) {}

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
