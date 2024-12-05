import { sign } from "jsonwebtoken";
import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../../app";
import { connectDB, disconnectDB } from "../../db/db";
import userModel from "../../models/userModel";
import { populateUsers } from "../populators";

describe("get user controllers", async () => {
  beforeAll(async () => {
    await connectDB();
    await populateUsers();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it("doesn't return me if not logged in", async () => {
    const res = await supertest(app).get("/api/users/me").send();
    expect(res.statusCode).toBe(401);
  });

  it("returns me if logged in", async () => {
    const strawberry = await userModel.findOne({ name: "strawberry" });
    const token = sign({ id: strawberry._id }, process.env.JWT_SECRET!);

    const res = await supertest(app).get("/api/users/me").set("Authorization", `Bearer ${token}`).send();
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toEqual("strawberry");
    expect(res.body.email).toEqual("strawberry@fruits.com");
    expect(res.body).toHaveProperty("avatar.url");
  });
})
