import { PrismaClient } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";

export class ReviewService {
  constructor(private prisma: PrismaClient) {}

  getReview = async (userId: number) => {
    const review = await this.prisma.review.findMany({
      where: {
        event: { organizerId: userId },
      },
      select: {
        id: true,
        text: true,
        rating: true,
        event: {
          select: {
            name: true,
          }
        },
        reviewer: {
          select: {
            fullName: true,
            avatar:true
          }
        },
      },
    });

    if (!review.length) {
      throw new ApiError("Event reviews not found", 404);
    }

    return review;
  };


  postReview = async (body: {
    text: string;
    rating: number;
    userId: number;
    eventId: number;
    transactionId?: number;
  }) => {
    if (body.rating < 1 || body.rating > 5) {
      throw new ApiError("Rating must be between 1 and 5", 400);
    }

    const attended = await this.prisma.transaction.findFirst({
      where: { eventId: body.eventId, userId: body.userId, paymentStatus: "PAID" },
    });
    if (!attended) throw new ApiError("You have not attended this event", 403);


    await this.prisma.review.create({
      data: {
        text: body.text,
        rating: body.rating,
        reviewerId: body.userId,
        eventId: body.eventId,
        transactionId: body.transactionId,
      },
    });

    return { message: "Review Posted" };
  };
}
