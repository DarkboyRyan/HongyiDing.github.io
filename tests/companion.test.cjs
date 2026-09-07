const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(base, file), 'utf8');
const flush = () => new Promise((resolve) => setImmediate(resolve));

test('all model dependencies exist, parse and stay inside the model folder', () => {
  const dir = path.join(base, 'assets/live2d/haru');
  const manifest = JSON.parse(read('assets/live2d/haru/haru_greeter_t03.model3.json'));
  const refs = manifest.FileReferences;
  const files = [refs.Moc, ...refs.Textures, refs.Physics, refs.Pose,
    ...refs.Expressions.map((e) => e.File),
    ...Object.values(refs.Motions).flat().map((m) => m.File)];
  for (const relative of files) {
    const file = path.resolve(dir, relative);
    assert.ok(file.startsWith(dir + path.sep));
    assert.ok(fs.statSync(file).size > 0, relative);
    if (file.endsWith('.json')) JSON.parse(fs.readFileSync(file, 'utf8'));
    if (file.endsWith('.png')) assert.equal(fs.readFileSync(file).subarray(1, 4).toString(), 'PNG');
  }
  assert.ok(!Object.values(refs.Motions).flat().some((m) => m.Sound));
  for (const file of ['companion.css', 'companion-config.js', 'companion.js',
    'live2d-notices.html', 'vendor/live2d/pixi-6.5.10.min.js',
    'vendor/live2d/pixi-live2d-display-0.4.0.min.js', 'vendor/live2d/live2dcubismcore.min.js',
    'vendor/live2d/PIXI-LICENSE.txt', 'vendor/live2d/PIXI-LIVE2D-LICENSE.txt']) {
    assert.ok(fs.statSync(path.join(base, file)).size > 0, file);
  }
});

test('the bundled real Cubism Core can instantiate and update the real Haru moc3', async () => {
  const ctx = vm.createContext({ console, setTimeout, clearTimeout, performance, atob, TextDecoder });
  vm.runInContext(read('vendor/live2d/live2dcubismcore.min.js'), ctx);
  // Wait for the embedded WebAssembly runtime to become callable, with a bounded deadline.
  const core = ctx.Live2DCubismCore;
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { ready = core.Version.csmGetVersion() > 0; } catch { /* WASM still initializing. */ }
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  assert.ok(ready);
  const bytes = fs.readFileSync(path.join(base, 'assets/live2d/haru/haru_greeter_t03.moc3'));
  const moc = core.Moc.fromArrayBuffer(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  assert.ok(moc);
  const model = core.Model.fromMoc(moc);
  assert.ok(model.drawables.count > 0);
  assert.ok(model.parameters.ids.includes('ParamAngleX'));
  assert.ok(model.parameters.ids.includes('ParamEyeLOpen'));
  model.update();
  assert.ok(model.drawables.vertexPositions.every((positions) => positions.every(Number.isFinite)));
  model.release();
  moc._release();
});

function harness({ mode = 'live2d', mobile = false, reduced = false, stored = null, storageBlocked = false, failure = false, speech = true, sleepFailure = false } = {}) {
  let now = 100000, nextTimer = 1;
  const timers = new Map();
  function schedule(callback, delay) {
    const id = nextTimer++;
    timers.set(id, { callback, at: now + delay });
    return id;
  }
  function advance(ms) {
    const end = now + ms;
    while (true) {
      const next = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      timers.delete(next[0]); now = next[1].at; next[1].callback();
    }
    now = end;
  }
  class Element {
    constructor() { this.listeners = {}; this.attributes = {}; this.hidden = false; this.clientWidth = 230; this.clientHeight = 300; }
    addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
    emit(type, event = {}) { for (const fn of this.listeners[type] || []) fn(event); }
    setAttribute(key, value) { this.attributes[key] = value; }
    removeAttribute(key) { delete this.attributes[key]; }
    getAttribute(key) { return this.attributes[key]; }
    focus() { this.focused = true; }
    remove() {}
    getBoundingClientRect() { return { left: 1000, top: 400 }; }
    querySelector(selector) { return elements[selector] ||= new Element(); }
    querySelectorAll() { return [this.querySelector('[data-link="projects"]'), this.querySelector('[data-link="about"]')]; }
  }
  const elements = {};
  const imageRequests = [];
  const portrait = new Element();
  Object.defineProperty(portrait, 'src', {
    set(value) {
      imageRequests.push(value);
      queueMicrotask(() => fail ? portrait.onerror?.() : portrait.onload?.());
    },
  });
  elements['.companion-portrait'] = portrait;
  const sleepPortrait = new Element();
  sleepPortrait.hidden = true; // Mirrors the initial hidden attribute in the HTML.
  Object.defineProperty(sleepPortrait, 'src', {
    set() { queueMicrotask(() => sleepFailure ? sleepPortrait.onerror?.() : sleepPortrait.onload?.()); },
  });
  elements['.companion-sleep-eyes'] = sleepPortrait;
  const events = new Element();
  const root = new Element(); root.lang = 'en';
  const doc = new Element(); doc.documentElement = root; doc.hidden = false;
  let observer, app, loads = 0, fail = failure;
  const loadedScripts = [];
  const sizes = new Element(); sizes.matches = mobile;
  const motion = new Element(); motion.matches = reduced;
  const utterances = [];
  const synth = {
    cancellations: 0,
    getVoices: () => [{ lang: 'en-US' }, { lang: 'ja-JP', localService: true }],
    cancel() { this.cancellations++; },
    speak(utterance) { utterances.push(utterance); },
  };
  const model = {
    internalModel: { width: 2400, height: 4500 },
    scale: { set() {} }, anchor: { set() {} }, position: { set() {} },
    update() {}, focus(x, y) { this.lastFocus = [x, y]; },
    motion() { this.motionCalls = (this.motionCalls || 0) + 1; return Promise.resolve(true); },
    expression() { return Promise.resolve(true); },
  };
  doc.getElementById = () => null;
  let host;
  doc.createElement = (tag) => {
    const element = new Element();
    if (tag === 'aside') host = element;
    return element;
  };
  doc.body = { append() {} };
  doc.head = { append(script) { loadedScripts.push(script.src); queueMicrotask(() => script.onload()); } };
  doc.querySelector = () => new Element();
  const context = vm.createContext({
    console: { warn() {} }, setTimeout: schedule, clearTimeout: (id) => timers.delete(id), Date: { now: () => now }, devicePixelRatio: 2,
    speechSynthesis: speech ? synth : undefined,
    SpeechSynthesisUtterance: speech ? class { constructor(text) { this.text = text; } } : undefined,
    document: doc,
    localStorage: { getItem() { if (storageBlocked) throw Error('denied'); return stored; }, setItem(k, v) { if (storageBlocked) throw Error('denied'); stored = v; } },
    matchMedia: (query) => query.includes('reduce') ? motion : sizes,
    MutationObserver: class { constructor(fn) { observer = fn; } observe() {} },
    addEventListener: events.addEventListener.bind(events),
    PIXI: {
      Application: class {
        constructor() {
          app = this; this.running = false;
          this.renderer = { resize() {} }; this.stage = { addChild() {} };
          this.ticker = { add() {}, deltaMS: 33 };
        }
        start() { this.running = true; }
        stop() { this.running = false; }
        render() { this.rendered = true; }
        destroy() { this.destroyed = true; }
      },
      live2d: { config: {}, MotionPriority: { FORCE: 3 }, MotionPreloadStrategy: { ALL: 'ALL' },
        Live2DModel: { async from() { loads++; if (fail) throw Error('missing model'); return model; } } },
    },
  });
  context.window = context;
  vm.runInContext(read('companion-config.js'), context);
  context.PORTFOLIO_COMPANION = { ...context.PORTFOLIO_COMPANION, mode };
  vm.runInContext(read('companion.js'), context);
  return { elements, model, events, doc, sizes, motion, loadedScripts, imageRequests, host, advance, utterances, synth,
    get app() { return app; }, get loads() { return loads; }, get stored() { return stored; },
    recover() { fail = false; }, language(lang) { root.lang = lang; observer(); } };
}

test('desktop interaction, translation, pointer coordinates, pause and background suspension', async () => {
  const h = harness(); await flush();
  assert.equal(h.loads, 1); assert.equal(h.app.running, true);
  h.events.emit('pointermove', { clientX: 1100, clientY: 460, pointerType: 'mouse' });
  assert.deepEqual(h.model.lastFocus, [100, 60]);
  h.elements['.companion-stage'].emit('click');
  assert.equal(h.model.motionCalls, 1);
  h.language('zh-CN');
  assert.equal(h.elements['[data-link="projects"]'].textContent, '看看项目');
  h.elements['[data-action="pause"]'].emit('click');
  assert.equal(h.app.running, false);
  h.doc.hidden = true; h.doc.emit('visibilitychange');
  h.doc.hidden = false; h.doc.emit('visibilitychange');
  assert.equal(h.app.running, false, 'visibility must not undo explicit pause');
  h.elements['[data-action="pause"]'].emit('click');
  assert.equal(h.app.running, true);
  h.elements['[data-action="close"]'].emit('click');
  assert.equal(h.app.running, false);
  assert.equal(h.elements['.companion-launcher'].focused, true);
});

test('mobile starts expanded despite old preferences and minimizes only with minus', async () => {
  const h = harness({ mobile: true, stored: 'true' }); await flush();
  assert.equal(h.elements['.companion-panel'].hidden, false);
  assert.equal(h.loads, 1); assert.equal(h.loadedScripts.length, 3);
  h.sizes.emit('change', { matches: true });
  h.elements['[data-link="about"]'].emit('click');
  h.host.emit('keydown', { key: 'Escape' });
  assert.equal(h.elements['.companion-panel'].hidden, false);
  h.elements['[data-action="close"]'].emit('click');
  assert.equal(h.elements['.companion-panel'].hidden, true);
  h.elements['.companion-launcher'].emit('click'); await flush();
  assert.equal(h.elements['.companion-panel'].hidden, false);
  assert.equal(h.loads, 1);
});

test('reduced motion renders a still frame; blocked storage does not break the companion', async () => {
  const h = harness({ reduced: true, storageBlocked: true }); await flush();
  assert.equal(h.app.running, false); assert.equal(h.app.rendered, true);
  h.elements['.companion-stage'].emit('click');
  assert.equal(h.model.motionCalls, undefined);
  h.elements['[data-action="close"]'].emit('click');
  assert.equal(h.elements['.companion-panel'].hidden, true);
});

test('failed load exposes retry and recovers without reloading scripts', async () => {
  const h = harness({ failure: true }); await flush();
  assert.equal(h.elements['[data-action="retry"]'].hidden, false);
  assert.equal(h.elements['.companion-stage'].hidden, true);
  assert.equal(h.app.destroyed, true);
  h.recover(); h.elements['[data-action="retry"]'].emit('click'); await flush();
  assert.equal(h.loads, 2); assert.equal(h.loadedScripts.length, 3);
  assert.equal(h.elements['[data-action="retry"]'].hidden, true);
  assert.equal(h.app.running, true);
});

test('portrait mode loads Yamoto artwork without any Live2D scripts and responds to clicks', async () => {
  const h = harness({ mode: 'portrait' }); await flush();
  assert.equal(h.imageRequests[0], 'assets/characters/yamoto-koki/standing.png');
  assert.equal(h.loadedScripts.length, 0); assert.equal(h.loads, 0);
  assert.equal(h.elements.canvas.hidden, true);
  assert.equal(h.elements['.companion-stage'].hidden, false);
  assert.equal(h.host.attributes['data-animated'], 'true');
  h.language('zh-CN');
  assert.equal(h.elements['.companion-name'].textContent, '矢本小季');
  h.elements['.companion-stage'].emit('click');
  assert.equal(h.elements['.companion-message'].textContent, 'demo、矢本小季です。');
  assert.equal(h.elements['.companion-sprite'].attributes['data-greeting'], 'true');
  h.elements['[data-action="pause"]'].emit('click');
  assert.equal(h.host.attributes['data-animated'], 'false');
  assert.equal(h.elements['.companion-sprite'].attributes['data-greeting'], undefined);
});

test('portrait loads immediately on mobile and a failed image can be retried', async () => {
  const h = harness({ mode: 'portrait', mobile: true, failure: true }); await flush();
  assert.equal(h.imageRequests.length, 1);
  assert.equal(h.elements['.companion-panel'].hidden, false);
  assert.equal(h.elements['[data-action="retry"]'].hidden, false);
  h.recover(); h.elements['[data-action="retry"]'].emit('click'); await flush();
  assert.equal(h.imageRequests.length, 2);
  assert.equal(h.elements['[data-action="retry"]'].hidden, true);
  h.elements['[data-action="close"]'].emit('click');
  assert.equal(h.host.attributes['data-animated'], 'false');
});

test('portrait respects reduced motion and has real PNG alpha', async () => {
  const h = harness({ mode: 'portrait', reduced: true }); await flush();
  assert.equal(h.host.attributes['data-animated'], 'false');
  h.elements['.companion-stage'].emit('click');
  assert.equal(h.elements['.companion-sprite'].attributes['data-greeting'], undefined);
  const png = fs.readFileSync(path.join(base, 'assets/characters/yamoto-koki/standing.png'));
  assert.equal(png.readUInt32BE(16), 1024);
  assert.equal(png.readUInt32BE(20), 1536);
  assert.equal(png[25], 6, 'RGBA PNG, not painted checkerboard');
});

test('30 seconds of inactivity closes eyes; moving, scrolling and clicking reset the timer', async () => {
  const h = harness({ mode: 'portrait' }); await flush();
  h.advance(29999);
  assert.equal(h.elements['.companion-sleep-eyes'].hidden, true);
  h.events.emit('pointermove', { pointerType: 'mouse' });
  h.advance(29999);
  assert.equal(h.elements['.companion-sleep-eyes'].hidden, true);
  h.advance(1);
  assert.equal(h.elements['.companion-sleep-eyes'].hidden, false);
  assert.equal(h.host.attributes['data-resting'], 'true');
  assert.equal(h.elements['.companion-panel'].hidden, false);
  h.events.emit('scroll');
  assert.equal(h.elements['.companion-sleep-eyes'].hidden, true);
  h.advance(30000);
  h.elements['.companion-stage'].emit('click');
  assert.equal(h.elements['.companion-sleep-eyes'].hidden, true);
  assert.equal(h.elements['.companion-message'].textContent, 'demo、矢本小季です。');
});

test('click greeting stays text-only even when browser speech is available', async () => {
  const h = harness({ mode: 'portrait' }); await flush();
  assert.equal(h.utterances.length, 0);
  h.elements['.companion-stage'].emit('click');
  assert.equal(h.elements['.companion-message'].textContent, 'demo、矢本小季です。');
  h.elements['.companion-stage'].emit('click');
  assert.equal(h.utterances.length, 0);
  h.advance(701); h.elements['.companion-stage'].emit('click');
  assert.equal(h.utterances.length, 0);
  h.elements['[data-action="close"]'].emit('click');
  assert.equal(h.synth.cancellations, 0);
});

test('hidden and minimized views suspend idle timers and returning starts a fresh wait', async () => {
  const h = harness({ mode: 'portrait' }); await flush();
  h.advance(25000);
  h.doc.hidden = true; h.doc.emit('visibilitychange');
  h.advance(60000);
  assert.equal(h.elements['.companion-sleep-eyes'].hidden, true);
  h.doc.hidden = false; h.doc.emit('visibilitychange');
  h.advance(29999);
  assert.equal(h.elements['.companion-sleep-eyes'].hidden, true);
  h.advance(1);
  assert.equal(h.elements['.companion-sleep-eyes'].hidden, false);
  h.elements['[data-action="close"]'].emit('click');
  h.advance(60000);
  assert.equal(h.elements['.companion-sleep-eyes'].hidden, true);
  h.elements['.companion-launcher'].emit('click');
  assert.equal(h.elements['.companion-panel'].hidden, false);
});

test('missing speech or resting artwork does not break greeting or the original portrait', async () => {
  const h = harness({ mode: 'portrait', speech: false, sleepFailure: true }); await flush();
  h.advance(60000);
  assert.equal(h.elements['.companion-sleep-eyes'].hidden, true);
  h.elements['.companion-stage'].emit('click');
  assert.equal(h.elements['.companion-message'].textContent, 'demo、矢本小季です。');
  assert.equal(h.elements['.companion-stage'].hidden, false);
  assert.ok(fs.statSync(path.join(base, 'assets/characters/yamoto-koki/sleeping-eyes.png')).size > 0);
});
