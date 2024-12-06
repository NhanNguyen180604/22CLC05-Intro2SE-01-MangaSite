import { cleanup, render } from "@testing-library/react";
import { page } from "@vitest/browser/context";
import { afterEach, describe, expect, it } from "vitest";
import DesktopLogo from "../../components/main/DesktopLogo.jsx";

describe("desktop logo", () => {
  afterEach(() => {
    cleanup();
  });

  it("doesn't render on mobile", async () => {
    render(<DesktopLogo />);
    await page.viewport(375, 700);
    await expect.element(page.getByRole("img")).not.toBeInTheDocument();
  });

  it("renders on desktop", async () => {
    render(<DesktopLogo />);
    await page.viewport(1280, 1020);
    await expect.element(page.getByRole("img")).toBeInTheDocument();
    await expect
      .element(page.getByRole("heading"))
      .toHaveTextContent("Openbook");
  });
});
