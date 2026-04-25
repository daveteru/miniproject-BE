import { body } from "express-validator";

export class VoucherValidator {
  static create() {
    return [
      body("eventId")
        .notEmpty()
        .withMessage("Event ID is required")
        .isInt()
        .withMessage("Event ID must be an integer"),

      body("organizerID")
        .notEmpty()
        .withMessage("Organizer ID is required")
        .isInt()
        .withMessage("Organizer ID must be an integer"),

      body("userId")
        .notEmpty()
        .withMessage("User ID is required")
        .isInt()
        .withMessage("User ID must be an integer"),

      body("amount")
        .notEmpty()
        .withMessage("Amount is required")
        .isFloat({ gt: 0 })
        .withMessage("Amount must be a positive number"),

      body("expiredDate")
        .notEmpty()
        .withMessage("Expired date is required")
        .isISO8601()
        .withMessage("Expired date must be a valid ISO8601 date"),
    ];
  }
}
