import cors from "cors";
import express, { Express } from "express";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middleware/error.middleware.js";
import { UserService } from "./modules/user/user.service.js";
import { prisma } from "./lib/prisma.js";
import { UserController } from "./modules/user/user.controller.js";
import { UserRouter } from "./modules/user/user.router.js";
import { TransactionService } from "./modules/transaction/transaction.service.js";
import { TransactionController } from "./modules/transaction/transaction.controller.js";
import { TransactionRouter } from "./modules/transaction/transaction.router.js";
import { TicketService } from "./modules/ticket/ticket.service.js";
import { TicketController } from "./modules/ticket/ticket.controller.js";
import { TicketRouter } from "./modules/ticket/ticket.router.js";
import { ReviewService } from "./modules/review/review.service.js";
import { ReviewController } from "./modules/review/review.controller.js";
import { ReviewRouter } from "./modules/review/review.router.js";
import { PromotionService } from "./modules/promotion/promotion.service.js";
import { PromotionController } from "./modules/promotion/promotion.controller.js";
import { PromotionRouter } from "./modules/promotion/promotion.router.js";
import { EventService } from "./modules/event/event.service.js";
import { EventController } from "./modules/event/event.controller.js";
import { EventRouter } from "./modules/event/event.router.js";
import { PointsService } from "./modules/points/points.service.js";
import { PointsController } from "./modules/points/points.controller.js";
import { PointsRouter } from "./modules/points/points.router.js";
import { CouponService } from "./modules/coupon/coupon.service.js";
import { CouponController } from "./modules/coupon/coupon.controller.js";
import { CouponRouter } from "./modules/coupon/coupon.router.js";
import { VoucherService } from "./modules/voucher/voucher.service.js";
import { VoucherController } from "./modules/voucher/voucher.controller.js";
import { VoucherRouter } from "./modules/voucher/voucher.router.js";

export class App {
  app: Express;

  constructor() {
    this.app = express();
    this.configure();
    
    this.userModules();
    this.transactionModules();
    this.ticketModules();
    this.reviewModules();
    this.promotionModules();
    this.pointsModules();
    this.eventModules();
    this.couponModules();
    this.voucherModules();

    this.errors();
  }

  configure() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  errors() {
    this.app.use(errorMiddleware);
    this.app.use(notFoundMiddleware);
  }

  private userModules() {
    const userService = new UserService(prisma);
    const userController = new UserController(userService);
    const userRouter = new UserRouter(userController);
    this.app.use("/users", userRouter.getRouter());
  }

  private transactionModules() {
    const transactionService = new TransactionService(prisma);
    const transactionController = new TransactionController(transactionService);
    const transactionRouter = new TransactionRouter(transactionController);
    this.app.use("/transactions", transactionRouter.getRouter());
  }

  private ticketModules() {
    const ticketService = new TicketService(prisma);
    const ticketController = new TicketController(ticketService);
    const ticketRouter = new TicketRouter(ticketController);
    this.app.use("/tickets", ticketRouter.getRouter());
  }

  private reviewModules() {
    const reviewService = new ReviewService(prisma);
    const reviewController = new ReviewController(reviewService);
    const reviewRouter = new ReviewRouter(reviewController);
    this.app.use("/reviews", reviewRouter.getRouter());
  }

  private promotionModules() {
    const promotionService = new PromotionService(prisma);
    const promotionController = new PromotionController(promotionService);
    const promotionRouter = new PromotionRouter(promotionController);
    this.app.use("/promotions", promotionRouter.getRouter());
  }

  private pointsModules() {
    const pointsService = new PointsService(prisma);
    const pointsController = new PointsController(pointsService);
    const pointsRouter = new PointsRouter(pointsController);
    this.app.use("/points", pointsRouter.getRouter());
  }

  private eventModules() {
    const eventService = new EventService(prisma);
    const eventController = new EventController(eventService);
    const eventRouter = new EventRouter(eventController);
    this.app.use("/events", eventRouter.getRouter());
  }

  private couponModules() {
    const couponService = new CouponService(prisma);
    const couponController = new CouponController(couponService);
    const couponRouter = new CouponRouter(couponController);
    this.app.use("/coupons", couponRouter.getRouter());
  }

  private voucherModules() {
    const voucherService = new VoucherService(prisma);
    const voucherController = new VoucherController(voucherService);
    const voucherRouter = new VoucherRouter(voucherController);
    this.app.use("/vouchers", voucherRouter.getRouter());
  }

  start() {
    const PORT = process.env.PORT;
    this.app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  }
}
