// Настройки версии для слабовидящих. Хранятся в localStorage("orgma_a11y"),
// применяются как data-атрибуты на <html>. Помимо этого модуля их применяет
// ранний инлайн-скрипт в layout (чтобы не было мигания при загрузке).
export type A11yTheme = "normal" | "darkblue" | "contrast" | "sepia";

export type A11ySettings = {
  font: 0 | 1 | 2; // размер шрифта: обычный / крупный / очень крупный
  theme: A11yTheme; // цветовая схема
  spacing: 0 | 1 | 2; // межбуквенный интервал
  images: boolean; // показывать изображения
};

export const A11Y_STORAGE_KEY = "orgma_a11y";

export const A11Y_DEFAULTS: A11ySettings = {
  font: 0,
  theme: "normal",
  spacing: 0,
  images: true,
};

export function applyA11y(s: A11ySettings): void {
  if (typeof document === "undefined") return;
  const d = document.documentElement;
  if (s.font) d.dataset.a11yFont = String(s.font);
  else delete d.dataset.a11yFont;

  if (s.theme && s.theme !== "normal") d.dataset.a11yTheme = s.theme;
  else delete d.dataset.a11yTheme;

  if (s.spacing) d.dataset.a11ySpacing = String(s.spacing);
  else delete d.dataset.a11ySpacing;

  if (!s.images) d.dataset.a11yImages = "off";
  else delete d.dataset.a11yImages;
}

export function readA11y(): A11ySettings {
  if (typeof window === "undefined") return A11Y_DEFAULTS;
  try {
    const raw = localStorage.getItem(A11Y_STORAGE_KEY);
    if (!raw) return A11Y_DEFAULTS;
    return { ...A11Y_DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return A11Y_DEFAULTS;
  }
}

export function saveA11y(s: A11ySettings): void {
  try {
    localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(s));
  } catch {
    // приватный режим / переполнение — молча игнорируем
  }
}

// Тот же код, что исполняет ранний инлайн-скрипт в <body> (до гидрации),
// строкой — чтобы применить сохранённые настройки без мигания.
export const A11Y_INLINE_SCRIPT = `(function(){try{var s=JSON.parse(localStorage.getItem('${A11Y_STORAGE_KEY}')||'null');if(!s)return;var d=document.documentElement;if(s.font)d.dataset.a11yFont=s.font;if(s.theme&&s.theme!=='normal')d.dataset.a11yTheme=s.theme;if(s.spacing)d.dataset.a11ySpacing=s.spacing;if(s.images===false)d.dataset.a11yImages='off';}catch(e){}})();`;
