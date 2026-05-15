import type { Request, Response } from "express";
import { getContext } from "@rm/platform";

export function sendOk<T>(req: Request, res: Response, data: T) {
  const { requestId } = getContext(req);
  return res.status(200).json({ ok: true, data, requestId });
}

export function sendCreated<T>(req: Request, res: Response, data: T) {
  const { requestId } = getContext(req);
  return res.status(201).json({ ok: true, data, requestId });
}
