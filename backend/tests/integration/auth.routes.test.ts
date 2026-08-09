import { beforeEach, describe, expect, it, vi } from "vitest";

import request from "supertest";

const { hashMock, compareMock } = vi.hoisted(() => ({
  hashMock: vi.fn(),
  compareMock: vi.fn(),
}));

vi.mock("bcrypt", () => ({
  hash: hashMock,
  compare: compareMock,
}));

vi.mock("../../src/modules/auth/auth.repository.js", () => ({
  findUserByEmail: vi.fn(),
  hasRecentEmailVerification: vi.fn(),
  createWorkspaceWithAdmin: vi.fn(),
  findPublicUserById: vi.fn(),
  updateLastLogin: vi.fn(),
}));

import { app } from "../../src/app.js";

import * as authRepository from "../../src/modules/auth/auth.repository.js";

const userRecord = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  role: "ADMIN",
  avatarUrl: null,
  isActive: true,
  workspaceId: "workspace-1",
  lastLoginAt: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  passwordHash: "hashed-password",
};

describe("auth routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("serves the health check", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  describe("POST /api/v1/auth/login", () => {
    it("returns an access token for valid credentials", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(
        userRecord as never,
      );
      compareMock.mockResolvedValue(true);
      vi.mocked(authRepository.updateLastLogin).mockResolvedValue(
        userRecord as never,
      );

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Login successful");
      expect(typeof response.body.accessToken).toBe("string");
      expect(response.body.user.email).toBe("test@example.com");
    });

    it("returns 401 for a wrong password", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(
        userRecord as never,
      );
      compareMock.mockResolvedValue(false);

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "test@example.com", password: "wrong" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("returns 401 for an unknown email", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "nobody@example.com", password: "password123" });

      expect(response.status).toBe(401);
    });

    it("returns 400 for a missing password", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "test@example.com" });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/register", () => {
    it("registers a new user", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);
      vi.mocked(authRepository.hasRecentEmailVerification).mockResolvedValue({
        id: "verification-1",
      });
      hashMock.mockResolvedValue("hashed-password");
      vi.mocked(authRepository.createWorkspaceWithAdmin).mockResolvedValue({
        user: userRecord,
        workspace: {
          id: "workspace-1",
          name: "Acme",
          slug: "acme-1234abcd",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
      });

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
          workspaceName: "Acme",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(typeof response.body.accessToken).toBe("string");
    });

    it("returns 409 when the email is already registered", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(
        userRecord as never,
      );

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
          workspaceName: "Acme",
        });

      expect(response.status).toBe(409);
    });
  });

  describe("GET /api/v1/auth/profile", () => {
    it("returns 401 without a token", async () => {
      const response = await request(app).get("/api/v1/auth/profile");

      expect(response.status).toBe(401);
    });
  });
});
