import { faker } from "@faker-js/faker";
import { sign } from "jsonwebtoken";
import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../../app";
import { connectDB, disconnectDB } from "../../db/db";
import reportModel from "../../models/reportModel";
import {
  depopulate,
  getManga,
  getUser,
  populateAuthors,
  populateCategories,
  populateChapters,
  populateComments,
  populateMangas,
  populateReports,
  populateUsers,
} from "../populators";

describe("reports controller", () => {
  let admin: string;
  let user: string;

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
    await populateComments();
    await populateReports();

    // Get an admin token.
    const elderberry = await getUser("elderberry");
    admin = sign({ id: elderberry._id }, process.env.JWT_SECRET!);

    // Get a user token.
    const strawberry = await getUser("strawberry");
    user = sign({ id: strawberry._id }, process.env.JWT_SECRET!);
  });

  afterAll(async () => {
    await depopulate();
    await disconnectDB();
  });

  describe("get /api/reports", () => {
    it("returns 401 if not admin", async () => {
      const res = await supertest(app)
        .get("/api/reports")
        .set("Authorization", `Bearer ${user}`)
        .send();
      expect(res.statusCode).toBe(401);
    });

    it("returns 400 if bad query", async () => {
      const res = await supertest(app)
        .get("/api/reports")
        .query({
          page: -1,
        })
        .set("Authorization", `Bearer ${admin}`)
        .send();
      expect(res.statusCode).toBe(400);
    });

    it("returns 200 when showing processed", async () => {
      const res = await supertest(app)
        .get("/api/reports")
        .query({ show_processed: true })
        .set("Authorization", `Bearer ${admin}`)
        .send();
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("total", 3);
      expect(res.body.reports).toHaveLength(3);
    });

    it("returns 200 if good query", async () => {
      const res = await supertest(app)
        .get("/api/reports")
        .set("Authorization", `Bearer ${admin}`)
        .send();
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("total", 3);
      expect(res.body.reports).toHaveLength(3);
    });
  });

  describe("post /api/reports", () => {
    const fakeId = faker.database.mongodbObjectId();

    it("returns 401 if not logged in", async () => {
      const res = await supertest(app).post("/api/reports").send();
      expect(res.statusCode).toBe(401);
    });

    it("returns 400 if bad description", async () => {
      const res = await supertest(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${user}`)
        .send();
      expect(res.statusCode).toBe(400);
    });

    it("returns 400 if multiple fields are set", async () => {
      const res = await supertest(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${user}`)
        .send({ description: "Description", manga: "1", chapter: "2" });
      expect(res.statusCode).toBe(400);
    });

    it("returns 404 if manga not available", async () => {
      const res = await supertest(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${user}`)
        .send({ description: "Description", manga: fakeId });
      expect(res.statusCode).toBe(404);
    });

    it("returns 404 if chapter not available", async () => {
      const res = await supertest(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${user}`)
        .send({ description: "Description", chapter: fakeId });
      expect(res.statusCode).toBe(404);
    });

    it("returns 404 if comment not available", async () => {
      const res = await supertest(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${user}`)
        .send({ description: "Description", comment: fakeId });
      expect(res.statusCode).toBe(404);
    });

    it("returns 200 if success", async () => {
      const shattered = (await getManga("Shattered"))._id;
      const res = await supertest(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${user}`)
        .send({
          description: "Description",
          manga: shattered,
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("informant");
      expect(res.body).toHaveProperty("description", "Description");
      expect(res.body).toHaveProperty("manga");
    });
  });

  describe("delete /api/reports/:id", () => {
    let report: any;
    let fakeReportId = faker.database.mongodbObjectId();

    beforeAll(async () => {
      report = await reportModel.findOne({ description: "Description" });
    });

    it("returns 401 if not admin", async () => {
      const res = await supertest(app)
        .delete(`/api/reports/${report._id}`)
        .set("Authorization", `Bearer ${user}`)
        .send();
      expect(res.statusCode).toBe(401);
    });

    it("returns 404 if not found report", async () => {
      const res = await supertest(app)
        .delete(`/api/reports/${fakeReportId}`)
        .set("Authorization", `Bearer ${admin}`)
        .send();
      expect(res.statusCode).toBe(404);
    });

    it("returns 200 if deleted", async () => {
      const res = await supertest(app)
        .delete(`/api/reports/${report._id}`)
        .set("Authorization", `Bearer ${admin}`)
        .send();
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("_id");
      await expect(reportModel.countDocuments()).resolves.toBe(3);
    });
  });

  describe("put /api/reports/:id", () => {
    let report: any;
    const fakeId = faker.database.mongodbObjectId();

    beforeAll(async () => {
      report = (await reportModel.aggregate().sample(1))[0];
    });

    it("returns 401 if not admin", async () => {
      const res = await supertest(app)
        .put(`/api/reports/${report._id}`)
        .set("Authorization", `Bearer ${user}`)
        .send();
      expect(res.statusCode).toBe(401);
    });

    it("returns 404 if not found", async () => {
      const res = await supertest(app)
        .put(`/api/reports/${fakeId}`)
        .set("Authorization", `Bearer ${admin}`)
        .send();
      expect(res.statusCode).toBe(404);
    });

    it("returns 200 if success", async () => {
      const res = await supertest(app)
        .put(`/api/reports/${report._id}`)
        .set("Authorization", `Bearer ${admin}`)
        .send();
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("processed", true);
    });
  });
});
