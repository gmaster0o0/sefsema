import { OptionalId, Collection, ObjectId } from "mongodb";
import { createHash } from "crypto";
import { getMongoDb } from "./mongodb";

type Session = {
  token: string;
  userId: string;
  expiresAt: number;
  type?: "access" | "refresh";
  remember?: boolean;
};

interface MongoSession {
  _id: ObjectId;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  type?: "access" | "refresh";
  remember?: boolean;
}

const COLLECTION_NAME = "sessions";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function ensureIndexes(): Promise<void> {
  const db = await getMongoDb();
  const col = db.collection<MongoSession>(COLLECTION_NAME);
  await col.createIndex({ tokenHash: 1 }, { unique: true });
  await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await col.createIndex({ userId: 1 });
}

export const mongoSessionStore = {
  async create(
    userId: string,
    ttlMs: number,
    type: "access" | "refresh" = "access",
    remember: boolean = false,
  ): Promise<string> {
    await ensureIndexes();
    const db = await getMongoDb();
    const col = db.collection<MongoSession>(COLLECTION_NAME) as unknown as Collection<OptionalId<MongoSession>>;

    const token = cryptoRandom();
    const tokenHash = hashToken(token);
    const doc: OptionalId<MongoSession> = {
      tokenHash,
      userId,
      expiresAt: new Date(Date.now() + ttlMs),
      type,
      remember,
    };

    await col.insertOne(doc);
    return token;
  },

  async get(token: string): Promise<Session | null> {
    const db = await getMongoDb();
    const col = db.collection<MongoSession>(COLLECTION_NAME);
    const tokenHash = hashToken(token);
    const doc = await col.findOne({ tokenHash });
    if (!doc) return null;
    return {
      token: token,
      userId: doc.userId,
      expiresAt: doc.expiresAt.getTime(),
      type: doc.type,
      remember: !!doc.remember,
    };
  },

  async delete(token: string): Promise<void> {
    const db = await getMongoDb();
    const col = db.collection<MongoSession>(COLLECTION_NAME);
    const tokenHash = hashToken(token);
    await col.deleteOne({ tokenHash });
  },
};

function cryptoRandom(): string {
  // 32 bytes -> 64 hex chars
  return require("crypto").randomBytes(32).toString("hex");
}
