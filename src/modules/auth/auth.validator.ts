import { body, param } from "express-validator";

export class AuthValidator {
  static register() {
    return [
      body("fullName")
        .notEmpty()
        .withMessage("Name is required")
        .isString()
        .withMessage("Name must be a string"),

      body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email format must be valid"),

      body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isString()
        .withMessage("Password must be a string"),

      body("birthdate")
        .notEmpty()
        .withMessage("Birth date is required")
        .isISO8601()
        .withMessage("Birth date must be valid"),

      body("referral")
        .optional()
        .isString()
        .withMessage("Referral code must be a string"),
    ];
  }
  static login() {
    return [
      body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email format must be valid"),

      body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isString()
        .withMessage("Password must be a string"),
    ];
  }
}
