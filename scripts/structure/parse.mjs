#!/usr/bin/env node
// Парсер структуры ОрГМУ со страницы /sveden/struct (Joomla, не itemprop-стандарт).
// Каждое подразделение — <fieldset class="Contact1"> с legend span[Itemprop="name"]
// («НОМЕР. Название») и ul.Contact2 (руководитель, адрес, телефон, email, положение).
// Номер («11.5.1.1») кодирует иерархию → depth/parent. Пишет content/structure/units.json.
//   node scripts/structure/parse.mjs
import fs from "node:fs";
import { load } from "cheerio";

const URL = "https://www.orgma.ru/sveden/struct";
const OUT = "content/structure/units.json";

const decodeEnt = (t) => t.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
function decloakEmail(html) {
  const user = html.match(/addy\d+\s*=\s*'([^']*)'\s*\+\s*'(?:&#64;|@)'/);
  const dom = html.match(/addy\d+\s*=\s*addy\d+\s*\+\s*'([^']*)'\s*\+\s*'(?:&#46;|\.)'\s*\+\s*'([^']*)'/);
  if (user && dom) return `${decodeEnt(user[1])}@${decodeEnt(dom[1])}.${decodeEnt(dom[2])}`;
  return null;
}

const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
const strip = (s, prefix) => clean(s).replace(new RegExp("^" + prefix + "\\s*:?\\s*", "i"), "");

function unitType(name) {
  const n = name.toLowerCase();
  if (/факультет/.test(n)) return "faculty";
  if (/институт/.test(n)) return "institute";
  if (/колледж/.test(n)) return "college";
  if (/кафедр/.test(n)) return "kafedra";
  if (/управлен/.test(n)) return "upravlenie";
  if (/(ректорат|учёный совет|ученый совет|конференц|попечительск|наблюдательн)/.test(n)) return "org";
  if (/деканат/.test(n)) return "dekanat";
  return "podrazdelenie";
}

// ФИО = последние 3 слова, если в строке есть учёные степени/запятые
// (напр. «Ректор - доктор медицинских наук, профессор ... Мирошниченко Игорь Васильевич»).
function cleanFio(namePart) {
  const words = clean(namePart).split(/\s+/).filter(Boolean);
  if ((namePart.includes(",") || words.length > 3) && words.length >= 3) {
    return words.slice(-3).join(" ");
  }
  return clean(namePart);
}

function parseHead(fioRaw) {
  // "Руководитель подразделения: Заведующий кафедрой - Коровина Ирина Алексеевна"
  const s = strip(fioRaw, "Руководитель подразделения");
  const dash = s.lastIndexOf(" - ") >= 0 ? " - " : s.lastIndexOf(" — ") >= 0 ? " — " : null;
  if (dash) {
    const idx = s.lastIndexOf(dash);
    return { post: clean(s.slice(0, idx)), fio: cleanFio(s.slice(idx + dash.length)) };
  }
  return { post: "", fio: cleanFio(s) };
}

async function main() {
  const res = await fetch(URL, { redirect: "follow" });
  const html = await res.text();
  const $ = load(html);

  const units = [];
  $("fieldset.Contact1").each((_, el) => {
    const $el = $(el);
    const nameRaw = clean($el.find("legend [Itemprop='name'], legend [itemprop='name']").first().text());
    if (!nameRaw) return;
    const m = nameRaw.match(/^([\d.]+)\.?\s+(.*)$/);
    const num = m ? m[1].replace(/\.$/, "") : "";
    const name = m ? clean(m[2]) : nameRaw;
    if (!name || !num) return; // пропускаем обёртку без номера (вся организация)

    const $c = $el.find("ul.Contact2").first();
    const li = (prop) => $c.find(`[Itemprop='${prop}'], [itemprop='${prop}']`).first();

    const head = parseHead(li("fio").text());
    const address = strip(li("addressStr").text(), "Месторасположение");

    let phone = "";
    $c.find("li").each((_, l) => {
      const t = clean($(l).text());
      if (/телефон/i.test(t)) phone = strip(t, "Номер стационарного телефона");
    });

    let email = "";
    const emailLi = li("email");
    if (emailLi.length) {
      const script = emailLi.find("script").html() || "";
      email = decloakEmail(script) || "";
    }

    const docA = li("divisionClauseDocLink").find("a[href]").first();
    const doc = docA.length ? { text: clean(docA.text()), href: docA.attr("href") } : null;

    const siteTxt = strip(li("site").text(), "Адрес веб-сайта");
    const site = siteTxt && siteTxt !== "—" ? siteTxt : "";

    const segs = num.split(".").filter(Boolean);
    const depth = Math.max(0, segs.length - 1);
    const parent = segs.length > 1 ? segs.slice(0, -1).join(".") : null;

    units.push({
      id: num.replace(/\./g, "-") || String(units.length + 1),
      num,
      name,
      type: unitType(name),
      depth,
      parent,
      head, // { post, fio }
      address: address && address !== "—" ? address : "",
      phone: phone && phone !== "—" ? phone : "",
      email,
      site,
      doc,
    });
  });

  fs.mkdirSync("content/structure", { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(units, null, 2) + "\n", "utf8");
  console.log(`Разобрано подразделений: ${units.length} → ${OUT}`);
  const byType = {};
  for (const u of units) byType[u.type] = (byType[u.type] || 0) + 1;
  console.log("По типам:", byType);
}

main().catch((e) => {
  console.error("Ошибка:", e);
  process.exit(1);
});
