import { Router } from "express";
import { CouponController } from "./coupon.controller.js";
import { AuthMiddleware } from "../../middleware/auth.middleware.js";

export class CouponRouter {
  router: Router;

  constructor(
    private couponController: CouponController,
    private authMiddleware: AuthMiddleware,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get(
      "/all/:id",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.couponController.getallCoupon,
    );
    this.router.get(
      "/user/:id",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.couponController.getCouponsByUser,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
