/* ══════════════════════════════════════════════════════════════════
   مخزني — عامل الخدمة.

   هدفه واحد: أن يعمل التطبيق كاملًا بلا شبكة، في أي وقت.
   لا يطلب شيئًا من أي خادم، ولا حتى مرّة واحدة بعد أول زيارة.

   لمسة واحدة غيّرت شيئًا: ملفات محرّك القراءة الضخمة (‏7 ميغابايت)
   تُحمَّل مرّة واحدة وتبقى في الجهاز. وعامل الخدمة يعيد توجيه أي اسم
   ملف لنواة WebAssembly إلى النسخة المتوافقة مع هذا المتصفح، فلا
   نحتاج أن نُضمِّن أربع نسخ من النواة ونضخّم التطبيق بلا داع.
   ══════════════════════════════════════════════════════════════════ */
'use strict';

/* v2 : قراءة الملصق بمناطقه (المواصفة القسم 3)، ومحرك القراءة صار يُحمَّل
   فعلًا — كان في قائمة التخزين المسبق فقط فلا يعمل. ترقيم النسخة هو ما
   يجعل عامل الخدمة يمسح الذاكرة القديمة ويجلب الجديد. */
const VER = 'kazistock-v3';
const CORE = 'vendor/tesseract/core/tesseract-core-simd-lstm.wasm.js';

const SHELL = [
  './',
  'index.html',
  'app.css',
  'app.js',
  'manifest.webmanifest',
  'icone-192.png',
  'icone-512.png',
  'vendor/zxing.min.js',
  'vendor/tesseract/tesseract.min.js',
  'vendor/tesseract/worker.min.js',
  'vendor/tesseract/lang/eng.traineddata.gz',
  CORE,
];

async function onInstall() {
  const c = await caches.open(VER);
  // كل ملف على حدة: فشل ملف واحد لا يجب أن يُسقط التثبيت كله
  const added = await Promise.all(SHELL.map(function (u) {
    return c.add(new Request(u, { cache: 'reload' }))
      .then(function () { return 1; })
      .catch(function (err) { console.warn('precache ignore', u, err); return 0; });
  }));
  const n = added.reduce(function (a, b) { return a + b; }, 0);
  if (n < SHELL.length) console.warn('precache incomplete', n + '/' + SHELL.length);
  await self.skipWaiting();
}

async function onActivate() {
  const names = await caches.keys();
  await Promise.all(names.map(function (n) {
    return n === VER ? null : caches.delete(n);
  }));
  await self.clients.claim();
}

/** أي نسخة من نواة WebAssembly تُعيد توجيهها إلى النسخة التي ضمّناها. */
async function serveCore(req) {
  const hit = await caches.match(CORE, { ignoreSearch: true });
  if (hit) return hit;
  const res = await fetch(CORE);
  if (res && res.ok) {
    const c = await caches.open(VER);
    c.put(CORE, res.clone());
  }
  return res;
}

/** الذاكرة أولًا. لا شبكة إن وُجدت نسخة. */
async function serve(req) {
  const hit = await caches.match(req, { ignoreSearch: true });
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res && res.ok && res.type === 'basic') {
      const c = await caches.open(VER);
      c.put(req, res.clone());
    }
    return res;
  } catch (err) {
    // انقطاع الشبكة: نجيب صفحة التطبيق إذا كان الطلب وثيقة HTML
    if (req.mode === 'navigate') {
      const shell = await caches.match('index.html');
      if (shell) return shell;
    }
    throw err;
  }
}

function onFetch(e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;   // لا طلبات إلى الخارج، إطلاقًا

  if (/tesseract-core.*\.wasm\.js$/.test(url.pathname)) {
    e.respondWith(serveCore(req));
    return;
  }
  e.respondWith(serve(req));
}

self.addEventListener('install', function (e) { e.waitUntil(onInstall()); });
self.addEventListener('activate', function (e) { e.waitUntil(onActivate()); });
self.addEventListener('fetch', onFetch);
