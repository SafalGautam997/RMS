import getDB from "../../db-connection.js";
import type {
  PublicCreateOrderRequest,
  PublicCreateOrderResponse,
} from "../models/public.js";

const ONLINE_WAITER_USERNAME = "online_orders";

async function getOrCreateOnlineWaiterId(): Promise<number> {
  const db = await getDB();

  const existing = (await db.get("SELECT id FROM users WHERE username = ?", [
    ONLINE_WAITER_USERNAME,
  ])) as unknown as { id: number } | undefined;
  if (existing?.id) return existing.id;

  const result = await db.run(
    "INSERT INTO users (name, username, password, role, party) VALUES (?, ?, ?, ?, ?)",
    [
      "Online Orders",
      ONLINE_WAITER_USERNAME,
      "online_orders",
      "Waiter",
      "cafe and restaurents",
    ]
  );

  return result.lastID as number;
}

export async function createPublicOrder(
  input: PublicCreateOrderRequest
): Promise<PublicCreateOrderResponse> {
  const customerName = (input.customerName || "").trim();
  if (!customerName) {
    throw new Error("customerName is required");
  }

  const tableNumber = Number(input.tableNumber);
  if (!Number.isInteger(tableNumber) || tableNumber <= 0) {
    throw new Error("Valid tableNumber is required");
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new Error("At least one item is required");
  }

  const normalizedItems = input.items
    .map((it) => ({
      menuItemId: Number(it.menuItemId),
      quantity: Number(it.quantity),
    }))
    .filter(
      (it) => Number.isInteger(it.menuItemId) && Number.isInteger(it.quantity)
    );

  if (normalizedItems.length === 0) {
    throw new Error("At least one valid item is required");
  }

  for (const it of normalizedItems) {
    if (it.menuItemId <= 0) throw new Error("Invalid menuItemId");
    if (it.quantity <= 0) throw new Error("Invalid quantity");
  }

  const db = await getDB();
  const waiterId = await getOrCreateOnlineWaiterId();

  // Load canonical prices/availability from DB (don’t trust client)
  const uniqueIds = Array.from(
    new Set(normalizedItems.map((x) => x.menuItemId))
  );
  const placeholders = uniqueIds.map(() => "?").join(",");
  type MenuRow = {
    id: number;
    price: number;
    stock: number;
    available: number;
  };
  const menuRows = (await db.all(
    `SELECT id, price, stock, available FROM menu_items WHERE id IN (${placeholders})`,
    uniqueIds
  )) as unknown as MenuRow[];

  const menuById = new Map(menuRows.map((r) => [r.id, r] as const));

  let subtotal = 0;
  for (const it of normalizedItems) {
    const row = menuById.get(it.menuItemId);
    if (!row) throw new Error("Menu item not found");
    if (row.available !== 1) throw new Error("Menu item is unavailable");
    if ((row.stock ?? 0) < it.quantity) {
      throw new Error("Insufficient stock for one or more items");
    }
    subtotal += Number(row.price) * it.quantity;
  }

  const discountAmount = 0;
  const totalPrice = subtotal - discountAmount;

  await db.exec("BEGIN");
  try {
    const waiter = (await db.get("SELECT name FROM users WHERE id = ?", [
      waiterId,
    ])) as unknown as { name: string } | undefined;
    const waiterName = waiter?.name ?? "Online Orders";

    const orderResult = await db.run(
      "INSERT INTO orders (table_number, waiter_id, waiter_name, status, subtotal, discount_amount, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        tableNumber,
        waiterId,
        waiterName,
        "Pending",
        subtotal,
        discountAmount,
        totalPrice,
      ]
    );

    const orderId = orderResult.lastID as number;

    for (const it of normalizedItems) {
      const row = menuById.get(it.menuItemId)!;
      await db.run(
        "INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, it.menuItemId, it.quantity, row.price]
      );

      await db.run(
        "UPDATE menu_items SET stock = MAX(0, stock - ?) WHERE id = ?",
        [it.quantity, it.menuItemId]
      );
    }

    await db.exec("COMMIT");

    return { orderId, status: "Pending" };
  } catch (e) {
    await db.exec("ROLLBACK");
    throw e;
  }
}
