import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Container, Section } from "@/components/shared/container";

describe("Container", () => {
  it("renders children with default width class", () => {
    render(<Container data-testid="container">Content</Container>);
    const el = screen.getByTestId("container");
    expect(el).toHaveClass("max-w-6xl");
    expect(el).toHaveTextContent("Content");
  });

  it("applies narrow size variant", () => {
    render(
      <Container size="narrow" data-testid="container">
        Narrow
      </Container>,
    );
    expect(screen.getByTestId("container")).toHaveClass("max-w-2xl");
  });
});

describe("Section", () => {
  it("renders as section with spacing classes", () => {
    render(<Section data-testid="section">Block</Section>);
    const el = screen.getByTestId("section");
    expect(el.tagName).toBe("SECTION");
    expect(el.className).toMatch(/py-/);
  });
});
