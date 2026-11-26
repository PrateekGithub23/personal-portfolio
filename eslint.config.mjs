// ESLint flat config: Next's core-web-vitals + TypeScript rules, with Prettier owning formatting.
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const config = [
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    ignores: [".next/**", "node_modules/**", "input/**", "playwright-report/**", "test-results/**"],
  },
];

export default config;
