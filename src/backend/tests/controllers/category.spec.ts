import { sign } from "jsonwebtoken";
import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../../app";
import { connectDB, disconnectDB } from "../../db/db";
import { depopulate, getUser, populateCategories, populateUsers } from "../populators";

describe("category controller", () => {
  let userToken = "";
  let adminToken = "";

  beforeAll(async () => {
    await connectDB();
    await populateCategories();
    await populateUsers();

    // Collect a token for authorization.
    // Oh I love when I have 0 clues what types are returned because every single fucking thing is "any".
    userToken = sign({ id: (await getUser("strawberry"))._id }, process.env.JWT_SECRET!);
    adminToken = sign({ id: (await getUser("elderberry"))._id }, process.env.JWT_SECRET!);
  });

  afterAll(async () => {
    await depopulate();
    await disconnectDB();
  });

  it("returns 400 if get categories with bad query page", async () => {
    const res = await supertest(app).get("/api/categories").query({ page: "page" }).send();
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 if get categories with bad query per_page", async () => {
    const res = await supertest(app).get("/api/categories").query({ per_page: -1.2 }).send();
    expect(res.statusCode).toBe(400);
  });

  it("returns 200 if get categories correctly", async () => {
    const res = await supertest(app).get("/api/categories").send();
    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(7);
  });

  it("returns 401 if upload category without admin", async () => {
    const res = await supertest(app).post("/api/categories").set("Authorization", `Bearer ${userToken}`).send({ name: "Shonen" });
    expect(res.statusCode).toBe(401);
  });

  it("returns 400 if upload category without name", async () => {
    const res = await supertest(app).post("/api/categories").set("Authorization", `Bearer ${adminToken}`).send({ name: "" });
    expect(res.statusCode).toBe(400);
  });

  // This should be 409 (Conflict)
  it("returns 400 if upload category with taken name", async () => {
    const res = await supertest(app).post("/api/categories").set("Authorization", `Bearer ${adminToken}`).send({ name: "Shojo" });
    expect(res.statusCode).toBe(400);
  });

  // This should be 201 (Resource Created)
  it("returns 200 if upload category success", async () => {
    const res = await supertest(app).post("/api/categories").set("Authorization", `Bearer ${adminToken}`).send({ name: "Shonen" });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toEqual("Shonen");
  });
});
