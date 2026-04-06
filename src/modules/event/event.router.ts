import { Router } from "express";
import { EventController } from "./event.controller.js";
import { EventValidator } from "./event.validator.js";
import { validatorMiddleware } from "../../middleware/validator.middleware.js";

export class EventRouter {
  router: Router;

  constructor(private eventController: EventController) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get(
      "/:id",
      EventValidator.getById(),
      validatorMiddleware,
      this.eventController.getEvent,
    );
    this.router.get(
      "/",
      EventValidator.getMany(),
      validatorMiddleware,
      this.eventController.getEvents,
    );
    this.router.delete(
      "/:id",
      EventValidator.delete(),
      validatorMiddleware,
      this.eventController.deleteEvent,
    );
    this.router.patch(
      "/:id",
      EventValidator.update(),
      validatorMiddleware,
      this.eventController.updateEvent,
    );
    this.router.post(
      "/",
      EventValidator.create(),
      validatorMiddleware,
      this.eventController.createEvent,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
