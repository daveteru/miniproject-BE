import { Router } from "express";
import { TransactionController } from "./transaction.controller.js";

export class TransactionRouter {
  router: Router;

  constructor(private transactionController: TransactionController) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.post("/", this.transactionController.createTransaction);
    this.router.get("/:id", this.transactionController.getTransaction);
    this.router.get("/history/:id", this.transactionController.getTransactionByUserId);
  };

  getRouter = () => {
    return this.router;
  };
}