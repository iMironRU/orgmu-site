// Единый датасет персон. Карточка на человека, а не на должность:
// один и тот же id может фигурировать и в «Руководстве», и в «Педсоставе».
window.STAFF_DATA = {
  people: [
    {
      id: "ivanov", fio: "Иванов Иван Иванович", initials: "ИИ",
      position: "Ректор · профессор кафедры госпитальной терапии", role: "lead",
      dept: "Кафедра госпитальной терапии", deptHref: "Department.dc.html",
      degree: "д.м.н., профессор", disciplines: ["Госпитальная терапия", "Внутренние болезни"],
      pedExp: "31 год", totalExp: "38 лет",
      leadRole: "Ректор", reception: "Вторник 15:00–17:00", phone: "+7 (3532) 77‑61‑03", email: "rector@orgma.ru",
      education: "Оренбургский государственный медицинский институт, 1986 — «Лечебное дело»",
      retraining: ["2023 — «Управление в здравоохранении», 144 ч.", "2021 — «Кардиология», 288 ч."],
    },
    {
      id: "petrova", fio: "Петрова Мария Сергеевна", initials: "ПМ",
      position: "Проректор по учебной работе · доцент", role: "lead",
      dept: "Кафедра факультетской терапии", deptHref: "Department.dc.html",
      degree: "к.м.н., доцент", disciplines: ["Факультетская терапия"],
      pedExp: "22 года", totalExp: "27 лет",
      leadRole: "Проректор по учебной работе", reception: "Среда 14:00–16:00", phone: "+7 (3532) 77‑61‑10", email: "study@orgma.ru",
      education: "ОрГМА, 1998 — «Лечебное дело»",
      retraining: ["2022 — «Электронная образовательная среда», 72 ч."],
    },
    {
      id: "sidorov", fio: "Сидоров Пётр Николаевич", initials: "СП",
      position: "Проректор по научной работе · профессор", role: "lead",
      dept: "Кафедра патофизиологии", deptHref: "Department.dc.html",
      degree: "д.м.н., профессор", disciplines: ["Патофизиология"],
      pedExp: "26 лет", totalExp: "30 лет",
      leadRole: "Проректор по научной работе", reception: "Четверг 15:00–17:00", phone: "+7 (3532) 77‑61‑14", email: "science@orgma.ru",
      education: "ОГМИ, 1992 — «Лечебное дело»",
      retraining: ["2023 — «Управление НИОКР», 108 ч."],
    },
    {
      id: "president", fio: "Фёдоров Николай Петрович", initials: "ФН",
      position: "Президент университета · профессор", role: "lead",
      dept: "Ректорат", deptHref: "Department.dc.html",
      degree: "д.м.н., профессор", disciplines: [],
      pedExp: "45 лет", totalExp: "52 года",
      leadRole: "Президент", reception: "Понедельник 14:00–16:00", phone: "+7 (3532) 77‑61‑01", email: "president@orgma.ru",
      education: "ОГМИ, 1972 — «Лечебное дело»", retraining: [],
    },
    {
      id: "lech_pr", fio: "Григорьева Светлана Ивановна", initials: "ГС",
      position: "Проректор по лечебной работе · доцент", role: "lead",
      dept: "Ректорат", deptHref: "Department.dc.html",
      degree: "к.м.н., доцент", disciplines: [],
      pedExp: "20 лет", totalExp: "25 лет",
      leadRole: "Проректор по лечебной работе", reception: "Понедельник 15:00–17:00", phone: "+7 (3532) 77‑61‑12", email: "clinic@orgma.ru",
      education: "ОрГМА, 2000 — «Лечебное дело»", retraining: [],
    },
    {
      id: "vospit_pr", fio: "Захаров Олег Витальевич", initials: "ЗО",
      position: "Проректор по воспитательной работе", role: "lead",
      dept: "Ректорат", deptHref: "Department.dc.html",
      degree: "к.п.н.", disciplines: [],
      pedExp: "18 лет", totalExp: "22 года",
      leadRole: "Проректор по воспитательной работе", reception: "Вторник 14:00–16:00", phone: "+7 (3532) 77‑61‑16", email: "vospit@orgma.ru",
      education: "ОГПУ, 2002 — «Педагогика»", retraining: [],
    },
    {
      id: "intl_pr", fio: "Соколова Ирина Юрьевна", initials: "СИ",
      position: "Проректор по международной работе · доцент", role: "lead",
      dept: "Ректорат", deptHref: "Department.dc.html",
      degree: "к.м.н., доцент", disciplines: [],
      pedExp: "16 лет", totalExp: "20 лет",
      leadRole: "Проректор по международной работе", reception: "Среда 15:00–17:00", phone: "+7 (3532) 77‑61‑18", email: "international@orgma.ru",
      education: "ОрГМА, 2004 — «Лечебное дело»", retraining: [],
    },
    {
      id: "ahch_pr", fio: "Тарасов Виктор Семёнович", initials: "ТВ",
      position: "Проректор по АХЧ", role: "lead",
      dept: "Ректорат", deptHref: "Department.dc.html",
      degree: "", disciplines: [],
      pedExp: "—", totalExp: "31 год",
      leadRole: "Проректор по АХЧ", reception: "Четверг 14:00–16:00", phone: "+7 (3532) 77‑61‑20", email: "ahch@orgma.ru",
      education: "ОГУ, 1993 — «Инженер»", retraining: [],
    },
    {
      id: "secretary", fio: "Белова Наталья Александровна", initials: "БН",
      position: "Учёный секретарь · доцент", role: "lead",
      dept: "Учёный совет", deptHref: "Department.dc.html",
      degree: "к.м.н., доцент", disciplines: [],
      pedExp: "19 лет", totalExp: "24 года",
      leadRole: "Учёный секретарь", reception: "Пятница 14:00–16:00", phone: "+7 (3532) 77‑61‑22", email: "secretary@orgma.ru",
      education: "ОрГМА, 2001 — «Лечебное дело»", retraining: [],
    },
    {
      id: "buh", fio: "Егорова Людмила Николаевна", initials: "ЕЛ",
      position: "Главный бухгалтер", role: "lead",
      dept: "Бухгалтерия", deptHref: "Department.dc.html",
      degree: "", disciplines: [],
      pedExp: "—", totalExp: "28 лет",
      leadRole: "Главный бухгалтер", reception: "Понедельник 10:00–12:00", phone: "+7 (3532) 77‑61‑24", email: "buh@orgma.ru",
      education: "ОГУ, 1996 — «Бухгалтерский учёт»", retraining: [],
    },
    {
      id: "college_dir", fio: "Романова Вера Михайловна", initials: "РВ",
      position: "Директор медицинского колледжа · доцент", role: "lead",
      dept: "Медицинский колледж", deptHref: "Department.dc.html",
      degree: "к.м.н., доцент", disciplines: [],
      pedExp: "23 года", totalExp: "27 лет",
      leadRole: "Директор колледжа", reception: "Среда 14:00–16:00", phone: "+7 (3532) 77‑61‑26", email: "college@orgma.ru",
      education: "ОрГМА, 1997 — «Лечебное дело»", retraining: [],
    },
    {
      id: "ipo_dir", fio: "Лебедев Андрей Геннадьевич", initials: "ЛА",
      position: "Директор института профобразования · профессор", role: "lead",
      dept: "Институт профессионального образования", deptHref: "Department.dc.html",
      degree: "д.м.н., профессор", disciplines: [],
      pedExp: "27 лет", totalExp: "32 года",
      leadRole: "Директор ИПО", reception: "Четверг 15:00–17:00", phone: "+7 (3532) 77‑61‑28", email: "ipo@orgma.ru",
      education: "ОГМИ, 1991 — «Лечебное дело»", retraining: [],
    },
    {
      id: "kuznetsova", fio: "Кузнецова Ольга Владимировна", initials: "КО",
      position: "Заведующая кафедрой · профессор", role: "staff",
      dept: "Кафедра акушерства и гинекологии", deptHref: "Department.dc.html",
      degree: "д.м.н., профессор", disciplines: ["Акушерство и гинекология"],
      pedExp: "24 года", totalExp: "29 лет",
      leadRole: "", reception: "", phone: "", email: "",
      education: "ОГМИ, 1993 — «Лечебное дело»",
      retraining: ["2024 — «Симуляционные технологии в акушерстве», 72 ч."],
    },
    {
      id: "smirnov", fio: "Смирнов Алексей Дмитриевич", initials: "СА",
      position: "Доцент", role: "staff",
      dept: "Кафедра госпитальной терапии", deptHref: "Department.dc.html",
      degree: "к.м.н., доцент", disciplines: ["Госпитальная терапия", "Клиническая фармакология"],
      pedExp: "14 лет", totalExp: "17 лет",
      leadRole: "", reception: "", phone: "", email: "",
      education: "ОрГМА, 2006 — «Лечебное дело»",
      retraining: ["2022 — «Клиническая фармакология», 144 ч."],
    },
    {
      id: "volkova", fio: "Волкова Екатерина Андреевна", initials: "ВЕ",
      position: "Ассистент", role: "staff",
      dept: "Кафедра нормальной физиологии", deptHref: "Department.dc.html",
      degree: "к.б.н.", disciplines: ["Нормальная физиология"],
      pedExp: "6 лет", totalExp: "8 лет",
      leadRole: "", reception: "", phone: "", email: "",
      education: "ОрГМУ, 2016 — «Медицинская биохимия»",
      retraining: ["2023 — «Цифровая дидактика», 36 ч."],
    },
    {
      id: "morozov", fio: "Морозов Дмитрий Олегович", initials: "МД",
      position: "Профессор", role: "staff",
      dept: "Кафедра хирургии", deptHref: "Department.dc.html",
      degree: "д.м.н., профессор", disciplines: ["Общая хирургия", "Оперативная хирургия"],
      pedExp: "28 лет", totalExp: "33 года",
      leadRole: "", reception: "", phone: "", email: "",
      education: "ОГМИ, 1990 — «Лечебное дело»",
      retraining: ["2021 — «Малоинвазивная хирургия», 216 ч."],
    },
    {
      id: "nikitina", fio: "Никитина Анна Павловна", initials: "НА",
      position: "Старший преподаватель", role: "staff",
      dept: "Кафедра иностранных языков", deptHref: "Department.dc.html",
      degree: "к.ф.н.", disciplines: ["Латинский язык", "Иностранный язык"],
      pedExp: "12 лет", totalExp: "15 лет",
      leadRole: "", reception: "", phone: "", email: "",
      education: "ОГПУ, 2008 — «Филология»",
      retraining: ["2024 — «Медицинская терминология», 72 ч."],
    },
  ],
  departments: ["Все кафедры", "Кафедра госпитальной терапии", "Кафедра факультетской терапии", "Кафедра патофизиологии", "Кафедра акушерства и гинекологии", "Кафедра нормальной физиологии", "Кафедра хирургии", "Кафедра иностранных языков"],
  positions: ["Все должности", "Заведующий кафедрой", "Профессор", "Доцент", "Старший преподаватель", "Ассистент"],
  degrees: ["Любая степень", "д.м.н.", "к.м.н.", "к.б.н.", "к.ф.н."],
};

// Пол по отчеству (для деликатной цветовой подсказки на аватаре)
window.STAFF_SEX = function (fio) {
  const parts = String(fio || "").trim().split(/\s+/);
  const patr = (parts[2] || "").toLowerCase();
  if (/(вна|чна|ична)$/.test(patr)) return "f";
  if (/(вич|ьич)$/.test(patr)) return "m";
  return "m";
};
// Тёплый градиент — ж, холодный — м
window.STAFF_AVATAR = function (fio) {
  return window.STAFF_SEX(fio) === "f"
    ? "linear-gradient(135deg, rgb(206,108,150), rgb(240,168,196))"
    : "linear-gradient(135deg, rgb(0,101,155), rgb(184,57,4))";
};

// Разбить "38 лет" → {num:"38", unit:"лет"} — единица всегда отдельно, не переносится
window.STAFF_NUM = function (v) {
  const s = String(v == null ? "" : v).trim();
  const i = s.indexOf(" ");
  return i < 0 ? { num: s, unit: "" } : { num: s.slice(0, i), unit: s.slice(i + 1) };
};

