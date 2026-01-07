import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import getDB from "./db-connection.js";
import { initDb } from "./db-init.js";
import { publicRoutes } from "./backend/routes/publicRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.SERVER_PORT || 3001;
const HOST = process.env.SERVER_HOST || "0.0.0.0";

type NotificationEvent = {
  id: number;
  type: "call_waiter";
  table_number: number | null;
  customer_name: string | null;
  created_at: string;
};

let nextNotificationId = 1;
const notificationClients = new Set<Response>();

const broadcastNotification = (event: NotificationEvent) => {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of notificationClients) {
    try {
      client.write(payload);
    } catch {
      notificationClients.delete(client);
    }
  }
};

// Initialize database on startup
initDb().catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
});

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Enable CORS for development
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ============= PUBLIC (CUSTOMER) ROUTES =============

app.use("/api/public", publicRoutes);

// ============= USER ROUTES =============

app.post("/api/users/login", async (req: Request, res: Response) => {
  try {
    const { username, password, party } = req.body;
    console.log("Login attempt:", { username, party, hasPassword: !!password });
    const db = await getDB();
    const user = await db.get(
      "SELECT id, name, username, role, party, created_at FROM users WHERE username = ? AND password = ? AND party = ?",
      [username, password, party]
    );
    console.log(
      "User found:",
      user ? { id: user.id, username: user.username, role: user.role } : null
    );
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    res.json(user);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    const rows = await db.all(
      "SELECT id, name, username, role, party, created_at FROM users"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/users", async (req: Request, res: Response) => {
  try {
    const { name, username, password, role, party } = req.body;
    const db = await getDB();
    const result = await db.run(
      "INSERT INTO users (name, username, password, role, party) VALUES (?, ?, ?, ?, ?)",
      [name, username, password, role, party || "cafe and restaurents"]
    );
    res.json({ lastID: result.lastID, changes: result.changes });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDB();
    const result = await db.run("DELETE FROM users WHERE id = ?", [id]);
    res.json({ changes: result.changes });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

// ============= CATEGORY ROUTES =============

app.get("/api/categories", async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    const rows = await db.all("SELECT * FROM categories ORDER BY name");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/categories", async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const db = await getDB();
    const result = await db.run("INSERT INTO categories (name) VALUES (?)", [
      name,
    ]);
    res.json({ lastID: result.lastID, changes: result.changes });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/api/categories/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDB();
    const result = await db.run("DELETE FROM categories WHERE id = ?", [id]);
    res.json({ changes: result.changes });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

// ============= MENU ROUTES =============

app.get("/api/menu", async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    const rows = await db.all(`
      SELECT m.*, c.name as category_name FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
      ORDER BY c.name, m.name
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/menu/available", async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    const rows = await db.all(`
      SELECT m.*, c.name as category_name FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE m.available = 1 AND m.stock > 0
      ORDER BY c.name, m.name
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/menu", async (req: Request, res: Response) => {
  try {
    const { name, price, categoryId, stock, imageUrl } = req.body;
    console.log("Creating menu item:", {
      name,
      hasImage: !!imageUrl,
      imageLength: imageUrl?.length,
    });
    const db = await getDB();
    const result = await db.run(
      "INSERT INTO menu_items (name, price, category_id, stock, images) VALUES (?, ?, ?, ?, ?)",
      [name, price, categoryId, stock, imageUrl || null]
    );
    res.json({ lastID: result.lastID, changes: result.changes });
  } catch (error) {
    console.error("Error creating menu item:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/api/menu/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, categoryId, stock, available, imageUrl } = req.body;
    console.log("Updating menu item:", {
      id,
      name,
      hasImage: !!imageUrl,
      imageLength: imageUrl?.length,
    });
    const db = await getDB();
    const result = await db.run(
      "UPDATE menu_items SET name = ?, price = ?, category_id = ?, stock = ?, available = ?, images = ? WHERE id = ?",
      [name, price, categoryId, stock, available, imageUrl || null, id]
    );
    res.json({ changes: result.changes });
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/api/menu/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDB();
    const result = await db.run("DELETE FROM menu_items WHERE id = ?", [id]);
    res.json({ changes: result.changes });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/api/menu/:id/stock", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const db = await getDB();
    const result = await db.run(
      "UPDATE menu_items SET stock = MAX(0, stock - ?) WHERE id = ?",
      [quantity, id]
    );
    res.json({ changes: result.changes });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

// ============= ORDER ROUTES =============

app.get("/api/orders", async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    const rows = await db.all(`
      SELECT o.*, u.name as waiter_name FROM orders o
      LEFT JOIN users u ON o.waiter_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/orders/waiter/:waiterId", async (req: Request, res: Response) => {
  try {
    const { waiterId } = req.params;
    const db = await getDB();
    const rows = await db.all(
      `
      SELECT o.*, u.name as waiter_name FROM orders o
      LEFT JOIN users u ON o.waiter_id = u.id
      WHERE o.waiter_id = ?
      ORDER BY o.created_at DESC
    `,
      [waiterId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/orders/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDB();
    const row = await db.get("SELECT * FROM orders WHERE id = ?", [id]);
    if (!row) return res.status(404).json({ error: "Order not found" });
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/orders", async (req: Request, res: Response) => {
  try {
    const {
      tableNumber,
      waiterId,
      status,
      subtotal,
      discountAmount,
      totalPrice,
    } = req.body;
    const db = await getDB();

    const waiter = await db.get("SELECT name FROM users WHERE id = ?", [
      waiterId,
    ]);
    const waiterName = waiter ? waiter.name : null;

    const result = await db.run(
      "INSERT INTO orders (table_number, waiter_id, waiter_name, status, subtotal, discount_amount, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        tableNumber,
        waiterId,
        waiterName,
        status,
        subtotal,
        discountAmount,
        totalPrice,
      ]
    );
    res.json({ lastID: result.lastID, changes: result.changes });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/api/orders/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = await getDB();
    const result = await db.run(
      "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, id]
    );
    res.json({ changes: result.changes });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/api/orders/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { subtotal, discountAmount, totalPrice } = req.body;
    const db = await getDB();
    const result = await db.run(
      "UPDATE orders SET subtotal = ?, discount_amount = ?, total_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [subtotal, discountAmount, totalPrice, id]
    );
    res.json({ changes: result.changes });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/api/orders/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDB();
    const result = await db.run("DELETE FROM orders WHERE id = ?", [id]);
    res.json({ changes: result.changes });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

// ============= ORDER ITEM ROUTES =============

app.get("/api/order-items/:orderId", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const db = await getDB();
    const rows = await db.all(
      `
      SELECT oi.*, m.name as item_name FROM order_items oi
      LEFT JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE oi.order_id = ?
    `,
      [orderId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/order-items", async (req: Request, res: Response) => {
  try {
    const { orderId, menuItemId, quantity, price } = req.body;
    const db = await getDB();
    const result = await db.run(
      "INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)",
      [orderId, menuItemId, quantity, price]
    );
    res.json({ lastID: result.lastID, changes: result.changes });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/api/order-items/:orderId", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const db = await getDB();
    const result = await db.run("DELETE FROM order_items WHERE order_id = ?", [
      orderId,
    ]);
    res.json({ changes: result.changes });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

// ============= DISCOUNT ROUTES =============

app.get("/api/discounts", async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    const rows = await db.all("SELECT * FROM discounts ORDER BY name");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/discounts/active", async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    const rows = await db.all(
      "SELECT * FROM discounts WHERE active = 1 ORDER BY name"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/discounts", async (req: Request, res: Response) => {
  try {
    const { name, type, value } = req.body;
    const db = await getDB();
    const result = await db.run(
      "INSERT INTO discounts (name, type, value) VALUES (?, ?, ?)",
      [name, type, value]
    );
    res.json({ lastID: result.lastID, changes: result.changes });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/api/discounts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, value, active } = req.body;
    const db = await getDB();
    const result = await db.run(
      "UPDATE discounts SET name = ?, type = ?, value = ?, active = ? WHERE id = ?",
      [name, type, value, active, id]
    );
    res.json({ changes: result.changes });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/api/discounts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDB();
    const result = await db.run("DELETE FROM discounts WHERE id = ?", [id]);
    res.json({ changes: result.changes });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

// ============= TRANSACTION ROUTES =============

app.get("/api/transactions", async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    const rows = await db.all(`
      SELECT t.*, o.table_number, o.total_price FROM transactions t
      LEFT JOIN orders o ON t.order_id = o.id
      WHERE o.status = 'Paid'
      ORDER BY t.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});
app.put("/api/transactions/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod } = req.body;
    const db = await getDB();
    const result = await db.run(
      "UPDATE transactions SET amount = ?, payment_method = ? WHERE id = ?",
      [amount, paymentMethod, id]
    );
    res.json({ changes: result.changes });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/api/transactions/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDB();
    const result = await db.run("DELETE FROM transactions WHERE id = ?", [id]);
    res.json({ changes: result.changes });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/transactions", async (req: Request, res: Response) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;
    const db = await getDB();
    const result = await db.run(
      "INSERT INTO transactions (order_id, amount, payment_method) VALUES (?, ?, ?)",
      [orderId, amount, paymentMethod]
    );
    res.json({ lastID: result.lastID, changes: result.changes });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get(
  "/api/transactions/daily-sales/:date",
  async (req: Request, res: Response) => {
    try {
      const { date } = req.params;
      const db = await getDB();
      const row = await db.get(
        "SELECT SUM(amount) as total FROM transactions WHERE DATE(created_at) = ?",
        [date]
      );
      res.json(row || { total: 0 });
    } catch (error) {
      res.status(500).json({ error: "Database error" });
    }
  }
);

app.get(
  "/api/transactions/daily-report/:date",
  async (req: Request, res: Response) => {
    try {
      const { date } = req.params;
      const db = await getDB();
      const rows = await db.all(
        "SELECT t.*, o.table_number FROM transactions t LEFT JOIN orders o ON t.order_id = o.id WHERE DATE(t.created_at) = ? AND o.status = 'Paid' ORDER BY t.created_at",
        [date]
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Database error" });
    }
  }
);

app.get(
  "/api/transactions/weekly-report/:startDate/:endDate",
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.params;
      const db = await getDB();
      const rows = await db.all(
        "SELECT t.*, o.table_number FROM transactions t LEFT JOIN orders o ON t.order_id = o.id WHERE DATE(t.created_at) BETWEEN ? AND ? AND o.status = 'Paid' ORDER BY t.created_at",
        [startDate, endDate]
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Database error" });
    }
  }
);

app.get(
  "/api/transactions/yearly-report/:year",
  async (req: Request, res: Response) => {
    try {
      const { year } = req.params;
      const db = await getDB();
      const rows = await db.all(
        "SELECT t.*, o.table_number FROM transactions t LEFT JOIN orders o ON t.order_id = o.id WHERE strftime('%Y', t.created_at) = ? AND o.status = 'Paid' ORDER BY t.created_at",
        [year]
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Database error" });
    }
  }
);

app.get(
  "/api/transactions/most-sold/:startDate/:endDate",
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.params;
      const db = await getDB();
      const rows = await db.all(
        `SELECT m.name, SUM(oi.quantity) as total_quantity, SUM(oi.quantity * oi.price) as total_revenue
         FROM order_items oi
         JOIN menu_items m ON oi.menu_item_id = m.id
         JOIN orders o ON oi.order_id = o.id
         WHERE DATE(o.created_at) BETWEEN ? AND ?
         GROUP BY m.id, m.name
         ORDER BY total_quantity DESC
         LIMIT 5`,
        [startDate, endDate]
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Database error" });
    }
  }
);

app.get(
  "/api/transactions/monthly-sales/:year/:month",
  async (req: Request, res: Response) => {
    try {
      const { year, month } = req.params;
      const db = await getDB();
      const row = await db.get(
        "SELECT SUM(amount) as total FROM transactions WHERE strftime('%Y', created_at) = ? AND strftime('%m', created_at) = ?",
        [year, month.padStart(2, "0")]
      );
      res.json(row || { total: 0 });
    } catch (error) {
      res.status(500).json({ error: "Database error" });
    }
  }
);

app.get(
  "/api/transactions/monthly-report/:year/:month",
  async (req: Request, res: Response) => {
    try {
      const { year, month } = req.params;
      const db = await getDB();
      const rows = await db.all(
        "SELECT t.*, o.table_number FROM transactions t LEFT JOIN orders o ON t.order_id = o.id WHERE strftime('%Y', t.created_at) = ? AND strftime('%m', t.created_at) = ? AND o.status = 'Paid' ORDER BY t.created_at",
        [year, month.padStart(2, "0")]
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Database error" });
    }
  }
);

// ============= HEALTH CHECK =============

// ============= NOTIFICATIONS (SSE) =============

app.get("/api/notifications/stream", (req: Request, res: Response) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Initial comment to establish the stream
  res.write(": connected\n\n");

  notificationClients.add(res);

  const heartbeat = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch {
      // ignore
    }
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    notificationClients.delete(res);
  });
});

app.post("/api/notifications/call-waiter", (req: Request, res: Response) => {
  const rawTable = req.body?.tableNumber;
  const rawCustomerName = req.body?.customerName;
  const tableNumber =
    typeof rawTable === "number" && Number.isFinite(rawTable)
      ? rawTable
      : typeof rawTable === "string" && rawTable.trim()
      ? Number(rawTable)
      : null;

  const customerName =
    typeof rawCustomerName === "string" && rawCustomerName.trim()
      ? rawCustomerName.trim()
      : null;

  const event: NotificationEvent = {
    id: nextNotificationId++,
    type: "call_waiter",
    table_number:
      typeof tableNumber === "number" && Number.isFinite(tableNumber)
        ? tableNumber
        : null,
    customer_name: customerName,
    created_at: new Date().toISOString(),
  };

  broadcastNotification(event);
  res.json({ ok: true, event });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "Server is running" });
});

// ============= FRONTEND (PRODUCTION) =============

if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.resolve(__dirname, "client");
  app.use(express.static(clientDistPath));
  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// Start server
app.listen(Number(PORT), HOST, () => {
  console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
  console.log(`📊 SQLite database ready`);
});
