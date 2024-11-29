import { cleanup, render } from "@testing-library/react";
import { page, userEvent } from "@vitest/browser/context";
import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BlackLayer from "../../components/misc/BlackLayer.jsx";
import SearchBox from "../../components/search/SearchBox.jsx";

describe("search box", () => {
  const categoriesData = ["Shojo", "Romcom", "Princess", "Wet"];
  const queryData = categoriesData.map((cat) => ({ name: cat }));

  beforeEach(() => {
    vi.resetModules();
    vi.mock("axios");
  });

  afterEach(() => {
    cleanup();
    vi.unmock("axios");
    vi.restoreAllMocks();
  });

  it("should render", async () => {
    vi.spyOn(axios, "get").mockResolvedValueOnce({
      status: 200,
      data: { categories: queryData },
    });
    render(<SearchBox />);
    const comp = page.getByRole("textbox");
    await expect.element(comp).toBeVisible();
  });

  it("should throw error if nothing is supplied", async () => {
    vi.spyOn(axios, "get").mockImplementationOnce(() => {
      throw new Error("Placebo");
    });
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

  it("should show list if it succeeds", async () => {
    vi.spyOn(axios, "get").mockResolvedValueOnce({
      status: 200,
      data: { categories: queryData },
    });
    render(<SearchBox />);

    const input = page.getByRole("textbox");
    await input.click();
    await expect.element(input).toHaveFocus();

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
    vi.spyOn(axios, "get").mockResolvedValueOnce({
      status: 200,
      data: { categories: queryData },
    });
    render(<SearchBox />);

    const input = page.getByRole("textbox");
    await input.click();
    await expect.element(input).toHaveFocus();
    await userEvent.type(input, "ntnhan69");
    expect(localStorage.getItem("search-text")).toEqual("ntnhan69");
  });

  it("should close if click on black layer", async () => {
    vi.spyOn(axios, "get").mockResolvedValueOnce({
      status: 200,
      data: { categories: queryData },
    });
    const comp = render(
      <>
        <BlackLayer />
        <SearchBox />
      </>,
    );

    const input = page.getByRole("textbox");
    await input.click();
    await expect.element(input).toHaveFocus();

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
});
