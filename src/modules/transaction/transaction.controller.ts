import { Request, Response } from "express";
import { TransactionService } from "./transaction.service.js";
import { body } from "express-validator";

export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  getTransaction = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.transactionService.getTransaction(id);
    res.status(200).send(result);
  };
  createTransaction = async (req: Request, res: Response) => {
    const result = await this.transactionService.createTransaction(req.body);
    res.status(200).send(result);
  };
}
