import { Priority, PrismaClient } from "../../generated/prisma/client.js";
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

  getPromotionHero = async () => {
    const promotedEvent = await this.prisma.promotions.findMany({
      where: {
        priority: Priority.HIGH,
      },
      include: {
        event: {
          select: {
            name: true,
            location: true,
            thumbnail: true,
            description: true,
            startDate: true,
          },
        },
      },
    });

    if (!promotedEvent) {
      throw new ApiError("Hero event not found", 404);
    }

    return promotedEvent;
  };

  getPromotionFeatured = async () => {
    const featuredEvent = await this.prisma.promotions.findMany({
      where: {
        priority: Priority.MID,
      },
      include: {
        event: {
          select: {
            name: true,
            artist: true,
            category: true,
            location: true,
            thumbnail: true,
            description: true,
            startDate: true,
            tickets: {
              where: { deletedAt: null },
              select: { price: true },
              orderBy: { price: "asc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!featuredEvent) {
      throw new ApiError("Featured event not found", 404);
    }

    return featuredEvent;
  };
}
