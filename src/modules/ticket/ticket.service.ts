import { PrismaClient } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";

export class TicketService {
  constructor(private prisma: PrismaClient) {}

  getTicket = async (id: number) => {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new ApiError("Event ticket not found", 404);
    }

    return ticket;
  };
}
