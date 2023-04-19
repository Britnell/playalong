import { defineConfig } from 'astro/config';
import solidJs from "@astrojs/solid-js";
import image from "@astrojs/image";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs(), image(), tailwind()]
});