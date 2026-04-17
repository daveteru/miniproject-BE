import { body } from "express-validator";

export class UserValidator {
  static updateUser() {
    return [
      body("fullName")
        .optional()
        .isString()
        .withMessage("Name must be a string"),

      body("birthdate")
        .optional()
        .isISO8601()
        .withMessage("Birth date must be valid"),
    ];
  }
}
