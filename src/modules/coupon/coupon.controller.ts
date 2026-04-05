import { Request, Response } from "express";
import { CouponService } from "./coupon.service.js";

export class CouponController {
  constructor(private couponService: CouponService) {}

  getCoupon = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.couponService.getCoupon(id);
    res.status(200).send(result);
  };
}