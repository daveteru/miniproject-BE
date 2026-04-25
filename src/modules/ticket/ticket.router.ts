import { Router } from "express";
import { TicketController } from "./ticket.controller.js";
import { AuthMiddleware } from "../../middleware/auth.middleware.js";
import { ValidatorMiddleware } from "../../middleware/validator.middleware.js";
import { TicketValidator } from "./ticket.validator.js";

export class TicketRouter {
  router: Router;

  constructor(
    private ticketController: TicketController,
    private authMiddleware: AuthMiddleware,
    private validatorMiddleware: ValidatorMiddleware,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.post(
      "/",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      TicketValidator.create(),
      this.validatorMiddleware.validateBody,
      this.ticketController.createTicket,
    );
    this.router.get("/events/:id", this.ticketController.getEventTicket);
  };

  getRouter = () => {
    return this.router;
  };
}
