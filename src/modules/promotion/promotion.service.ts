import { PrismaClient } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";

export class PromotionService {
  constructor(private prisma: PrismaClient) {}

  getPromotion = async (id: number) => {
    const promotedEvent = await this.prisma.promotions.findUnique({
      where: { id },
    });

    if (!promotedEvent) {
      throw new ApiError("Promotional event not found", 404);
    }

    return promotedEvent;
  };
}
