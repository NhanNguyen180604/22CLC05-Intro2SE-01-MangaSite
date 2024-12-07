import { faker } from "@faker-js/faker";
import { cleanup, render } from "@testing-library/react";
import { page } from "@vitest/browser/context";
import { afterEach, describe, expect, it } from "vitest";
import AuthorsSpread from "../../../components/search/AuthorsSpread.jsx";

describe("AuthorsSpread component", async () => {
  const fakeAuthors = [...Array(faker.number.int({ min: 1, max: 3 }))].map(
    (_) => ({
      _id: faker.database.mongodbObjectId(),
      name: faker.book.author(),
    }),
  );
  const fakeEmptyAuthors: { _id: string; name: string }[] = [];

  afterEach(async () => {
    cleanup();
  });

  it("shows 'no one' if there's no author", async () => {
    render(<AuthorsSpread authors={fakeEmptyAuthors} />);
    await expect.element(page.getByText("No one?")).toBeVisible();
  });

  it("shows all authors if there are authors", async () => {
    render(<AuthorsSpread authors={fakeAuthors} />);
    fakeAuthors.forEach(async (author) => {
      await expect.element(page.getByText(author.name)).toBeVisible();
    });
  });
});
