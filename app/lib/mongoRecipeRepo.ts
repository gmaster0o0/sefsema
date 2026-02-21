import { ObjectId } from "mongodb";

import { getMongoDb } from "./mongodb";
import type { Recipe, RecipeRepository } from "./store";

const COLLECTION_NAME = "recipes";

interface MongoRecipe {
  _id: ObjectId;
  userId: string;
  title: string;
  slug: string;
  imageUrl: string;
  ingredients: string[];
  preparation: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
}

function toRecipe(doc: MongoRecipe): Recipe {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    title: doc.title,
    slug: doc.slug,
    imageUrl: doc.imageUrl,
    ingredients: doc.ingredients,
    preparation: doc.preparation,
    tags: doc.tags,
    isPublic: doc.isPublic,
    createdAt: doc.createdAt,
  };
}

async function ensureIndexes(): Promise<void> {
  const db = await getMongoDb();
  const collection = db.collection<MongoRecipe>(COLLECTION_NAME);

  await collection.createIndex({ createdAt: -1 });
  await collection.createIndex({ isPublic: 1, createdAt: -1 });
  await collection.createIndex({ userId: 1, createdAt: -1 });
  await collection.createIndex({ slug: 1 }, { unique: true });
}

export const mongoRecipeRepo: RecipeRepository = {
  async createRecipe(input) {
    await ensureIndexes();
    const db = await getMongoDb();
    const collection = db.collection<MongoRecipe>(COLLECTION_NAME);

    const doc: Omit<MongoRecipe, "_id"> = {
      userId: input.userId,
      title: input.title,
      slug: input.slug,
      imageUrl: input.imageUrl,
      ingredients: input.ingredients,
      preparation: input.preparation,
      tags: input.tags,
      isPublic: input.isPublic,
      createdAt: new Date().toISOString(),
    };

    const result = await collection.insertOne(doc as any);
    const inserted = await collection.findOne({ _id: result.insertedId });

    if (!inserted) {
      throw new Error("Failed to retrieve inserted recipe");
    }

    return toRecipe(inserted);
  },

  async updateRecipe(id, updates) {
    await ensureIndexes();
    const db = await getMongoDb();
    const collection = db.collection<MongoRecipe>(COLLECTION_NAME);

    // Filter out fields that should not be updated
    const allowedUpdates: Partial<Omit<MongoRecipe, "_id" | "id" | "createdAt" | "userId">> = {};

    if ("title" in updates && updates.title !== undefined) allowedUpdates.title = updates.title;
    if ("slug" in updates && updates.slug !== undefined) allowedUpdates.slug = updates.slug;
    if ("imageUrl" in updates && updates.imageUrl !== undefined) allowedUpdates.imageUrl = updates.imageUrl;
    if ("ingredients" in updates && updates.ingredients !== undefined) allowedUpdates.ingredients = updates.ingredients;
    if ("preparation" in updates && updates.preparation !== undefined) allowedUpdates.preparation = updates.preparation;
    if ("tags" in updates && updates.tags !== undefined) allowedUpdates.tags = updates.tags;
    if ("isPublic" in updates && updates.isPublic !== undefined) allowedUpdates.isPublic = updates.isPublic;

    // perform update, then fetch the updated document to avoid typing
    // issues with driver return types in different environments
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: allowedUpdates });
    const updated = await collection.findOne({ _id: new ObjectId(id) });
    return updated ? toRecipe(updated) : null;
  },

  async deleteRecipe(id) {
    const db = await getMongoDb();
    const collection = db.collection<MongoRecipe>(COLLECTION_NAME);

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },

  async listRecipes() {
    await ensureIndexes();
    const db = await getMongoDb();
    const collection = db.collection<MongoRecipe>(COLLECTION_NAME);

    const docs = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return docs.map(toRecipe);
  },

  async listPublicRecipes() {
    await ensureIndexes();
    const db = await getMongoDb();
    const collection = db.collection<MongoRecipe>(COLLECTION_NAME);

    const docs = await collection.find({ isPublic: true }).sort({ createdAt: -1 }).toArray();
    return docs.map(toRecipe);
  },

  async listUserRecipes(userId) {
    await ensureIndexes();
    const db = await getMongoDb();
    const collection = db.collection<MongoRecipe>(COLLECTION_NAME);

    const docs = await collection.find({ userId }).sort({ createdAt: -1 }).toArray();
    return docs.map(toRecipe);
  },

  async findBySlug(slug) {
    await ensureIndexes();
    const db = await getMongoDb();
    const collection = db.collection<MongoRecipe>(COLLECTION_NAME);

    const doc = await collection.findOne({ slug });
    return doc ? toRecipe(doc) : null;
  },
};
