import type { Request, Response } from "express";
import { getContext } from "@rm/platform";
import type { UsersService } from "./users.service.js";
import { CreateUserBodySchema } from "./users.validation.js";

export class UsersController {
  constructor(private readonly service: UsersService) {}

  create = async (req: Request, res: Response) => {
    const tenantId = getContext(req).tenantId ?? "";
    const body = CreateUserBodySchema.parse(req.body);
    const created = await this.service.createUser(tenantId, body);
    res.status(201).json(created);
  };
}
