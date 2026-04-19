import { Router } from "express";
import { TransactionController } from "./transaction.controller.js";
import { UploadMiddleware } from "../../middleware/upload.middleware.js";

export class TransactionRouter {
  router: Router;

  constructor(
    private transactionController: TransactionController,
    private uploadMiddleware: UploadMiddleware,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.post("/", this.transactionController.createTransaction);
    this.router.get("/:id", this.transactionController.getTransaction);
    this.router.get("/history/:id", this.transactionController.getTransactionByUserId);
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