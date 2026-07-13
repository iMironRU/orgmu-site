# orgmu-site

Новый сайт ОрГМУ на [Next.js](https://nextjs.org) (App Router, TypeScript, Tailwind CSS).
Собирается в статику и деплоится на GitHub Pages через GitHub Actions.

## Локальная разработка

```bash
npm install
npm run dev
```

Открыть http://localhost:3000.

## Сборка статики

```bash
npm run build   # результат в out/
```

Локально сайт собирается без `basePath` (работает по корню). В CI переменная
`NEXT_PUBLIC_BASE_PATH` выставляется автоматически (`actions/configure-pages`),
чтобы ссылки и ассеты работали по пути `/orgmu-site/`.

## Деплой

Пуш в ветку `main` запускает workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):
сборка статики → публикация на GitHub Pages.

Тестовый сайт: `https://imironru.github.io/orgmu-site/` (появится после первого деплоя
и включения Pages: Settings → Pages → Source → **GitHub Actions**).

## Стек

- Next.js 16 (App Router, `output: "export"`)
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint
