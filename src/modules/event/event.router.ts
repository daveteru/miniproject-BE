import { Router } from "express";
import { EventController } from "./event.controller.js";
import { EventValidator } from "./event.validator.js";
import { ValidatorMiddleware } from "../../middleware/validator.middleware.js";
import { UploadMiddleware } from "../../middleware/upload.middleware.js";
import { AuthMiddleware } from "../../middleware/auth.middleware.js";
import { Role } from "../../generated/prisma/enums.js";

export class EventRouter {
  router: Router;

  constructor(
    private eventController: EventController,
    private validatorMiddleware: ValidatorMiddleware,
    private uploadMiddleware: UploadMiddleware,
    private authMiddleware: AuthMiddleware,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get("/sample", this.eventController.getSampleEvents);
    this.router.get(
      "/",
      EventValidator.getMany(),
      this.validatorMiddleware.validateBody,
      this.eventController.getEvents,
    );
    this.router.get(
      "/organizer",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.authMiddleware.verifyRole([Role.ORGANIZER]),
      this.eventController.getEventsByOrganizer,
    );
    this.router.get("/attendees/:id", this.eventController.getEventAttendees);
    this.router.post(
      "/",
      EventValidator.create(),
      this.validatorMiddleware.validateBody,
      this.eventController.createEvent,
    );
    this.router.post(
      "/bundle",
      this.uploadMiddleware.upload().single("thumbnail"),
      this.eventController.createEventBundle,
    );
    this.router.get(
      "/:id",
      EventValidator.getById(),
      this.validatorMiddleware.validateBody,
      this.eventController.getEvent,
    );
    this.router.get(
      "/detail/:id",
      EventValidator.getById(),
      this.validatorMiddleware.validateBody,
      this.eventController.getEventDetail,
    );
    this.router.delete(
      "/:id",
      EventValidator.delete(),
      this.validatorMiddleware.validateBody,
      this.eventController.deleteEvent,
    );
    this.router.patch(
      "/:id",
      this.authMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.authMiddleware.verifyRole([Role.ORGANIZER]),
      EventValidator.update(),
      this.uploadMiddleware.upload().fields([{ name: "thumbnail", maxCount: 1 }]),
      this.validatorMiddleware.validateBody,
      this.eventController.updateEvent,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
