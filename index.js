jQuery(() => {
    // 1. Встраиваем кнопки погоды и контейнеры слоёв в интерфейс SillyTavern
    const weatherHTML = `
        <div id="st-weather-buttons-container" class="st-weather-buttons-container">
            <button id="btn-weather-toggle-menu" class="toggleWeather" title="Свернуть/развернуть меню погоды">🌤️</button>
            <div id="st-weather-menu-items" class="st-weather-menu-items collapsed">
                <div class="st-weather-divider"></div>
                <button id="btn-fireflies" class="toggleWeather" title="Светлячки">🪰</button>
                <button id="btn-snow" class="toggleWeather" title="Снег">❄️</button>
                <button id="btn-rain" class="toggleWeather" title="Дождь">🌧️</button>
                <button id="btn-fog" class="toggleWeather" title="Туман">🌫️</button>
                <button id="btn-petals" class="toggleWeather" title="Сакура">🌸</button>
                <button id="btn-rays" class="toggleWeather" title="Лучи">🌟</button>
                <button id="btn-leaves" class="toggleWeather" title="Листья">🍁</button>
                <div class="st-weather-divider"></div>
                <button id="btn-layer-mode" class="toggleWeather" title="Режим: Только на фоне">🔀</button>
            </div>
        </div>

        <div id="fireflies-container" class="st-weather-layer"></div>
        <div id="snow-container" class="st-weather-layer"></div>
        <div id="rain-container" class="st-weather-layer"></div>
        <div id="petals-container" class="st-weather-layer"></div>
        <div id="leaves-container" class="st-weather-layer"></div>
        <div id="fog-container" class="st-weather-layer"></div>
        <div id="rays-container" class="st-weather-layer"></div>
    `;

    $('body').append(weatherHTML);

    // 2. Встраиваем меню настроек во вкладку Extensions (Расширения)
    const settingsHTML = `
        <div class="weather-extension-settings">
            <div class="inline-drawer">
                <div class="inline-drawer-toggle inline-drawer-header">
                    <b>Weather Effects</b>
                    <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                </div>
                <div class="inline-drawer-content">
                    <label class="checkbox_label" for="st-weather-enabled-checkbox" style="margin-top: 8px; margin-bottom: 6px;">
                        <input id="st-weather-enabled-checkbox" type="checkbox" />
                        <span>Показывать кнопку погоды в интерфейсе</span>
                    </label>
                </div>
            </div>
        </div>
    `;

    $('#extensions_settings').append(settingsHTML);

    // Динамические таблицы стилей для индивидуальных траекторий
    const snowStyleSheet = document.createElement('style');
    snowStyleSheet.id = 'st-snow-styles';
    document.head.appendChild(snowStyleSheet);

    const firefliesStyleSheet = document.createElement('style');
    firefliesStyleSheet.id = 'st-fireflies-styles';
    document.head.appendChild(firefliesStyleSheet);

    // Переменные состояния
    let fogActive = false;
    let firefliesActive = false;
    let snowflakesActive = false;
    let rainActive = false;
    let petalsActive = false;
    let raysActive = false;
    let leavesActive = false;
    
    let extensionEnabled = localStorage.getItem('st_weather_enabled') !== 'false';
    let menuCollapsed = true;
    let overChatMode = localStorage.getItem('st_weather_over_chat') === 'true';

    function stopAllWeatherEffects() {
        if (fogActive) $('#btn-fog').trigger('click');
        if (firefliesActive) $('#btn-fireflies').trigger('click');
        if (snowflakesActive) $('#btn-snow').trigger('click');
        if (rainActive) $('#btn-rain').trigger('click');
        if (petalsActive) $('#btn-petals').trigger('click');
        if (raysActive) $('#btn-rays').trigger('click');
        if (leavesActive) $('#btn-leaves').trigger('click');
    }

    function updateExtensionEnabled() {
        $('#st-weather-enabled-checkbox').prop('checked', extensionEnabled);
        if (extensionEnabled) {
            $('#st-weather-buttons-container').show();
        } else {
            stopAllWeatherEffects();
            $('#st-weather-buttons-container').hide();
        }
    }

    function updateMenuCollapse() {
        $('#st-weather-menu-items').toggleClass('collapsed', menuCollapsed);
        $('#btn-weather-toggle-menu').toggleClass('menu-open', !menuCollapsed);
    }

    function updateLayerMode() {
        $('#btn-layer-mode').toggleClass('active-weather', overChatMode);
        $('.st-weather-layer').toggleClass('weather-over-chat', overChatMode);
        
        const titleText = overChatMode 
            ? "Режим: Поверх чата (Нажми, чтобы убрать на фон)" 
            : "Режим: Только на фоне (Нажми, чтобы включить поверх чата)";
        $('#btn-layer-mode').attr('title', titleText);
    }

    updateMenuCollapse();
    updateLayerMode();
    updateExtensionEnabled();

    $('#st-weather-enabled-checkbox').on('change', function() {
        extensionEnabled = $(this).is(':checked');
        localStorage.setItem('st_weather_enabled', extensionEnabled);
        updateExtensionEnabled();
    });

    $('#btn-weather-toggle-menu').on('click', function() {
        menuCollapsed = !menuCollapsed;
        updateMenuCollapse();
    });

    $('#btn-layer-mode').on('click', function() {
        overChatMode = !overChatMode;
        localStorage.setItem('st_weather_over_chat', overChatMode);
        updateLayerMode();
    });

    // ================= СВЕТЛЯЧКИ НА GPU (ПЛАВНЫЕ, НЕ ЗАМИРАЮТ И НЕ МЕЛЬЧАЮТ!) =================
    $('#btn-fireflies').on('click', function() {
        firefliesActive = !firefliesActive;
        $(this).toggleClass('active-weather', firefliesActive);
        const container = document.getElementById('fireflies-container');
        container.style.visibility = firefliesActive ? 'visible' : 'hidden';

        if (firefliesActive) {
            requestAnimationFrame(() => {
                const fragment = document.createDocumentFragment();
                const isMobile = window.innerWidth <= 768;
                const total = isMobile ? 45 : 75;
                let keyframesCSS = '';

                for (let i = 0; i < total; i++) {
                    const ff = document.createElement('div');
                    ff.className = 'st-firefly';

                    // Размер от 3px до 6px (с учётом мягкого свечения)
                    const size = (2.5 + Math.random() * 3).toFixed(1);
                    const x0 = Math.random() * 100;
                    const y0 = Math.random() * 100;
                    const x1 = x0 + (Math.random() * 30 - 15);
                    const y1 = y0 + (Math.random() * 30 - 15);
                    const x2 = x0 + (Math.random() * 30 - 15);
                    const y2 = y0 + (Math.random() * 30 - 15);
                    const x3 = x0 + (Math.random() * 30 - 15);
                    const y3 = y0 + (Math.random() * 30 - 15);

                    const moveDuration = (28 + Math.random() * 25).toFixed(1) + 's';
                    const moveDelay = -(Math.random() * 40).toFixed(1) + 's';
                    const pulseDuration = (3 + Math.random() * 4).toFixed(1) + 's';

                    ff.style.width = `${size}px`;
                    ff.style.height = `${size}px`;
                    ff.style.animation = `st-ff-move-${i} ${moveDuration} ${moveDelay} ease-in-out infinite alternate, st-ff-pulse ${pulseDuration} ${moveDelay} ease-in-out infinite alternate`;

                    fragment.appendChild(ff);

                    keyframesCSS += `
                        @keyframes st-ff-move-${i} {
                            0%   { transform: translate3d(${x0}vw, ${y0}vh, 0); }
                            33%  { transform: translate3d(${x1}vw, ${y1}vh, 0); }
                            66%  { transform: translate3d(${x2}vw, ${y2}vh, 0); }
                            100% { transform: translate3d(${x3}vw, ${y3}vh, 0); }
                        }
                    `;
                }
                firefliesStyleSheet.innerText = keyframesCSS;
                container.appendChild(fragment);
            });
        } else {
            container.innerHTML = '';
            firefliesStyleSheet.innerText = '';
        }
    });

    // ================= ДЫМНЫЙ ТУМАН НА GPU =================
    const fogContainer = document.getElementById('fog-container');
    let smokeDataUrls = null;

    function createSmokeSpriteDataUrl(size, seed) {
        const off = document.createElement('canvas');
        off.width = size;
        off.height = size;
        const ctx = off.getContext('2d');
        const img = ctx.createImageData(size, size);
        const data = img.data;

        function hash(x, y) {
            const n = Math.sin((x + seed) * 127.1 + (y + seed * 1.7) * 311.7) * 43758.5453;
            return n - Math.floor(n);
        }

        function noise(x, y) {
            const ix = Math.floor(x);
            const iy = Math.floor(y);
            const fx = x - ix;
            const fy = y - iy;
            const ux = fx * fx * (3 - 2 * fx);
            const uy = fy * fy * (3 - 2 * fy);
            const a = hash(ix, iy);
            const b = hash(ix + 1, iy);
            const c = hash(ix, iy + 1);
            const d = hash(ix + 1, iy + 1);
            return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
        }

        function fbm(x, y) {
            let v = 0;
            let amp = 0.5;
            let freq = 1;
            for (let i = 0; i < 4; i++) {
                v += noise(x * freq, y * freq) * amp;
                freq *= 2.05;
                amp *= 0.5;
            }
            return v;
        }

        for (let y = 0; y < size; y++) {
            const ny = (y / size) * 2 - 1;
            for (let x = 0; x < size; x++) {
                const nx = (x / size) * 2 - 1;
                const dist = Math.sqrt(nx * nx + ny * ny);
                if (dist >= 1) continue;

                const radialFalloff = Math.pow(1 - dist, 1.8);
                const qx = fbm(nx * 2.2, ny * 2.2);
                const qy = fbm(nx * 2.2 + 5.2, ny * 2.2 + 1.3);
                const nVal = fbm(nx * 2.5 + qx * 1.8, ny * 2.5 + qy * 1.8);

                let wisp = Math.max(0, (nVal - 0.42) * 2.3);
                wisp = Math.pow(wisp, 1.35);

                const alpha = Math.min(255, Math.floor(wisp * radialFalloff * 255));
                const idx = (y * size + x) * 4;
                data[idx] = 200;
                data[idx + 1] = 208;
                data[idx + 2] = 216;
                data[idx + 3] = alpha;
            }
        }

        ctx.putImageData(img, 0, 0);
        return off.toDataURL('image/png');
    }

    $('#btn-fog').on('click', function() {
        fogActive = !fogActive;
        $(this).toggleClass('active-weather', fogActive);
        fogContainer.style.visibility = fogActive ? 'visible' : 'hidden';

        if (fogActive) {
            requestAnimationFrame(() => {
                if (!smokeDataUrls) {
                    smokeDataUrls = [
                        createSmokeSpriteDataUrl(128, 12.3),
                        createSmokeSpriteDataUrl(128, 45.8),
                        createSmokeSpriteDataUrl(128, 78.1),
                        createSmokeSpriteDataUrl(128, 109.4)
                    ];
                }
                const fragment = document.createDocumentFragment();
                const totalPuffs = 16;
                for (let i = 0; i < totalPuffs; i++) {
                    const puff = document.createElement('div');
                    puff.className = 'st-smoke-puff';
                    const spriteUrl = smokeDataUrls[i % smokeDataUrls.length];

                    const w = 55 + Math.random() * 35;
                    const h = 40 + Math.random() * 40;
                    const y = 10 + Math.random() * 65;
                    const duration = 55 + Math.random() * 45;
                    const delay = -(Math.random() * duration);
                    const opacity = 0.24 + Math.random() * 0.22;

                    puff.style.width = `${w}vw`;
                    puff.style.height = `${h}vh`;
                    puff.style.setProperty('--smoke-y', `${y}vh`);
                    puff.style.backgroundImage = `url("${spriteUrl}")`;
                    puff.style.opacity = opacity;
                    puff.style.animationDuration = `${duration}s`;
                    puff.style.animationDelay = `${delay}s`;

                    fragment.appendChild(puff);
                }
                fogContainer.appendChild(fragment);
            });
        } else {
            fogContainer.innerHTML = '';
        }
    });

    // ================= ДОЖДЬ =================
    $('#btn-rain').on('click', function() {
        rainActive = !rainActive;
        $(this).toggleClass('active-weather', rainActive);
        const rainContainer = document.getElementById('rain-container');
        rainContainer.style.visibility = rainActive ? 'visible' : 'hidden';
        
        if (rainActive) {
            requestAnimationFrame(() => {
                const fragment = document.createDocumentFragment();
                const isMobile = window.innerWidth <= 768;
                const droplets = isMobile ? 120 : 220;
                for (let i = 0; i < droplets; i++) {
                    const rainDrop = document.createElement('div');
                    rainDrop.className = 'rain__drop';
                    rainDrop.style.cssText = `--x:${Math.floor(Math.random() * 100)};--d:${(Math.random() * 2) - 1};--s:${Math.random() + 0.5};--o:${Math.random()};`;
                    fragment.appendChild(rainDrop);
                }
                rainContainer.appendChild(fragment);
            });
        } else {
            rainContainer.innerHTML = '';
        }
    });

    // ================= СНЕГ =================
    $('#btn-snow').on('click', function() {
        snowflakesActive = !snowflakesActive;
        $(this).toggleClass('active-weather', snowflakesActive);
        const snowContainer = document.getElementById('snow-container');
        snowContainer.style.visibility = snowflakesActive ? 'visible' : 'hidden';

        if (snowflakesActive) {
            requestAnimationFrame(() => {
                const fragment = document.createDocumentFragment();
                const isMobile = window.innerWidth <= 768;
                const total = isMobile ? 110 : 200;
                let keyframesCSS = '';
                for (let index = 0; index < total; index++) {
                    const snowflake = document.createElement('div');
                    snowflake.className = 'snowflake';

                    const randomX = Math.random() * 100;
                    const randomOffset = (Math.random() * 200 - 100);
                    const randomXEnd = randomX + randomOffset;
                    const randomScale = Math.random();
                    const fallDuration = (Math.random() * 20 + 10) + 's';
                    const fallDelay = (Math.random() * -30) + 's';

                    snowflake.style.opacity = Math.random();
                    snowflake.style.transform = `translate(${randomX}vw, -10px) scale(${randomScale})`;
                    snowflake.style.animation = `st-snow-fall-${index} ${fallDuration} ${fallDelay} linear infinite`;

                    fragment.appendChild(snowflake);

                    keyframesCSS += `@keyframes st-snow-fall-${index}{to{transform:translate(${randomXEnd}vw,105vh) scale(${randomScale});}}`;
                }
                snowStyleSheet.innerText = keyframesCSS;
                snowContainer.appendChild(fragment);
            });
        } else {
            snowContainer.innerHTML = '';
            snowStyleSheet.innerText = '';
        }
    });

    // ================= САКУРА =================
    $('#btn-petals').on('click', function() {
        petalsActive = !petalsActive;
        $(this).toggleClass('active-weather', petalsActive);
        const petalsContainer = document.getElementById('petals-container');
        petalsContainer.style.visibility = petalsActive ? 'visible' : 'hidden';

        if (petalsActive) {
            requestAnimationFrame(() => {
                const fragment = document.createDocumentFragment();
                const totalPetals = Math.floor(Math.random() * (50 - 20) + 20);
                for (let i = 0; i < totalPetals; i++) {
                    const petal = document.createElement('div');
                    petal.className = 'petal';
                    petal.style.top = '-10rem';
                    petal.style.left = `${Math.random() * window.innerWidth}px`;
                    petal.style.animation = `st-weather-fall ${Math.random() * (30 - 10) + 10}s linear infinite`;
                    petal.style.animationDelay = `${Math.random() * -20}s`;
                    fragment.appendChild(petal);
                }
                petalsContainer.appendChild(fragment);
            });
        } else {
            petalsContainer.innerHTML = '';
        }
    });

    // ================= ОСЕННИЕ ЛИСТЬЯ (МОМИДЗИ) =================
    $('#btn-leaves').on('click', function() {
        leavesActive = !leavesActive;
        $(this).toggleClass('active-weather', leavesActive);
        const leavesContainer = document.getElementById('leaves-container');
        leavesContainer.style.visibility = leavesActive ? 'visible' : 'hidden';

        if (leavesActive) {
            requestAnimationFrame(() => {
                const fragment = document.createDocumentFragment();
                const totalLeaves = 30;
                for (let i = 0; i < totalLeaves; i++) {
                    const leaf = document.createElement('div');
                    leaf.className = 'leaf';
                    leaf.style.top = '-10rem';
                    leaf.style.left = `${Math.random() * window.innerWidth}px`;
                    leaf.style.animation = `st-weather-fall ${Math.random() * (30 - 10) + 10}s linear infinite`;
                    leaf.style.animationDelay = `${Math.random() * -20}s`;
                    fragment.appendChild(leaf);
                }
                leavesContainer.appendChild(fragment);
            });
        } else {
            leavesContainer.innerHTML = '';
        }
    });

    // ================= ЛУЧИ НА GPU (НЕ ЗАМИРАЮТ ПРИ ЛАГАХ ЧАТА!) =================
    $('#btn-rays').on('click', function() {
        raysActive = !raysActive;
        $(this).toggleClass('active-weather', raysActive);
        const raysContainer = document.getElementById('rays-container');
        raysContainer.style.visibility = raysActive ? 'visible' : 'hidden';

        if (raysActive) {
            requestAnimationFrame(() => {
                const fragment = document.createDocumentFragment();
                const numRays = 28;
                for (let i = 0; i < numRays; i++) {
                    const ray = document.createElement('div');
                    ray.className = 'st-sun-ray';

                    const x = Math.random() * 110 - 5; // -5vw .. 105vw
                    const len = 55 + Math.random() * 45; // 55vh .. 100vh
                    const width = 2 + Math.random() * 6; // 2px .. 8px
                    const hue = Math.round(45 + Math.random() * 15);
                    const sat = Math.round(25 + Math.random() * 40);
                    const duration = (6 + Math.random() * 8).toFixed(1) + 's';
                    const delay = -(Math.random() * 12).toFixed(1) + 's';
                    const drift = (Math.random() * 8 - 4).toFixed(1) + 'vw';

                    ray.style.left = `${x}vw`;
                    ray.style.height = `${len}vh`;
                    ray.style.width = `${width}px`;
                    ray.style.setProperty('--ray-color', `hsla(${hue}, ${sat}%, 65%, 0.32)`);
                    ray.style.setProperty('--ray-drift', drift);
                    ray.style.animationDuration = `${duration}`;
                    ray.style.animationDelay = `${delay}`;

                    fragment.appendChild(ray);
                }
                raysContainer.appendChild(fragment);
            });
        } else {
            raysContainer.innerHTML = '';
        }
    });
});
