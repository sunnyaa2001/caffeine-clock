import type { NextConfig } from "next";

// 정적 export: Vercel, GitHub Pages, Netlify 등 어디에나 올릴 수 있다.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
