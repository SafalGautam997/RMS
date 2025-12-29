import sqlite3 from "sqlite3";
import { open } from "sqlite";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.SQLITE_PATH || path.join(__dirname, "restaurant.db");

let db: any = null;

export async function getDB() {
  if (!db) {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    db.configure("busyTimeout", 5000);
  }
  return db;
}

export default getDB;
