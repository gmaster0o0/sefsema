import { ObjectId, OptionalId, Collection } from "mongodb";

import { getMongoDb } from "./mongodb";
import type { User, UserRepository } from "./store";

const COLLECTION_NAME = "users";

interface MongoUser {
  _id: ObjectId;
  username: string;
  email: string;
  avatarUrl?: string | null;
  theme?: string | null;
  fontSize?: string | null;
  role: string;
  passwordHash: string;
  createdAt: string;
}

function toUser(doc: MongoUser): User {
  return {
    id: doc._id.toString(),
    username: doc.username,
    email: doc.email,
    avatarUrl: doc.avatarUrl ?? null,
    theme: (doc.theme as User["theme"]) ?? "system",
    fontSize: (doc.fontSize as User["fontSize"]) ?? "normal",
    role: doc.role as User["role"],
    passwordHash: doc.passwordHash,
    createdAt: doc.createdAt,
  };
}

async function ensureIndexes(): Promise<void> {
  const db = await getMongoDb();
  const collection = db.collection<MongoUser>(COLLECTION_NAME);

  await collection.createIndex({ email: 1 }, { unique: true });
  await collection.createIndex({ username: 1 }, { unique: true });
  await collection.createIndex({ createdAt: -1 });
}

export const mongoUserRepo: UserRepository = {
  async createUser(input) {
    await ensureIndexes();
    const db = await getMongoDb();
    const collection = db.collection<MongoUser>(COLLECTION_NAME) as unknown as Collection<OptionalId<MongoUser>>;

    const doc: OptionalId<MongoUser> = {
      username: input.username,
      email: input.email,
      avatarUrl: input.avatarUrl ?? null,
      theme: (input as any).theme ?? "system",
      fontSize: (input as any).fontSize ?? "normal",
      role: input.role,
      passwordHash: input.passwordHash,
      createdAt: new Date().toISOString(),
    };

    const result = await collection.insertOne(doc);
    const inserted = await collection.findOne({ _id: result.insertedId });
    if (!inserted) throw new Error("Failed to retrieve inserted user");
    return toUser(inserted);
  },

  async findByEmail(email) {
    const db = await getMongoDb();
    const collection = db.collection<MongoUser>(COLLECTION_NAME);
    const doc = await collection.findOne({ email: email.trim().toLowerCase() });
    return doc ? toUser(doc) : null;
  },

  async findByUsername(username) {
    const db = await getMongoDb();
    const collection = db.collection<MongoUser>(COLLECTION_NAME);
    const doc = await collection.findOne({ username: username.trim().toLowerCase() });
    return doc ? toUser(doc) : null;
  },

  async getById(id) {
    const db = await getMongoDb();
    const collection = db.collection<MongoUser>(COLLECTION_NAME);
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    return doc ? toUser(doc) : null;
  },

  async updateUser(id, updates) {
    const db = await getMongoDb();
    const collection = db.collection<MongoUser>(COLLECTION_NAME);

    const allowedUpdates: Partial<Omit<MongoUser, "_id" | "role" | "createdAt">> = {};
    if (updates.username !== undefined) allowedUpdates.username = updates.username;
    if (updates.email !== undefined) allowedUpdates.email = updates.email;
    if (updates.avatarUrl !== undefined) allowedUpdates.avatarUrl = updates.avatarUrl;
    if (updates.passwordHash !== undefined) allowedUpdates.passwordHash = updates.passwordHash;
    if ((updates as any).theme !== undefined) allowedUpdates.theme = (updates as any).theme;
    if ((updates as any).fontSize !== undefined) allowedUpdates.fontSize = (updates as any).fontSize;

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: allowedUpdates },
      { returnDocument: "after" },
    );

    return result ? toUser(result) : null;
  },

  async listUsers() {
    await ensureIndexes();
    const db = await getMongoDb();
    const collection = db.collection<MongoUser>(COLLECTION_NAME);
    const docs = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return docs.map(toUser);
  },
};
