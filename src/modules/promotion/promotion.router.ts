import { Router } from "express";
import { PromotionController } from "./promotion.controller.js";

export class PromotionRouter {
  router: Router;

  constructor(private promotionController: PromotionController) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get("/hero", this.promotionController.getPromotionHero);
    this.router.get("/featured", this.promotionController.getPromotionFeatured);
    this.router.get("/:id", this.promotionController.getPromotion);
  };

  getRouter = () => {
    return this.router;
  };
}