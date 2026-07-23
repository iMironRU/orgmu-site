// Транслитерация ФИО в латиницу для английской версии сайта.
//
// Имена машинному переводчику не отдаём: он переводит фамилии как слова
// («Кузнецов» → «Smith», «Соловьёв» → «Nightingale»). Транслитерация —
// единственный корректный способ показать имя человеку, который не читает
// кириллицу.
//
// Таблица — ГОСТ Р 7.0.34-2014 в упрощённом виде (без диакритики), он же
// практически совпадает с загранпаспортным ICAO: именно так фамилии
// сотрудников написаны в их документах и в зарубежных публикациях. Мягкий и
// твёрдый знаки опускаются, поэтому «Васильевич» → «Vasilevich».
//
// На казахскую версию НЕ распространяется: казахский пишется кириллицей, там
// ФИО остаются как есть.

const MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
  з: "z", и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e",
  ю: "iu", я: "ia",
};

// В начале слова «е» читается как «ye» — иначе «Елена» превращается в «Elena»
// с потерей звука, а «Евгений» в «Evgenii» вместо привычного «Yevgeniy».
// Загранпаспортный стандарт этого не различает, но для чтения вслух разница
// заметна, а для поиска по сайту — нет.
const INITIAL: Record<string, string> = { е: "ye", ё: "yo", ю: "yu", я: "ya" };

function translitWord(word: string): string {
  let out = "";
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    const lower = ch.toLowerCase();
    const isUpper = ch !== lower;
    const rule = (i === 0 && INITIAL[lower]) || MAP[lower];
    if (rule === undefined) {
      out += ch; // латиница, дефис, точка, пробел — как есть
      continue;
    }
    out += isUpper ? rule.charAt(0).toUpperCase() + rule.slice(1) : rule;
  }
  return out;
}

/** «Мирошниченко Игорь Васильевич» → «Miroshnichenko Igor Vasilevich» */
export function translit(s: string): string {
  if (!s) return s;
  // Разбиваем по границам слов, чтобы правило «е в начале» применялось к
  // каждой части составной фамилии: «Соловьёв-Седой» → «Solovev-Sedoi».
  return s.split(/([\s-]+)/).map((part) => (/[\s-]/.test(part) ? part : translitWord(part))).join("");
}

/** Транслитерация только для латинских языков; казахский — кириллица. */
export function personName(fio: string, locale: string): string {
  return locale === "en" ? translit(fio) : fio;
}
