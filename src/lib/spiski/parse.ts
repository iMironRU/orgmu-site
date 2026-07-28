import type { Spiski, Competition, SpisokRow } from "./types";

// Разбор выгрузки 1С в наш формат. 1С отдаёт плоский массив строк с русскими
// ключами (по одному объекту на заявление); группируем по конкурсу и
// раскладываем баллы по предметам. Делать это на клиенте, а не просить 1С
// формировать наш формат, — сознательно: так выгрузка остаётся ровно тем, что
// даёт запрос, и её проще сопровождать на стороне вуза.

// Адрес файла с данными. Отдельный хост вуза: 1С кладёт файл туда, а обе
// площадки сайта (Pages и сервер вуза) берут список из одного источника —
// значит он везде одинаково свежий. ВАЖНО: хост обязан отдавать CORS-заголовок
// Access-Control-Allow-Origin, иначе браузер заблокирует загрузку.
export const SPISKI_URL = "https://edu.app.orgma.ru/spiski/spiski.json";

// Строка выгрузки: русские ключи, значения уже типизированы (1С сериализует
// числа числами, булевы — true/false). Пустой балл приходит пустой строкой.
type Raw = Record<string, unknown>;

const num = (v: unknown): number => (typeof v === "number" ? v : Number(v) || 0);
// И boolean, и «Да» — на случай, если сериализация булевых изменится.
const bool = (v: unknown): boolean => v === true || v === "Да";
const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

function quotaOf(title: string, program: string): string {
  let q = title;
  if (program && q.startsWith(program)) q = q.slice(program.length);
  return q.replace(/^[\s.]+|[\s.]+$/g, "") || title;
}

export function parseSpiski(raw: Raw[], updated: string): Spiski {
  const byComp = new Map<number, Competition>();

  for (const r of raw) {
    const id = num(r["КодКонкурса"]);
    if (!id) continue;

    let comp = byComp.get(id);
    if (!comp) {
      const program = str(r["Специальность"]);
      const title = str(r["Конкурс"]);
      comp = {
        id,
        program,
        title,
        quota: quotaOf(title, program),
        form: str(r["ФормаОбучения"]),
        basis: str(r["Основа"]),
        category: str(r["Категория"]),
        seats: num(r["КоличествоМест"]),
        applied: num(r["ПоданоЗаявлений"]),
        consents: num(r["ПоданоСогласий"]),
        rows: [],
      };
      byComp.set(id, comp);
    }

    // Баллы по предметам: только заполненные (пустой балл — пустая строка).
    const subj: number[] = [];
    for (let k = 1; k <= 5; k++) {
      const v = r[`Балл${k}`];
      if (v !== "" && v != null) subj.push(num(v));
    }

    const row: SpisokRow = {
      code: str(r["Код"]),
      n: num(r["Номер"]),
      sum: num(r["СуммаБаллов"]),
      vi: num(r["БаллыЗаВИ"]),
      id: num(r["БаллыЗаИД"]),
      subj,
      pr: num(r["Приоритет"]),
      hp: bool(r["ЭтоВысшийПриоритет"]) || bool(r["ЭтоОсновнойВысшийПриоритет"]),
      cons: bool(r["Согласие"]),
      orig: bool(r["Оригинал"]),
      pref: bool(r["ПреимущественноеПраво"]),
      bvi: bool(r["БВИ"]),
    };

    // Поля состава по Порядку приёма — только если 1С их прислала.
    const opt = (k: string) => (r[k] === undefined ? undefined : num(r[k]));
    const optB = (k: string) => (r[k] === undefined ? undefined : bool(r[k]));
    const optS = (k: string) => (r[k] === undefined ? undefined : str(r[k]));
    row.idCommon = opt("БаллыЗаОбщиеИД");
    row.idTarget = opt("БаллыЗаЦелевыеИД");
    row.pref9 = optB("ПреимПравоЧ9");
    row.pref10 = optB("ПреимПравоЧ10");
    row.bviBasis = optS("ОснованиеБВИ") || undefined;
    row.avgScore = opt("СреднийБалл");
    row.contract = optB("Договор");

    comp.rows.push(row);
  }

  // На всякий случай упорядочиваем строки конкурса по позиции.
  for (const c of byComp.values()) c.rows.sort((a, b) => a.n - b.n);

  return { updated, competitions: [...byComp.values()] };
}
