import { randomUUID, scryptSync } from "crypto";

import type { Role } from "./permissions";

// MongoDB repo will be conditionally imported based on USE_MONGO flag
const USE_MONGO = process.env.USE_MONGO === "true";

export type User = {
  id: string;
  username: string;
  email: string;
  role: Role;
  passwordHash: string;
  createdAt: string;
};

export type PublicUser = Omit<User, "passwordHash">;

export type UserRepository = {
  createUser: (input: Omit<User, "id" | "createdAt">) => Promise<User>;
  findByEmail: (email: string) => Promise<User | null>;
  findByUsername: (username: string) => Promise<User | null>;
  getById: (id: string) => Promise<User | null>;
  listUsers: () => Promise<User[]>;
};

export type Recipe = {
  id: string;
  userId: string;
  title: string;
  slug: string;
  imageUrl: string;
  ingredients: string[];
  preparation: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
};

export type RecipeRepository = {
  createRecipe: (input: Omit<Recipe, "id" | "createdAt">) => Promise<Recipe>;
  updateRecipe: (id: string, updates: Partial<Omit<Recipe, "id" | "createdAt" | "userId">>) => Promise<Recipe | null>;
  deleteRecipe: (id: string) => Promise<boolean>;
  listRecipes: () => Promise<Recipe[]>;
  listPublicRecipes: () => Promise<Recipe[]>;
  listUserRecipes: (userId: string) => Promise<Recipe[]>;
  findBySlug: (slug: string) => Promise<Recipe | null>;
};

type Session = {
  token: string;
  userId: string;
  expiresAt: number;
};
// Use globalThis to persist data across HMR in dev mode
const globalForStore = globalThis as unknown as {
  users: Map<string, User>;
  sessions: Map<string, Session>;
  recipes: Map<string, Recipe>;
};

const users = globalForStore.users ?? new Map<string, User>();
const sessions = globalForStore.sessions ?? new Map<string, Session>();
const recipes = globalForStore.recipes ?? new Map<string, Recipe>();

if (process.env.NODE_ENV !== "production") {
  globalForStore.users = users;
  globalForStore.sessions = sessions;
  globalForStore.recipes = recipes;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const memoryUserRepo: UserRepository = {
  async createUser(input) {
    const user: User = {
      ...input,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };

    users.set(user.id, user);
    return user;
  },

  async findByEmail(email) {
    const normalized = normalizeEmail(email);
    for (const user of users.values()) {
      if (user.email === normalized) {
        return user;
      }
    }

    return null;
  },

  async findByUsername(username) {
    const normalized = username.trim().toLowerCase();
    for (const user of users.values()) {
      if (user.username.toLowerCase() === normalized) {
        return user;
      }
    }

    return null;
  },

  async getById(id) {
    return users.get(id) ?? null;
  },

  async listUsers() {
    return Array.from(users.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
};

/* Event code removed — not used in this codebase */

export const memoryRecipeRepo: RecipeRepository = {
  async createRecipe(input) {
    const recipe: Recipe = {
      ...input,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };

    recipes.set(recipe.id, recipe);
    return recipe;
  },

  async updateRecipe(id, updates) {
    const existing = recipes.get(id);
    if (!existing) {
      return null;
    }

    const updated: Recipe = {
      ...existing,
      ...updates,
    };

    recipes.set(id, updated);
    return updated;
  },

  async deleteRecipe(id) {
    return recipes.delete(id);
  },

  async listRecipes() {
    return Array.from(recipes.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async listPublicRecipes() {
    return Array.from(recipes.values())
      .filter((recipe) => recipe.isPublic)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async listUserRecipes(userId) {
    return Array.from(recipes.values())
      .filter((recipe) => recipe.userId === userId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async findBySlug(slug) {
    for (const recipe of recipes.values()) {
      if (recipe.slug === slug) {
        return recipe;
      }
    }
    return null;
  },
};

function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt <= now) {
      sessions.delete(token);
    }
  }
}

export const memorySessionStore = {
  async create(userId: string, ttlMs: number, type: "access" | "refresh" = "access"): Promise<string> {
    cleanupExpiredSessions();
    const token = randomUUID();
    sessions.set(token, {
      token,
      userId,
      expiresAt: Date.now() + ttlMs,
    });
    return token;
  },

  async get(token: string): Promise<Session | null> {
    cleanupExpiredSessions();
    const session = sessions.get(token);
    if (!session) {
      return null;
    }

    if (session.expiresAt <= Date.now()) {
      sessions.delete(token);
      return null;
    }

    return session;
  },

  async delete(token: string): Promise<void> {
    sessions.delete(token);
  },
};

// Export a `sessionStore` that delegates to either the in-memory or Mongo implementation.
export const sessionStore = (() => {
  if (!USE_MONGO) return memorySessionStore;

  let impl: {
    create: (userId: string, ttlMs: number) => Promise<string>;
    get: (token: string) => Promise<Session | null>;
    delete: (token: string) => Promise<void>;
  } | null = null;

  async function load() {
    if (!impl) {
      const mod = await import("./mongoSessionStore");
      impl = mod.mongoSessionStore;
    }
    return impl as NonNullable<typeof impl>;
  }

  return {
    async create(userId: string, ttlMs: number, type: "access" | "refresh" = "access") {
      const s = await load();
      return s.create(userId, ttlMs, type);
    },
    async get(token: string) {
      const s = await load();
      return s.get(token);
    },
    async delete(token: string) {
      const s = await load();
      return s.delete(token);
    },
  };
})();

// Export a `userRepo` that delegates to either the in-memory or Mongo implementation.
// We avoid statically importing the Mongo implementation because `app/lib/mongodb.ts`
// throws if `MONGODB_URI` / `MONGODB_DB` are not set. Instead load dynamically
// only when `USE_MONGO` is true.
export const userRepo: UserRepository = (() => {
  if (!USE_MONGO) return memoryUserRepo;

  let impl: UserRepository | null = null;

  async function load() {
    if (!impl) {
      const mod = await import("./mongoUserRepo");
      impl = mod.mongoUserRepo;
    }
    return impl as UserRepository;
  }

  return {
    async createUser(input) {
      const r = await load();
      return r.createUser(input);
    },
    async findByEmail(email) {
      const r = await load();
      return r.findByEmail(email);
    },
    async findByUsername(username) {
      const r = await load();
      return r.findByUsername(username);
    },
    async getById(id) {
      const r = await load();
      return r.getById(id);
    },
    async listUsers() {
      const r = await load();
      return r.listUsers();
    },
  } as UserRepository;
})();

export function toPublicUser(user: User): PublicUser {
  const { passwordHash, ...rest } = user;
  return rest;
}

const seedUserId = "seed-user-1";

function createSeedPasswordHash(password: string): string {
  const salt = "seed-salt";
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derivedKey}`;
}

function seedUsers() {
  if (users.size === 0) {
    const seedUser: User = {
      id: seedUserId,
      username: "maria",
      email: "maria@example.com",
      role: "user",
      passwordHash: createSeedPasswordHash("demo1234"),
      createdAt: new Date("2026-02-14T09:00:00Z").toISOString(),
    };

    users.set(seedUser.id, seedUser);
  }
}

// Seed data for demo purposes
function seedRecipes() {
  if (recipes.size === 0) {
    const seedRecipe1: Recipe = {
      id: "seed-1",
      userId: "system",
      title: "Margherita pizza",
      slug: "margherita-pizza",
      imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop",
      ingredients: [
        "Pizza tészta",
        "San Marzano paradicsom",
        "Friss mozzarella",
        "Friss bazsalikom",
        "Extra szűz olívaolaj",
        "Só",
      ],
      preparation:
        "Melegítsd elő a sütőt 250°C-ra. Nyújtsd ki a tésztát vékonyra. Kend meg paradicsommal, tedd rá a mozzarellát. Süsd 10-12 percig, amíg a tészta alja ropogós nem lesz. Tálalás előtt szórd meg friss bazsalikommal és csorgass rá olívaolajat.",
      tags: ["Olasz", "Vegetáriánus", "Főétel"],
      isPublic: true,
      createdAt: new Date("2026-02-15T10:00:00Z").toISOString(),
    };

    const seedRecipe2: Recipe = {
      id: "seed-2",
      userId: "system",
      title: "Csokis keksz",
      slug: "csokis-keksz",
      imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop",
      ingredients: [
        "2 csésze liszt",
        "1 csésze vaj (szobahőmérsékletű)",
        "3/4 csésze fehér cukor",
        "3/4 csésze barna cukor",
        "2 tojás",
        "2 csésze csokoládéchips",
        "1 tk vaníliakivonat",
        "1 tk szódabikarbóna",
        "1/2 tk só",
      ],
      preparation:
        "Melegítsd elő a sütőt 180°C-ra. Keverd össze a vajat a cukorral, add hozzá a tojásokat és a vaníliát. Szitáld hozzá a lisztet, szódabikarbónát és sót. Keverd bele a csokoládéchipseket. Formázz golyókat és helyezd a sütőpapírral bélelt tepsire. Süsd 10-12 percig aranybarnára.",
      tags: ["Desszert", "Vegetáriánus", "Közepes"],
      isPublic: true,
      createdAt: new Date("2026-02-16T14:30:00Z").toISOString(),
    };

    const seedRecipe3: Recipe = {
      id: "seed-3",
      userId: "system",
      title: "Cézár saláta",
      slug: "cezar-salata",
      imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop",
      ingredients: [
        "Római saláta",
        "Pirított kenyérkockák",
        "Parmezán sajt",
        "Cézár öntet",
        "Fokhagyma",
        "Citromlé",
        "Szardella",
      ],
      preparation:
        "Mosd meg és szárítsd meg a salátát, tépd fel nagyobb darabokra. Pirítsd meg a kenyérkockákat. Keverd össze az öntetet a fokhagymával, szardellával és citromlével. Öntsd a salátára, keverd össze. Szórd meg parmezánnal és kenyérkockákkal. Azonnal tálald.",
      tags: ["Gyors", "Előétel", "Könnyű"],
      isPublic: true,
      createdAt: new Date("2026-02-17T09:15:00Z").toISOString(),
    };

    const seedRecipe4: Recipe = {
      id: "seed-4",
      userId: "system",
      title: "Palacsinta",
      slug: "palacsinta",
      imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop",
      ingredients: [
        "2 csésze liszt",
        "2 tojás",
        "1/2 liter tej",
        "1 csipet só",
        "Olaj a sütéshez",
        "Lekvár vagy nutella",
      ],
      preparation:
        "Keverd simára a lisztet, tojást, tejet és sót. Hagyd állni 15 percet. Hevíts fel egy serpenyőt kevés olajjal. Önts bele egy merőkanálnyi tésztát, forgasd körbe a serpenyőt. Süsd mindkét oldalát aranybarnára. Töltsd meg lekvárral vagy nutellával, tekerd fel.",
      tags: ["Magyar", "Desszert", "Vegetáriánus", "Gyors"],
      isPublic: true,
      createdAt: new Date("2026-02-18T11:20:00Z").toISOString(),
    };

    const seedRecipe5: Recipe = {
      id: "seed-5",
      userId: "system",
      title: "Guacamole",
      slug: "guacamole",
      imageUrl: "https://images.unsplash.com/photo-1604467794349-0b74285de7e7?w=800&h=600&fit=crop",
      ingredients: [
        "3 db érett avokádó",
        "1 db lime leve",
        "1/2 csésze apróra vágott hagyma",
        "2 db paradicsom kockázva",
        "1 ek koriander",
        "Só ízlés szerint",
      ],
      preparation:
        "Vájd ki az avokádó húsát és törjed pépesre egy villával. Add hozzá a lime levét, hagymát, paradicsomot és korianderlevelet. Ízesítsd sóval. Keverd össze alaposan. Tálald azonnal tortilla chipsekkel vagy taco-hoz.",
      tags: ["Mexikói", "Vegan", "Gyors", "Előétel"],
      isPublic: true,
      createdAt: new Date("2026-02-19T16:45:00Z").toISOString(),
    };

    const seedRecipe6: Recipe = {
      id: "seed-6",
      userId: seedUserId,
      title: "Citromos ricotta tészta",
      slug: "citromos-ricotta-teszta",
      imageUrl: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop",
      ingredients: [
        "250 g spagetti",
        "1 citrom héja és leve",
        "200 g ricotta",
        "2 gerezd fokhagyma",
        "2 ek olívaolaj",
        "Só",
        "Bors",
        "Reszelt parmezán",
      ],
      preparation:
        "Főzd meg a tésztát sós vízben. Keverd össze a ricottát a citrom levével és héjával, majd add hozzá az olívaolajat és az aprított fokhagymát. Forgasd össze a forró tésztával, és ízesítsd sóval, borssal. Tálaláskor szórd meg parmezánnal.",
      tags: ["Olasz", "Főétel", "Gyors", "Vegetáriánus"],
      isPublic: true,
      createdAt: new Date("2026-02-19T10:30:00Z").toISOString(),
    };

    const seedRecipe7: Recipe = {
      id: "seed-7",
      userId: seedUserId,
      title: "Gyors zöldséges wok",
      slug: "gyors-zoldseges-wok",
      imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop",
      ingredients: [
        "1 csésze brokkoli",
        "1 csésze répa csíkokra vágva",
        "1 paprika",
        "1/2 vöröshagyma",
        "2 ek szójaszósz",
        "1 ek szezámolaj",
        "1 gerezd fokhagyma",
      ],
      preparation:
        "Forrósítsd fel a szezámolajat egy wokban. Add hozzá a hagymát és fokhagymát, majd dobd rá a zöldségeket. Pirítsd nagy lángon 5-7 percig roppanósra. Öntsd rá a szójaszószt, forgasd át, és azonnal tálald.",
      tags: ["Ázsiai", "Főétel", "Gyors", "Vegan"],
      isPublic: true,
      createdAt: new Date("2026-02-19T12:10:00Z").toISOString(),
    };

    recipes.set(seedRecipe1.id, seedRecipe1);
    recipes.set(seedRecipe2.id, seedRecipe2);
    recipes.set(seedRecipe3.id, seedRecipe3);
    recipes.set(seedRecipe4.id, seedRecipe4);
    recipes.set(seedRecipe5.id, seedRecipe5);
    recipes.set(seedRecipe6.id, seedRecipe6);
    recipes.set(seedRecipe7.id, seedRecipe7);
  }
}

// Initialize seed data
seedUsers();
seedRecipes();
