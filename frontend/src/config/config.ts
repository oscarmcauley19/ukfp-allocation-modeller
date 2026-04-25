import { configSchema } from "./schemas/configSchema";
import { configDefaults } from "./defaults/configDefaults";

const envVars = import.meta.env;

// Step 2: Automatically strip "VITE_" prefix
export const fromEnv = Object.fromEntries(
  Object.entries(envVars).map(([key, value]) => {
    const strippedKey = key.replace(/^VITE_/, "");
    return [strippedKey, value];
  }),
) as {
  [K in keyof typeof envVars as K extends `VITE_${infer R}`
    ? R
    : never]: string;
};

const parsed = configSchema.safeParse(fromEnv);

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.format());
  process.exit(1);
}

console.log(parsed.data);

export const config = {
  ...configDefaults,
  ...parsed.data,
};
