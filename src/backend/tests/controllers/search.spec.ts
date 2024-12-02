import supertest from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import server from "../../server";
import { populateAuthors, populateCategories, populateMangas, populateUsers } from "../populators";

describe("search controller", async () => {
  beforeAll(async () => {
    expect(process.env.VITEST).toBeDefined();

    // Populate data
    await populateUsers();
    await populateAuthors();
    await populateCategories();
    await populateMangas();
  });

  it("returns 400 with no query param", async () => {
    const res = await supertest(server).get("/api/search").query({
      include_categories: "Shojo",
    }).send();
    expect(res.body).toHaveProperty("message", "q: Required");
    expect(res.statusCode).toBe(400);
  });

  it("returns correct results given param", async () => {
    const res = await supertest(server).get("/api/search").query({
      q: "five five five",
    }).send();
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("total", 1);
    expect(res.body).toHaveProperty("total_pages", 1);
    expect(res.body).toHaveProperty("page", 1);
    expect(res.body).toHaveProperty("per_page", 20);

    const mangas = res.body.mangas;
    expect(mangas).toHaveLength(1);
    expect(mangas[0].name).toBe("Five Five Five Five Five");
  });

  it("returns correct results given categories", async () => {
    const res = await supertest(server).get("/api/search").query({
      q: "",
      include_categories: "Fantasy",
      exclude_categories: "Romance",
    }).send();

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(2);
  });

  it("returns correct results with non ascii query", async () => {
    const res = await supertest(server).get("/api/search").query({ q: "馬鹿野郎" }).send();
    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(1);
  });

  it("returns correct results given authors", async () => {
    const res = await supertest(server).get("/api/search").query({
      q: "",
      include_authors: "Mario",
      exclude_authors: "Peach",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(0);
  });

  it("paginates", async () => {
    const res = await supertest(server).get("/api/search").query({
      q: "",
      per_page: 1,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(5);
    expect(res.body.total_pages).toBe(5);
    expect(res.body.per_page).toBe(1);
  });
});
