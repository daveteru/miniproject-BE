import { Event, Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { PaginationQueryParams } from "../../types/pagination.js";
import { ApiError } from "../../utils/api-error.js";

interface GetEventsQuery extends PaginationQueryParams {
  search?: string;
  category?: string;
  city?:string;
}

export class EventService {
  constructor(private prisma: PrismaClient) {}

  getEvents = async ({
    page,
    sortBy,
    sortOrder,
    take,
    search,
    category,
    city,
  }: GetEventsQuery) => {
    const whereClause: Prisma.EventWhereInput = {
      deletedAt: null,
    };

    if (search) {
      whereClause.name = { contains: search, mode: "insensitive" };
    }
    if (category) {
      whereClause.category = { contains: category, mode: "insensitive" };
    }
    if (city) {
      whereClause.city = { contains: city, mode: "insensitive" };
    }

    const events = await this.prisma.event.findMany({
      where: whereClause,
      skip: (page - 1) * take,
      take: take,
      orderBy: { [sortBy]: sortOrder },
    });

    const total = await this.prisma.event.count({ where: whereClause });

    return {
      data: events,
      meta: { page, take, total },
    };
  };

  getEvent = async (id: number) => {
    const event = await this.prisma.event.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!event) {
      throw new ApiError("Event not found", 404);
    }

    return event;
  };

  deleteEvent = async (id: number) => {
    try {
      await this.prisma.event.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return { message: "Event deletion successful" };
    } catch {
      throw new ApiError("Event deletion failed", 404);
    }
  };

  updateEvent = async (id: number, body: Partial<Event>) => {
    // cek kalo event ada
    await this.getEvent(id);

    await this.prisma.event.update({
      where: { id },
      data: body,
    });

    return { message: "Event data update successful" };
  };

  createEvent = async (body: Omit<Event, "id" | "deletedAt">) => {
    await this.prisma.event.create({
      data: {
        name: body.name,
        artist: body.artist,
        location: body.location,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        thumbnail: body.thumbnail,
        totalTicket: body.totalTicket,
        category: body.category,
        description: body.description,
        organizerId: body.organizerId,
      },
    });
    return { message: "Event creation successful" };
  };
}
