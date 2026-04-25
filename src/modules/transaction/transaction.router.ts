import { Router } from "express";
import { TransactionController } from "./transaction.controller.js";
import { UploadMiddleware } from "../../middleware/upload.middleware.js";
import { AuthMiddleware } from "../../middleware/auth.middleware.js";
import { Role } from "../../generated/prisma/enums.js";
import { ValidatorMiddleware } from "../../middleware/validator.middleware.js";
import { TransactionValidator } from "./transaction.validator.js";

export class TransactionRouter {
  router: Router;

  constructor(
    private transactionController: TransactionController,
    private uploadMiddleware: UploadMiddleware,
    private authMiddleware: AuthMiddleware,
    private validatorMiddleware: ValidatorMiddleware,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.post(
      "/",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      TransactionValidator.create(),
      this.validatorMiddleware.validateBody,
      this.transactionController.createTransaction,
    );
    this.router.get(
      "/attendance/",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.transactionController.checkAttendance,
    );
    this.router.get(
      "/history/:id",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.transactionController.getTransactionByUserId,
    );
    this.router.get(
      "/organizer",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.authMiddleware.verifyRole([Role.ORGANIZER]),
      this.transactionController.getOrganizerTransactions,
    );
    this.router.patch(
      "/:uuid/proof",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.authMiddleware.verifyRole([Role.USER]),
      this.uploadMiddleware.upload().single("paymentProof"),
      this.transactionController.uploadPaymentProof,
    );
    this.router.patch(
      "/accept/:uuid",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.authMiddleware.verifyRole([Role.ORGANIZER]),
      TransactionValidator.accept(),
      this.validatorMiddleware.validateBody,
      this.transactionController.acceptTransaction,
    );
    this.router.patch(
      "/reject/:uuid",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.authMiddleware.verifyRole([Role.ORGANIZER]),
      TransactionValidator.reject(),
      this.validatorMiddleware.validateBody,
      this.transactionController.rejectTransaction,
    );

    this.router.patch(
      "/cancel/:uuid",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.authMiddleware.verifyRole([Role.USER]),
      this.transactionController.cancelTransaction,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
