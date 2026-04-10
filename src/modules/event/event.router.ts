import { Router } from "express";
import { EventController } from "./event.controller.js";
import { EventValidator } from "./event.validator.js";
import { ValidatorMiddleware } from "../../middleware/validator.middleware.js";

export class EventRouter {
  router: Router;

  constructor(
    private eventController: EventController,
    private validatorMiddleware: ValidatorMiddleware,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get(
      "/",
      EventValidator.getMany(),
      this.validatorMiddleware.validateBody,
      this.eventController.getEvents,
    );
    this.router.post(
      "/",
      EventValidator.create(),
      this.validatorMiddleware.validateBody,
      this.eventController.createEvent,
    );
    this.router.post(
      "/bundle",
      EventValidator.createBundle(),
      this.validatorMiddleware.validateBody,
      this.eventController.createEventBundle,
    );
    this.router.get(
      "/:id",
      EventValidator.getById(),
      this.validatorMiddleware.validateBody,
      this.eventController.getEvent,
    );
    this.router.delete(
      "/:id",
      EventValidator.delete(),
      this.validatorMiddleware.validateBody,
      this.eventController.deleteEvent,
    );
    this.router.patch(
      "/:id",
      EventValidator.update(),
      this.validatorMiddleware.validateBody,
      this.eventController.updateEvent,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
