jQuery(() => {
    // 1. Встраиваем кнопки погоды и холсты в интерфейс SillyTavern
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

        <canvas id="fireflies-effect" class="st-weather-layer"></canvas>
        <div id="snow-container" class="st-weather-layer"></div>
        <div id="rain-container" class="st-weather-layer"></div>
        <div id="petals-container" class="st-weather-layer"></div>
        <div id="leaves-container" class="st-weather-layer"></div>
        <canvas id="fog-canvas" class="st-weather-layer"></canvas>
        <canvas id="rays-canvas" class="st-weather-layer"></canvas>
    `;

    $('body').append(weatherHTML);

    // 2. Встраиваем меню настроек во вкладку Extensions (Расширения)
    const settingsHTML = `
        <div class="weather-extension-settings">
            <div class="inline-drawer">
                <div class="inline-drawer-toggle inline-drawer-header">
                    <b>🌤️ Weather Effects (Погодные эффекты)</b>
                    <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                </div>
                <div class="inline-drawer-content">
                    <label class="checkbox_label" for="st-weather-enabled-checkbox" style="margin-top: 8px;">
                        <input id="st-weather-enabled-checkbox" type="checkbox" />
                        <span>Показывать кнопку погоды в интерфейсе</span>
                    </label>
                    <label class="checkbox_label" for="st-weather-overchat-checkbox" style="margin-top: 6px; margin-bottom: 6px;">
                        <input id="st-weather-overchat-checkbox" type="checkbox" />
                        <span>Накладывать эффекты поверх чата (🔀)</span>
                    </label>
                </div>
            </div>
        </div>
    `;

    $('#extensions_settings').append(settingsHTML);

    const snowStyleSheet = document.createElement('style');
    snowStyleSheet.id = 'st-snow-styles';
    document.head.appendChild(snowStyleSheet);

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
        $('#st-weather-overchat-checkbox').prop('checked', overChatMode);
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

    $('#st-weather-overchat-checkbox').on('change', function() {
        overChatMode = $(this).is(':checked');
        localStorage.setItem('st_weather_over_chat', overChatMode);
        updateLayerMode();
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

    // ================= ДЫМНЫЙ ТУМАН БЕЗ ШВОВ (ОПТИМИЗИРОВАННЫЙ) =================
    const fogCanvas = document.getElementById('fog-canvas');
    const fogCtx = fogCanvas.getContext('2d');
    let fogAnimationId = null;
    let smokeSprites = null; // Создаём лениво только когда реально включили туман!
    let smokeClouds = [];

    function createSmokeSprite(size, seed) {
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
        return off;
    }

    function ensureSmokeReady() {
        if (!smokeSprites) {
            // Размер 128x128 считается в 4 раза быстрее, а для мягкого дыма выглядит идентично!
            smokeSprites = [
                createSmokeSprite(128, 12.3),
                createSmokeSprite(128, 45.8),
                createSmokeSprite(128, 78.1),
                createSmokeSprite(128, 109.4)
            ];
        }
        if (smokeClouds.length === 0) {
            initSmokeClouds();
        }
    }

    class SmokeCloud {
        constructor() {
            this.sprite = smokeSprites[Math.floor(Math.random() * smokeSprites.length)];
            this.w = window.innerWidth * (0.45 + Math.random() * 0.45);
            this.h = window.innerHeight * (0.35 + Math.random() * 0.40);
            this.x = Math.random() * (window.innerWidth + this.w) - this.w * 0.5;
            this.y = window.innerHeight * (0.25 + Math.random() * 0.65) - this.h * 0.5;
            this.vx = -(0.12 + Math.random() * 0.22);
            this.opacity = 0.22 + Math.random() * 0.22;
        }
        update() {
            this.x += this.vx;
            if (this.x + this.w < -50) {
                this.x = fogCanvas.width + 50;
                this.y = fogCanvas.height * (0.25 + Math.random() * 0.65) - this.h * 0.5;
            }
        }
        draw() {
            fogCtx.save();
            fogCtx.globalAlpha = this.opacity;
            fogCtx.drawImage(this.sprite, this.x, this.y, this.w, this.h);
            fogCtx.restore();
        }
    }

    function initSmokeClouds() {
        if (!smokeSprites) return;
        smokeClouds = [];
        for (let i = 0; i < 15; i++) {
            smokeClouds.push(new SmokeCloud());
        }
    }

    function loopFog() {
        fogCtx.clearRect(0, 0, fogCanvas.width, fogCanvas.height);
        for (let i = 0; i < smokeClouds.length; i++) {
            smokeClouds[i].update();
            smokeClouds[i].draw();
        }
        fogAnimationId = requestAnimationFrame(loopFog);
    }

    $('#btn-fog').on('click', function() {
        fogActive = !fogActive;
        $(this).toggleClass('active-weather', fogActive);
        if (fogActive) {
            fogCanvas.style.visibility = 'visible';
            requestAnimationFrame(() => {
                ensureSmokeReady();
                if (!fogAnimationId) loopFog();
            });
        } else {
            cancelAnimationFrame(fogAnimationId);
            fogAnimationId = null;
            fogCanvas.style.visibility = 'hidden';
        }
    });

    // ================= СВЕТЛЯЧКИ =================
    const firefliesCanvas = document.getElementById('fireflies-effect');
    const fCtx = firefliesCanvas.getContext('2d');
    const fireflies = [];
    let firefliesAnimationId = null;

    class Firefly {
        constructor() {
            this.x = Math.random() * firefliesCanvas.width;
            this.y = Math.random() * firefliesCanvas.height;
            this.s = 1.2 + Math.random() * 1.6;
            this.ang = Math.random() * 2 * Math.PI;
            this.v = 0.08 + Math.random() * 0.2;
            this.age = 0;
            this.maxLife = 400 + Math.random() * 600;
        }
        move() {
            this.x += this.v * Math.cos(this.ang);
            this.y += this.v * Math.sin(this.ang);
            this.ang += (Math.random() * 6 - 3) * Math.PI / 180;
            this.age++;
        }
        show() {
            let alpha = 0.85;
            if (this.age < 80) {
                alpha = (this.age / 80) * 0.85;
            } else if (this.age > this.maxLife - 80) {
                alpha = ((this.maxLife - this.age) / 80) * 0.85;
            }

            fCtx.save();
            fCtx.beginPath();
            fCtx.arc(this.x, this.y, this.s, 0, 2 * Math.PI);
            fCtx.fillStyle = `rgba(253, 219, 163, ${Math.max(0, alpha)})`;
            fCtx.shadowBlur = 8;
            fCtx.shadowColor = "#fddba3";
            fCtx.fill();
            fCtx.restore();
        }
    }

    function drawFireflies() {
        if (fireflies.length < 85) fireflies.push(new Firefly());
        fCtx.clearRect(0, 0, firefliesCanvas.width, firefliesCanvas.height);
        for (let i = fireflies.length - 1; i >= 0; i--) {
            const f = fireflies[i];
            f.move();
            f.show();
            if (f.age >= f.maxLife || f.x < -10 || f.x > firefliesCanvas.width + 10 || f.y < -10 || f.y > firefliesCanvas.height + 10) {
                fireflies.splice(i, 1);
            }
        }
    }

    function loopFireflies() {
        drawFireflies();
        firefliesAnimationId = requestAnimationFrame(loopFireflies);
    }

    $('#btn-fireflies').on('click', function() {
