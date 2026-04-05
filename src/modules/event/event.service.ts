import { PrismaClient } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";

export class EventService {
  constructor(private prisma: PrismaClient) {}

  getEvent = async (id: number) => {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new ApiError("Event not found", 404);
    }

    return event;
  };
}
