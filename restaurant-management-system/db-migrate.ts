import getDB from "./db-connection.js";

async function migrateDatabase() {
  let db;
  try {
    db = await getDB();
    console.log("Starting database migration...");

    try {
      await db.exec(
        `ALTER TABLE users ADD COLUMN party TEXT NOT NULL DEFAULT 'cafe and restaurents';`
      );
      console.log("✓ Added party column to users table");
    } catch (error) {
      console.log("⊘ Party column already exists in users table");
    }

    try {
      await db.exec(`ALTER TABLE menu_items ADD COLUMN image_url TEXT;`);
      console.log("✓ Added image_url column to menu_items table");
    } catch (error) {
      console.log("⊘ image_url column already exists in menu_items table");
    }

    try {
      await db.exec(`ALTER TABLE orders ADD COLUMN waiter_name TEXT;`);
      console.log("✓ Added waiter_name column to orders table");
    } catch (error) {
      console.log("⊘ waiter_name column already exists in orders table");
    }

    await db.exec(`
      UPDATE orders 
      SET waiter_name = (SELECT name FROM users WHERE users.id = orders.waiter_id)
      WHERE waiter_name IS NULL;
    `);
    console.log("✓ Populated waiter_name for existing orders");

    console.log("\n✅ Database migration completed successfully!");
  } catch (error) {
    console.error("❌ Database migration failed:", (error as Error).message);
    process.exit(1);
  }
}

migrateDatabase();
