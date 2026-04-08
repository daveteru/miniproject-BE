import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error.js";

export const validatorMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);

  let errorMessage: string = "Validation error! ";

  for (let i = 0; i < errors.array().length; i++) {
    errorMessage += "[" + i + "]: " + errors.array()[i].msg;
    if (i !== errors.array().length - 1) {
      errorMessage += " ";
    }
  }

  if (!errors.isEmpty()) {
    throw new ApiError(errorMessage, 400);
  }

  next();
};
