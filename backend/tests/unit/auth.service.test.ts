import { beforeEach, describe, expect, it, vi } from "vitest";

const { hashMock, compareMock, signMock } = vi.hoisted(() => ({
  hashMock: vi.fn(),
  compareMock: vi.fn(),
  signMock: vi.fn(),
}));

vi.mock("bcrypt", () => ({
  hash: hashMock,
  compare: compareMock,
}));

vi.mock("jsonwebtoken", () => ({
  default: { sign: signMock },
}));

vi.mock("../../src/modules/auth/auth.repository.js", () => ({
  findUserByEmail: vi.fn(),
  hasRecentEmailVerification: vi.fn(),
  createWorkspaceWithAdmin: vi.fn(),
  findPublicUserById: vi.fn(),
  updateLastLogin: vi.fn(),
}));

import * as authRepository from "../../src/modules/auth/auth.repository.js";

import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../../src/modules/auth/auth.service.js";

const baseUser = {
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
};

const passwordHash = "hashed-password";

const registerInput = {
  name: "Test User",
  email: "TEST@example.com",
  password: "password123",
  workspaceName: "Acme",
};

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signMock.mockReturnValue("signed-token");
  });

  describe("registerUser", () => {
    it("registers a new user and returns an access token", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null as never);
      vi.mocked(authRepository.hasRecentEmailVerification).mockResolvedValue({
        id: "verification-1",
      });
      hashMock.mockResolvedValue(passwordHash);
      vi.mocked(authRepository.createWorkspaceWithAdmin).mockResolvedValue({
        user: baseUser,
        workspace: {
          id: "workspace-1",
          name: "Acme",
          slug: "acme-1234abcd",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
      });

      const result = await registerUser(registerInput);

      expect(result.message).toBe("Account created successfully");
      expect(result.accessToken).toBe("signed-token");
      expect(result.user.email).toBe("test@example.com");

      expect(authRepository.createWorkspaceWithAdmin).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
          passwordHash,
        }),
      );
      expect(signMock).toHaveBeenCalledTimes(1);
    });

    it("rejects a duplicate email with a 409", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(
        baseUser as never,
      );

      await expect(registerUser(registerInput)).rejects.toMatchObject({
        statusCode: 409,
      });
    });

    it("rejects registration when the email is not verified", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null as never);
      vi.mocked(authRepository.hasRecentEmailVerification).mockResolvedValue(
        null,
      );

      await expect(registerUser(registerInput)).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });

  describe("loginUser", () => {
    it("logs in with valid credentials", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue({
        ...baseUser,
        passwordHash,
      } as never);
      compareMock.mockResolvedValue(true);
      vi.mocked(authRepository.updateLastLogin).mockResolvedValue(
        baseUser as never,
      );

      const result = await loginUser({
        email: "TEST@example.com",
        password: "password123",
      });

      expect(result.message).toBe("Login successful");
      expect(result.accessToken).toBe("signed-token");
      expect(authRepository.updateLastLogin).toHaveBeenCalledWith("user-1");
    });

    it("rejects an unknown email with a 401", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null as never);

      await expect(
        loginUser({ email: "nobody@example.com", password: "password123" }),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("rejects a wrong password with a 401", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue({
        ...baseUser,
        passwordHash,
      } as never);
      compareMock.mockResolvedValue(false);

      await expect(
        loginUser({ email: "test@example.com", password: "wrong" }),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("rejects a disabled account with a 403", async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue({
        ...baseUser,
        isActive: false,
        passwordHash,
      } as never);

      await expect(
        loginUser({ email: "test@example.com", password: "password123" }),
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe("getCurrentUser", () => {
    it("returns the public user profile", async () => {
      vi.mocked(authRepository.findPublicUserById).mockResolvedValue(
        baseUser as never,
      );

      await expect(getCurrentUser("user-1")).resolves.toMatchObject({
        id: "user-1",
      });
    });

    it("rejects a missing user with a 404", async () => {
      vi.mocked(authRepository.findPublicUserById).mockResolvedValue(null as never);

      await expect(getCurrentUser("user-1")).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("rejects a disabled user with a 403", async () => {
      vi.mocked(authRepository.findPublicUserById).mockResolvedValue({
        ...baseUser,
        isActive: false,
      } as never);

      await expect(getCurrentUser("user-1")).rejects.toMatchObject({
        statusCode: 403,
      });
    });
  });
});
