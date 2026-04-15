import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error.js";
import jwt from "jsonwebtoken";
import { Role } from "../generated/prisma/enums.js";

export class AuthMiddleware {
  verifyToken = (secretKey: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      let token: string | undefined;

      const authBearerToken = req.headers.authorization?.split(" ")[1];
      if (authBearerToken) {
        token = authBearerToken;
      }

      if (!token) {
        token = req.cookies?.accessToken;
      }

      if (!token) throw new ApiError("No token provided", 401);

      try {
        const payload = jwt.verify(token, secretKey);
        res.locals.user = payload;
        next();
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          return next(new ApiError("Token expired", 401));
        }

        return next(new ApiError("Token invalid", 401));
      }
    };
  };

  verifyRole = (roles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const userRole = res.locals.user.role;

      if (!userRole || !roles.includes(userRole)) {
        throw new ApiError("Unauthorized access.", 403);
      }

      next();
    };
  };
}
