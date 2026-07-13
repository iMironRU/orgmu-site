import type { SectionDef, FieldDef, GroupDef } from "@/lib/sveden/vocab";
import { sectionFields, sectionGroups } from "@/lib/sveden/vocab";
import {
  sectionData,
  renderText,
  hrefOf,
  isMissing,
  type FieldValue,
} from "@/lib/sveden/data";
import { fieldLabel, groupLabel } from "@/lib/sveden/labels";

// Атрибут микроразметки строчными в исходном HTML (чекер Рособрнадзора ищет
// itemprop без учёта регистра, но пишем как на эталонных sveden-страницах).
const ip = (value: string) => ({ itemprop: value }) as Record<string, string>;

// Значение поля с микроразметкой. itemprop оборачивает ТОЛЬКО значение —
// подпись снаружи, иначе она попадёт в микроразметку при чтении чекером.
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

// Строка «подпись + значение» для одиночных полей и карточек групп.
function Row({ f, value }: { f: FieldDef; value: FieldValue }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[minmax(220px,300px)_1fr] gap-1 sm:gap-4 py-3 border-b border-line last:border-0">
      <span className="text-[14px] text-ink-2 font-ui">{fieldLabel(f.key)}</span>
      <div className="text-[16px] font-ui">
        <Value itemprop={f.itemprop} value={value} />
      </div>
    </div>
  );
}

function GroupBlock({ g, items }: { g: GroupDef; items: Record<string, FieldValue>[] }) {
  const asTable = items.length > 8;

  return (
    <section className="mt-8">
      <h2 className="m-0 mb-4 font-display font-bold text-[22px] text-brand">
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
            <div key={i} {...ip(g.itemprop)} className="bg-white border border-line rounded-xl px-5 py-2">
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

export function SvedenSection({ sectionKey, section }: { sectionKey: string; section: SectionDef }) {
  const fields: FieldDef[] = sectionFields(section);
  const groups: GroupDef[] = sectionGroups(section);
  const data = sectionData(sectionKey);

  return (
    <div>
      {fields.length > 0 && (
        <section className="bg-white border border-line rounded-xl px-5 py-2">
          {fields.map((f) => (
            <Row key={f.key} f={f} value={data.fields?.[f.key]} />
          ))}
        </section>
      )}

      {groups.map((g) => (
        <GroupBlock key={g.key} g={g} items={normalizeItems(data.groups?.[g.key])} />
      ))}
    </div>
  );
}
