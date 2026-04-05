import { PrismaClient } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";

export class ReviewService {
  constructor(private prisma: PrismaClient) {}

  getReview = async (id: number) => {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new ApiError("Event ticket not found", 404);
    }

    return review;
  };
}
