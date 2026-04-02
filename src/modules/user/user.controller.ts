import { Request, Response } from "express";
import { UserService } from "./user.service.js";

export class UserController {
  constructor(private userService: UserService) {}

  getSample = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.userService.getUser(id);
    res.status(200).send(result);
  };
}