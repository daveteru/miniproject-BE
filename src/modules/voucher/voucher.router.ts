import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { AuthMiddleware } from "../../middleware/auth.middleware.js";
import { ValidatorMiddleware } from "../../middleware/validator.middleware.js";
import { VoucherController } from "./voucher.controller.js";
import { VoucherValidator } from "./voucher.validator.js";

export class VoucherRouter {
  router: Router;

  constructor(
    private voucherController: VoucherController,
    private authMiddleware: AuthMiddleware,
    private validatorMiddleware: ValidatorMiddleware,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.post("/", this.voucherController.createVoucher);
    this.router.get(
      "/:id",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.authMiddleware.verifyRole([Role.ORGANIZER]),
      VoucherValidator.create(),
      this.validatorMiddleware.validateBody,
      this.voucherController.getVoucher,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
