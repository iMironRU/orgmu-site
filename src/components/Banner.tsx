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
  // Это обычный <a> — basePath к внутренним ссылкам добавляем сами.
  const href = b.href?.startsWith("/") ? asset(b.href) : b.href || "#";

  return (
    <a
      href={href}
      className="relative flex flex-col justify-end min-h-[192px] p-6 no-underline rounded-lg overflow-hidden bg-cover bg-center"
      style={{ backgroundColor: tone, backgroundImage: bg ? `url('${bg}')` : undefined }}
    >
      {/* Подложка под текстом. Картинка-карточка бывает почти белой инфографикой
          со своим заголовком, и белый текст баннера на ней сливался. Заголовок
          баннера занимает нижние ~70% высоты, поэтому затемняем всю эту зону
          плотно (0.6+), фейдим только верх — там просвечивает верх карточки.
          Второй слой слева — для читаемости кикера. */}
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.86)_0%,rgba(0,0,0,0.78)_52%,rgba(0,0,0,0.62)_74%,rgba(0,0,0,0.28)_90%,rgba(0,0,0,0)_100%),linear-gradient(90deg,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.1)_60%,rgba(0,0,0,0)_100%)]" />
      {/* Тень у текста — вместе со scrim добавляет читаемости на пёстром фоне
          (карточка-инфографика), не затемняя картинку ещё сильнее. */}
      <div className="relative flex flex-col gap-[6px] max-w-[70%] max-[640px]:max-w-full [text-shadow:0_1px_4px_rgba(0,0,0,0.55)]">
        {b.kicker && (
          <span className="font-ui font-bold text-[14px] tracking-[0.06em] uppercase text-white/90">
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
