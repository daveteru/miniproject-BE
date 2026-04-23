import { Router } from "express";
import { TransactionController } from "./transaction.controller.js";
import { UploadMiddleware } from "../../middleware/upload.middleware.js";
import { AuthMiddleware } from "../../middleware/auth.middleware.js";
import { Role } from "../../generated/prisma/enums.js";

export class TransactionRouter {
  router: Router;

  constructor(
    private transactionController: TransactionController,
    private uploadMiddleware: UploadMiddleware,
    private authMiddleware: AuthMiddleware,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.post(
      "/",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.transactionController.createTransaction,
    );
    this.router.post(
      "/attendance/",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.transactionController.checkAttendance,
    );
    this.router.get(
      "/history/:id",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.authMiddleware.verifyRole([Role.USER]),
      this.transactionController.getTransactionByUserId,
    );
    this.router.get(
      "/organizer",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.authMiddleware.verifyRole([Role.ORGANIZER]),
      this.transactionController.getOrganizerTransactions,
    );
    this.router.patch(
      "/:id/proof",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.authMiddleware.verifyRole([Role.USER]),
      this.uploadMiddleware.upload().single("paymentProof"),
      this.transactionController.uploadPaymentProof,
    );
    this.router.patch(
      "/accept/:uuid",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.authMiddleware.verifyRole([Role.ORGANIZER]),
      this.transactionController.acceptTransaction,
    );
    this.router.patch(
      "/reject/:uuid",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.authMiddleware.verifyRole([Role.ORGANIZER]),
      this.transactionController.rejectTransaction,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
