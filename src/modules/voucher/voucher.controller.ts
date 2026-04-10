import { Request, Response } from "express";
import { VoucherService } from "./voucher.service.js";

export class VoucherController {
  constructor(private voucherService: VoucherService) {}

  getVoucher = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.voucherService.getVoucher(id);
    res.status(200).send(result);
  };

  createVoucher = async (req: Request, res: Response) => {
    const body = req.body;
    const result = await this.voucherService.createVoucher(body);
    res.status(201).send(result);
  };
}