import { Request, Response } from "express";
import { ReviewService } from "./review.service.js";

export class ReviewController {
  constructor(private reviewService: ReviewService) {}

getReview = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;  // from auth middleware
  const result = await this.reviewService.getReview(userId);
  res.status(200).send(result);
};

postReview = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;  // from auth middleware
  const result = await this.reviewService.postReview({ ...req.body, userId });
  res.status(200).send(result);
};
}
