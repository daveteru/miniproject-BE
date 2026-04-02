import "dotenv/config";
import {
    PaymentStatus,
    Priority,
    Role,
    Status
} from "../src/generated/prisma/client.js";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  // create user
  const user = await prisma.user.create({
    data: {
      email: "budi@mail.com",
      password: "User123",
      fullName: "Budi User",
      birthdate: new Date("2000-01-01"),
      role: Role.USER,
    },
  });

  // create organizer
  const organizer = await prisma.user.create({
    data: {
      email: "budiOrganizer@mail.com",
      password: "Admin123",
      fullName: "Budi Organizer",
      birthdate: new Date("1999-01-01"),
      role: Role.ORGANIZER,
    },
  });

  // event
  const event = await prisma.event.create({
    data: {
      name: "Festival Foo Bar",
      artist: "Foo Bar",
      location: "Foo Bar Convention Center",
      startDate: new Date("2026-06-01T18:00:00"),
      endDate: new Date("2026-06-01T23:00:00"),
      totalTicket: 1000,
      category: "Concert",
      description: "Ada ada aja festival.",
      organizerId: organizer.id,
    },
  });

  // tickets
  const ticketVIP = await prisma.ticket.create({
    data: {
      ticketLevel: "VIP",
      availableTicket: 100,
      eventId: event.id,
    },
  });

  const ticketRegular = await prisma.ticket.create({
    data: {
      ticketLevel: "Regular",
      availableTicket: 500,
      eventId: event.id,
    },
  });

  // coupon
  const coupon = await prisma.coupon.create({
    data: {
      amount: 50,
      expiredDate: new Date("2026-07-01"),
      userId: user.id,
    },
  });

  // voucher
  const voucher = await prisma.voucher.create({
    data: {
      amount: 100,
      expiredDate: new Date("2026-07-01"),
      userId: user.id,
      organizerID: organizer.id,
    },
  });

  // transaction
  const transaction = await prisma.transaction.create({
    data: {
      paymentStatus: PaymentStatus.PAID,
      userId: user.id,
      ticketId: ticketVIP.id,
      couponId: coupon.id,
      voucherId: voucher.id,
    },
  });

  // review
  await prisma.review.create({
    data: {
      text: "jorok amet",
      rating: 2,
      transactionId: transaction.id,
      eventId: event.id,
      reviewerId: user.id,
    },
  });

  // points
  await prisma.point.create({
    data: {
      amount: 200,
      expiredDate: new Date("2026-12-31"),
      userId: user.id,
    },
  });

  await prisma.promotions.create({
    data: {
      priority: Priority.HIGH,
      status: Status.DRAFT,
      eventId: event.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
