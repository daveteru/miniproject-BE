import { Router } from "express";
import { UserController } from "./user.controller.js";
import { UserValidator } from "./user.validator.js";
import { ValidatorMiddleware } from "../../middleware/validator.middleware.js";

export class UserRouter {
  router: Router;

  constructor(
    private userController: UserController,
    private validatorMiddleware: ValidatorMiddleware,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get("/:id", this.userController.getUser);
    this.router.patch(
      "/:id",
      UserValidator.create(),
      this.validatorMiddleware.validateBody,
      this.userController.updateUser,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
