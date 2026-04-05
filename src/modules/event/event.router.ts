import { Router } from "express";
import { EventController } from "./event.controller.js";

export class EventRouter {
  router: Router;

  constructor(private eventController: EventController) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get("/:id", this.eventController.getEvent);
    this.router.get("/", this.eventController.getEvents);
    this.router.delete("/:id", this.eventController.deleteEvent);
    this.router.patch("/:id", this.eventController.updateEvent);
    this.router.post("/", this.eventController.createEvent);
  };

  getRouter = () => {
    return this.router;
  };
}