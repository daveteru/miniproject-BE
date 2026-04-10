import { PrismaClient, Ticket } from "../../generated/prisma/client.js";
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

  getEventTicket = async (eventId: number) => {
    const ticket = await this.prisma.ticket.findMany({
      where: { eventId, deletedAt: null },
    });

    if (!ticket.length) {
      throw new ApiError("Event ticket not found", 404);
    }

    return ticket;
  };

  createTicket = async (body: Omit<Ticket, "id" | "deletedAt">) => {
    await this.prisma.ticket.create({
      data: {
        ticketLevel: body.ticketLevel,
        price: body.price,
        availableTicket: body.availableTicket,
        eventId: body.eventId,
      },
    });
    return { message: "Ticket creation successful" };
  };
}
