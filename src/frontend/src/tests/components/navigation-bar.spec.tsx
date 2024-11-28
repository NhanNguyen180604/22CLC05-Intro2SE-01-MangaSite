import { cleanup, fireEvent, render } from "@testing-library/react";
import { page, userEvent } from "@vitest/browser/context";
import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DesktopNavigationBar from "../../components/DesktopNavigationBar.jsx";
import MobileNavigationBar from "../../components/MobileNavigationBar.jsx";

describe("navigation bar", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.mock("axios");
    vi.spyOn(axios, "get").mockImplementation(
      vi.fn(async (url) => ({
        status: 200,
        data: {
          name: "luna",
          email: "luna@example.com",
        },
      })),
    );
  });

  afterEach(async () => {
    vi.unmock("axios");
    vi.restoreAllMocks();
    cleanup();
  });

  it("should show mobile version on small screens", async () => {
    render(
      <>
        <MobileNavigationBar />
        <DesktopNavigationBar />
      </>,
    );
    await page.viewport(375, 600);

    await expect.element(page.getByTestId("mobile-nav-bar")).toBeVisible();
    await expect.element(page.getByTestId("desktop-nav-bar")).not.toBeVisible();
  });

  it("should show desktop version on big screens", async () => {
    render(
      <>
        <MobileNavigationBar />
        <DesktopNavigationBar />
      </>,
    );
    await page.viewport(1280, 720);

    await expect.element(page.getByTestId("mobile-nav-bar")).not.toBeVisible();
    await expect.element(page.getByTestId("desktop-nav-bar")).toBeVisible();
  });

  it("should show nothing if not authorized", async () => {
    vi.resetModules();
    vi.mock("axios");
    vi.spyOn(axios, "get").mockImplementation(
      vi.fn(async (url) => ({ status: 401 })),
    );

    render(
      <>
        <MobileNavigationBar />
        <DesktopNavigationBar />
      </>,
    );
    await expect
      .element(page.getByTestId("mobile-nav-bar"))
      .not.toBeInTheDocument();
    await expect
      .element(page.getByTestId("desktop-nav-bar"))
      .not.toBeInTheDocument();

    vi.unmock("axios");
    vi.restoreAllMocks();
  });

  it("should expand on hover desktop bar", async () => {
    render(<DesktopNavigationBar />);
    await page.viewport(1280, 720);

    const link = page.getByRole("link", { name: "Profile" });
    const publishButton = page.getByRole("link", { name: "Publish" });
    await expect.element(link).toBeVisible();
    await expect.element(publishButton).not.toBeInTheDocument();

    await link.hover();
    await expect.element(publishButton).toBeInTheDocument();
  });

  it("should expand on mouse enter desktop bar", async () => {
    const comp = render(<DesktopNavigationBar />);
    await page.viewport(1280, 720);

    const navBar = comp.getByTestId("desktop-nav-bar");
    const link = page.getByRole("link", { name: "Profile" });
    const publishButton = page.getByRole("link", { name: "Publish" });

    await expect.element(link).toBeVisible();
    await expect.element(publishButton).not.toBeInTheDocument();

    fireEvent.mouseEnter(navBar);
    await expect.element(publishButton).toBeInTheDocument();
    fireEvent.mouseLeave(navBar);
    await expect.element(publishButton).toBeInTheDocument();
  });

  it("should expand on focus desktop bar", async () => {
    const comp = render(<DesktopNavigationBar />);
    await page.viewport(1280, 720);

    const navBar = comp.getByTestId("desktop-nav-bar");
    const link = page.getByRole("link", { name: "Profile" });
    const publishButton = page.getByRole("link", { name: "Publish" });

    await expect.element(link).toBeVisible();
    await expect.element(publishButton).not.toBeInTheDocument();

    await userEvent.keyboard("{Tab}");
    await expect.element(navBar).toHaveFocus();
    await expect.element(publishButton).toBeInTheDocument();
    fireEvent.blur(navBar);
    await expect.element(publishButton).not.toBeInTheDocument();
  });
});
