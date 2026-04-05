import { Request, Response } from "express";
import { ReviewService } from "./review.service.js";

export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  getReview = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.reviewService.getReview(id);
    res.status(200).send(result);
  };
}