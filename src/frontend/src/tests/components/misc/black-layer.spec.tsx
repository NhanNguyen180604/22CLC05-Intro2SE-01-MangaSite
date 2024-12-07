import { cleanup, render } from "@testing-library/react";
import { page } from "@vitest/browser/context";
import { afterEach, describe, expect, it } from "vitest";
import BlackLayer from "../../../components/misc/BlackLayer.jsx";
import { $showBlackLayer } from "../../../stores/black-layer.js";

describe("black layer", () => {
  afterEach(() => {
    cleanup();
  });

  it("should not show if disabled", async () => {
    $showBlackLayer.set(false);
    render(<BlackLayer />);
    await expect.element(page.getByTestId("black-layer")).not.toBeVisible();
  });

  it("should show if enabled", async () => {
    $showBlackLayer.set(true);
    render(<BlackLayer />);
    await expect.element(page.getByTestId("black-layer")).toBeVisible();
  });
});
