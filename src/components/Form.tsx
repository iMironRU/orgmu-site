"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/components/Link";
import type { FormConfig, FormFieldDef } from "@/lib/forms/types";
import { submitForm, type SubmitResult } from "@/lib/forms/rpc";

// Единый движок форм сайта: регистрация на мероприятие, опрос, обратная связь.
// Собирается по конфигу (FormConfig), шлёт данные в 1С по JSON-RPC (см. rpc.ts).
//
// Состояния: idle → sending → ok | error. Успех показываем ТОЛЬКО по реальному
// ответу сервера (result.ok) — никакого преждевременного «отправлено». Пока
// endpoint не подключён, submitForm возвращает "stub": форма честно говорит,
// что заявка не ушла.
//
// Антиспам без капчи: honeypot (скрытое поле — боты заполняют, люди нет) и
// тайм-трап (сабмит раньше пары секунд после открытия — почти наверняка бот).
// Оба сигнала едут в params, 1С может перепроверить.

const FIELD =
  "w-full font-ui text-[17px] px-[14px] py-[11px] border rounded-lg outline-none text-ink bg-white transition-colors";
const MIN_FILL_MS = 1500; // быстрее человек форму не заполнит

type Values = Record<string, string | boolean>;

function emptyValues(fields: FormFieldDef[]): Values {
  const v: Values = {};
  for (const f of fields) v[f.name] = f.kind === "checkbox" ? false : "";
  return v;
}

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export function Form({ config, compact = false }: { config: FormConfig; compact?: boolean }) {
  const [values, setValues] = useState<Values>(() => emptyValues(config.fields));
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [result, setResult] = useState<SubmitResult | null>(null);

  const openedAt = useRef<number>(0);
  const honeypot = useRef<HTMLInputElement>(null);
  useEffect(() => {
    openedAt.current = performance.now();
  }, []);

  const set = (name: string, val: string | boolean) => {
    setValues((v) => ({ ...v, [name]: val }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  };

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    for (const f of config.fields) {
      const val = values[f.name];
      if (f.kind === "checkbox") {
        if (f.required && !val) e[f.name] = "Отметьте это поле";
        continue;
      }
      const s = String(val ?? "").trim();
      if (f.required && !s) {
        e[f.name] = "Заполните поле";
        continue;
      }
      if (s && f.kind === "email" && !isEmail(s)) e[f.name] = "Проверьте адрес почты";
      if (s && f.kind === "tel" && s.replace(/\D/g, "").length < 6) e[f.name] = "Проверьте телефон";
    }
    return e;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (status === "sending") return;

    // Honeypot заполнен — это бот. Молча ничего не делаем (человек это поле
    // не видит, значит и сообщение ему показывать незачем).
    if (honeypot.current?.value) return;

    const e = validate();
    if (config.consent && !consent) e.__consent = "Нужно согласие на обработку данных";
    setErrors(e);
    if (Object.keys(e).length) return;

    // Тайм-трап: всё валидно, но форму «заполнили» мгновенно — вероятный бот.
    const elapsed = performance.now() - openedAt.current;
    if (elapsed < MIN_FILL_MS) return;

    setStatus("sending");
    const fields: Record<string, unknown> = {};
    for (const f of config.fields) fields[f.name] = values[f.name];

    const r = await submitForm(config.method, {
      formId: config.id,
      fields,
      consent: config.consent ? consent : undefined,
      ts: Math.round(elapsed),
      hp: "",
    });
    setResult(r);
    setStatus(r.status === "ok" || r.status === "stub" ? "ok" : "error");
  }

  // ── Успех / заглушка ──────────────────────────────────────────────────
  if (status === "ok" && result) {
    if (result.status === "stub") {
      // Честно: данные никуда не ушли. Показываем, что было бы отправлено.
      return (
        <div className="rounded-xl border border-dashed border-line-strong bg-bg-muted p-5 font-ui">
          <div className="flex items-center gap-2 font-bold text-[17px] text-ink-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v4h1" /></svg>
            Демо-режим: заявка НЕ отправлена
          </div>
          <p className="mt-2 mb-3 text-[15px] leading-[1.5] text-ink-2">
            Форма собрана и проверена, но приём заявок ещё не подключён к серверу.
            Когда HTTP-сервис 1С заработает, эти данные уйдут методом{" "}
            <code className="text-[13px] bg-white px-1 py-0.5 rounded border border-line">{config.method}</code>:
          </p>
          <pre className="text-[13px] leading-[1.5] bg-white border border-line rounded-lg p-3 overflow-x-auto text-ink-2">
            {JSON.stringify((result.payload as { params?: unknown }).params, null, 2)}
          </pre>
          <button
            type="button"
            onClick={() => { setStatus("idle"); setResult(null); }}
            className="mt-3 font-bold text-[15px] text-accent no-underline hover:underline cursor-pointer bg-transparent border-0 p-0"
          >
            ← Заполнить заново
          </button>
        </div>
      );
    }
    const ticket = result.status === "ok" ? result.ticket : undefined;
    const text = (config.success || "Заявка принята. Спасибо!").replace(
      "{ticket}",
      ticket ? `№ ${ticket}` : "",
    );
    return (
      <div className="rounded-xl border border-teal/40 bg-teal/10 p-5 font-ui">
        <div className="flex items-center gap-2 font-bold text-[18px] text-brand">
          <span className="shrink-0 text-teal flex">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M8 12l2.5 2.5L16 9" /></svg>
          </span>
          Готово
        </div>
        <p className="mt-2 mb-0 text-[16px] leading-[1.5] text-ink-2">{text.trim()}</p>
      </div>
    );
  }

  // ── Форма ─────────────────────────────────────────────────────────────
  const sending = status === "sending";

  return (
    <form onSubmit={onSubmit} noValidate className={`flex flex-col ${compact ? "gap-3" : "gap-4"} font-ui`}>
      {/* Honeypot: видимо только ботам. Реальный человек его не заполнит. */}
      <input
        ref={honeypot}
        type="text"
        name="organization"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {config.fields.map((f) => (
        <Field
          key={f.name}
          f={f}
          value={values[f.name]}
          error={errors[f.name]}
          disabled={sending}
          onChange={(val) => set(f.name, val)}
        />
      ))}

      {config.consent && (
        <label className="flex items-start gap-[10px] text-[14px] leading-[1.5] text-steel cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            disabled={sending}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (errors.__consent) setErrors((x) => ({ ...x, __consent: "" }));
            }}
            className="mt-[3px] shrink-0 w-[18px] h-[18px] accent-[rgb(184,57,4)]"
          />
          <span>
            {config.consentLabel ||
              "Я согласен на обработку персональных данных в целях рассмотрения заявки"}
            <span className="text-accent"> *</span>
            {". "}
            <Link href="/politika" className="text-accent font-bold no-underline hover:underline">
              Политика обработки ПДн
            </Link>
            {errors.__consent && <span className="block text-accent font-bold mt-1">{errors.__consent}</span>}
          </span>
        </label>
      )}

      {status === "error" && result?.status === "error" && (
        <div className="flex items-start gap-2 rounded-lg border border-accent/40 bg-accent/8 px-4 py-3 text-[15px] leading-[1.4] text-accent">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
          <span>{result.message}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={sending}
        className="self-stretch inline-flex items-center justify-center gap-2 font-ui font-bold text-[18px] text-white bg-accent rounded-[10px] py-[14px] px-6 border-0 cursor-pointer hover:bg-[rgb(150,46,3)] transition-colors disabled:opacity-60 disabled:cursor-wait"
      >
        {sending && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="animate-spin"><circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.35)" strokeWidth="3" /><path d="M12 3a9 9 0 0 1 9 9" stroke="white" strokeWidth="3" strokeLinecap="round" /></svg>
        )}
        {sending ? "Отправляем…" : config.submit || "Отправить"}
      </button>
    </form>
  );
}

function Field({
  f,
  value,
  error,
  disabled,
  onChange,
}: {
  f: FormFieldDef;
  value: string | boolean;
  error?: string;
  disabled: boolean;
  onChange: (val: string | boolean) => void;
}) {
  const border = error ? "border-accent" : "border-line-strong focus:border-accent";

  // Отдельный булев чекбокс (не «согласие» — те рендерятся отдельно).
  if (f.kind === "checkbox") {
    return (
      <label className="flex items-start gap-[10px] text-[15px] leading-[1.5] text-steel cursor-pointer">
        <input
          type="checkbox"
          checked={!!value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-[3px] shrink-0 w-[18px] h-[18px] accent-[rgb(184,57,4)]"
        />
        <span>
          {f.label}
          {f.required && <span className="text-accent"> *</span>}
          {error && <span className="block text-accent font-bold mt-1 text-[13px]">{error}</span>}
        </span>
      </label>
    );
  }

  return (
    <label className="flex flex-col gap-[6px] text-[15px] font-bold text-ink-2">
      <span>
        {f.label}
        {f.required && <span className="text-accent"> *</span>}
      </span>

      {f.kind === "textarea" ? (
        <textarea
          rows={f.rows ?? 5}
          value={String(value)}
          placeholder={f.placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`${FIELD} ${border} resize-y font-normal`}
        />
      ) : f.kind === "select" ? (
        <select
          value={String(value)}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`${FIELD} ${border} font-normal cursor-pointer ${value ? "" : "text-ink-3"}`}
        >
          <option value="">{f.placeholder || "— выберите —"}</option>
          {(f.options ?? []).map((o) => (
            <option key={o} value={o} className="text-ink">{o}</option>
          ))}
        </select>
      ) : f.kind === "radio" ? (
        <div className="flex flex-col gap-2 font-normal">
          {(f.options ?? []).map((o) => (
            <label key={o} className="flex items-center gap-[10px] text-[16px] text-ink cursor-pointer">
              <input
                type="radio"
                name={f.name}
                value={o}
                checked={value === o}
                disabled={disabled}
                onChange={() => onChange(o)}
                className="w-[18px] h-[18px] accent-[rgb(184,57,4)]"
              />
              {o}
            </label>
          ))}
        </div>
      ) : (
        <input
          type={f.kind}
          value={String(value)}
          placeholder={f.placeholder}
          disabled={disabled}
          inputMode={f.kind === "tel" ? "tel" : f.kind === "number" ? "numeric" : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={`${FIELD} ${border} font-normal`}
        />
      )}

      {f.hint && !error && <span className="text-[14px] font-normal text-ink-3">{f.hint}</span>}
      {error && f.kind !== "radio" && <span className="text-[13px] font-bold text-accent">{error}</span>}
      {error && f.kind === "radio" && <span className="text-[13px] font-bold text-accent">{error}</span>}
    </label>
  );
}
