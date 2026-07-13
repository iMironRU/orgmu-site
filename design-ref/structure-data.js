// Структура и органы управления. Плоский список с иерархией (parentId + depth).
// headId ссылается на window.STAFF_DATA.people — руководитель ведёт в общую карточку.
window.STRUCTURE_DATA = {
  types: {
    org:        { label: "Орган управления", color: "rgb(0,101,155)",   soft: "rgba(0,101,155,0.10)" },
    faculty:    { label: "Факультет",        color: "rgb(184,57,4)", soft: "rgba(184,57,4,0.12)" },
    institute:  { label: "Институт",         color: "rgb(48,176,199)",  soft: "rgba(48,176,199,0.12)" },
    college:    { label: "Колледж",          color: "rgb(48,176,199)",  soft: "rgba(48,176,199,0.12)" },
    kafedra:    { label: "Кафедра",          color: "rgb(50,100,150)",  soft: "rgb(245,248,251)" },
    upravlenie: { label: "Управление",       color: "rgb(170,136,99)",  soft: "rgba(170,136,99,0.12)" },
  },
  // порядок = обход дерева; depth задаёт отступ
  units: [
    { id: "rectorat", name: "Ректорат", type: "org", parent: null, depth: 0, headId: "ivanov",
      address: "г. Оренбург, ул. Советская, д. 6", phone: "+7 (3532) 77-61-03", email: "rectorat@orgma.ru", site: "orgma.ru", doc: "Положение о ректорате" },
    { id: "us", name: "Учёный совет", type: "org", parent: null, depth: 0, headId: "secretary",
      address: "г. Оренбург, ул. Советская, д. 6", phone: "+7 (3532) 77-61-22", email: "secretary@orgma.ru", site: "orgma.ru", doc: "Положение об Учёном совете" },

    { id: "lech", name: "Лечебный факультет", type: "faculty", parent: "rectorat", depth: 1, headId: null, headName: "Деканат лечебного факультета",
      address: "г. Оренбург, ул. Советская, д. 6, корп. 2", phone: "+7 (3532) 77-24-59", email: "lech@orgma.ru", site: "orgma.ru/lech", doc: "Положение о факультете" },
    { id: "kaf_gt", name: "Кафедра госпитальной терапии", type: "kafedra", parent: "lech", depth: 2, headId: "ivanov",
      address: "г. Оренбург, ул. Аксакова, д. 23 (ГКБ №1)", phone: "+7 (3532) 43-11-05", email: "gospterapia@orgma.ru", site: "", doc: "Положение о кафедре" },
    { id: "kaf_ft", name: "Кафедра факультетской терапии", type: "kafedra", parent: "lech", depth: 2, headId: "petrova",
      address: "г. Оренбург, пр. Гагарина, д. 21 (ГКБ №3)", phone: "+7 (3532) 35-42-18", email: "facterapia@orgma.ru", site: "", doc: "Положение о кафедре" },
    { id: "kaf_hir", name: "Кафедра хирургии", type: "kafedra", parent: "lech", depth: 2, headId: "morozov",
      address: "г. Оренбург, ул. Невельская, д. 24 (ООКБ)", phone: "+7 (3532) 30-71-44", email: "surgery@orgma.ru", site: "", doc: "Положение о кафедре" },

    { id: "ped", name: "Педиатрический факультет", type: "faculty", parent: "rectorat", depth: 1, headId: null, headName: "Деканат педиатрического факультета",
      address: "г. Оренбург, ул. Советская, д. 6, корп. 3", phone: "+7 (3532) 77-93-86", email: "ped@orgma.ru", site: "orgma.ru/ped", doc: "Положение о факультете" },
    { id: "kaf_ag", name: "Кафедра акушерства и гинекологии", type: "kafedra", parent: "ped", depth: 2, headId: "kuznetsova",
      address: "г. Оренбург, ул. Постникова, д. 11 (роддом)", phone: "+7 (3532) 77-05-19", email: "akusher@orgma.ru", site: "", doc: "Положение о кафедре" },

    { id: "ipo", name: "Институт профессионального образования", type: "institute", parent: "rectorat", depth: 1, headId: "ipo_dir",
      address: "г. Оренбург, ул. Советская, д. 6, корп. 4", phone: "+7 (3532) 77-61-28", email: "ipo@orgma.ru", site: "orgma.ru/ipo", doc: "Положение об институте" },
    { id: "college", name: "Медицинский колледж", type: "college", parent: "rectorat", depth: 1, headId: "college_dir",
      address: "г. Оренбург, ул. Пролетарская, д. 12", phone: "+7 (3532) 77-61-26", email: "college@orgma.ru", site: "orgma.ru/college", doc: "Положение о колледже" },

    { id: "nauka", name: "Управление по научной работе", type: "upravlenie", parent: "rectorat", depth: 1, headId: "sidorov",
      address: "г. Оренбург, ул. Советская, д. 6, каб. 214", phone: "+7 (3532) 77-61-14", email: "science@orgma.ru", site: "", doc: "Положение об управлении" },
    { id: "int", name: "Управление международных связей", type: "upravlenie", parent: "rectorat", depth: 1, headId: "intl_pr",
      address: "г. Оренбург, ул. Советская, д. 6, каб. 118", phone: "+7 (3532) 77-61-18", email: "international@orgma.ru", site: "", doc: "Положение об управлении" },
  ],
};

window.STRUCTURE_HEAD = function (unit) {
  const people = (window.STAFF_DATA && window.STAFF_DATA.people) || [];
  if (unit.headId) {
    const p = people.find(x => x.id === unit.headId);
    if (p) return { name: p.fio, position: (p.position || "").split("·")[0].trim(), id: p.id, hasLink: true };
  }
  return { name: unit.headName || "—", position: "", id: "", hasLink: false };
};
