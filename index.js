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
                    <b>Weather Effects</b>
                    <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                </div>
                <div class="inline-drawer-content">
                    <label class="checkbox_label" for="st-weather-enabled-checkbox" style="margin-top: 8px;">
                        <input id="st-weather-enabled-checkbox" type="checkbox" />
                        <span>Показывать кнопку погоды в интерфейсе</span>
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
        firefliesActive = !firefliesActive;
        $(this).toggleClass('active-weather', firefliesActive);
        if (firefliesActive) {
            firefliesCanvas.style.visibility = 'visible';
            if (!firefliesAnimationId) loopFireflies();
        } else {
            cancelAnimationFrame(firefliesAnimationId);
            firefliesAnimationId = null;
            firefliesCanvas.style.visibility = 'hidden';
        }
    });

    // ================= ДОЖДЬ (ЧЕРЕЗ DOCUMENT FRAGMENT БЕЗ ФРИЗОВ) =================
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

    // ================= СНЕГ (ЧЕРЕЗ DOCUMENT FRAGMENT БЕЗ ФРИЗОВ) =================
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

    // ================= ЛУЧИ =================
    const rCanvas = document.getElementById('rays-canvas');
    const rCtx = rCanvas.getContext('2d');
    const osCanvas = document.createElement('canvas');
    const osCtx = osCanvas.getContext('2d');
    let raysObjects = [];
    const numRays = 30;
    let raysAnimationId = null;

    function wave(t, a) {
        return Math.abs((t + a / 2) % a - a / 2);
    }

    class Ray {
        constructor() {
            this.ctx = osCtx;
            this.angle = 85 * Math.PI / 180;
            this.init();
        }
        init() {
            this.velocity = 0.25 - Math.random() * 0.5;
            this.len = rCanvas.height / 2 + Math.random() * (rCanvas.height / 2);
            this.start = { x: Math.random() * (rCanvas.width + 100) - 50, y: 0 };
            this.end = {
                x: this.start.x + this.len * Math.cos(this.angle),
                y: this.start.y + this.len * Math.sin(this.angle)
            };
            this.ttl = 100 + Math.random() * 200;
            this.life = 0;
            this.width = 0.5 + Math.random() * 4;
            this.hue = Math.round(45 + Math.random() * 15).toString();
            this.saturation = Math.round(20 + Math.random() * 40).toString();
        }
        color() {
            const alpha = wave(this.life, this.ttl) * 0.005;
            const color1 = `hsla(${this.hue},${this.saturation}%,60%,${alpha})`;
            const color2 = 'hsla(50,20%,20%,0)';
            const gradient = rCtx.createLinearGradient(this.start.x, this.start.y, this.end.x, this.end.y);
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
            return gradient;
        }
        draw() {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.color();
            this.ctx.lineWidth = this.width;
            this.ctx.moveTo(this.start.x, this.start.y);
            this.ctx.lineTo(this.end.x, this.end.y);
            this.ctx.stroke();
            this.ctx.closePath();
        }
        update() {
            if (this.life > this.ttl) this.init();
            this.life++;
            this.start.x += this.velocity;
            this.end.x += this.velocity;
        }
    }

    function createRays() {
        raysObjects = [];
        for (let i = 0; i < numRays; i++) {
            raysObjects.push(new Ray());
        }
    }

    function renderRays() {
        osCtx.clearRect(0, 0, rCanvas.width, rCanvas.height);
        osCtx.shadowBlur = 30;
        osCtx.shadowColor = "white";
        osCtx.globalCompositeOperation = "lighter";
        for (let i = 0; i < raysObjects.length; i++) {
            raysObjects[i].update();
            raysObjects[i].draw();
        }
        rCtx.clearRect(0, 0, rCanvas.width, rCanvas.height);
        rCtx.drawImage(osCanvas, 0, 0);
    }

    function loopRays() {
        renderRays();
        raysAnimationId = requestAnimationFrame(loopRays);
    }

    $('#btn-rays').on('click', function() {
        raysActive = !raysActive;
        $(this).toggleClass('active-weather', raysActive);
        if (raysActive) {
            rCanvas.style.visibility = 'visible';
            if (!raysAnimationId) loopRays();
        } else {
            cancelAnimationFrame(raysAnimationId);
            raysAnimationId = null;
            rCanvas.style.visibility = 'hidden';
        }
    });

    // ================= ЗАЩИЩЕННЫЙ РЕСАЙЗ ОКНА (БЕЗ СПАМА НА МОБИЛКАХ) =================
    let lastWidth = 0;
    let resizeTimeout = null;

    function updateCanvasSizes() {
        lastWidth = window.innerWidth;
        firefliesCanvas.width = window.innerWidth;
        firefliesCanvas.height = window.innerHeight;
        fogCanvas.width = window.innerWidth;
        fogCanvas.height = window.innerHeight;
        rCanvas.width = window.innerWidth;
        rCanvas.height = window.innerHeight;
        osCanvas.width = window.innerWidth;
        osCanvas.height = window.innerHeight;
        if (fogActive) initSmokeClouds();
    }

    window.addEventListener('resize', () => {
        // Игнорируем мелкие срабатывания мобильной адресной строки/клавиатуры, если ширина не менялась
        if (Math.abs(window.innerWidth - lastWidth) < 20) return;
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateCanvasSizes, 250);
    });

    updateCanvasSizes();
    createRays();
});
