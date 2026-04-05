import { Router } from "express";
import { ReviewController } from "./review.controller.js";

export class ReviewRouter {
  router: Router;

  constructor(private reviewController: ReviewController) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get("/:id", this.reviewController.getReview);
  };

  getRouter = () => {
    return this.router;
  };
}