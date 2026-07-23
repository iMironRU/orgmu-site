#!/usr/bin/env node
/**
 * Выкладка собранного сайта на сервер вуза по FTP — по контрольным суммам.
 *
 *   node scripts/deploy/ftp-sync.mjs            # залить изменившееся
 *   node scripts/deploy/ftp-sync.mjs --dry      # только показать, что уйдёт
 *   node scripts/deploy/ftp-sync.mjs --full     # залить всё заново
 *
 * Требует FTP_HOST, FTP_USER, FTP_PASSWORD в окружении и установленный lftp.
 *
 * Почему не `lftp mirror`
 * ----------------------
 * mirror решает, менялся ли файл, по размеру и времени. Для нашей сборки это
 * не работает: в каждую страницу зашита метка сборки, и при пересборке
 * содержимое меняется, а размер остаётся прежним (дата той же длины). mirror
 * такие файлы пропускает — на сервере остаётся прошлая версия сайта. Хуже
 * того, идентификатор сборки в путях к статике при этом обновляется, и
 * страницы начинают ссылаться на файлы, которых уже нет.
 *
 * Поэтому сравниваем содержимое: рядом с сайтом лежит манифест
 * (путь → md5 + размер) от предыдущей выкладки. Разница между ним и текущей
 * сборкой и есть список работы. Манифест заливается последним — если выкладка
 * оборвётся, следующий запуск начнёт с того же места, а не решит, что всё уже
 * на месте.
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const LOCAL_DIR = path.join(ROOT, "out");
const REMOTE_DIR = "public_html";
const MANIFEST = ".deploy-manifest.json";

const DRY = process.argv.includes("--dry");
const FULL = process.argv.includes("--full");

const HOST = process.env.FTP_HOST;
const USER = process.env.FTP_USER;
const PASS = process.env.FTP_PASSWORD;

if (!HOST || !USER || !PASS) {
  console.error("Нет FTP_HOST / FTP_USER / FTP_PASSWORD — пропускаю выкладку.");
  process.exit(0);
}
if (!fs.existsSync(LOCAL_DIR)) {
  console.error(`Нет каталога ${LOCAL_DIR} — сначала соберите сайт.`);
  process.exit(1);
}

const md5 = (file) => createHash("md5").update(fs.readFileSync(file)).digest("hex");

function walk(dir, base = "") {
  const out = {};
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${e.name}` : e.name;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) Object.assign(out, walk(abs, rel));
    else out[rel] = md5(abs);
  }
  return out;
}

// Пароль передаём файлом команд, а не аргументом: аргументы видны в списке
// процессов, а лог GitHub маскирует только известные ему секреты.
function lftp(commands) {
  const script =
    [
      "set ftp:ssl-allow no", // vsFTPd на AUTH TLS отвечает 530, шифрования нет
      "set xfer:clobber on", // перезаписывать, а не дописывать в конец
      "set net:timeout 20",
      "set net:max-retries 3",
      "set net:reconnect-interval-base 5",
      "set cmd:fail-exit yes",
      `open -u ${JSON.stringify(USER)},${JSON.stringify(PASS)} ${JSON.stringify(HOST)}`,
      ...commands,
    ].join("\n") + "\n";
  const tmp = path.join(ROOT, ".lftp-script");
  fs.writeFileSync(tmp, script, { mode: 0o600 });
  try {
    return execFileSync("lftp", ["-f", tmp], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  } finally {
    fs.unlinkSync(tmp);
  }
}

function remoteManifest() {
  if (FULL) return {};
  const tmp = path.join(ROOT, ".remote-manifest.json");
  try {
    lftp([`get ${REMOTE_DIR}/${MANIFEST} -o ${tmp}`]);
    const data = JSON.parse(fs.readFileSync(tmp, "utf8"));
    fs.unlinkSync(tmp);
    return data;
  } catch {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    console.log("Манифеста на сервере нет — считаю выкладку первой.");
    return {};
  }
}

const local = walk(LOCAL_DIR);
const remote = remoteManifest();

const changed = Object.keys(local).filter((f) => local[f] !== remote[f]);
const removed = Object.keys(remote).filter((f) => !(f in local) && f !== MANIFEST);

const bytes = changed.reduce((n, f) => n + fs.statSync(path.join(LOCAL_DIR, f)).size, 0);
console.log(
  `Файлов в сборке: ${Object.keys(local).length} | к заливке: ${changed.length}` +
    ` (${(bytes / 1024 / 1024).toFixed(1)} МБ) | к удалению: ${removed.length}`,
);

if (DRY) {
  changed.slice(0, 20).forEach((f) => console.log("  +", f));
  removed.slice(0, 20).forEach((f) => console.log("  −", f));
  process.exit(0);
}
if (changed.length === 0 && removed.length === 0) {
  console.log("Сервер уже совпадает со сборкой — заливать нечего.");
  process.exit(0);
}

// Каталоги создаём заранее: put сам их не создаёт.
const dirs = [...new Set(changed.map((f) => path.posix.dirname(f)).filter((d) => d !== "."))].sort();

const cmds = [
  `mkdir -p -f ${REMOTE_DIR}`,
  ...dirs.map((d) => `mkdir -p -f ${REMOTE_DIR}/${d}`),
  ...changed.map((f) => `put -O ${REMOTE_DIR}/${path.posix.dirname(f)} ${JSON.stringify(path.join(LOCAL_DIR, f))}`),
  ...removed.map((f) => `rm -f ${REMOTE_DIR}/${JSON.stringify(f).slice(1, -1)}`),
];

// Манифест пишем последним и только после успешной заливки: оборванная
// выкладка не должна выглядеть завершённой.
const manifestPath = path.join(ROOT, ".manifest-out.json");
fs.writeFileSync(manifestPath, JSON.stringify(local));

const CHUNK = 400; // длинные скрипты lftp читает медленно, режем на части
for (let i = 0; i < cmds.length; i += CHUNK) {
  lftp(cmds.slice(i, i + CHUNK));
  console.log(`  выполнено ${Math.min(i + CHUNK, cmds.length)}/${cmds.length}`);
}
lftp([`put -O ${REMOTE_DIR} ${JSON.stringify(manifestPath)} -o ${MANIFEST}`]);
fs.unlinkSync(manifestPath);

console.log(`Готово: залито ${changed.length}, удалено ${removed.length}.`);
