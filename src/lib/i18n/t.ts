import type { TargetLocale } from "./config";
import { translate } from "./dict";

// Короткий помощник для строк интерфейса, зашитых в компонентах.
// Русский текст здесь — и ключ, и запасной вариант: перевода нет → покажем
// оригинал, а не пустоту. Сами строки перечислены в content/i18n/ui.yml,
// чтобы попадать в машинный перевод.
export function t(src: string, locale: TargetLocale): string {
  return translate(src, locale).text;
}
