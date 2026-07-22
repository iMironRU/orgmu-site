import type { TargetLocale } from "./config";
import { translate } from "./dict";
import rules from "./rules.json";

// Перевод ДАННЫХ, а не компонентов. Ключевой приём: структура объекта остаётся
// той же, меняются только текстовые значения. Поэтому ни один компонент
// (ContentPage, PageNav, Banner…) переделывать не нужно — он получает данные
// привычной формы, просто на другом языке.
//
// Правила отбора — общие со скриптом перевода (rules.json). Если бы они
// разошлись, скрипт переводил бы одно, а страница спрашивала другое, и часть
// текста молча оставалась бы русской.

const SKIP_KEYS = new Set(rules.skipKeys);
const DOC_EXT = new RegExp(rules.docExt, "i");
const DOC_FIELDS = new Set(rules.docFields);
const SKIP_STRINGS = rules.skipStrings.map((s) => new RegExp(s));
const TECHNICAL = rules.technical.map((s) => new RegExp(s, "i"));

function translatable(v: string): boolean {
  const s = v.trim();
  if (s.length < 2 || !/[А-Яа-яЁё]/.test(s)) return false;
  if (s === "—" || s === "-") return false;
  if (SKIP_STRINGS.some((re) => re.test(s))) return false;
  return !TECHNICAL.some((re) => re.test(s));
}

export type TranslateResult<T> = {
  data: T;
  /** Хоть одна строка переведена машиной — значит нужна плашка. */
  machine: boolean;
  /** Хоть одна строка осталась без перевода (показана по-русски). */
  missing: boolean;
};

// Возвращает копию данных с переведёнными строками. Исходные данные не портим:
// они кешируются загрузчиками и переиспользуются между языками.
export function translateData<T>(data: T, locale: TargetLocale): TranslateResult<T> {
  let machine = false;
  let missing = false;

  const walk = (node: unknown, insideDoc = false): unknown => {
    if (typeof node === "string") {
      if (!translatable(node)) return node;
      const r = translate(node, locale);
      if (r.machine) machine = true;
      if (r.missing) missing = true;
      return r.text;
    }
    if (Array.isArray(node)) return node.map((v) => walk(v, insideDoc));
    if (node && typeof node === "object") {
      const obj = node as Record<string, unknown>;
      const isDoc = typeof obj.href === "string" && DOC_EXT.test(obj.href);
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj)) {
        // Технические поля и подписи к файлам оставляем как есть.
        if (SKIP_KEYS.has(k) || k.startsWith("_") || (isDoc && DOC_FIELDS.has(k))) {
          out[k] = v;
        } else {
          out[k] = walk(v, isDoc);
        }
      }
      return out;
    }
    return node;
  };

  return { data: walk(data) as T, machine, missing };
}
