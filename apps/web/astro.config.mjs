import { defineConfig } from "astro/config";

import nodejs from "@astrojs/node";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  output: "server",
  server: {
    host: "0.0.0.0",
  },
  adapter: nodejs({ mode: "standalone" }),
  integrations: [tailwind(), react()],
});
