// Конфиг формы — данные, а не код. Одна форма (компонент Form) собирается по
// такому описанию: регистрация на мероприятие, опрос, обратная связь — разница
// только в наборе полей и методе JSON-RPC. Чистые типы (без node:fs) — можно
// импортировать в клиентские компоненты.

export type FormFieldKind =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox";

export type FormFieldDef = {
  /** Ключ в params.fields запроса. Латиницей, без пробелов. */
  name: string;
  label: string;
  kind: FormFieldKind;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  /** Для select / radio. */
  options?: string[];
  /** Для textarea. */
  rows?: number;
  /**
   * Подсказки Dadata: "fio" — дополняет ФИО, "address" — адрес (ФИАС).
   * Работает только если задан токен (NEXT_PUBLIC_DADATA_TOKEN). Без токена
   * поле обычное. Это передача введённого текста в Dadata — включать осознанно.
   */
  suggest?: "fio" | "address";
};

export type FormConfig = {
  /** Идентификатор формы — уезжает в params.formId, по нему сервер отличает форму. */
  id: string;
  /** Метод JSON-RPC, например "event.register" или "survey.submit". */
  method: string;
  /** Подпись кнопки отправки. */
  submit?: string;
  /**
   * Текст успеха. {ticket} подставляется номером заявки из ответа сервера.
   * Показывается только по реальному ответу result.ok — не «на всякий случай».
   */
  success?: string;
  /** Требовать галочку согласия на обработку ПДн (ссылка на /politika). */
  consent?: boolean;
  /** Своя формулировка согласия (по умолчанию — стандартная). */
  consentLabel?: string;
  fields: FormFieldDef[];
};
