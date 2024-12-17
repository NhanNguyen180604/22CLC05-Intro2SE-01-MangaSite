import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../../app";
import { connectDB, disconnectDB } from "../../db/db";
import { depopulate, populateAuthors, populateCategories, populateChapters, populateMangas, populateUsers } from "../populators";

describe("manga controller", () => {
  beforeAll(async () => {
    await connectDB();
    await depopulate();

    // Populate data for testing
    await Promise.all([
      populateUsers(),
      populateAuthors(),
      populateCategories(),
    ]);
    await populateMangas();
    await populateChapters();
  });

  afterAll(async () => {
    await depopulate();
    await disconnectDB();
  });

  describe("get /api/mangas", () => {
    it("returns 400 if invalid page", async () => {
      const res = await supertest(app).get("/api/mangas").query({ page: -1 }).send();
      expect(res.statusCode).toBe(400);
    });

    it("returns 400 if invalid per_page", async () => {
      const res = await supertest(app).get("/api/mangas").query({ per_page: "null" }).send();
      expect(res.statusCode).toBe(400);
    });
  });
})
