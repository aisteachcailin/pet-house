# ПЭТ-Хаус НН - Проект сайта

## Структура проекта

```
pet-house-project/
├── dist/              # Собранные файлы для продакшена
├── public/           # Статические файлы (изображения)
├── scripts/          # Скрипты сборки
├── src/              # Исходные файлы
│   ├── components/   # HTML компоненты
│   ├── js/           # JavaScript файлы
│   ├── pages/         # Страницы сайта
│   └── styles/        # SCSS стили
└── package.json
```

## Команды

### Разработка
```bash
npm run dev
```
Запускает live-server из папки `src` с автоматической компиляцией SCSS.

### Сборка
```bash
npm run build
```
Компилирует SCSS и копирует все необходимые файлы в папку `dist`.

### Просмотр собранной версии
```bash
npm run preview
```
Запускает live-server из папки `dist` для проверки собранной версии.

## Пути к файлам

### В режиме разработки (src/)
- CSS: `./styles/css/main.css`
- JS: `./js/main.js`
- Компоненты: `./components/header.html`
- Изображения: `../public/images/hero-bg.jpg`

### В собранной версии (dist/)
- CSS: `./src/styles/css/main.css`
- JS: `./src/js/main.js`
- Компоненты: `./src/components/header.html`
- Изображения: `/public/images/hero-bg.jpg`

## Важно

После изменений в исходных файлах необходимо запустить `npm run build` для обновления папки `dist`.

