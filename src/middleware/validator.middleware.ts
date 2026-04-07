import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error.js";

export const validatorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ApiError("Validation error", 400);
  }

  next();
};