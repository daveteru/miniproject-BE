import cors from "cors";
import express, { Express } from "express";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middleware/error.middleware.js";

export class App {
  app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.errors();
  }

  configure() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  errors() {
    this.app.use(errorMiddleware);
    this.app.use(notFoundMiddleware);
  }

  start() {
    const PORT = process.env.PORT;
    this.app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  }
}
