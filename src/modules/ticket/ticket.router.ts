import { Router } from "express";
import { TicketController } from "./ticket.controller.js";

export class TicketRouter {
  router: Router;

  constructor(private ticketController: TicketController) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get("/:id", this.ticketController.getSample);
  };

  getRouter = () => {
    return this.router;
  };
}