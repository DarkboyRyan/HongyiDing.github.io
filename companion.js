(() => {
  "use strict";
  const config = window.PORTFOLIO_COMPANION;
  if (!config || document.getElementById("companion")) return;
  const isPortrait = config.mode === "portrait";

  const copy = {
    en: {
      label: "Website companion", open: "Meet {name}", close: "Minimize companion",
      pause: "Pause animation", resume: "Resume animation", greet: "Say hello to {name}",
      welcome: "Hi! Welcome to Hongyi’s corner. Shall we explore his projects?",
      loading: "Just a moment, I’m getting ready…",
      error: "I couldn’t load right now. You can retry or keep exploring the website.",
      retry: "Try again", projects: "Explore projects", about: "About Hongyi",
      resting: "Resting for a moment… zzz",
    },
    zh: {
      label: "网页小伙伴", open: "和{name}打招呼", close: "收起小伙伴",
      pause: "暂停动画", resume: "继续动画", greet: "和{name}打招呼",
      welcome: "你好呀！欢迎来到泓邑的小天地。一起看看他的项目吧？",
      loading: "稍等一下，我正在准备出场……",
      error: "暂时没能加载出来，你可以重试，也可以继续浏览网页。",
      retry: "重新加载", projects: "看看项目", about: "认识泓邑",
      resting: "稍微休息一下……zzz",
    },
  };
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  // Always welcome visitors on a new page load; only the minus button minimizes.
  let collapsed = false;
  let paused = reducedMotion.matches;
  let status = "loading";
  let greeted = false;
  let sleeping = false;
  let sleepReady = false;
  let idleTimer;
  const idleAfterMs = Math.max(1000, Number(config.idleAfterMs) || 30000);
  let app, model, pending;
  let reactionTimer;
  let lastTap = 0;
  let expressionIndex = 0;
  const scripts = new Map();
  const host = document.createElement("aside");
  host.id = "companion";
  host.className = "companion";
  host.innerHTML = `
    <button class="companion-launcher" type="button" aria-controls="companion-panel"></button>
    <div class="companion-panel" id="companion-panel">
      <div class="companion-toolbar">
        <button type="button" data-action="pause" aria-pressed="false">Ⅱ</button>
        <button type="button" data-action="close">−</button>
      </div>
      <div class="companion-bubble">
        <span class="companion-name"></span>
        <p class="companion-message" role="status" aria-live="polite" aria-atomic="true"></p>
        <div class="companion-actions">
          <a href="#projects" data-link="projects"></a>
          <a href="#about" data-link="about"></a>
          <button type="button" data-action="retry" hidden></button>
        </div>
      </div>
      <button class="companion-stage" type="button" disabled>
        <canvas aria-hidden="true"></canvas>
        <span class="companion-sprite" hidden><span class="companion-figure">
          <img class="companion-portrait" alt="" decoding="async" draggable="false">
          <img class="companion-sleep-eyes" alt="" decoding="async" draggable="false" hidden>
        </span></span>
      </button>
      <div class="companion-credit"><a></a></div>
    </div>`;
  document.body.append(host);
  const find = (selector) => host.querySelector(selector);
  const launcher = find(".companion-launcher");
  const panel = find(".companion-panel");
  const stage = find(".companion-stage");
  const canvas = find("canvas");
  const sprite = find(".companion-sprite");
  const portrait = find(".companion-portrait");
  const sleepPortrait = find(".companion-sleep-eyes");
  canvas.hidden = isPortrait;
  sprite.hidden = !isPortrait;
  const pauseButton = find('[data-action="pause"]');
  const closeButton = find('[data-action="close"]');
  const retryButton = find('[data-action="retry"]');
  const credit = find(".companion-credit a");
  credit.textContent = config.credit;
  credit.href = config.creditUrl;

  function translate() {
    const chinese = document.documentElement.lang.startsWith("zh");
    const text = copy[chinese ? "zh" : "en"];
    const name = chinese ? (config.nameZh || config.name) : config.name;
    find(".companion-name").textContent = name;
    host.setAttribute("aria-label", text.label);
    launcher.textContent = text.open.replace("{name}", name);
    closeButton.setAttribute("aria-label", text.close);
    closeButton.title = text.close;
    pauseButton.setAttribute("aria-label", paused ? text.resume : text.pause);
    pauseButton.title = paused ? text.resume : text.pause;
    pauseButton.setAttribute("aria-pressed", String(paused));
    pauseButton.textContent = paused ? "▷" : "Ⅱ";
    stage.setAttribute("aria-label", text.greet.replace("{name}", name));
    find(".companion-message").textContent = status === "ready"
      ? (sleeping ? text.resting : greeted ? config.greeting : text.welcome) : text[status];
    find('[data-link="projects"]').textContent = text.projects;
    find('[data-link="about"]').textContent = text.about;
    retryButton.textContent = text.retry;
    retryButton.hidden = status !== "error";
    pauseButton.disabled = status !== "ready";
    stage.disabled = status !== "ready";
    stage.hidden = status !== "ready";
  }

  function syncAnimation() {
    const running = status === "ready" && !collapsed && !paused && !document.hidden;
    host.setAttribute("data-animated", String(running));
    if (!running) {
      clearTimeout(reactionTimer);
      sprite.removeAttribute("data-greeting");
    }
    if (!app || !model) return;
    // Use only the application's ticker so hiding/pausing also stops model updates.
    if (collapsed || paused || document.hidden) app.stop();
    else app.start();
  }

  function setSleeping(value) {
    sleeping = value;
    sleepPortrait.hidden = !value;
    host.setAttribute("data-resting", String(value));
    translate();
  }

  function armIdle() {
    clearTimeout(idleTimer);
    if (!isPortrait || !sleepReady || status !== "ready" || collapsed || document.hidden) return;
    idleTimer = setTimeout(() => {
      if (!collapsed && !document.hidden) setSleeping(true);
    }, idleAfterMs);
  }

  function noteActivity() {
    if (sleeping) setSleeping(false);
    armIdle();
  }

  function loadImage(element, url) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => finish(new Error("Portrait load timed out")), 20000);
      function finish(error) {
        clearTimeout(timer);
        element.onload = element.onerror = null;
        if (error) reject(error);
        else resolve();
      }
      element.onload = () => finish();
      element.onerror = () => finish(new Error("Could not load character portrait"));
      element.src = url;
    });
  }

  function fit() {
    if (!app || !model || collapsed) return;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    app.renderer.resize(width, height);
    const bounds = model.internalModel;
    model.scale.set(Math.min(width / bounds.width, height / bounds.height) * 0.96);
    model.anchor.set(0.5, 1);
    model.position.set(width / 2, height - 2);
    app.render();
  }

  function setCollapsed(value) {
    collapsed = value;
    panel.hidden = value;
    launcher.hidden = !value;
    launcher.setAttribute("aria-expanded", String(!value));
    if (!value) { fit(); void load(); }
    noteActivity();
    syncAnimation();
  }

  function loadScript(src) {
    if (!scripts.has(src)) {
      scripts.set(src, new Promise((resolve, reject) => {
        const element = document.createElement("script");
        const timer = setTimeout(() => fail(), 20000);
        function fail() {
          clearTimeout(timer);
          element.remove();
          scripts.delete(src);
          reject(new Error(`Could not load ${src}`));
        }
        element.src = src;
        element.onload = () => { clearTimeout(timer); resolve(); };
        element.onerror = fail;
        document.head.append(element);
      }));
    }
    return scripts.get(src);
  }

  async function load() {
    if (status === "ready") return;
    if (pending) return pending;
    status = "loading";
    translate();
    pending = (async () => {
      try {
        if (isPortrait) {
          await loadImage(portrait, config.portraitUrl);
          status = "ready";
          translate();
          syncAnimation();
          if (config.sleepingPortraitUrl) {
            void loadImage(sleepPortrait, config.sleepingPortraitUrl).then(() => {
              sleepReady = true;
              armIdle();
            }).catch((error) => console.warn("Resting expression unavailable:", error));
          }
          return;
        }
        await loadScript("vendor/live2d/pixi-6.5.10.min.js");
        await loadScript("vendor/live2d/live2dcubismcore.min.js");
        await loadScript("vendor/live2d/pixi-live2d-display-0.4.0.min.js");
        const PIXI = window.PIXI;
        PIXI.live2d.config.sound = false;
        app = new PIXI.Application({
          view: canvas, width: 230, height: 300, backgroundAlpha: 0,
          autoStart: false, antialias: true, resolution: Math.min(devicePixelRatio || 1, 2),
          autoDensity: true, sharedTicker: false,
        });
        app.ticker.maxFPS = 30;
        const modelRequest = PIXI.live2d.Live2DModel.from(config.modelUrl, {
          autoInteract: false, autoUpdate: false, idleMotionGroup: config.idleMotion,
          motionPreload: PIXI.live2d.MotionPreloadStrategy.ALL,
        });
        let expired = false;
        let deadline;
        try {
          model = await Promise.race([
            modelRequest.then((loaded) => {
              if (expired) {
                // Pixi may share cached textures with a newer retry.
                loaded.destroy();
                return null;
              }
              return loaded;
            }),
            new Promise((_, reject) => {
              deadline = setTimeout(() => {
                expired = true;
                reject(new Error("Live2D model load timed out"));
              }, 20000);
            }),
          ]);
        } finally {
          clearTimeout(deadline);
        }
        app.stage.addChild(model);
        app.ticker.add(() => model.update(app.ticker.deltaMS));
        model.update(1);
        status = "ready";
        translate();
        fit();
        syncAnimation();
      } catch (error) {
        console.warn("Website companion could not start:", error);
        if (app) app.destroy(false, { children: true, texture: true, baseTexture: true });
        app = model = null;
        status = "error";
        translate();
      } finally {
        pending = null;
      }
    })();
    return pending;
  }

  launcher.addEventListener("click", () => {
    setCollapsed(false);
    closeButton.focus();
  });
  closeButton.addEventListener("click", () => {
    setCollapsed(true);
    launcher.focus();
  });
  retryButton.addEventListener("click", () => { void load(); });
  pauseButton.addEventListener("click", () => {
    paused = !paused;
    translate();
    syncAnimation();
  });
  host.querySelectorAll('.companion-actions a').forEach((link) => {
    link.addEventListener("click", () => {
      // Native fragment navigation remains functional without animation.
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
  });
  stage.addEventListener("click", () => {
    if (status !== "ready" || Date.now() - lastTap < 700) return;
    lastTap = Date.now();
    noteActivity();
    greeted = true;
    translate();
    if (!paused) {
      if (isPortrait) {
        sprite.setAttribute("data-greeting", "true");
        clearTimeout(reactionTimer);
        reactionTimer = setTimeout(() => sprite.removeAttribute("data-greeting"), 600);
        return;
      }
      void model.motion(config.tapMotion, undefined, window.PIXI.live2d.MotionPriority.FORCE);
      const expressions = config.expressions || [];
      if (expressions.length) void model.expression(expressions[expressionIndex++ % expressions.length]);
    }
  });
  window.addEventListener("pointermove", (event) => {
    if (!model || collapsed || paused || document.hidden || event.pointerType === "touch") return;
    const rect = canvas.getBoundingClientRect();
    // focus() takes renderer coordinates, not page coordinates.
    model.focus(event.clientX - rect.left, event.clientY - rect.top);
  }, { passive: true });
  // Interaction with any part of the page wakes her; no automatic minimizing.
  ["pointermove", "pointerdown", "keydown", "scroll", "click"].forEach((event) => {
    window.addEventListener(event, noteActivity, { passive: true });
  });
  document.addEventListener("visibilitychange", () => {
    noteActivity();
    syncAnimation();
  });
  window.addEventListener("pagehide", () => {
    clearTimeout(idleTimer);
    clearTimeout(reactionTimer);
    app?.stop();
  });
  window.addEventListener("pageshow", () => { noteActivity(); syncAnimation(); });
  window.addEventListener("resize", fit, { passive: true });
  reducedMotion.addEventListener("change", (event) => {
    paused = event.matches;
    translate();
    syncAnimation();
  });
  new MutationObserver(translate).observe(document.documentElement, {
    attributes: true, attributeFilter: ["lang"],
  });
  translate();
  setCollapsed(collapsed);
})();
