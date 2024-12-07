import { faker } from "@faker-js/faker";
import { cleanup, render } from "@testing-library/react";
import { page } from "@vitest/browser/context";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import SearchQueryDisplay from "../../../components/search/SearchQueryDisplay.jsx";
import { $searchGenres, $searchText } from "../../../stores/search.js";

describe("SearchQueryDisplay component", () => {
  const fakeMangas = [...Array(100)].map((_) => ({
    _id: faker.database.mongodbObjectId(),
    name: faker.book.title(),
    authors: [
      { _id: faker.database.mongodbObjectId(), name: faker.book.author() },
    ],
    categories: [...Array(3)].map((_) => ({
      _id: faker.database.mongodbObjectId(),
      name: faker.book.genre(),
    })),
    cover: faker.image.urlPlaceholder(),
    description: faker.lorem.sentences(3),
    status: faker.helpers.arrayElement([
      "In progress",
      "Completed",
      "Suspended",
    ]),
    uploader: faker.database.mongodbObjectId(),
    canComment: true,
    overallRating: faker.number.float({ min: 0, max: 5 }),
  }));

  // Fake the fetch by partially implementing the search. We don't care about the query though.
  // Query searching should have been checked in the backend side already.
  // Here, the data is randomly faked, we can't know for sure what to expect back.
  const fetchMock = vi.fn(async (url, opts) => {
    const params = new URL(url).searchParams;
    const page = Number(params.get("page"));
    const totalPages = Math.ceil(fakeMangas.length / 20);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return new Response(
      JSON.stringify({
        page,
        per_page: 20,
        total: 100,
        total_pages: totalPages,
        mangas: fakeMangas.slice(page * 20, page * 20 + 20),
      }),
      { status: 200 },
    );
  });

  // Throw a random error in fetch().
  const fetchMockError = vi.fn(async () => {
    return new Response(null, { status: 400 });
  });

  // Returns nothing.
  const fetchMockEmpty = vi.fn(async () => {
    return new Response(
      JSON.stringify({
        page: 1,
        per_page: 20,
        total: 0,
        total_pages: 0,
        mangas: [],
      }),
    );
  });

  beforeAll(() => {
    $searchText.set("");
    $searchGenres.set([]);
    vi.useFakeTimers();
  });

  beforeEach(async () => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
  });

  afterAll(async () => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("renders a loading state", async () => {
    render(<SearchQueryDisplay />);
    expect(
      page.getByTestId("search-manga-loading").elements().length,
    ).toBeGreaterThan(0);
  });

  it("renders first few search results", async () => {
    render(<SearchQueryDisplay />);
    await vi.advanceTimersByTimeAsync(2000);

    // There can be duplicate names, so we check if the elements are just displayed.
    expect(
      page.getByRole("heading", { name: fakeMangas[0].name }).elements().length,
    ).toBeGreaterThan(0);
    expect(
      page.getByRole("heading", { name: fakeMangas[19].name }).elements()
        .length,
    ).toBeGreaterThan(0);
  });

  it("renders error handling if there was an error", async () => {
    vi.stubGlobal("fetch", fetchMockError);
    render(<SearchQueryDisplay />);
    await expect.element(page.getByText("There was an error")).toBeVisible();
  });

  it("renders empty message if there was no results", async () => {
    vi.stubGlobal("fetch", fetchMockEmpty);
    render(<SearchQueryDisplay />);
    await expect.element(page.getByText("There's nothing")).toBeVisible();
  });
});
