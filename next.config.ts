import type { NextConfig } from "next";

// 정적 export: Vercel, GitHub Pages, Netlify 등 어디에나 올릴 수 있다.
const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages 프로젝트 주소(/저장소이름/)에서 열리도록 배포 시 지정
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
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
