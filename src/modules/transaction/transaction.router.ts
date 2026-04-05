import { Router } from "express";
import { TransactionController } from "./transaction.controller.js";

export class TransactionRouter {
  router: Router;

  constructor(private transactionController: TransactionController) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get("/:id", this.transactionController.getTransaction);
  };

  getRouter = () => {
    return this.router;
  };
}