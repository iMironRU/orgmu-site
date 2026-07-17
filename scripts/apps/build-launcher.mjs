#!/usr/bin/env node
// Собирает статику для внутренних серверов из общего реестра:
//
//   node scripts/apps/build-launcher.mjs
//     → dist-app/index.html + apps.json            (app.orgma.ru — лаунчер)
//     → dist-app/<инстанс>/index.html + apps.json  (buh.app.orgma.ru и др.)
//
// Раскладывается вручную: содержимое dist-app/ — в корень app.orgma.ru,
// dist-app/buh/ — в корень buh.app.orgma.ru и так далее.
//
// Данные лежат РЯДОМ со страницей в apps.json и читаются на лету: правишь
// json на сервере — страница обновилась, пересобирать HTML не нужно. Эталон
// данных — content/apps/instances.json в репозитории; правки на сервере
// переноси и туда, иначе следующая сборка их затрёт.
//
// Ноль внешних скриптов и стилей: страницы открываются во внутренней сети,
// даже когда наружу доступа нет. Цвета и шрифты — те же, что у сайта.
import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "dist-app");
const SITE = "https://www.orgma.ru";
const PLATFORM = "https://app.orgma.ru";

const apps = parseYaml(fs.readFileSync(path.join(ROOT, "content/navigation/apps.yml"), "utf8"));
const reg = JSON.parse(fs.readFileSync(path.join(ROOT, "content/apps/instances.json"), "utf8"));

// Общие стили — один раз, чтобы страницы не разъезжались между собой.
const CSS = `
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
  .crumbs a:hover{text-decoration:underline}
  h1{margin:0 0 8px;font-family:var(--display);font-weight:700;font-size:38px;line-height:1.12}
  @media(max-width:768px){h1{font-size:26px}}
  .lead{margin:0;max-width:680px;font-size:17px;color:rgba(255,255,255,.85)}
  .tabs{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 24px}
  .tab{font-size:15px;font-weight:500;color:var(--steel);background:#fff;
    border:1px solid var(--line-strong);border-radius:999px;padding:7px 17px;cursor:pointer;font-family:var(--ui)}
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
  .rows{display:flex;flex-direction:column;gap:8px}
  .row{display:flex;align-items:center;gap:14px;background:#fff;border:1px solid var(--line);
    border-radius:10px;padding:14px 18px;text-decoration:none;box-shadow:0 1px 2px rgba(0,0,0,.05)}
  .row:hover{border-color:var(--accent);transform:translateY(-1px)}
  .row .nm{flex:1;min-width:0;font-weight:700;font-size:17px;color:var(--brand)}
  .row .cd{font-size:13px;color:var(--ink-3);font-variant-numeric:tabular-nums}
  .row .go{color:var(--accent);font-weight:700;font-size:14px}
  .tools{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}
  .tool{font-size:14px;font-weight:700;color:var(--steel);background:#fff;
    border:1px solid var(--line-strong);border-radius:8px;padding:9px 14px;text-decoration:none}
  .tool:hover{border-color:var(--accent);color:var(--accent)}
  .err{background:#fff;border:1px dashed var(--line-strong);border-radius:12px;padding:24px;
    text-align:center;color:var(--ink-3);font-size:15px}
  footer{border-top:1px solid var(--line);background:#fff;margin-top:40px}
  footer .wrap{padding:20px 40px;font-size:14px;color:var(--ink-3);display:flex;
    justify-content:space-between;gap:12px;flex-wrap:wrap}
  footer a{color:var(--accent);font-weight:700;text-decoration:none}
`;

const shell = ({ title, crumbs, h1, lead, body, script }) => `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="robots" content="noindex">
<style>${CSS}</style>
</head>
<body>
<header>
  <div class="wrap">
    <div class="crumbs">${crumbs}</div>
    <h1>${h1}</h1>
    <p class="lead">${lead}</p>
  </div>
</header>
<main class="wrap">
${body}
</main>
<footer>
  <div class="wrap">
    <span>ФГБОУ ВО ОрГМУ Минздрава России</span>
    <a href="${SITE}">Сайт университета →</a>
  </div>
</footer>
<script>
// Данные читаем из apps.json рядом: правишь json — страница обновилась,
// пересобирать HTML не нужно.
(function () {
  var box = document.getElementById("app");
  fetch("./apps.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(function () {
      box.innerHTML = '<div class="err">Не удалось загрузить apps.json — проверьте, что файл лежит рядом с index.html.</div>';
    });
${script}
})();
</script>
</body>
</html>
`;

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ── Лаунчер app.orgma.ru ──────────────────────────────────────────────────
const launcherApps = apps
  .filter((a) => a.platform === "1c" && a.id !== "app-platform" && a.version)
  .map((a) => ({
    name: a.name, host: a.tag, href: a.href, desc: a.desc, category: a.category,
    version: a.version, statusNote: a.statusNote, accent: a.accent,
    updating: a.status === "updating",
  }));

const launcherHtml = shell({
  title: "Платформа приложений · ОрГМУ",
  crumbs: `<a href="${SITE}">ОрГМУ</a> / Платформа приложений`,
  h1: "Платформа приложений",
  lead: "Приложения 1С университета. Для входа нужна учётная запись.",
  body: `  <div class="tabs" id="tabs" role="tablist"></div>\n  <div id="app"></div>`,
  script: `
  function render(d) {
    var list = d.apps || [];
    var cats = list.map(function (a) { return a.category; }).filter(function (v, i, s) { return v && s.indexOf(v) === i; });
    var tabs = document.getElementById("tabs");
    tabs.innerHTML = ['<button class="tab" role="tab" aria-selected="true" data-f="all">Все</button>']
      .concat(cats.map(function (c) { return '<button class="tab" role="tab" aria-selected="false" data-f="' + c + '">' + c + '</button>'; })).join("");
    box.className = "grid";
    box.innerHTML = list.map(function (a) {
      return '<article class="card" data-cat="' + (a.category || "") + '">' +
        '<div class="card-head"><span class="dot" style="background:' + a.accent + '"></span>' +
        '<div class="card-title"><h2>' + a.name + '</h2>' +
        '<a class="host" href="' + a.href + '">' + a.host + '</a></div></div>' +
        '<p class="desc">' + a.desc + '</p>' +
        '<div class="meta"><span class="ver">v ' + a.version + '</span>' +
        '<span class="badge' + (a.updating ? ' badge-warn' : '') + '">Активен · ' + a.statusNote + '</span></div>' +
        '<a class="btn" href="' + a.href + '">Открыть приложение</a></article>';
    }).join("");
    tabs.querySelectorAll(".tab").forEach(function (t) {
      t.addEventListener("click", function () {
        tabs.querySelectorAll(".tab").forEach(function (x) { x.setAttribute("aria-selected", String(x === t)); });
        box.querySelectorAll(".card").forEach(function (c) {
          c.style.display = t.dataset.f === "all" || c.dataset.cat === t.dataset.f ? "" : "none";
        });
      });
    });
  }`,
});

// ── Страница инстанса (buh/adm/edu/med/dev) ───────────────────────────────
const instanceHtml = (id, inst) =>
  shell({
    title: `${inst.name} · ${inst.host}`,
    crumbs: `<a href="${SITE}">ОрГМУ</a> / <a href="${PLATFORM}">Платформа приложений</a> / ${esc(inst.name)}`,
    h1: esc(inst.name),
    lead: `${esc(inst.host)} · Выберите информационную базу. Для входа нужна учётная запись.`,
    body: `  <div id="app" class="rows"></div>\n  <div class="tools" id="tools"></div>`,
    script: `
  function render(d) {
    box.innerHTML = (d.bases || []).map(function (b) {
      return '<a class="row" href="' + b.href + '" target="_blank" rel="noopener">' +
        '<span class="nm">' + b.name + '</span>' +
        (b.code ? '<span class="cd">' + b.code + '</span>' : '') +
        '<span class="go">Открыть →</span></a>';
    }).join("") || '<div class="err">Список баз пуст.</div>';
    var i = d.install || {}, t = [];
    if (i.x86) t.push('<a class="tool" href="' + i.x86 + '">Клиент 1С · x86</a>');
    if (i.x64) t.push('<a class="tool" href="' + i.x64 + '">Клиент 1С · x64</a>');
    if (i.v8i) t.push('<a class="tool" href="' + i.v8i + '">Список баз для клиента (v ' + (d.version || "") + ')</a>');
    document.getElementById("tools").innerHTML = t.join("");
  }`,
  });

// ── Сборка ────────────────────────────────────────────────────────────────
fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "index.html"), launcherHtml, "utf8");
fs.writeFileSync(path.join(OUT_DIR, "apps.json"), JSON.stringify({ apps: launcherApps }, null, 2), "utf8");
console.log(`  app.orgma.ru       ← dist-app/            (${launcherApps.length} приложений)`);

for (const [id, inst] of Object.entries(reg.instances)) {
  const dir = path.join(OUT_DIR, id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), instanceHtml(id, inst), "utf8");
  fs.writeFileSync(
    path.join(dir, "apps.json"),
    JSON.stringify({ host: inst.host, version: inst.version, bases: inst.bases, install: inst.install }, null, 2),
    "utf8",
  );
  console.log(`  ${inst.host.padEnd(18)} ← dist-app/${id}/${" ".repeat(Math.max(0, 8 - id.length))} (${inst.bases.length} баз)`);
}

console.log(`\nГотово. Разложить вручную: содержимое dist-app/ → в корень app.orgma.ru,`);
console.log(`dist-app/<инстанс>/ → в корень <инстанс>.app.orgma.ru.`);
console.log(`Данные правятся в apps.json рядом со страницей (эталон — content/apps/instances.json).`);
