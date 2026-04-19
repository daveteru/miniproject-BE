import { Request, Response } from "express";
import { TransactionService } from "./transaction.service.js";

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
  uploadPaymentProof = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.transactionService.uploadPaymentProof(id, req.file!);
    res.status(200).send(result);
  };

  getTransactionByUserId = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const take = parseInt(req.query.take as string) || 10;
    const result = await this.transactionService.getTransactionByUserId(id, page, take);
    res.status(200).send(result);
  };
  checkAttendance = async (req: Request, res: Response) => {
    const result = await this.transactionService.checkAttendance(req.body);
    res.status(200).send(result);
  };
}
