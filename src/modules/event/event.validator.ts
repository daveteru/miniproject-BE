import { body, param } from "express-validator";

export class EventValidator {
  static create() {
    return [
      body("name").notEmpty().withMessage("Name is required").isString(),

      body("artist").notEmpty().withMessage("Artist is required").isString(),

      body("location")
        .notEmpty()
        .withMessage("Location is required")
        .isString(),

      body("startDate")
        .notEmpty()
        .withMessage("Start date is required")
        .isISO8601()
        .withMessage("Start date must be a valid date"),

      body("endDate")
        .notEmpty()
        .withMessage("End date is required")
        .isISO8601()
        .withMessage("End date must be a valid date")
        .custom((value, { req }) => {
          if (new Date(value) <= new Date(req.body.startDate)) {
            throw new Error("End date must be after start date");
          }
          return true;
        }),

      body("thumbnail")
        .optional()
        .isString()
        .withMessage("Thumbnail must be a string"),

      body("totalTicket")
        .notEmpty()
        .withMessage("Total ticket is required")
        .isInt({ min: 1 })
        .withMessage("Total ticket must be at least 1"),

      body("category")
        .notEmpty()
        .withMessage("Category is required")
        .isString(),

      body("city").notEmpty().withMessage("City is required").isString(),

      body("description").optional().isString(),

      body("organizerId")
        .notEmpty()
        .withMessage("Organizer ID is required")
        .isInt()
        .withMessage("Organizer ID must be an integer"),
    ];
  }

  static createBundle() {
    return [
      // event fields
      body("event.name").notEmpty().withMessage("Event name is required").isString(),
      body("event.artist").notEmpty().withMessage("Artist is required").isString(),
      body("event.location").notEmpty().withMessage("Location is required").isString(),
      body("event.city").optional().isString(),
      body("event.startDate")
        .notEmpty()
        .withMessage("Start date is required")
        .isISO8601()
        .withMessage("Start date must be a valid date"),
      body("event.endDate")
        .notEmpty()
        .withMessage("End date is required")
        .isISO8601()
        .withMessage("End date must be a valid date")
        .custom((value, { req }) => {
          if (new Date(value) <= new Date(req.body.event.startDate)) {
            throw new Error("End date must be after start date");
          }
          return true;
        }),
      body("event.thumbnail").optional().isString(),
      body("event.category").notEmpty().withMessage("Category is required").isString(),
      body("event.description").optional().isString(),
      body("event.organizerId")
        .notEmpty()
        .withMessage("Organizer ID is required")
        .isInt()
        .withMessage("Organizer ID must be an integer"),

      // ticket fields
      body("tickets")
        .isArray({ min: 1 })
        .withMessage("At least one ticket tier is required"),
      body("tickets.*.ticketLevel")
        .notEmpty()
        .withMessage("Ticket level is required")
        .isString(),
      body("tickets.*.availableTicket")
        .notEmpty()
        .withMessage("Available ticket is required")
        .isInt({ min: 1 })
        .withMessage("Available ticket must be at least 1"),
      body("tickets.*.price")
        .notEmpty()
        .withMessage("Price is required")
        .isInt({ min: 0 })
        .withMessage("Price must be 0 or more"),

      // voucher fields (optional — omit entire voucher object to skip)
      body("voucher.amount")
        .if(body("voucher").exists())
        .notEmpty().withMessage("Voucher amount is required")
        .isInt({ min: 1 }).withMessage("Voucher amount must be at least 1"),
      body("voucher.expiredDate")
        .if(body("voucher").exists())
        .notEmpty().withMessage("Voucher expired date is required")
        .isISO8601().withMessage("Voucher expired date must be a valid date"),
      body("voucher.userId")
        .if(body("voucher").exists())
        .notEmpty().withMessage("Voucher user ID is required")
        .isInt().withMessage("Voucher user ID must be an integer"),
    ];
  }

  static update() {
    return [
      param("id").isInt().withMessage("Event ID must be an integer"),

      body("name").optional().isString(),
      body("artist").optional().isString(),
      body("location").optional().isString(),

      body("startDate")
        .optional()
        .isISO8601()
        .withMessage("Start date must be valid"),

      body("endDate")
        .optional()
        .isISO8601()
        .withMessage("End date must be valid")
        .custom((value, { req }) => {
          if (
            req.body.startDate &&
            new Date(value) <= new Date(req.body.startDate)
          ) {
            throw new Error("End date must be after start date");
          }
          return true;
        }),

      body("thumbnail").optional().isString(),

      body("totalTicket")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Total ticket must be at least 1"),

      body("category").optional().isString(),
      body("description").optional().isString(),
    ];
  }

  static delete() {
    return [param("id").isInt().withMessage("Event ID must be an integer")];
  }

  static getById() {
    return [param("id").isInt().withMessage("Event ID must be an integer")];
  }

  static getMany() {
    return [
      param("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be at least 1"),

      param("take")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Take must be at least 1"),

      param("sortOrder")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage("Sort order must specify asc or desc"),

      param("sortBy")
        .optional()
        .isIn(["name", "artist", "startDate"])
        .withMessage("Sort by must be by name, artist, or startDate"),

      param("search").optional().isString(),
    ];
  }
}
