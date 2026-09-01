import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      // New in eslint-plugin-react-hooks 7 (shipped with Next 16).
      // Existing screens use this pattern; do not block the upgrade on it.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "backend/**",
    "node_modules/**",
  ]),
]);
