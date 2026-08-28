// export const env = {
//   apiUrl:
//     process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1",
//   auth: {
//     tokenKey: "loop_access_token",
//     userKey: "loop_user",
//   },
// };
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is missing. Add it to .env.local before starting the frontend.",
  );
}

export const env = {
  apiUrl: apiUrl.replace(/\/+$/, ""),

   auth: {
    tokenKey: "loop_access_token",
    userKey: "loop_auth_user",
  },
} as const;
