import { Request, Response } from "express";
import { PromotionService } from "./promotion.service.js";

export class PromotionController {
  constructor(private promotionService: PromotionService) {}

  getPromotion = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.promotionService.getPromotion(id);
    res.status(200).send(result);
  };
  getPromotionHero = async (req: Request, res: Response) => {
    const result = await this.promotionService.getPromotionHero();
    res.status(200).send(result);
  };
  getPromotionFeatured = async (req: Request, res: Response) => {
    const result = await this.promotionService.getPromotionFeatured();
    res.status(200).send(result);
  };
}