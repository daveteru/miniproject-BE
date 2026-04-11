import { Router } from "express";
import { PointsController } from "./points.controller.js";

export class PointsRouter {
  router: Router;

  constructor(private pointsController: PointsController) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get("/:id", this.pointsController.getPoints);
    this.router.get("/user/:id", this.pointsController.getPointsByUser);
  };

  getRouter = () => {
    return this.router;
  };
}