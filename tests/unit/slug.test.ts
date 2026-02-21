import { describe, expect, it, vi } from "vitest";
import { generateSlug, generateUniqueSlug } from "../../app/lib/slug";

describe("generateSlug", () => {
  it("normalizes whitespace and punctuation", () => {
    expect(generateSlug("  Hello, World!  ")).toBe("hello-world");
  });

  it("removes accents", () => {
    expect(generateSlug("Árvíz tűrő tükörfúrógép")).toBe("arviz-turo-tukorfurogep");
  });
});

describe("generateUniqueSlug", () => {
  it("keeps current slug when unchanged", async () => {
    const existingSlugCheck = vi.fn().mockResolvedValue(false);
    const result = await generateUniqueSlug("Hello World", existingSlugCheck, "hello-world");

    expect(result).toBe("hello-world");
    expect(existingSlugCheck).not.toHaveBeenCalled();
  });

  it("returns base slug when available", async () => {
    const existingSlugCheck = vi.fn().mockResolvedValue(false);
    const result = await generateUniqueSlug("Hello World", existingSlugCheck);

    expect(result).toBe("hello-world");
    expect(existingSlugCheck).toHaveBeenCalledWith("hello-world");
  });

  it("returns numbered slug when base exists", async () => {
    const existingSlugCheck = vi.fn(async (slug: string) => slug === "hello-world");
    const result = await generateUniqueSlug("Hello World", existingSlugCheck);

    expect(result).toBe("hello-world-2");
  });
});
