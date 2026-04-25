import { Request, Response } from "express";
import { TicketService } from "./ticket.service.js";

export class TicketController {
  constructor(private userService: TicketService) {}

  getEventTicket = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.userService.getEventTicket(id);
    res.status(200).send(result);
  };
  
  createTicket = async (req: Request, res: Response) => {
    const body = req.body;
    const result = await this.userService.createTicket(body);
    res.status(201).send(result);
  };
}
