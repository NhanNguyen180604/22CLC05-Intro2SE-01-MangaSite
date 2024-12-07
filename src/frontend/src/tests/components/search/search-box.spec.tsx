import { cleanup, render } from "@testing-library/react";
import { page, userEvent } from "@vitest/browser/context";
import { allTasks } from "nanostores";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import BlackLayer from "../../../components/misc/BlackLayer.jsx";
import SearchBox from "../../../components/search/SearchBox.jsx";
import { $searchGenres } from "../../../stores/search.js";

const { redirectMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((url) => {}),
}));

vi.mock(import("../../../service/service.js"), async (factory) => {
  const actual = await factory();
  return {
    ...actual,
    redirect: redirectMock,
  };
});

describe("search box", () => {
  const categoriesData = ["Shojo", "Romcom", "Princess", "Wet"];
  const queryData = categoriesData.map((cat) => ({ name: cat }));

  const fetchMock = vi.fn(async (url) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return new Response(JSON.stringify({ categories: queryData }), {
      status: 200,
    });
  });
  const fetchMockError = vi.fn(async (url) => {
    return new Response(null, { status: 400 });
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
  });

  afterAll(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("should render", async () => {
    render(<SearchBox />);
    const comp = page.getByRole("textbox");
    await expect.element(comp).toBeVisible();
  });

  it("should replace localStorage with correct genres if changed", async () => {
    $searchGenres.set(["Shonen"]);
    render(<SearchBox />);
    const input = page.getByRole("textbox");
    await input.click();
    await expect.element(input).toHaveFocus();
    await vi.advanceTimersByTimeAsync(2000);

    await allTasks();
    expect($searchGenres.get()).not.toContain("Shonen");
  });

  it("should throw error if nothing is supplied", async () => {
    vi.stubGlobal("fetch", fetchMockError);
    render(
      <>
        <BlackLayer />
        <SearchBox />
      </>,
    );

    const input = page.getByRole("textbox");
    await input.click();
    await expect.element(input).toHaveFocus();
    await expect.element(page.getByTestId("black-layer")).toBeVisible();
    await expect.element(page.getByText("Error loading tags")).toBeVisible();
  });

  it("should show loading state while rendering", async () => {
    render(<SearchBox />);
    const input = page.getByRole("textbox");
    await input.click();
    await expect.element(input).toHaveFocus();

    expect(page.getByTestId("category-loading-box").elements()).toHaveLength(
      10,
    );
  });

  it("should show list if it succeeds", async () => {
    render(<SearchBox />);

    const input = page.getByRole("textbox");
    await input.click();
    await expect.element(input).toHaveFocus();
    await vi.advanceTimersByTimeAsync(2001);

    const shojo = page.getByText("Shojo");
    await expect.element(shojo).toBeVisible();
    await shojo.click();
    expect(
      localStorage.getItem("search-genres")?.includes("Shojo"),
    ).toBeTruthy();

    await shojo.click();
    expect(
      localStorage.getItem("search-genres")?.includes("Shojo"),
    ).toBeFalsy();
  });

  it("should change search-text in localStorage", async () => {
    render(<SearchBox />);

    const input = page.getByRole("textbox");
    await input.click();
    await expect.element(input).toHaveFocus();
    await userEvent.type(input, "ntnhan69");
    expect(localStorage.getItem("search-text")).toEqual("ntnhan69");
  });

  it("should close if click on black layer", async () => {
    const comp = render(
      <>
        <BlackLayer />
        <SearchBox />
      </>,
    );

    const input = page.getByRole("textbox");
    await input.click();
    await expect.element(input).toHaveFocus();
    await vi.advanceTimersByTimeAsync(2001);

    const shojo = page.getByText("Shojo");
    await expect.element(shojo).toBeVisible();

    const blackLayer = page.getByTestId("black-layer");
    await blackLayer.click();
    await expect.element(blackLayer).not.toBeVisible();
    expect(comp.queryByText("Shojo")).toBeFalsy();

    await input.click();
    await expect.element(input).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect.element(blackLayer).not.toBeVisible();
    expect(comp.queryByText("Shojo")).toBeFalsy();
  });

  it("navigates to search when entered", async () => {
    // How do we even mock window.location.href.
    // Answer: we can't.
    render(<SearchBox />);
    const input = page.getByRole("textbox");
    await input.click();
    await expect.element(input).toHaveFocus();
    await userEvent.keyboard("{Enter}");

    expect(redirectMock).toHaveBeenCalledWith("/search");
    redirectMock.mockClear();
  });

  it("navigates to search when clicked on the icon", async () => {
    render(<SearchBox />);

    const button = page.getByRole("button", { name: "Search" });
    await button.click();
    expect(redirectMock).toHaveBeenCalledWith("/search");
    redirectMock.mockClear();
  });
});
