import { body } from "express-validator";

export class TicketValidator {
  static create() {
    return [
      body("ticketLevel")
        .notEmpty()
        .withMessage("Ticket level is required")
        .isString()
        .withMessage("Ticket level must be a string"),

      body("price")
        .notEmpty()
        .withMessage("Price is required")
        .isFloat({ gt: 0 })
        .withMessage("Price must be a positive number"),

      body("availableTicket")
        .notEmpty()
        .withMessage("Available ticket count is required")
        .isInt({ gt: 0 })
        .withMessage("Available ticket must be a positive integer"),

      body("eventId")
        .notEmpty()
        .withMessage("Event ID is required")
        .isInt({ gt: 0 })
        .withMessage("Event ID must be a positive integer"),
    ];
  }
}
