import { Request, Response } from "express";
import { EventService } from "./event.service.js";

export class EventController {
  constructor(private eventService: EventService) {}

  getEvent = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.eventService.getEvent(id);
    res.status(200).send(result);
  };
}