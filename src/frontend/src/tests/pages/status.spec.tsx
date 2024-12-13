import { cleanup, render } from "@testing-library/react";
import { page } from "@vitest/browser/context";
import { afterEach, describe, expect, it } from "vitest";
import Page401 from "../../pages/status/401.jsx";

describe("status pages", () => {
  afterEach(async () => {
    cleanup();
  });

  it("renders 401 page", async () => {
    render(<Page401 />);
    await expect
      .element(
        page.getByRole("heading", {
          name: "Where does bro thing bro is going",
        }),
      )
      .toBeVisible();
  });
});
