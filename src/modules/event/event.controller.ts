import { Request, Response } from "express";
import { EventService } from "./event.service.js";

export class EventController {
  constructor(private eventService: EventService) {}

  getEvents = async (req: Request, res: Response) => {
    const DEFAULT_PAGE: number = 1;
    const DEFAULT_TAKE: number = 6;
    const DEFAULT_SORT_ORDER: string = "desc";
    const DEFAULT_SORT_BY: string = "startDate";
    const DEFAULT_SEARCH: string = "";
    const DEFAULT_FILTER: string = "";
    
    const query = {
      page: parseInt(req.query.page as string) || DEFAULT_PAGE,
      take: parseInt(req.query.take as string) || DEFAULT_TAKE,
      sortOrder: (req.query.sortOrder as string) || DEFAULT_SORT_ORDER,
      sortBy: (req.query.sortBy as string) || DEFAULT_SORT_BY,
      search: (req.query.search as string) || DEFAULT_SEARCH,
      category: (req.query.category as string) || DEFAULT_FILTER,
    };

    const result = await this.eventService.getEvents(query);
    res.status(200).send(result);
  };

  getEvent = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.eventService.getEvent(id);
    res.status(200).send(result);
  };

  deleteEvent = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.eventService.deleteEvent(id);
    res.status(200).send(result);
  }

  updateEvent = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const body = req.body;
    const result = await this.eventService.updateEvent(id, body);
    res.status(200).send(result);
  }

  createEvent = async (req: Request, res: Response) => {
    const body = req.body;
    const result = await this.eventService.createEvent(body);
    res.status(200).send(result);
  }
}
