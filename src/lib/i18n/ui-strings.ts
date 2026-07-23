import { isTargetLocale } from "./config";
import { t } from "./t";

// Подписи интерфейса для КЛИЕНТСКИХ компонентов.
//
// Клиентский компонент не может прочитать словарь: тот лежит в файле и живёт
// на сервере. Раньше это заканчивалось тем, что «Поиск», «Найдено», «Сбросить»
// оставались русскими на всех языках — вёрстка переведена, а элементы
// управления нет.
//
// Приём простой: компонент объявляет свои строки по-русски (они же ключи
// перевода и запасной вариант), страница прогоняет этот объект через
// uiStrings() и отдаёт результат пропсом. Форма объекта не меняется, поэтому
// компонент не переписывается — только принимает необязательный пропс.
//
//   // в компоненте
//   const L = { search: "Поиск", found: "Найдено" };
//   export function View({ ui }: { ui?: Partial<typeof L> }) {
//     const s = { ...L, ...ui };
//
//   // на странице
//   <View ui={uiStrings(VIEW_STRINGS, lang)} />
export function uiStrings<T extends Record<string, string>>(src: T, locale?: string): T {
  if (!locale || !isTargetLocale(locale)) return src;
  const out = {} as Record<string, string>;
  for (const [k, v] of Object.entries(src)) out[k] = t(v, locale);
  return out as T;
}
