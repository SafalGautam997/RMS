import getDB from "./db-connection.js";

export async function initDb() {
  let db;
  try {
    // Get database connection
    db = await getDB();

    console.log(`✓ Connected to SQLite database`);

    // Enable foreign keys
    await db.exec("PRAGMA foreign_keys = ON");

    // Create tables
    console.log("Creating tables...");

    // Users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('Admin', 'Waiter')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Users table created");

    // Categories table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Categories table created");

    // Menu items table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category_id INTEGER,
        stock INTEGER DEFAULT 1,
        available INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);
    console.log("✓ Menu items table created");

    // Orders table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_number INTEGER NOT NULL,
        waiter_id INTEGER NOT NULL,
        status TEXT DEFAULT 'Pending',
        subtotal DECIMAL(10, 2) DEFAULT 0,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        total_price DECIMAL(10, 2) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (waiter_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("✓ Orders table created");

    // Order items table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        menu_item_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
      )
    `);
    console.log("✓ Order items table created");

    // Discounts table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS discounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('Percentage', 'Fixed')),
        value DECIMAL(10, 2) NOT NULL,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Discounts table created");

    // Transactions table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);
    console.log("✓ Transactions table created");

    // Create indexes
    console.log("Creating indexes...");
    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`
    );
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name)`
    );
    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id)`
    );
    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available)`
    );
    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_orders_waiter ON orders(waiter_id)`
    );
    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`
    );
    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`
    );
    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_order_items_item ON order_items(menu_item_id)`
    );
    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_discounts_active ON discounts(active)`
    );
    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_transactions_order ON transactions(order_id)`
    );
    console.log("✓ Indexes created");

    // Seed default data
    console.log("Seeding default data...");

    // Check if admin user already exists
    const adminUser = await db.get("SELECT * FROM users WHERE username = ?", [
      "admin",
    ]);

    if (!adminUser) {
      await db.run(
        "INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)",
        ["Admin User", "admin", "admin123", "Admin"]
      );
      console.log("✓ Admin user created (username: admin, password: admin123)");
    }

    // Check if categories already exist
    const categoryCount = await db.get(
      "SELECT COUNT(*) as count FROM categories"
    );
    if (categoryCount.count === 0) {
      const categories = [
        "Appetizers",
        "Main Courses",
        "Desserts",
        "Beverages",
        "Specials",
      ];

      for (const category of categories) {
        await db.run("INSERT INTO categories (name) VALUES (?)", [category]);
      }
      console.log(`✓ ${categories.length} default categories created`);
    }

    // Check if menu items already exist
    const menuItemCount = await db.get(
      "SELECT COUNT(*) as count FROM menu_items"
    );
    if (menuItemCount.count === 0) {
      const appetizersCategory = await db.get(
        "SELECT id FROM categories WHERE name = ?",
        ["Appetizers"]
      );

      const menuItems = [
        {
          name: "Spring Rolls",
          price: 5.99,
          categoryId: appetizersCategory.id,
          stock: 50,
        },
        {
          name: "Samosas",
          price: 4.99,
          categoryId: appetizersCategory.id,
          stock: 40,
        },
      ];

      for (const item of menuItems) {
        await db.run(
          "INSERT INTO menu_items (name, price, category_id, stock, available) VALUES (?, ?, ?, ?, ?)",
          [item.name, item.price, item.categoryId, item.stock, 1]
        );
      }
      console.log(`✓ ${menuItems.length} sample menu items created`);
    }

    console.log("\n✅ Database initialization completed successfully!");
  } catch (error) {
    console.error(
      "❌ Database initialization failed:",
      (error as Error).message
    );
    process.exit(1);
  }
}

// Only run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initDb();
}
