export const env = {
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1",
  auth: {
    tokenKey: "loop_access_token",
    userKey: "loop_user",
  },
};
