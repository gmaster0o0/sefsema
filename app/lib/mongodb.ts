import { MongoClient, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

if (!process.env.MONGODB_DB) {
  throw new Error("MONGODB_DB environment variable is not set");
}

const mongoUri = process.env.MONGODB_URI;
const mongoDb = process.env.MONGODB_DB;

// Singleton pattern for MongoDB connection
declare global {
  var mongoClient: MongoClient | undefined;
  var mongoDbInstance: Db | undefined;
}

async function getMongoDb(): Promise<Db> {
  if (typeof globalThis.mongoDbInstance !== "undefined") {
    return globalThis.mongoDbInstance;
  }

  const client = new MongoClient(mongoUri);
  await client.connect();

  const db = client.db(mongoDb);

  if (process.env.NODE_ENV !== "production") {
    globalThis.mongoClient = client;
    globalThis.mongoDbInstance = db;
  }

  return db;
}

export async function getMongoClient(): Promise<MongoClient> {
  if (typeof globalThis.mongoClient !== "undefined") {
    return globalThis.mongoClient;
  }

  const client = new MongoClient(mongoUri);
  await client.connect();

  if (process.env.NODE_ENV !== "production") {
    globalThis.mongoClient = client;
  }

  return client;
}

export { getMongoDb };
