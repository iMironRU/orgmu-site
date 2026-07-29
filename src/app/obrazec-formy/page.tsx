import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { Form } from "@/components/Form";
import type { FormConfig } from "@/lib/forms/types";

// Страница-образец: показывает все типы полей формы и её поведение (валидация,
// согласие ПДн, состояния отправки). Внутренний справочник для тех, кто
// собирает формы в yml, — в навигацию не выведена. Пока приёмник не подключён,
// форма работает в режиме-заглушке и честно сообщает, что данные не ушли.

export const metadata: Metadata = {
  title: "Образец формы — типы полей",
};

const DEMO: FormConfig = {
  id: "obrazec",
  method: "survey.submit",
  submit: "Отправить образец",
  consent: true,
  success: "Форма принята, заявка {ticket}.",
  fields: [
    { name: "text", label: "Текстовое поле", kind: "text", required: true, placeholder: "Обычная строка", hint: "kind: text — обязательное" },
    { name: "fio", label: "ФИО с подсказками", kind: "text", suggest: "fio", placeholder: "Начните вводить фамилию", hint: "suggest: fio — автодополнение Dadata (нужен токен)" },
    { name: "address", label: "Адрес с подсказками", kind: "text", suggest: "address", placeholder: "Город, улица, дом", hint: "suggest: address — адрес из ФИАС (нужен токен)" },
    { name: "email", label: "Почта", kind: "email", required: true, placeholder: "you@example.ru", hint: "kind: email — проверяется формат" },
    { name: "tel", label: "Телефон", kind: "tel", hint: "kind: tel — маска и проверка полноты номера" },
    { name: "number", label: "Число", kind: "number", placeholder: "18", hint: "kind: number — числовая клавиатура на телефоне" },
    { name: "date", label: "Дата", kind: "date", hint: "kind: date — календарь в дизайне сайта" },
    { name: "select", label: "Выпадающий список", kind: "select", options: ["Специалитет", "Ординатура", "Аспирантура"], hint: "kind: select — выпадашка в дизайне сайта" },
    { name: "radio", label: "Переключатели", kind: "radio", options: ["Очно", "Заочно", "Онлайн"], hint: "kind: radio — один из вариантов, все на виду" },
    { name: "checkbox", label: "Отдельный флажок (нужен сертификат участника)", kind: "checkbox", hint: "kind: checkbox — да/нет" },
    { name: "textarea", label: "Многострочное поле", kind: "textarea", rows: 4, placeholder: "Развёрнутый ответ…", hint: "kind: textarea — свободный текст" },
  ],
};

export default function ObrazecFormyPage() {
  return (
    <main className="flex-1">
      {/* Синяя шапка — эталон */}
      <div className="bg-brand text-white" data-a11y-surface="brand">
        <div className="mx-auto max-w-[1146px] px-10 py-8 box-border max-[768px]:px-5">
          <div className="flex items-center gap-2 text-[15px] text-white/70 mb-[14px] font-ui flex-wrap">
            <Link href="/" className="text-white/90 no-underline">Главная</Link>
            <span>/</span>
            <span className="text-white/90">Образец формы</span>
          </div>
          <h1 className="m-0 mb-2 font-display font-bold text-[38px] leading-[1.12] max-[768px]:text-[26px]">
            Образец формы
          </h1>
          <p className="m-0 max-w-[720px] font-ui text-[17px] text-white/85">
            Все типы полей одного движка форм: валидация, согласие на обработку
            данных, состояния отправки. Форма отправляет данные в 1С по JSON-RPC —
            пока приёмник не подключён, работает в демо-режиме и данные не уходят.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1146px] w-full px-10 pt-9 pb-16 box-border grid grid-cols-[1fr_320px] gap-10 items-start max-[900px]:grid-cols-1 max-[768px]:px-5 font-ui">
        <div className="min-w-0">
          <div className="bg-white border border-line rounded-xl p-6 max-[768px]:p-5">
            <Form config={DEMO} />
          </div>
        </div>

        {/* Пояснение сбоку */}
        <aside className="min-w-0 flex flex-col gap-4">
          <div className="bg-bg-muted border border-line rounded-xl p-5">
            <div className="font-display font-bold text-[18px] text-brand mb-2">Как это устроено</div>
            <ul className="m-0 pl-5 flex flex-col gap-2 text-[15px] leading-[1.5] text-ink-2">
              <li>Форма описывается в yml — набором полей, без правки кода.</li>
              <li>Обязательные поля помечены <span className="text-accent font-bold">*</span> и проверяются до отправки.</li>
              <li>Галочка согласия на ПДн обязательна, со ссылкой на политику.</li>
              <li>Успех показывается только по ответу сервера — без ложного «отправлено».</li>
              <li>Антиспам без капчи: скрытое поле-ловушка и проверка времени заполнения.</li>
            </ul>
          </div>
          <div className="text-[14px] leading-[1.5] text-ink-3 px-1">
            Тот же движок ставится в карточку мероприятия (регистрация), в блок
            страницы (опрос, обратная связь) и на отдельную страницу.
          </div>
        </aside>
      </div>
    </main>
  );
}
