import { sign } from "jsonwebtoken";
import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../../app";
import { connectDB, disconnectDB } from "../../db/db";
import authorModel from "../../models/authorModel";
import { depopulate, getUser, populateAuthors, populateUsers } from "../populators";

describe("author controller", () => {
  let userToken: string;
  let adminToken: string;

  let marioId: string;

  beforeAll(async () => {
    await connectDB();
    await populateAuthors();
    await populateUsers();

    userToken = sign({ id: (await getUser("strawberry"))._id }, process.env.JWT_SECRET!);
    adminToken = sign({ id: (await getUser("elderberry"))._id }, process.env.JWT_SECRET!);
    marioId = (await authorModel.findOne({ name: "Mario" }))._id;
  });

  afterAll(async () => {
    await depopulate();
    await disconnectDB();
  });

  it("returns 400 if get all with bad page", async () => {
    const res = await supertest(app).get("/api/authors")
      .query({
        page: "hehe",
      })
      .send();
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 if get all with bad per_page", async () => {
    const res = await supertest(app).get("/api/authors")
      .query({ per_page: -1 }).send();
    expect(res.statusCode).toBe(400);
  });

  it("returns 200 if get all with good query", async () => {
    const res = await supertest(app).get("/api/authors").query({ per_page: 3 }).send();
    expect(res.statusCode).toBe(200);
    expect(res.body.authors).toHaveLength(3);
    expect(res.body.total_pages).toBe(2);
    expect(res.body.total).toBe(6);
  });

  it("returns 200 if get ALL", async () => {
    const res = await supertest(app).get("/api/authors").query({ all: true }).send();
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(6);
  });

  it("returns 200 even with page too large", async () => {
    const res = await supertest(app).get("/api/authors").query({ page: 3 }).send();
    expect(res.statusCode).toBe(200);
    expect(res.body.total_pages).toBe(1);
    expect(res.body.page).toBe(1);
  });

  it("returns 401 if not logged in to upload author", async () => {
    const res = await supertest(app).post("/api/authors").send();
    expect(res.statusCode).toBe(401);
  });

  it("returns 401 if logged in as user to upload author", async () => {
    const res = await supertest(app).post("/api/authors").set("Authorization", `Bearer ${userToken}`).send();
    expect(res.statusCode).toBe(401);
  });

  it("returns 400 if upload author blank", async () => {
    const res = await supertest(app).post("/api/authors").set("Authorization", `Bearer ${adminToken}`).send({ name: "" });
    expect(res.statusCode).toBe(400);
  });

  // This should be 409 (Conflict) instead of 400.
  it("returns 400 if upload author already exists", async () => {
    const res = await supertest(app).post("/api/authors").set("Authorization", `Bearer ${adminToken}`).send({ name: "Mario" });
    expect(res.statusCode).toBe(400);
  });

  // This should be 201 (Resource Created) instead of 200.
  it("returns 200 if upload author success", async () => {
    const res = await supertest(app).post("/api/authors").set("Authorization", `Bearer ${adminToken}`).send({ name: "Toad" });
    expect(res.statusCode).toBe(200);

    // Cleanup
    await authorModel.deleteOne({ name: "Toad" });
  });

  it("returns 401 if update author without admin", async () => {
    const res = await supertest(app).put("/api/authors/1").set("Authorization", `Bearer ${userToken}`).send();
    expect(res.statusCode).toBe(401);
  });

  it("returns 400 if update ID doesn't conform with MongoDB", async () => {
    const res = await supertest(app).put("/api/authors/notmongoid").set("Authorization", `Bearer ${adminToken}`).send();
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 if update author with empty name", async () => {
    const res = await supertest(app).put(`/api/authors/${marioId}`).set("Authorization", `Bearer ${adminToken}`).send({ name: "" });
    expect(res.statusCode).toBe(400);
  })

  // This should be 409 (Conflict), but backend design says 400.
  it("returns 400 if update author with name already exists", async () => {
    const res = await supertest(app).put(`/api/authors/${marioId}`).set("Authorization", `Bearer ${adminToken}`).send({ name: "Luigi" });
    expect(res.statusCode).toBe(400);
  });

  it("returns 200 if update author successfully", async () => {
    const res = await supertest(app).put(`/api/authors/${marioId}`).set("Authorization", `Bearer ${adminToken}`).send({ name: "Metal Mario" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name", "Metal Mario");

    // Cleanup
    await authorModel.updateOne({ name: "Metal Mario" }, { name: "Mario" });
  });

  it("returns 401 if delete author without admin", async () => {
    const res = await supertest(app).delete("/api/authors/1").set("Authorization", `Bearer ${userToken}`).send();
    expect(res.statusCode).toBe(401);
  });

  it("returns 400 if delete ID doesn't conform with MongoDB", async () => {
    const res = await supertest(app).delete("/api/authors/notmongodb").set("Authorization", `Bearer ${adminToken}`).send();
    expect(res.statusCode).toBe(400);
  });

  // This should be 404 (Not Found) but backend design says 400.
  it("returns 400 if delete ID doesn't exist", async () => {
    const res = await supertest(app).delete("/api/authors/f322eef10bf1fdfdede8de4e").set("Authorization", `Bearer ${adminToken}`).send();
    expect(res.statusCode).toBe(400);
  });

  // This should fake out the delete() call because the delete() call is tremendously destructive to any test files.
  // But because this app was written in CommonJS, we can't mock anything at all. Everything has to be run as it's written.
  // Another reason to fuck CommonJS.
  it("returns 200 if delete author successfully", async () => {
    const res = await supertest(app).delete(`/api/authors/${marioId}`).set("Authorization", `Bearer ${adminToken}`).send();
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name", "Mario");
  });
});
