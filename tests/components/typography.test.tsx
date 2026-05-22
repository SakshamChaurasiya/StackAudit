import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Display, Eyebrow, Lead } from "@/components/shared/typography";

describe("Typography", () => {
  it("renders Display as h1 by default", () => {
    render(<Display>Headline</Display>);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Headline");
  });

  it("renders Eyebrow with brand styling", () => {
    render(<Eyebrow>Label</Eyebrow>);
    expect(screen.getByText("Label")).toHaveClass("text-brand");
  });

  it("renders Lead with muted color", () => {
    render(<Lead>Subcopy</Lead>);
    expect(screen.getByText("Subcopy")).toHaveClass("text-muted-foreground");
  });
});
