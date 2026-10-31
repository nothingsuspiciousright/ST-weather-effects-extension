# ST-weather-effects-extension
Silly Tavern Weather Effects Extension


# 🌤️ ST Weather & Atmosphere Effects (for SillyTavern)

A lightweight, 100% self-contained visual extension for **SillyTavern** that brings your roleplay scenes to life with dynamic weather, particles, and cinematic overlays — featuring an optional **🤖 Smart Auto-Weather** mode that automatically reacts to the events in your chat!

---

## ✨ Core Features (Manual Mode)

A compact, collapsible **🌤️** button in the top-left corner opens a sleek toolbar with **9 atmospheric effects** that can be toggled individually or combined together:

* 🪰 **Fireflies** — Softly glowing, pulsing forest lights lazily drifting through the air.
* ❄️ **Snow** — A chaotic winter flurry with snowflakes of varying sizes, speeds, and depths.
* 🌧️ **Rain** — Atmospheric rainfall for moody, melancholic, or cozy scenes.
* 🌫️ **Smoke & Fog** — Procedurally generated, seamless clouds of thick mist and drifting cigarette smoke.
* 🌸 **Sakura Petals** — Delicate pink cherry blossom petals swirling in the breeze.
* 🌟 **Sunbeams** — Warm, slowly shimmering shafts of golden sunlight.
* 🍁 **Momiji Leaves** — Vibrant crimson Japanese maple leaves for autumn scenes.
* 🔥 **Embers & Ash** — Glowing orange cinders, floating gray ash, and a subtle warm hearth glow at the bottom of the screen (perfect for campfires, battles, ruins, and dark fantasy settings).
* 📼 **Retro Film & VHS** — A subtle cinematic vignette, warm bloom, delicate animated film grain, CRT scanlines, and soft VHS tracking glints.

### 🎛️ Controls & Optimization:
* 🔀 **Layer Mode Toggle (Background / Over Chat):** Switch with a single click between rendering effects strictly behind the chat window (background only) or over the entire UI for maximum immersion.
* 📱 **Mobile-Friendly Design:** Features a compact two-column dropdown grid on smartphones, zero tap delay, no sticky hover states, and mobile-optimized frame rates.
* 🔒 **100% Self-Contained (No External Images):** All textures (smoke wisps, sakura petals, momiji leaves, film grain) are procedurally generated or embedded as inline SVG/Canvas — the extension never relies on external image hosts and works completely offline.

---

## 🤖 Smart Auto-Weather (Context-Aware Mode)

In the SillyTavern **Extensions -> Weather Effects** panel, you can enable **🤖 Smart Auto-Weather**.

### How It Works:
1. **Bilingual Context Scanning (EN / RU):** The extension automatically reads the latest messages in your chat in both **English and Russian** (while smartly ignoring technical API/Proxy error messages).
2. **Dynamic Roleplay Reactions:**
   * Mentioning *rain, pouring, drizzle, or thunderstorm* automatically starts the **Rain** 🌧️.
   * When a character *lights a cigarette, exhales smoke, or walks into fog/mist*, **Smoke & Fog** gently fills the screen 🚬🌫️.
   * Describing *a campfire, flames, sparks, embers, or ash* triggers rising **Embers & Ash** 🔥.
   * Also automatically detects *snow/blizzards ❄️, cherry blossoms/sakura 🌸, falling autumn/maple leaves 🍁, sunbeams/sunlight 🌟, and fireflies 🪰*.
3. **Smart Scene Fade-Out:**
   * Auto-triggered effects stay active for the duration of the current micro-scene (the last 2–3 messages). Once the conversation moves on, the character finishes smoking, or the scene changes (or if stop-phrases like *"rain stopped"*, *"puts out the cigarette"*, *"went inside"* appear), the auto-effect **automatically turns itself off**!
   * Effects that you turned on **manually** via the toolbar will never be turned off by Auto-Weather.
   * Unchecking **Smart Auto-Weather** in the settings immediately clears any effects it had automatically triggered.

---

## 📥 Installation

1. Open **SillyTavern** -> go to the **Extensions** tab (the cubes icon at the top) -> click **Install extension**.
2. Paste the repository URL:
   ```text
   https://github.com/nothingsuspiciousright/ST-weather-effects-extension



# 🌤️ ST Weather & Atmosphere Effects (Погодные и атмосферные эффекты для SillyTavern)

Лёгкое, полностью автономное расширение для **SillyTavern**, которое добавляет живые погодные явления, частицы и кинематографичные спецэффекты прямо в ваш чат — с поддержкой умного режима **🤖 Smart Auto-Weather**, автоматически реагирующего на события в вашей ролевой игре!

---

## ✨ Основные возможности (Базовый режим)

В левом верхнем углу экрана располагается компактная сворачиваемая кнопка **🌤️**, открывающая панель из **9 атмосферных эффектов**, которые можно включать по отдельности или комбинировать друг с другом:

* 🪰 **Светлячки (Fireflies)** — мягко мерцающие лесные огоньки, плавно парящие в воздухе.
* ❄️ **Снег (Snow)** — хаотичная зимняя вьюга со снежинками разного размера и глубины.
* 🌧️ **Дождь (Rain)** — атмосферный ливень для мрачных, меланхоличных или уютных сцен.
* 🌫️ **Дымный туман (Smoke & Fog)** — процедурно генерируемые бесшовные клубы густого тумана и сигаретного дыма.
* 🌸 **Лепестки сакуры (Sakura Petals)** — нежные розовые лепестки, кружащиеся на ветру.
* 🌟 **Солнечные лучи (Sunbeams)** — тёплые, медленно переливающиеся лучи света.
* 🍁 **Кленовые листья Момидзи (Momiji Leaves)** — резные алые листья японского клёна для осенних сцен.
* 🔥 **Искры и пепел (Embers & Ash)** — тлеющие угольки, серый пепел и мягкое зарево у низа экрана (идеально для сцен у костра, битв, пожаров и тёмного фэнтези).
* 📼 **Старая плёнка / VHS (Retro Film & VHS)** — кинематографическая виньетка, тёплое ретро-свечение, деликатное плёночное зерно, сканлайны и редкие блики кассетного трекинга.

### 🎛️ Удобное управление и оптимизация:
* 🔀 **Переключатель слоёв (Фон / Поверх чата):** выбирайте одним кликом, где должна идти погода — только на заднем фоне за окном чата или поверх всего интерфейса для максимального погружения.
* 📱 **Полная адаптация под мобильные устройства:** компактная двухколоночная панель на смартфонах, мгновенный отклик кнопок без залипания и высокая частота кадров.
* 🔒 **100% автономность:** все текстуры (дым, лепестки, листья момидзи, плёночное зерно) генерируются математически или встроены в код (SVG/Canvas) — расширение не зависит от сторонних хостингов картинок и никогда не сломается.

---

## 🤖 Умная авто-погода (Smart Auto-Weather)

В настройках расширения (**Extensions -> Weather Effects**) можно включить режим **🤖 Smart Auto-Weather (Авто-погода по тексту чата)**.

### Как это работает:
1. **Чтение контекста (RU / EN):** Расширение автоматически анализирует последние сообщения в чате на **русском и английском языках** (автоматически игнорируя технические ошибки прокси/API).
2. **Живая реакция на сюжет:**
   * Если в тексте упоминается *дождь, ливень, гроза (rain, pouring, storm)* — на фоне сам начнёт идти дождь 🌧️.
   * Если персонаж *закуривает сигарету, выпускает дым или заходит в туман (cigarette, smoke, inhaling, fog, mist)* — экран мягко затянет дымкой 🚬🌫️.
   * Если вокруг *разгорается костёр, летят искры или пепел (campfire, embers, ash, flames)* — снизу вверх начнут подниматься тлеющие угольки 🔥.
   * Аналогично распознаются *снег/метель ❄️, сакура 🌸, осенний листопад 🍁, солнечные лучи 🌟 и светлячки 🪰*.
3. **Умное затухание при смене сцены:**
   * Автоматический эффект держится на протяжении текущей микро-сцены (2–3 сообщения). Если тема разговора сменилась, персонаж докурил или ушёл в другое место (либо в тексте прямо сказано *«дождь стих» / «потушил сигарету» / «puts out the cigarette»*), авто-эффект **сам плавно выключается**!
   * Эффекты, которые вы включили **вручную** на панели кнопок, авто-погода не отключает.
   * При отключении галочки **Smart Auto-Weather** в настройках все вызванные ею эффекты мгновенно очищаются.

---

## 📥 Установка (Installation)

1. Откройте **SillyTavern** -> вкладку **Extensions** (иконка кубиков) -> **Install extension**.
2. Вставьте ссылку на репозиторий:
   ```text
   https://github.com/nothingsuspiciousright/ST-weather-effects-extension

https://github.com/user-attachments/assets/d2431b79-4721-464a-aaaf-740206bee7b2



