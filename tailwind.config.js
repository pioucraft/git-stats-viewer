/** @type {import('tailwindcss').Config} */

import { skeleton } from "@skeletonlabs/tw-plugin";
import { join } from "path";

const config = {
  darkMode: "media",
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    join(
      require.resolve("@skeletonlabs/skeleton"),
      "../**/*.{html,js,svelte,ts}",
    ),
  ],
  theme: {
    extend: {},
  },
  plugins: [
    // 4. Append the Skeleton plugin (after other plugins)
    skeleton({
      themes: { preset: ["modern"] },
    }),
  ],
};

export default config;
