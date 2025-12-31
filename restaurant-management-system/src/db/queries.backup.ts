const API_URL = "http://localhost:3001/api";

// User queries
export const userQueries = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error("Login failed");
    return await response.json();
  },

  getAll: async () => {
    return await db
      .prepare("SELECT id, name, username, role, created_at FROM users")
      .all();
  },

  create: async (
    name: string,
    username: string,
    password: string,
    role: string
  ) => {
    return await db
      .prepare(
        "INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)"
      )
      .run(name, username, password, role);
  },

  delete: async (id: number) => {
    return await db.prepare("DELETE FROM users WHERE id = ?").run(id);
  },
};

// Category queries
export const categoryQueries = {
  getAll: async () => {
    return await db.prepare("SELECT * FROM categories ORDER BY name").all();
  },

  create: async (name: string) => {
    return await db
      .prepare("INSERT INTO categories (name) VALUES (?)")
      .run(name);
  },

  delete: async (id: number) => {
    return await db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  },
};

// Menu item queries
export const menuQueries = {
  getAll: async () => {
    return await db
      .prepare(
        `
      SELECT m.*, c.name as category_name 
      FROM menu_items m 
      LEFT JOIN categories c ON m.category_id = c.id
      ORDER BY c.name, m.name
    `
      )
      .all();
  },

  getAvailable: async () => {
    return await db
      .prepare(
        `
      SELECT m.*, c.name as category_name 
      FROM menu_items m 
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE m.available = 1 AND m.stock > 0
      ORDER BY c.name, m.name
    `
      )
      .all();
  },

  create: async (
    name: string,
    price: number,
    categoryId: number,
    stock: number
  ) => {
    return await db
      .prepare(
        "INSERT INTO menu_items (name, price, category_id, stock) VALUES (?, ?, ?, ?)"
      )
      .run(name, price, categoryId, stock);
  },

  update: async (
    id: number,
    name: string,
    price: number,
    categoryId: number,
    stock: number,
    available: number
  ) => {
    return await db
      .prepare(
        "UPDATE menu_items SET name = ?, price = ?, category_id = ?, stock = ?, available = ? WHERE id = ?"
      )
      .run(name, price, categoryId, stock, available, id);
  },

  delete: async (id: number) => {
    return await db.prepare("DELETE FROM menu_items WHERE id = ?").run(id);
  },

  updateStock: async (id: number, quantityDecrement: number) => {
    return await db
      .prepare("UPDATE menu_items SET stock = MAX(0, stock - ?) WHERE id = ?")
      .run(quantityDecrement, id);
  },
};

// Order queries
export const orderQueries = {
  getAll: async () => {
    return await db
      .prepare(
        `
      SELECT o.*, u.name as waiter_name 
      FROM orders o 
      LEFT JOIN users u ON o.waiter_id = u.id
      ORDER BY o.created_at DESC
    `
      )
      .all();
  },

  getByWaiter: async (waiterId: number) => {
    return await db
      .prepare(
        `
      SELECT o.*, u.name as waiter_name 
      FROM orders o 
      LEFT JOIN users u ON o.waiter_id = u.id
      WHERE o.waiter_id = ?
      ORDER BY o.created_at DESC
    `
      )
      .get(waiterId);
  },

  getById: async (id: number) => {
    return await db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  },

  create: async (
    tableNumber: number,
    waiterId: number,
    status: string,
    subtotal: number,
    discountAmount: number,
    totalPrice: number
  ) => {
    return await db
      .prepare(
        "INSERT INTO orders (table_number, waiter_id, status, subtotal, discount_amount, total_price) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(tableNumber, waiterId, status, subtotal, discountAmount, totalPrice);
  },

  updateStatus: async (id: number, status: string) => {
    return await db
      .prepare(
        "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      )
      .run(status, id);
  },

  update: async (
    id: number,
    subtotal: number,
    discountAmount: number,
    totalPrice: number
  ) => {
    return await db
      .prepare(
        "UPDATE orders SET subtotal = ?, discount_amount = ?, total_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      )
      .run(subtotal, discountAmount, totalPrice, id);
  },

  delete: async (id: number) => {
    return await db.prepare("DELETE FROM orders WHERE id = ?").run(id);
  },
};

// Order item queries
export const orderItemQueries = {
  getByOrderId: async (orderId: number) => {
    return await db
      .prepare(
        `
      SELECT oi.*, m.name as item_name 
      FROM order_items oi 
      LEFT JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE oi.order_id = ?
    `
      )
      .all(orderId);
  },

  create: async (
    orderId: number,
    menuItemId: number,
    quantity: number,
    price: number
  ) => {
    return await db
      .prepare(
        "INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)"
      )
      .run(orderId, menuItemId, quantity, price);
  },

  deleteByOrderId: async (orderId: number) => {
    return await db
      .prepare("DELETE FROM order_items WHERE order_id = ?")
      .run(orderId);
  },
};

// Discount queries
export const discountQueries = {
  getAll: async () => {
    return await db.prepare("SELECT * FROM discounts ORDER BY name").all();
  },

  getActive: async () => {
    return await db
      .prepare("SELECT * FROM discounts WHERE active = 1 ORDER BY name")
      .all();
  },

  create: async (name: string, type: string, value: number) => {
    return await db
      .prepare("INSERT INTO discounts (name, type, value) VALUES (?, ?, ?)")
      .run(name, type, value);
  },

  update: async (
    id: number,
    name: string,
    type: string,
    value: number,
    active: number
  ) => {
    return await db
      .prepare(
        "UPDATE discounts SET name = ?, type = ?, value = ?, active = ? WHERE id = ?"
      )
      .run(name, type, value, active, id);
  },

  delete: async (id: number) => {
    return await db.prepare("DELETE FROM discounts WHERE id = ?").run(id);
  },
};

// Transaction queries
export const transactionQueries = {
  getAll: async () => {
    return await db
      .prepare(
        `
      SELECT t.*, o.table_number, o.total_price 
      FROM transactions t 
      LEFT JOIN orders o ON t.order_id = o.id
      ORDER BY t.created_at DESC
    `
      )
      .all();
  },

  create: async (orderId: number, amount: number, paymentMethod: string) => {
    return await db
      .prepare(
        "INSERT INTO transactions (order_id, amount, payment_method) VALUES (?, ?, ?)"
      )
      .run(orderId, amount, paymentMethod);
  },

  getDailySales: async (date: string) => {
    return await db
      .prepare(
        `
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM transactions 
      WHERE DATE(created_at) = ?
    `
      )
      .get(date);
  },

  getMonthlySales: async (year: number, month: number) => {
    return await db
      .prepare(
        `
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM transactions 
      WHERE strftime('%Y', created_at) = ? AND strftime('%m', created_at) = ?
    `
      )
      .get(year.toString(), month.toString().padStart(2, "0"));
  },

  update: async (id: number, amount: number, paymentMethod: string) => {
    return await db
      .prepare(
        "UPDATE transactions SET amount = ?, payment_method = ? WHERE id = ?"
      )
      .run(amount, paymentMethod, id);
  },

  delete: async (id: number) => {
    return await db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
  },

  // Report queries
  getDailyReport: async (date: string) => {
    return await db
      .prepare(
        `
      SELECT t.*, o.table_number, o.total_price 
      FROM transactions t 
      LEFT JOIN orders o ON t.order_id = o.id
      WHERE DATE(t.created_at) = ?
      ORDER BY t.created_at DESC
    `
      )
      .all(date);
  },

  getWeeklyReport: async (startDate: string, endDate: string) => {
    return await db
      .prepare(
        `
      SELECT t.*, o.table_number, o.total_price 
      FROM transactions t 
      LEFT JOIN orders o ON t.order_id = o.id
      WHERE DATE(t.created_at) BETWEEN ? AND ?
      ORDER BY t.created_at DESC
    `
      )
      .all(startDate, endDate);
  },

  getMonthlyReport: async (year: number, month: number) => {
    return await db
      .prepare(
        `
      SELECT t.*, o.table_number, o.total_price 
      FROM transactions t 
      LEFT JOIN orders o ON t.order_id = o.id
      WHERE strftime('%Y', t.created_at) = ? AND strftime('%m', t.created_at) = ?
      ORDER BY t.created_at DESC
    `
      )
      .all(year.toString(), month.toString().padStart(2, "0"));
  },

  getYearlyReport: async (year: number) => {
    return await db
      .prepare(
        `
      SELECT t.*, o.table_number, o.total_price 
      FROM transactions t 
      LEFT JOIN orders o ON t.order_id = o.id
      WHERE strftime('%Y', t.created_at) = ?
      ORDER BY t.created_at DESC
    `
      )
      .all(year.toString());
  },

  getMostSoldProducts: async (startDate: string, endDate: string) => {
    return await db
      .prepare(
        `
      SELECT 
        m.id,
        m.name as product_name,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.quantity * oi.price) as total_sales,
        COUNT(DISTINCT oi.order_id) as order_count
      FROM order_items oi
      LEFT JOIN menu_items m ON oi.menu_item_id = m.id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE DATE(o.created_at) BETWEEN ? AND ?
      GROUP BY m.id, m.name
      ORDER BY total_quantity DESC
      LIMIT 10
    `
      )
      .all(startDate, endDate);
  },
};
