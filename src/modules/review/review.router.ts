import { Router } from "express";
import { ReviewController } from "./review.controller.js";
import { AuthMiddleware } from "../../middleware/auth.middleware.js";

export class ReviewRouter {
  router: Router;

  constructor(
    private reviewController: ReviewController,
    private authMiddleware: AuthMiddleware,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get(
      "/",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.reviewController.getReview,
    );
    this.router.post(
      "/",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.reviewController.postReview,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
