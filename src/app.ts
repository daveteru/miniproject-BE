import cors from "cors";
import cookieParser from "cookie-parser";
import express, { Express } from "express";
import cron from "node-cron";

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
import { AuthService } from "./modules/auth/auth.service.js";
import { AuthController } from "./modules/auth/auth.controller.js";
import { AuthRouter } from "./modules/auth/auth.router.js";
import { AuthMiddleware } from "./middleware/auth.middleware.js";
import { corsOptions } from "./config/cors.js";
import { ValidatorMiddleware } from "./middleware/validator.middleware.js";
import { MailService } from "./modules/mail/mail.service.js";
import { CloudinaryService } from "./modules/cloudinary/cloudinary.service.js";
import { UploadMiddleware } from "./middleware/upload.middleware.js";
import { expiredTransactionsCron } from "./jobs/transactionExpiryCron.js";
export class App {
  app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.registerModules();
    this.errors();
  }

  configure() {
    this.app.use(cors(corsOptions));
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use((_req, res, next) => {
      res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
      next();
    });
  }

  errors() {
    this.app.use(errorMiddleware);
    this.app.use(notFoundMiddleware);
  }

  private registerModules() {
    // services
    const mailService = new MailService();
    const cloudinaryService = new CloudinaryService();
    const userService = new UserService(prisma, cloudinaryService);
    const transactionService = new TransactionService(
      prisma,
      cloudinaryService,
      mailService,
    );
    const ticketService = new TicketService(prisma);
    const reviewService = new ReviewService(prisma);
    const promotionService = new PromotionService(prisma);
    const pointsService = new PointsService(prisma);
    const eventService = new EventService(prisma, cloudinaryService);
    const couponService = new CouponService(prisma);
    const voucherService = new VoucherService(prisma);
    const authService = new AuthService(prisma, mailService);

    // middlewares
    const authMiddleware = new AuthMiddleware();
    const validatorMiddleware = new ValidatorMiddleware();
    const uploadMiddleware = new UploadMiddleware();

    // controllers
    const userController = new UserController(userService);
    const transactionController = new TransactionController(transactionService);
    const ticketController = new TicketController(ticketService);
    const reviewController = new ReviewController(reviewService);
    const promotionController = new PromotionController(promotionService);
    const pointsController = new PointsController(pointsService);
    const eventController = new EventController(eventService);
    const couponController = new CouponController(couponService);
    const voucherController = new VoucherController(voucherService);
    const authController = new AuthController(authService);

    // routers
    const userRouter = new UserRouter(
      userController,
      validatorMiddleware,
      authMiddleware,
      uploadMiddleware,
    );
    const transactionRouter = new TransactionRouter(
      transactionController,
      uploadMiddleware,
      authMiddleware,
    );
    const ticketRouter = new TicketRouter(ticketController);
    const reviewRouter = new ReviewRouter(reviewController, authMiddleware);
    const promotionRouter = new PromotionRouter(promotionController);
    const pointsRouter = new PointsRouter(pointsController);
    const eventRouter = new EventRouter(
      eventController,
      validatorMiddleware,
      uploadMiddleware,
      authMiddleware,
    );
    const couponRouter = new CouponRouter(couponController);
    const voucherRouter = new VoucherRouter(voucherController);
    const authRouter = new AuthRouter(
      authController,
      authMiddleware,
      validatorMiddleware,
    );

    // entry points
    this.app.use("/users", userRouter.getRouter());
    this.app.use("/transactions", transactionRouter.getRouter());
    this.app.use("/tickets", ticketRouter.getRouter());
    this.app.use("/reviews", reviewRouter.getRouter());
    this.app.use("/promotions", promotionRouter.getRouter());
    this.app.use("/points", pointsRouter.getRouter());
    this.app.use("/events", eventRouter.getRouter());
    this.app.use("/coupons", couponRouter.getRouter());
    this.app.use("/vouchers", voucherRouter.getRouter());
    this.app.use("/auth", authRouter.getRouter());
  }

  start() {
    const PORT = process.env.PORT;
    this.app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);

      cron.schedule("* * * * * *", () => {
        expiredTransactionsCron().catch(console.error);
      });
    });
  }
}
