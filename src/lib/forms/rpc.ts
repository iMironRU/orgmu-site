// Транспорт форм: браузер шлёт JSON-RPC 2.0 POST-ом на HTTP-сервис 1С.
// Сайт статический — своего бэкенда нет, поэтому отправка идёт напрямую с
// клиента на внешний endpoint (адрес задаётся при сборке).
//
// Контракт:
//   → { jsonrpc:"2.0", id:<nonce>, method:"event.register",
//       params:{ formId, fields:{…}, consent, ts, hp } }
//   ← { jsonrpc:"2.0", id, result:{ ok:true, ticket:"R-1042" } }
//   ← { jsonrpc:"2.0", id, error:{ code, message } }
//
// hp (honeypot) и ts (метка времени открытия формы) едут вместе с данными —
// антиспам проверяем и на клиенте, и на стороне 1С.
//
// Пока endpoint не задан (NEXT_PUBLIC_FORMS_RPC_URL пуст) — форма работает в
// режиме-заглушке: собирает и проверяет данные, но НИЧЕГО не отправляет и
// честно об этом сообщает. Никакого ложного «заявка отправлена».

export const FORMS_RPC_URL = process.env.NEXT_PUBLIC_FORMS_RPC_URL || "";

export type SubmitResult =
  | { status: "ok"; ticket?: string }
  | { status: "error"; message: string }
  // endpoint не настроен — данные НЕ ушли, показываем это открыто
  | { status: "stub"; payload: Record<string, unknown> };

function nonce(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* нет crypto — падаем на запасной вариант ниже */
  }
  return `id-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
}

export async function submitForm(
  method: string,
  params: Record<string, unknown>,
): Promise<SubmitResult> {
  // Заглушка: адрес приёмника ещё не подключён.
  if (!FORMS_RPC_URL) return { status: "stub", payload: { method, params } };

  let res: Response;
  try {
    res = await fetch(FORMS_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: nonce(), method, params }),
    });
  } catch {
    return {
      status: "error",
      message: "Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.",
    };
  }

  if (!res.ok) {
    return { status: "error", message: `Сервер ответил ошибкой (${res.status}). Попробуйте позже.` };
  }

  let data: { result?: { ok?: boolean; ticket?: string }; error?: { message?: string } };
  try {
    data = await res.json();
  } catch {
    return { status: "error", message: "Не удалось прочитать ответ сервера." };
  }

  if (data.error) return { status: "error", message: data.error.message || "Заявка не принята." };
  if (data.result?.ok) return { status: "ok", ticket: data.result.ticket };
  return { status: "error", message: "Заявка не принята сервером." };
}
