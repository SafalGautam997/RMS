import getDB from "../../db-connection.js";
import type { PublicMenuItem } from "../models/public.js";

export async function getAvailablePublicMenu(): Promise<PublicMenuItem[]> {
  const db = await getDB();
  const rows = (await db.all(`
    SELECT m.*, c.name as category_name
    FROM menu_items m
    LEFT JOIN categories c ON m.category_id = c.id
    WHERE m.available = 1 AND m.stock > 0
    ORDER BY c.name, m.name
  `)) as unknown as PublicMenuItem[];
  return rows;
}
