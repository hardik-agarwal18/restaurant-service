import { hashPassword } from "@rm/auth";
import type { UsersRepository } from "./users.repository.js";
import type { CreateUserBody } from "./users.validation.js";

export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  async createUser(tenantId: string, body: CreateUserBody): Promise<{ id: string }> {
    const passwordHash = await hashPassword(body.password);
    return this.repo.createUser(tenantId, {
      email: body.email,
      name: body.name,
      passwordHash,
    });
  }
}
