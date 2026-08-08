import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const baseDirectory = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory });

const config = [
  { ignores: [".next/**", "node_modules/**"] },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Existing navigation links preserve their client-side behavior; migrate
      // them incrementally rather than blocking production builds.
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];

export default config;
