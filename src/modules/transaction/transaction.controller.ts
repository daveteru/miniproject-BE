import { Request, Response } from "express";
import {
  DEFAULT_PAGE,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
  DEFAULT_TAKE,
} from "./constants.js";
import { TransactionService } from "./transaction.service.js";

export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  createTransaction = async (req: Request, res: Response) => {
    const result = await this.transactionService.createTransaction(req.body);
    res.status(200).send(result);
  };

  uploadPaymentProof = async (req: Request, res: Response) => {
    const uuid = String(req.params.uuid);
    const result = await this.transactionService.uploadPaymentProof(
      uuid,
      req.file!,
    );
    res.status(200).send(result);
  };

  getTransactionByUserId = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const take = parseInt(req.query.take as string) || 10;
    const result = await this.transactionService.getTransactionByUserId(
      id,
      page,
      take,
    );
    res.status(200).send(result);
  };

  checkAttendance = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.transactionService.checkAttendance({
      userId,
      eventId: req.body.eventId,
    });
    res.status(200).send(result);
  };

  getOrganizerTransactions = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;

    const query = {
      page: parseInt(req.query.page as string) || DEFAULT_PAGE,
      take: parseInt(req.query.take as string) || DEFAULT_TAKE,
      sortOrder: (req.query.sortOrder as string) || DEFAULT_SORT_ORDER,
      sortBy: (req.query.sortBy as string) || DEFAULT_SORT_BY,
    };

    const result = await this.transactionService.getOrganizerTransactions(
      userId,
      query,
    );
    res.status(200).send(result);
  };

  acceptTransaction = async (req: Request, res: Response) => {
    const transactionId = String(req.params.uuid);

    const result =
      await this.transactionService.acceptTransaction(transactionId);
    res.status(200).send(result);
  };

  rejectTransaction = async (req: Request, res: Response) => {
    const transactionId = String(req.params.uuid);

    const result =
      await this.transactionService.rejectTransaction(transactionId);
    res.status(200).send(result);
  };
  
  cancelTransaction = async (req: Request, res: Response) => {
    const transactionId = String(req.params.uuid);
    const userId = res.locals.user.id;
    const result = await this.transactionService.cancelTransaction(
      transactionId,
      userId,
    );
    res.status(200).send(result);
  };
}
