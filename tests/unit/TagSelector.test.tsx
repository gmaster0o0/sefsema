import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TagSelector from "../../app/components/TagSelector";

describe("TagSelector", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders tag groups with edit variant", () => {
    render(<TagSelector selectedTags={[]} onToggle={vi.fn()} variant="edit" />);

    expect(screen.getByText("Tagek")).toBeInTheDocument();
    expect(screen.getByText("Több taget is kiválaszthatsz.")).toBeInTheDocument();
  });

  it("renders with filter variant", () => {
    render(<TagSelector selectedTags={[]} onToggle={vi.fn()} variant="filter" />);

    expect(screen.getByText("Szűrés tagek alapján")).toBeInTheDocument();
    expect(screen.queryByText("Több taget is kiválaszthatsz.")).not.toBeInTheDocument();
  });

  it("calls onToggle when tag clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(<TagSelector selectedTags={[]} onToggle={onToggle} />);

    await user.click(screen.getByRole("button", { name: "Vegan" }));

    expect(onToggle).toHaveBeenCalledWith("Vegan");
  });

  it("shows selected tags with black background", () => {
    render(<TagSelector selectedTags={["Vegan", "Gyors"]} onToggle={vi.fn()} />);

    const veganButton = screen.getByRole("button", { name: "Vegan" });
    const gyorsButton = screen.getByRole("button", { name: "Gyors" });

    expect(veganButton).toHaveClass("bg-black", "text-white");
    expect(gyorsButton).toHaveClass("bg-black", "text-white");
  });
});
