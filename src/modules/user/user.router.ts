import { Router } from "express";
import { UserController } from "./user.controller.js";
import { UserValidator } from "./user.validator.js";
import { ValidatorMiddleware } from "../../middleware/validator.middleware.js";
import { AuthMiddleware } from "../../middleware/auth.middleware.js";
import { UploadMiddleware } from "../../middleware/upload.middleware.js";

export class UserRouter {
  router: Router;

  constructor(
    private userController: UserController,
    private validatorMiddleware: ValidatorMiddleware,
    private authMiddleware: AuthMiddleware,
    private uploadMiddleware: UploadMiddleware,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get("/:id", this.userController.getUser);
    this.router.patch(
      "/",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      UserValidator.updateUser(),
      this.uploadMiddleware.upload().fields([{ name: "avatar", maxCount: 1 }]),
      this.validatorMiddleware.validateBody,
      this.userController.updateUser,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
