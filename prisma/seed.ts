import "dotenv/config";
import {
  PaymentStatus,
  Priority,
  Provider,
  Role,
  Status,
  Usage
} from "../src/generated/prisma/client.js";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  // Create a USER
  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      password: "hashedpassword123", // hash in real apps
      birthdate: new Date("1995-06-15"),
      fullName: "John Doe",
      referral: "REF12345",
      avatar: null,
      role: Role.USER,
      provider: Provider.CREDENTIALS,
    },
  });

  // Create an ORGANIZER
  const organizer = await prisma.user.create({
    data: {
      email: "organizer@example.com",
      password: "hashedpassword456",
      birthdate: new Date("1985-01-20"),
      fullName: "Jane Organizer",
      referral: "REF67890",
      role: Role.ORGANIZER,
      provider: Provider.CREDENTIALS,
    },
  });

  // Create an Event
  const event = await prisma.event.create({
    data: {
      name: "Music Festival",
      artist: "Cool Band",
      location: "Jakarta Convention Center",
      city: "Jakarta",
      startDate: new Date("2026-07-01T18:00:00"),
      endDate: new Date("2026-07-02T23:00:00"),
      totalTicket: 500,
      category: "Concert",
      description: "A fun summer music festival",
      organizerId: organizer.id,
      promotions: {
        create: {
          priority: Priority.HIGH,
          status: Status.ACTIVE,
        },
      },
    },
  });

  // Create a Ticket
  const ticket = await prisma.ticket.create({
    data: {
      ticketLevel: "VIP",
      availableTicket: 50,
      price: 1000000,
      eventId: event.id,
    },
  });

  // Create a Coupon
  const coupon = await prisma.coupon.create({
    data: {
      amount: 100000,
      expiredDate: new Date("2026-12-31"),
      userId: user.id,
      usage: Usage.FREE,
    },
  });

  // Create a Voucher
  const voucher = await prisma.voucher.create({
    data: {
      amount: 200000,
      discamount: 50000,
      expiredDate: new Date("2026-12-31"),
      userId: user.id,
      organizerID: organizer.id,
      eventId: event.id,
    },
  });

  // Create a Transaction
  const transaction = await prisma.transaction.create({
    data: {
      paymentStatus: PaymentStatus.PAID,
      userId: user.id,
      eventId: event.id,
      couponId: coupon.id,
      voucherId: voucher.id,
      items: {
        create: [
          {
            ticketId: ticket.id,
            quantity: 2,
            price: ticket.price,
          },
        ],
      },
    },
  });

  console.log({ user, organizer, event, ticket, coupon, voucher, transaction });
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