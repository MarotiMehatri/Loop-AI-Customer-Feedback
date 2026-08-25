const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is missing. Add it to .env.local or your Vercel Environment Variables.",
  );
}

export const env = {
  apiUrl: apiUrl.replace(/\/+$/, ""),
  auth: {
    tokenKey: "loop_access_token",
    userKey: "loop_auth_user",
    refreshTokenKey: "loop_refresh_token",
  },
} as const;
