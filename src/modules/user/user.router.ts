import { Router } from "express";
import { UserController } from "./user.controller.js";

export class UserRouter {
  router: Router;

  constructor(private userController: UserController) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get("/:id", this.userController.getUser);
  };

  getRouter = () => {
    return this.router;
  };
}