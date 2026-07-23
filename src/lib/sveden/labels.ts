import labels from "@/../content/sveden/labels.json";
import { isTargetLocale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/t";

// Человекочитаемые подписи для sveden. Словарь (base.yaml) задаёт только
// технические ключи микроразметки (itemprop) — а видимые подписи по Приказу
// Рособрнадзора № 1493 живут в content/sveden/labels.json.
//
// Почему данными, а не константами в коде: подписи разделов и полей — это
// СТРУКТУРА раздела, её можно и нужно переводить. Сами юридические значения
// (наименования, даты, реквизиты) лежат в sveden.json и остаются русскими:
// переводить официальные формулировки мы сознательно не беремся.
// Один источник — значит перевод не разъедется с тем, что показано.

export const SECTION_LABELS: Record<string, string> = labels.SECTION_LABELS;
export const SECTION_SHORT: Record<string, string> = labels.SECTION_SHORT;
export const SECTION_LEADS: Record<string, string> = labels.SECTION_LEADS;
export const GROUP_LABELS: Record<string, string> = labels.GROUP_LABELS;
export const FIELD_LABELS: Record<string, string> = labels.FIELD_LABELS;

// Подписи на языке страницы. Переводится ТОЛЬКО структура раздела — названия
// разделов, групп и полей. Юридические значения (наименования, реквизиты,
// даты) лежат в sveden.json, в перевод не входят и остаются русскими.
//
// Ключ отсутствует → показываем сам ключ: лучше техническое имя, чем пустота.
function localized(map: Record<string, string>, key: string, locale?: string): string {
  const ru = map[key] ?? key;
  return locale && isTargetLocale(locale) ? t(ru, locale) : ru;
}

export function fieldLabel(key: string, locale?: string): string {
  return localized(FIELD_LABELS, key, locale);
}

export function groupLabel(key: string, locale?: string): string {
  return localized(GROUP_LABELS, key, locale);
}

export function sectionLabel(key: string, locale?: string): string {
  return localized(SECTION_LABELS, key, locale);
}

export function sectionShort(key: string, locale?: string): string {
  return localized(SECTION_SHORT, key, locale);
}

export function sectionLead(key: string, locale?: string): string {
  return SECTION_LEADS[key] ? localized(SECTION_LEADS, key, locale) : "";
}
