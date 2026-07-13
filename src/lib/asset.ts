// Префикс basePath для ассетов, на которые НЕ распространяется авто-префикс
// Next.js (например, url(...) в inline-стилях). Для next/link, next/image и
// обычных src на статику из public basePath добавляется автоматически.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function asset(path: string): string {
  return `${BASE_PATH}${path}`;
}
