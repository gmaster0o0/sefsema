import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RecipeCard from "../../app/components/RecipeCard";
import type { Recipe } from "../../app/lib/store";

const mockRecipe: Recipe = {
  id: "1",
  userId: "user-1",
  title: "Test Recipe",
  slug: "test-recipe",
  imageUrl: "",
  ingredients: ["ingredient 1", "ingredient 2", "ingredient 3", "ingredient 4"],
  preparation: "Test preparation",
  tags: ["Vegan"],
  isPublic: true,
  createdAt: "2026-02-21T00:00:00.000Z",
};

describe("RecipeCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders recipe title and public badge", () => {
    render(<RecipeCard recipe={mockRecipe} />);

    expect(screen.getByText("Test Recipe")).toBeInTheDocument();
    expect(screen.getByText("Publikus")).toBeInTheDocument();
  });

  it("shows private badge when isPublic is false", () => {
    const privateRecipe = { ...mockRecipe, isPublic: false };
    render(<RecipeCard recipe={privateRecipe} />);

    expect(screen.getByText("Privát")).toBeInTheDocument();
  });

  it("shows own badge when isOwn is true", () => {
    render(<RecipeCard recipe={mockRecipe} isOwn={true} />);

    expect(screen.getByText("Saját")).toBeInTheDocument();
  });

  it("shows edit and delete buttons for own recipes", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<RecipeCard recipe={mockRecipe} isOwn={true} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByRole("button", { name: /Szerkeszt/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Törlés/i })).toBeInTheDocument();
  });

  it("calls onEdit when edit button clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(<RecipeCard recipe={mockRecipe} isOwn={true} onEdit={onEdit} onDelete={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /Szerkeszt/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("calls onDelete when delete button clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<RecipeCard recipe={mockRecipe} isOwn={true} onEdit={vi.fn()} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: /Törlés/i }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("shows first 3 ingredients and count for rest", () => {
    render(<RecipeCard recipe={mockRecipe} />);

    expect(screen.getByText(/ingredient 1/)).toBeInTheDocument();
    expect(screen.getByText(/ingredient 2/)).toBeInTheDocument();
    expect(screen.getByText(/ingredient 3/)).toBeInTheDocument();
    expect(screen.getByText("+ 1 további")).toBeInTheDocument();
  });
});
