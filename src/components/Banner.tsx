import { asset } from "@/lib/asset";

export type BannerData = {
  kicker?: string;
  title: string;
  image?: string; // URL или локальный путь (public)
  tone?: string; // цвет-подложка
  href?: string;
};

// Баннер-карточка по макету Banner.dc.html: фон (картинка или цвет) + градиент,
// кикер и заголовок, вся карточка — ссылка.
export function Banner({ b }: { b: BannerData }) {
  const tone = b.tone || "rgb(0,101,155)";
  const bg = b.image
    ? b.image.startsWith("http")
      ? b.image
      : asset(b.image)
    : null;

  return (
    <a
      href={b.href || "#"}
      className="relative flex flex-col justify-end min-h-[192px] p-6 no-underline rounded-lg overflow-hidden bg-cover bg-center"
      style={{ backgroundColor: tone, backgroundImage: bg ? `url('${bg}')` : undefined }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.15)_60%,rgba(0,0,0,0)_100%)]" />
      <div className="relative flex flex-col gap-[6px] max-w-[70%] max-[640px]:max-w-full">
        {b.kicker && (
          <span className="font-ui font-bold text-[14px] tracking-[0.06em] uppercase text-white/85">
            {b.kicker}
          </span>
        )}
        <span className="font-ui font-bold text-[26px] leading-[1.1] text-white text-pretty">
          {b.title}
        </span>
      </div>
    </a>
  );
}
