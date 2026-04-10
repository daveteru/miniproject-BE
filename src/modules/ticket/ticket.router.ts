import { Router } from "express";
import { TicketController } from "./ticket.controller.js";

export class TicketRouter {
  router: Router;

  constructor(private ticketController: TicketController) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.post("/", this.ticketController.createTicket);
    this.router.get("/:id", this.ticketController.getTicket);
    this.router.get("/events/:id", this.ticketController.getEventTicket);
  };

  getRouter = () => {
    return this.router;
  };
}