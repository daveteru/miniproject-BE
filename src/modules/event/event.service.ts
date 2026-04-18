import { Event, Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { PaginationQueryParams } from "../../types/pagination.js";
import { ApiError } from "../../utils/api-error.js";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";

interface createEventBundle {
  event: {
    name: string;
    artist: string;
    location: string;
    city?: string;
    startDate: string;
    endDate: string;
    thumbnail?: string;
    category: string;
    description?: string;
    organizerId: number;
  };
  tickets: {
    ticketLevel: string;
    availableTicket: number;
    price: number;
  }[];
  voucher?: {
    amount: number;
    expiredDate: string;
    userId: number;
    discamount: number;
  };
}

interface GetEventsQuery extends PaginationQueryParams {
  search?: string;
  category?: string;
  city?: string;
}

export class EventService {
  constructor(
    private prisma: PrismaClient,
    private cloudinary: CloudinaryService,
  ) {}

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

  getEventsByOrganizer = async (
    userId: number,
    { page, sortBy, sortOrder, take }: PaginationQueryParams,
  ) => {
    const user = this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new ApiError("User not found", 404);

    const whereClause: Prisma.EventWhereInput = {
      organizerId: userId,
      deletedAt: null,
    };

    const events = this.prisma.event.findMany({
      where: whereClause,
      skip: (page - 1) * take,
      take: take,
      orderBy: { [sortBy]: sortOrder },
    });

    const total = this.prisma.event.count({ where: whereClause });

    return { data: events, meta: { page, take, total } };
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

  getEventDetail = async (id: number) => {
    const event = await this.prisma.event.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        tickets: {
          where: { deletedAt: null },
        },
        organizer: {
          select: {
            fullName: true,
            avatar: true,
          },
        },
        vouchers: {
          select: {
            id: true,
            expiredDate: true,
            discamount: true,
            amount: true,
          },
        },
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
        city: body.city,
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

  createEventBundle = async (
    body: createEventBundle,
    file?: Express.Multer.File,
  ) => {
    if (!body.tickets?.length)
      throw new ApiError("At least one ticket is required", 400); // ← here

    await this.prisma.$transaction(async (tx) => {
      const result = file ? await this.cloudinary.upload(file) : undefined;
      const uploaded = result?.secure_url;
      const totalTicket = body.tickets.reduce(
        (sum, t) => sum + Number(t.availableTicket),
        0,
      );

      console.log(body);
      

      const event = await tx.event.create({
        data: {
          name: body.event.name,
          artist: body.event.artist,
          location: body.event.location,
          city: body.event.city,
          startDate: new Date(body.event.startDate),
          endDate: new Date(body.event.endDate),
          thumbnail: uploaded,
          totalTicket,
          category: body.event.category,
          description: body.event.description,
          organizerId: body.event.organizerId,
        },
      });

      await tx.ticket.createMany({
        data: body.tickets.map((ticket) => ({
          ticketLevel: ticket.ticketLevel,
          availableTicket: Number(ticket.availableTicket),
          price: Number(ticket.price),
          eventId: event.id,
        })),
      });

      if (body.voucher) {
        await tx.voucher.create({
          data: {
            amount: Number(body.voucher.amount),
            discamount: Number(body.voucher.discamount),
            expiredDate: new Date(body.voucher.expiredDate),
            userId: body.voucher.userId,
            organizerID: body.event.organizerId,
            eventId: event.id,
          },
        });
      }
    });

    return { message: "Event bundle creation successful" };
  };
}
