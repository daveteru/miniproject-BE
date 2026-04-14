import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { ValidatorMiddleware } from "../../middleware/validator.middleware.js";
import { AuthValidator } from "./auth.validator.js";

export class AuthRouter {
  router: Router;

  constructor(
    private authController: AuthController,
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
  };

  getRouter = () => {
    return this.router;
  };
}
