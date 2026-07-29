// Подсказки Dadata (dadata.ru) для полей ФИО и адреса. Клиентский вызов
// suggestions API: как человек печатает, сервис возвращает варианты из
// справочника (ЕГР ЗАГС для ФИО, ФИАС для адреса).
//
// Токен. Подсказочный токен публичный, но его ОБЯЗАТЕЛЬНО ограничивают доменом
// в личном кабинете Dadata (иначе им пользуются чужие сайты). Задаётся при
// сборке: NEXT_PUBLIC_DADATA_TOKEN. Пусто — подсказок нет, поле обычное.
//
// ПДн. Каждый запрос отправляет введённый текст (часть ФИО/адреса) в Dadata —
// это передача данных третьей стороне. Сервис российский, данные в РФ. Рядом с
// полем показываем, что подсказки внешние (см. DadataInput).

export const DADATA_TOKEN = process.env.NEXT_PUBLIC_DADATA_TOKEN || "";

const BASE = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest";

export type SuggestKind = "fio" | "address";

export type Suggestion = {
  /** Готовое значение для подстановки в поле. */
  value: string;
  /** Доп. данные (пол для ФИО, координаты/индекс для адреса) — на будущее. */
  data?: Record<string, unknown>;
};

export async function dadataSuggest(
  kind: SuggestKind,
  query: string,
  count = 6,
  signal?: AbortSignal,
): Promise<Suggestion[]> {
  if (!DADATA_TOKEN || !query.trim()) return [];
  let res: Response;
  try {
    res = await fetch(`${BASE}/${kind}`, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Token ${DADATA_TOKEN}`,
      },
      body: JSON.stringify({ query, count }),
    });
  } catch {
    return []; // сеть/отмена — просто без подсказок
  }
  if (!res.ok) return [];
  try {
    const json = (await res.json()) as { suggestions?: { value: string; data?: Record<string, unknown> }[] };
    return (json.suggestions ?? []).map((s) => ({ value: s.value, data: s.data }));
  } catch {
    return [];
  }
}
