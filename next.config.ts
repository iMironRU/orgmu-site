import type { NextConfig } from "next";

// basePath задаётся в GitHub Actions (NEXT_PUBLIC_BASE_PATH=/orgmu-site),
// локально пусто — сайт работает по http://localhost:3000.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  // Статический экспорт в out/ — то, что раздаёт GitHub Pages.
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  // На Pages нет сервера оптимизации картинок.
  images: { unoptimized: true },
  // Каждый маршрут выгружается как каталог с index.html.
  trailingSlash: true,
};

export default nextConfig;
