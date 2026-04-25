import { body, param } from "express-validator";

export class TransactionValidator {
  static create() {
    return [
      body("items")
        .isArray({ min: 1 })
        .withMessage("Items must be a non-empty array"),

      body("items.*.ticketId")
        .notEmpty()
        .withMessage("Ticket ID is required")
        .isInt({ gt: 0 })
        .withMessage("Ticket ID must be a positive integer"),

      body("items.*.quantity")
        .notEmpty()
        .withMessage("Quantity is required")
        .isInt({ gt: 0 })
        .withMessage("Quantity must be a positive integer"),

      body("userId")
        .notEmpty()
        .withMessage("User ID is required")
        .isInt({ gt: 0 })
        .withMessage("User ID must be a positive integer"),

      body("voucherId")
        .optional()
        .isInt({ gt: 0 })
        .withMessage("Voucher ID must be a positive integer"),

      body("eventId")
        .optional()
        .isInt({ gt: 0 })
        .withMessage("Event ID must be a positive integer"),

      body("couponId")
        .optional({ nullable: true })
        .isInt({ gt: 0 })
        .withMessage("Coupon ID must be a positive integer"),

      body("pointsUsed")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Points used must be greater than 0"),
    ];
  }

  static accept() {
    return [
      param("uuid")
        .notEmpty()
        .withMessage("Transaction UUID is required")
        .isUUID()
        .withMessage("Transaction UUID must be a valid UUID"),
    ];
  }
  
  static reject() {
    return [
      param("uuid")
        .notEmpty()
        .withMessage("Transaction UUID is required")
        .isUUID()
        .withMessage("Transaction UUID must be a valid UUID"),
    ];
  }
}
