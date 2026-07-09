import { fileURLToPath } from "url";
import path from "path";

// The dev server is launched from the repo root, so Tailwind's config
// auto-discovery (which uses cwd) misses this file. Pin it explicitly.
const dir = path.dirname(fileURLToPath(import.meta.url));

const config = {
  plugins: {
    tailwindcss: { config: path.join(dir, "tailwind.config.ts") },
    autoprefixer: {},
  },
};

export default config;
