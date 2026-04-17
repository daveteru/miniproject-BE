import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { ValidatorMiddleware } from "../../middleware/validator.middleware.js";
import { AuthValidator } from "./auth.validator.js";
import { AuthMiddleware } from "../../middleware/auth.middleware.js";

export class AuthRouter {
  router: Router;

  constructor(
    private authController: AuthController,
    private authMiddleware: AuthMiddleware,
    private validatorMiddleware: ValidatorMiddleware,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.post(
      "/register",
      AuthValidator.register(),
      this.validatorMiddleware.validateBody,
      this.authController.register,
    );
    this.router.post(
      "/login",
      AuthValidator.login(),
      this.validatorMiddleware.validateBody,
      this.authController.login,
    );
    this.router.post("/logout", this.authController.logout);
    this.router.post(
      "/forgot-password",
      AuthValidator.forgotPassword(),
      this.validatorMiddleware.validateBody,
      this.authController.forgotPassword,
    );
    this.router.post(
      "/reset-password",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET_RESET!),
      AuthValidator.resetPassword(),
      this.validatorMiddleware.validateBody,
      this.authController.resetPassword,
    );
    this.router.patch(
      "/change-password",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      AuthValidator.changePassword(),
      this.validatorMiddleware.validateBody,
      this.authController.changePassword,
    );
    this.router.post("/google", this.authController.authgoogle);
  };

  getRouter = () => {
    return this.router;
  };
}
