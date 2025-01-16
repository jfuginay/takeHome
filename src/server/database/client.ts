import { MongoClient, Db } from "mongodb";
import { env } from "~/env.mjs"; // Import environment variables

let client: MongoClient | null = null;
let db: Db | null = null;

// Function to get the database connection
export const getDatabaseConnection = async (): Promise<Db> => {
  if (db) {
    return db; // Return existing connection if already established
  }

  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables.");
  }

  if (!client) {
    client = new MongoClient(env.MONGODB_URI, {
      useUnifiedTopology: true,
    });
    await client.connect(); // Connect to MongoDB
  }

  db = client.db(env.MONGODB_DATABASE || "default"); // Use the database name from .env or fallback to "default"
  return db;
};
