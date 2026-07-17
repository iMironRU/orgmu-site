import type { SectionDef, FieldDef, GroupDef } from "@/lib/sveden/vocab";
import { sectionFields, sectionGroups } from "@/lib/sveden/vocab";
import {
  sectionData,
  renderText,
  hrefOf,
  isMissing,
  MISSING_VALUE,
  type FieldValue,
} from "@/lib/sveden/data";
import { fieldLabel, groupLabel } from "@/lib/sveden/labels";
import { makeDocItem, isFileHref, type DocItem } from "@/lib/sveden/documents";
import { DocCards } from "@/components/sveden/DocCards";

// Атрибут микроразметки строчными в исходном HTML.
const ip = (value: string) => ({ itemprop: value }) as Record<string, string>;

// Значение поля с микроразметкой. itemprop оборачивает ТОЛЬКО значение.
function Value({ itemprop, value }: { itemprop: string; value: FieldValue }) {
  const href = hrefOf(value);
  const text = renderText(value);
  const cls = isMissing(value) ? "text-ink-3" : "text-ink";
  if (href) {
    return (
      <a {...ip(itemprop)} href={href} className="text-accent underline break-words">
        {text}
      </a>
    );
  }
  return (
    <span {...ip(itemprop)} className={`${cls} break-words whitespace-pre-line`}>
      {text}
    </span>
  );
}

// Строка «подпись + значение» — стиль макета Svedenia (подпись слева, значение справа).
function Row({ f, value }: { f: FieldDef; value: FieldValue }) {
  return (
    <div className="flex gap-5 px-[22px] py-[15px] border-b border-line last:border-0 flex-wrap">
      <div className="flex-[0_0_240px] max-w-full text-[16px] text-ink-2 font-ui">
        {fieldLabel(f.key)}
      </div>
      <div className="flex-1 min-w-[180px] text-[17px] font-medium font-ui">
        <Value itemprop={f.itemprop} value={value} />
      </div>
    </div>
  );
}

// Якорь заголовка группы — чтобы к разделу можно было прокрутить из
// оглавления. Ключ группы стабилен (из вокабуляра), поэтому годится как id.
export const groupAnchor = (key: string) => `grp-${key}`;

function GroupBlock({ g, items }: { g: GroupDef; items: Record<string, FieldValue>[] }) {
  const asTable = items.length > 8;
  return (
    <section className="mt-8">
      <h2 id={groupAnchor(g.key)} className="m-0 mb-4 font-display font-bold text-[22px] text-brand scroll-mt-[100px]">
        {groupLabel(g.key)}
        {items.length > 1 && (
          <span className="text-ink-3 font-normal text-[16px]"> · {items.length}</span>
        )}
      </h2>
      {items.length === 0 ? (
        <p className="text-ink-3 font-ui">отсутствует</p>
      ) : asTable ? (
        <div className="overflow-x-auto border border-line rounded-xl">
          <table className="w-full border-collapse text-[14px] font-ui">
            <thead>
              <tr className="bg-bg-muted text-left">
                {g.fields.map((f) => (
                  <th key={f.key} className="px-3 py-2 border-b border-line font-bold text-ink-2 whitespace-nowrap">
                    {fieldLabel(f.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} {...ip(g.itemprop)} className="align-top">
                  {g.fields.map((f) => {
                    const v = item[f.key];
                    const href = hrefOf(v);
                    return (
                      <td key={f.key} className="px-3 py-2 border-b border-line min-w-[140px]">
                        {href ? (
                          <a {...ip(f.itemprop)} href={href} className="text-accent underline break-words">
                            {renderText(v)}
                          </a>
                        ) : (
                          <span
                            {...ip(f.itemprop)}
                            className={`${isMissing(v) ? "text-ink-3" : "text-ink"} break-words whitespace-pre-line`}
                          >
                            {renderText(v)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item, i) => (
            <div key={i} {...ip(g.itemprop)} className="bg-white border border-line rounded-xl px-0 py-0 overflow-hidden">
              {g.fields.map((f) => (
                <Row key={f.key} f={f} value={item[f.key]} />
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function normalizeItems(
  value: Record<string, FieldValue>[] | Record<string, FieldValue> | null | undefined,
): Record<string, FieldValue>[] {
  if (Array.isArray(value)) return value;
  if (value) return [value];
  return [];
}

// Строки-«шапки» таблиц, ошибочно попавшие в данные при парсинге
// («Код, шифр…», «Наименование объекта», «Адрес», «Оснащённость»…).
const HEADER_RE =
  /^(наименовани|адрес|код,?\s*шифр|код\b|должност|ф\.?\s?и\.?\s?о|оснащ|приспособл|номер стационарн|уровень образ|форма обуч|срок обуч|проходной|места? (проведен|осуществлен|при )|результат|численност|перечень|телефон|электронн|веб-сайт|количеств|образовательная программа|курс$)/i;

function isHeaderRow(item: Record<string, FieldValue>, fields: FieldDef[]): boolean {
  const vals = fields
    .map((f) => renderText(item[f.key]))
    .filter((v) => v && v !== MISSING_VALUE);
  if (vals.length === 0) return false;
  const labelish = vals.filter((v) => HEADER_RE.test(v)).length;
  return labelish >= Math.ceil(vals.length / 2);
}

function cleanItems(items: Record<string, FieldValue>[], fields: FieldDef[]) {
  return items.filter((it) => !isHeaderRow(it, fields));
}

export function SvedenSection({ sectionKey, section }: { sectionKey: string; section: SectionDef }) {
  const fields: FieldDef[] = sectionFields(section);
  const groups: GroupDef[] = sectionGroups(section);
  const data = sectionData(sectionKey);

  // Поля-файлы выносим в блок «Документы» карточками; остальные — в таблицу.
  const docItems: DocItem[] = [];
  const plainFields: FieldDef[] = [];
  for (const f of fields) {
    const v = data.fields?.[f.key];
    const href = hrefOf(v);
    if (isFileHref(href)) {
      const item = makeDocItem(f.itemprop, renderText(v), href);
      if (item) {
        docItems.push(item);
        continue;
      }
    }
    plainFields.push(f);
  }

  return (
    <div>
      {plainFields.length > 0 && (
        <section className="bg-white border border-line rounded-xl overflow-hidden">
          {plainFields.map((f) => (
            <Row key={f.key} f={f} value={data.fields?.[f.key]} />
          ))}
        </section>
      )}

      {docItems.length > 0 && (
        <section className="mt-8">
          <h2 className="m-0 mb-4 font-display font-bold text-[22px] text-brand">Документы</h2>
          <DocCards docs={docItems} />
        </section>
      )}

      {groups.map((g) => (
        <GroupBlock key={g.key} g={g} items={cleanItems(normalizeItems(data.groups?.[g.key]), g.fields)} />
      ))}
    </div>
  );
}
