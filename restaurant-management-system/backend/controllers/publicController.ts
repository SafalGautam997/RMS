import type { Request, Response } from "express";
import { getAvailablePublicMenu } from "../services/menuService.js";
import { createPublicOrder } from "../services/orderService.js";

export async function getPublicMenu(req: Request, res: Response) {
  try {
    const items = await getAvailablePublicMenu();
    res.json(items);
  } catch (error) {
    console.error("Public menu error:", error);
    res.status(500).json({ error: "Database error" });
  }
}

export async function postPublicOrder(req: Request, res: Response) {
  try {
    const result = await createPublicOrder(req.body);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status =
      message.includes("required") ||
      message.includes("Invalid") ||
      message.includes("Insufficient") ||
      message.includes("not found") ||
      message.includes("unavailable")
        ? 400
        : 500;

    if (status === 500) {
      console.error("Public order error:", error);
    }

    res.status(status).json({ error: message });
  }
}
