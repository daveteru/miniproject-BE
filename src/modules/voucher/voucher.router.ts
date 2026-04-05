import { Router } from "express";
import { VoucherController } from "./voucher.controller.js";

export class VoucherRouter {
  router: Router;

  constructor(private voucherController: VoucherController) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get("/:id", this.voucherController.getVoucher);
  };

  getRouter = () => {
    return this.router;
  };
}