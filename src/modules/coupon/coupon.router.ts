import { Router } from "express";
import { CouponController } from "./coupon.controller.js";

export class CouponRouter {
  router: Router;

  constructor(private couponController: CouponController) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get("/:id", this.couponController.getCoupon);
    this.router.get("/user/:id", this.couponController.getCouponsByUser);
  };

  getRouter = () => {
    return this.router;
  };
}