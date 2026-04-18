import { Request, Response } from "express";
import { EventService } from "./event.service.js";
import {
  DEFAULT_FILTER,
  DEFAULT_PAGE,
  DEFAULT_SEARCH,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
  DEFAULT_TAKE,
} from "./constants.js";

export class EventController {
  constructor(private eventService: EventService) {}

  getEvents = async (req: Request, res: Response) => {
    const query = {
      page: parseInt(req.query.page as string) || DEFAULT_PAGE,
      take: parseInt(req.query.take as string) || DEFAULT_TAKE,
      sortOrder: (req.query.sortOrder as string) || DEFAULT_SORT_ORDER,
      sortBy: (req.query.sortBy as string) || DEFAULT_SORT_BY,
      search: (req.query.search as string) || DEFAULT_SEARCH,
      category: (req.query.category as string) || DEFAULT_FILTER,
      city: (req.query.city as string) || DEFAULT_FILTER,
    };

    const result = await this.eventService.getEvents(query);
    res.status(200).send(result);
  };

  getEventsByOrganizer = async (req: Request, res: Response) => {
    const query = {
      page: parseInt(req.query.page as string) || DEFAULT_PAGE,
      take: parseInt(req.query.take as string) || DEFAULT_TAKE,
      sortOrder: (req.query.sortOrder as string) || DEFAULT_SORT_ORDER,
      sortBy: (req.query.sortBy as string) || DEFAULT_SORT_BY,
    };

    const userId = res.locals.user.id;

    const result = await this.eventService.getEventsByOrganizer(userId, query);
    res.status(200).send(result);
  };

  getEvent = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.eventService.getEvent(id);
    res.status(200).send(result);
  };

  getEventDetail = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.eventService.getEventDetail(id);
    res.status(200).send(result);
  };

  deleteEvent = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.eventService.deleteEvent(id);
    res.status(200).send(result);
  };

  updateEvent = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const body = req.body;
    const result = await this.eventService.updateEvent(id, body);
    res.status(200).send(result);
  };

  createEvent = async (req: Request, res: Response) => {
    const body = req.body;
    const result = await this.eventService.createEvent(body);
    res.status(201).send(result);
  };

  createEventBundle = async (req: Request, res: Response) => {
    const event = typeof req.body.event === "string" ? JSON.parse(req.body.event) : req.body.event;
    const tickets = typeof req.body.tickets === "string" ? JSON.parse(req.body.tickets) : req.body.tickets;
    const voucher = req.body.voucher ? (typeof req.body.voucher === "string" ? JSON.parse(req.body.voucher) : req.body.voucher) : undefined;

    const result = await this.eventService.createEventBundle(
      { event, tickets, voucher },
      req.file,
    );
    res.status(201).send(result);
  };
}
