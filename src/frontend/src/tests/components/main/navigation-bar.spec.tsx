import { cleanup, fireEvent, render } from "@testing-library/react";
import { page, userEvent } from "@vitest/browser/context";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DesktopNavigationBar from "../../../components/main/DesktopNavigationBar.jsx";
import MobileNavigationBar from "../../../components/main/MobileNavigationBar.jsx";

describe("navigation bar", () => {
  const data = {
    avatar: { url: "https://avatars.githubusercontent.com/u/128211112?v=4" },
  };
  const fetchMeMock = vi.fn(
    async () => new Response(JSON.stringify(data), { status: 200 }),
  );
  const fetchErrorMock = vi.fn(async () => new Response(null, { status: 401 }));

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", fetchMeMock);
  });

  afterEach(async () => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
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
    vi.stubGlobal("fetch", fetchErrorMock);
    render(
      <>
        <MobileNavigationBar />
        <DesktopNavigationBar />
      </>,
    );

    await expect
      .element(page.getByRole("link", { name: "Login" }))
      .toBeInTheDocument();
    await expect
      .element(page.getByTestId("mobile-nav-bar"))
      .not.toBeInTheDocument();
    await expect
      .element(page.getByTestId("desktop-nav-bar"))
      .not.toBeInTheDocument();
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
    expect(publishButton.elements()).toHaveLength(0);

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
