import { Request, Response } from "express";
import { CouponService } from "./coupon.service.js";
import {
  DEFAULT_PAGE,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
  DEFAULT_TAKE,
} from "./constants.js";

export class CouponController {
  constructor(private couponService: CouponService) {}

  getCouponsByUser = async (req: Request, res: Response) => {
    const query = {
      page: parseInt(req.query.page as string) || DEFAULT_PAGE,
      take: parseInt(req.query.take as string) || DEFAULT_TAKE,
      sortOrder: (req.query.sortOrder as string) || DEFAULT_SORT_ORDER,
      sortBy: (req.query.sortBy as string) || DEFAULT_SORT_BY,
    };

    const id = Number(req.params.id);
    const result = await this.couponService.getCouponsByUser(id, query);
    res.status(200).send(result);
  };

  getallCoupon = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.couponService.getallCoupon(id);
    res.status(200).send(result);
  };
}
