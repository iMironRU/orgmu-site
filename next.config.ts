import type { NextConfig } from "next";
import { execSync } from "node:child_process";

// Метка сборки для подвала: короткий хеш коммита + дата сборки. Нужна на время
// тестирования, чтобы по странице было видно, ту ли сборку смотрим (Pages
// кеширует, и «поправил, а не видно» — обычно просто старая копия у клиента).
// В Actions хеш приходит переменной, локально спрашиваем git.
function buildStamp(): string {
  const sha = (process.env.GITHUB_SHA || gitSha()).slice(0, 7);
  const date = new Date().toISOString().slice(0, 16).replace("T", " ");
  return sha ? `${sha} · ${date} UTC` : date;
}
function gitSha(): string {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return ""; // не git-каталог — обойдёмся датой
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
  env: { NEXT_PUBLIC_BUILD: buildStamp() },
  // На Pages нет сервера оптимизации картинок.
  images: { unoptimized: true },
  // Каждый маршрут выгружается как каталог с index.html.
  trailingSlash: true,
};

export default nextConfig;
