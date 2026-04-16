import { Request, Response } from "express";
import { UserService } from "./user.service.js";

export class UserController {
  constructor(private userService: UserService) {}

  getUser = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.userService.getUser(id);
    res.status(200).send(result);
  };

  updateUser = async (req: Request, res: Response) => {
    const body = req.body;
    const id = Number(req.params.id);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const thumbnail = files.thumbnail?.[0];

    const result = await this.userService.updateUser(id, body, thumbnail);
  };
}
