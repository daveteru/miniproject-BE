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
    this.router.post("/", this.transactionController.createTransaction);
    this.router.post(
      "/attendance/",
      this.transactionController.checkAttendance,
    );
    this.router.get(
      "/history/:id",
      this.transactionController.getTransactionByUserId,
    );
    this.router.get(
      "/pending",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.authMiddleware.verifyRole([Role.ORGANIZER]),
      this.transactionController.getPendingTransactions,
    );
    this.router.get("/:id", this.transactionController.getTransaction);
    this.router.patch(
      "/:id/proof",
      this.uploadMiddleware.upload().single("paymentProof"),
      this.transactionController.uploadPaymentProof,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
