import type { NextConfig } from "next";
import { execSync } from "node:child_process";

// Метка сборки для подвала: короткий хеш коммита + момент сборки в UTC. Нужна
// на время тестирования, чтобы по странице было видно, ту ли сборку смотрим
// (Pages кеширует, и «поправил, а не видно» — обычно старая копия у клиента).
// В человеческий вид и пояс браузера её приводит BuildStamp.tsx: здесь только
// ISO, пересчитывать на сервере нечего — пояс знает лишь клиент.
function buildSha(): string {
  return (process.env.GITHUB_SHA || gitSha()).slice(0, 7);
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
  env: { NEXT_PUBLIC_BUILD_SHA: buildSha(), NEXT_PUBLIC_BUILD_ISO: new Date().toISOString() },
  // На Pages нет сервера оптимизации картинок.
  images: { unoptimized: true },
  // Каждый маршрут выгружается как каталог с index.html.
  trailingSlash: true,
};

export default nextConfig;
