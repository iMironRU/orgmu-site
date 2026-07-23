import type { NextConfig } from "next";
import { execSync } from "node:child_process";

// Идентификатор сборки. По умолчанию Next генерирует его случайным, и он
// зашит в пути к статике на каждой странице — то есть при любой пересборке
// меняются все файлы сайта. Считаем его от последнего коммита, менявшего КОД:
// правка контента (новости, yml) идентификатор не трогает, поэтому на сервер
// вуза уходят только реально изменившиеся страницы.
//
// Метка версии для подвала живёт отдельно, в public/build.json
// (scripts/build-stamp.mjs) — по той же причине.
function codeBuildId(): string | null {
  try {
    const sha = execSync(
      "git log -1 --format=%H -- src public next.config.ts package.json package-lock.json",
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    return sha ? sha.slice(0, 12) : null;
  } catch {
    return null; // не git-каталог — пусть Next решает сам
  }
}

// basePath задаётся в GitHub Actions (NEXT_PUBLIC_BASE_PATH=/orgmu-site),
// локально пусто — сайт работает по http://localhost:3000.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  // Статический экспорт в out/ — то, что раздаёт GitHub Pages.
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  // Стабильный id: см. codeBuildId(). null → поведение Next по умолчанию.
  generateBuildId: async () => codeBuildId(),
  // На Pages нет сервера оптимизации картинок.
  images: { unoptimized: true },
  // Каждый маршрут выгружается как каталог с index.html.
  trailingSlash: true,
};

export default nextConfig;
