import { Request, Response } from "express";
import { PointsService } from "./points.service.js";

export class PointsController {
  constructor(private pointsService: PointsService) {}

  getPoints = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.pointsService.getPoints(id);
    res.status(200).send(result);
  };
}