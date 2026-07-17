#!/usr/bin/env node
// Собирает статику для внутренних хостов: app.orgma.ru и <инстанс>.app.orgma.ru.
//
//   node scripts/apps/build-launcher.mjs
//
// Страницы — это страницы САЙТА (маршруты /app-launcher и /app-launcher/<id>),
// поэтому шапка, подвал, боковая панель и все стили те же самые: разъехаться
// не могут по определению. Раньше здесь был самодельный HTML «в похожем
// стиле» — это была ошибка, дизайн получался свой.
//
// Как это работает:
//  1. собираем сайт второй раз с basePath="" (внутренние хосты обслуживают
//     корень, а не /orgmu-site) и NEXT_PUBLIC_LINK_BASE=https://www.orgma.ru,
//     чтобы ссылки меню и подвала вели на сайт, а не в 404;
//  2. раскладываем: страницу каждого хоста + общие ассеты (_next, brand).
//
// Данные приложений — content/navigation/apps.yml, состав баз —
// content/apps/instances.json. Правите их → пересобираете → раскладываете.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const BUILD = path.join(ROOT, ".launcher-build");
const OUT = path.join(ROOT, "dist-app");
// Куда ведут ссылки меню и подвала с этих страниц. Пока сайт живёт на
// new.orgma.ru — туда. На www.orgma.ru стоит СТАРЫЙ сайт: наших разделов
// (/prilozheniya и прочих) там нет, ссылки вели бы в 404. Поменять на
// https://www.orgma.ru в день, когда новый сайт займёт основной адрес.
const SITE = "https://new.orgma.ru";

const reg = JSON.parse(fs.readFileSync(path.join(ROOT, "content/apps/instances.json"), "utf8")).instances;

console.log("Сборка сайта для внутренних хостов (basePath=\"\")…");
execSync("npm run build", {
  cwd: ROOT,
  stdio: ["ignore", "ignore", "inherit"],
  env: { ...process.env, NEXT_PUBLIC_BASE_PATH: "", NEXT_PUBLIC_LINK_BASE: SITE, NEXT_DIST_DIR: ".launcher-next" },
});

const SRC = path.join(ROOT, "out");
if (!fs.existsSync(path.join(SRC, "app-launcher", "index.html"))) {
  console.error("Не нашёл out/app-launcher/index.html — сборка не удалась?");
  process.exit(1);
}

// Общее для каждого хоста: ассеты Next и картинки бренда.
const SHARED = ["_next", "brand", "favicon.ico"];

fs.rmSync(OUT, { recursive: true, force: true });

function putHost(hostDir, pageHtml) {
  const dir = path.join(OUT, hostDir);
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(pageHtml, path.join(dir, "index.html"));
  for (const item of SHARED) {
    const from = path.join(SRC, item);
    if (fs.existsSync(from)) fs.cpSync(from, path.join(dir, item), { recursive: true });
  }
}

putHost("app.orgma.ru", path.join(SRC, "app-launcher", "index.html"));
console.log(`\n  app.orgma.ru       ← dist-app/app.orgma.ru/`);

for (const [id, inst] of Object.entries(reg)) {
  const page = path.join(SRC, "app-launcher", id, "index.html");
  if (!fs.existsSync(page)) {
    console.warn(`  ${inst.host}: страницы нет, пропускаю`);
    continue;
  }
  putHost(inst.host, page);
  const what = inst.kind === "web" ? "точек входа" : "баз";
  console.log(`  ${inst.host.padEnd(18)} ← dist-app/${inst.host}/  (${inst.bases.length} ${what})`);
}

fs.rmSync(BUILD, { recursive: true, force: true });
// out/ сейчас содержит сборку для внутренних хостов (basePath=""), а не сайта.
// Если её оставить, легко принять одно за другое — и проверять сайт по чужой
// сборке. Убираем: для сайта нужен обычный npm run build.
fs.rmSync(SRC, { recursive: true, force: true });

// README рядом со сборкой: инструкция должна лежать там же, где артефакт,
// а не в переписке — раскладывать будет человек и, возможно, не сегодня.
const hosts = ["app.orgma.ru", ...Object.values(reg).map((i) => i.host)];
fs.writeFileSync(
  path.join(OUT, "README.txt"),
  [
    "Статика для внутренних хостов ОрГМУ",
    "===================================",
    "",
    "Каждая папка — отдельный хост. Содержимое папки кладётся в КОРЕНЬ этого",
    "хоста (сам каталог не копируется, только то, что внутри):",
    "",
    ...hosts.map((h) => `  ${h.padEnd(20)} ←  ${h}/*`),
    "",
    "В каждой папке: index.html + _next/ (стили и шрифты) + brand/ (логотип)",
    "+ favicon.ico. Всё нужно целиком — index.html без _next/ будет без стилей.",
    "",
    "Ничего настраивать не нужно: страницы статические, внешних запросов не",
    "делают, работают во внутренней сети без выхода наружу.",
    "",
    "Что менять и где",
    "----------------",
    "  состав баз, версии, описания → content/apps/instances.json",
    "  список приложений             → content/navigation/apps.yml",
    "  тексты «Настройка рабочего места» → instances.json, секция setup",
    "",
    "После правки: node scripts/apps/build-launcher.mjs — и разложить заново.",
    "",
    "Внимание: скрипт собирает сайт с basePath=\"\" и удаляет out/.",
    "Для самого сайта нужна обычная сборка: npm run build",
  ].join("\n") + "\n",
  "utf8",
);

const size = execSync(`du -sh "${OUT}" | cut -f1`).toString().trim();
console.log(`\nГотово (${size}). Разложить вручную: содержимое dist-app/<хост>/ — в корень этого хоста.`);
console.log(`Данные: content/navigation/apps.yml (приложения), content/apps/instances.json (базы).`);
console.log(`Внимание: out/ удалён — там была сборка для внутренних хостов.`);
console.log(`Для сайта соберите заново: npm run build`);
