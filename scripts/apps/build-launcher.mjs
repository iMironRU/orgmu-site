#!/usr/bin/env node
// Генерирует страницу-лаунчер для app.orgma.ru из content/navigation/apps.yml.
//
//   node scripts/apps/build-launcher.mjs   →  dist-app/index.html
//
// Зачем отдельный генератор, а не маршрут в Next:
//  - app.orgma.ru живёт на внутреннем сервере и выкладывается ВРУЧНУЮ, значит
//    артефакт должен быть один самодостаточный файл: скопировал — работает;
//  - сайт собирается с basePath=/orgmu-site (GitHub Pages), а лаунчер лежит в
//    корне другого домена — сборки несовместимы по путям;
//  - ноль внешних скриптов и запросов: страница открывается во внутренней сети,
//    даже если наружу нет доступа.
//
// Стилистика — те же токены, что у сайта: цвета и шрифты берутся из
// src/app/globals.css, поэтому лаунчер не выделяется из общего дизайна.
import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";

const APPS = path.join(process.cwd(), "content", "navigation", "apps.yml");
const OUT_DIR = path.join(process.cwd(), "dist-app");
const OUT = path.join(OUT_DIR, "index.html");
const SITE = "https://www.orgma.ru";

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const apps = parseYaml(fs.readFileSync(APPS, "utf8"));
// На лаунчере — только 1С-инстансы: он про платформу, а не про сайт.
// Сама «Платформа приложений» — это и есть эта страница, её не показываем.
const list = apps.filter((a) => a.platform === "1c" && a.id !== "app-platform" && a.version);

const cats = [...new Set(list.map((a) => a.category).filter(Boolean))];

const card = (a) => `
      <article class="card" data-cat="${esc(a.category ?? "")}">
        <div class="card-head">
          <span class="dot" style="background:${esc(a.accent)}"></span>
          <div class="card-title">
            <h2>${esc(a.name)}</h2>
            <a class="host" href="${esc(a.href)}">${esc(a.tag)}</a>
          </div>
        </div>
        <p class="desc">${esc(a.desc)}</p>
        <div class="meta">
          <span class="ver">v ${esc(a.version)}</span>
          <span class="badge${a.status === "updating" ? " badge-warn" : ""}">Активен · ${esc(a.statusNote ?? "")}</span>
        </div>
        <a class="btn" href="${esc(a.href)}">Открыть приложение</a>
      </article>`;

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Платформа приложений · ОрГМУ</title>
<meta name="robots" content="noindex">
<style>
  :root{
    --brand:rgb(0,101,155); --accent:rgb(184,57,4); --ink:rgb(49,49,49);
    --steel:rgb(50,100,150); --ink-3:rgb(150,150,150); --line:rgb(238,238,238);
    --line-strong:rgb(217,217,217); --bg:rgb(251,251,251);
    --ui:'Roboto Condensed',system-ui,sans-serif; --display:'Inter',system-ui,sans-serif;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--ui)}
  header{background:var(--brand);color:#fff}
  .wrap{max-width:1146px;margin:0 auto;padding:32px 40px}
  @media(max-width:768px){.wrap{padding:24px 20px}}
  .crumbs{font-size:15px;color:rgba(255,255,255,.72);margin-bottom:14px}
  .crumbs a{color:rgba(255,255,255,.92);text-decoration:none}
  h1{margin:0 0 8px;font-family:var(--display);font-weight:700;font-size:38px;line-height:1.12}
  @media(max-width:768px){h1{font-size:26px}}
  .lead{margin:0;max-width:680px;font-size:17px;color:rgba(255,255,255,.85)}
  .tabs{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 24px}
  .tab{font-size:15px;font-weight:500;color:var(--steel);background:#fff;
    border:1px solid var(--line-strong);border-radius:999px;padding:7px 17px;cursor:pointer}
  .tab[aria-selected="true"]{color:#fff;background:var(--accent);border-color:var(--accent)}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
  .card{display:flex;flex-direction:column;gap:12px;background:#fff;border:1px solid var(--line);
    border-radius:12px;padding:20px;box-shadow:0 1px 2px rgba(0,0,0,.05)}
  .card-head{display:flex;align-items:center;gap:12px}
  .dot{flex:0 0 auto;width:12px;height:12px;border-radius:50%}
  .card-title h2{margin:0;font-family:var(--display);font-weight:700;font-size:19px;color:var(--brand)}
  .host{font-size:13px;color:var(--ink-3);text-decoration:none}
  .host:hover{color:var(--accent)}
  .desc{margin:0;flex:1;font-size:15px;line-height:1.45;color:var(--steel)}
  .meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .ver{font-size:13px;color:var(--ink-3);font-variant-numeric:tabular-nums}
  .badge{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;
    color:rgb(30,160,80);background:rgba(52,199,89,.12);border-radius:6px;padding:3px 8px}
  .badge-warn{color:rgb(180,120,0);background:rgba(255,149,0,.14)}
  .btn{display:block;text-align:center;font-weight:700;font-size:15px;color:#fff;
    background:var(--accent);border-radius:10px;padding:11px;text-decoration:none}
  .btn:hover{background:rgb(150,46,3)}
  footer{border-top:1px solid var(--line);background:#fff}
  footer .wrap{padding:20px 40px;font-size:14px;color:var(--ink-3);display:flex;
    justify-content:space-between;gap:12px;flex-wrap:wrap}
  footer a{color:var(--accent);font-weight:700;text-decoration:none}
</style>
</head>
<body>
<header>
  <div class="wrap">
    <div class="crumbs"><a href="${SITE}">ОрГМУ</a> / Платформа приложений</div>
    <h1>Платформа приложений</h1>
    <p class="lead">Приложения 1С университета. Для входа нужна учётная запись.</p>
  </div>
</header>

<main class="wrap">
  <div class="tabs" role="tablist">
    <button class="tab" role="tab" aria-selected="true" data-f="all">Все</button>
    ${cats.map((c) => `<button class="tab" role="tab" aria-selected="false" data-f="${esc(c)}">${esc(c)}</button>`).join("\n    ")}
  </div>
  <div class="grid">${list.map(card).join("")}
  </div>
</main>

<footer>
  <div class="wrap">
    <span>ФГБОУ ВО ОрГМУ Минздрава России</span>
    <a href="${SITE}">Сайт университета →</a>
  </div>
</footer>

<script>
  // Фильтр по категориям. Без него — просто список: страница остаётся рабочей.
  var tabs = document.querySelectorAll(".tab");
  var cards = document.querySelectorAll(".card");
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      tabs.forEach(function (x) { x.setAttribute("aria-selected", String(x === t)); });
      var f = t.dataset.f;
      cards.forEach(function (c) {
        c.style.display = f === "all" || c.dataset.cat === f ? "" : "none";
      });
    });
  });
</script>
</body>
</html>
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, html, "utf8");
console.log(`Лаунчер собран: ${path.relative(process.cwd(), OUT)}`);
console.log(`  приложений: ${list.length} | категорий: ${cats.length} | размер: ${Math.round(html.length / 1024)} КБ`);
console.log(`  выложить вручную в корень app.orgma.ru`);
