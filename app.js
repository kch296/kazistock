/* ══════════════════════════════════════════════════════════════════
   مخزني — منطق التطبيق.

   المبدأ الذي يحكم كل شيء هنا: **المسار لا يتوقف أبداً**.
   المستخدم يقود الكاميرا نحو ملصق، فيُقرأ ويُحفظ، ثم يمرّ إلى
   التالي. لا شاشة بين، لا نموذج، لا «حفظ». كل خطوة تتقدّم تلقائياً.

   مسار القراءة الواحد يمرّ بمرحلتين في نفس اللحظة:
     1) الباركود  → رقم التتبع، **دقيق وفوري** (لا يُخطئ)
     2) التحليل البصري (OCR) → بقية بيانات الملصق
   يُحفظ السجل مرة واحدة فقط، برقم التصدق الدقيق مدمجًا فيه.

   كل شيء على الجهاز: لا خادم، لا طلب شبكة وقت التشغيل. محرّك القراءة
   نفسه مُضمَّن في المجلد (vendor/) لا يُجلب من أي مكان خارجي.
   ══════════════════════════════════════════════════════════════════ */
'use strict';

/* ─────────────────────────── 1. اللغات ─────────────────────────── */

const I18N = {
  ar: {
    dir: 'rtl',
    app: 'مخزني',
    gateTitle: 'مراقبة المخزن',
    gateSub: 'وجّه الكاميرا نحو الملصق — يُقرأ ويُسجَّل تلقائيًا، ثم انتقل إلى التالي',
    gateNote: 'لا يغادر شيء هاتفك. لا إنترنت، لا خادم.',
    gateDenied: 'تعذّر فتح الكاميرا. اسمح بالوصول إليها من إعدادات المتصفح.',
    gateStart: 'ابدأ',
    loading: 'جارٍ تحضير المحرّك…',
    engBarcodeOnly: 'باركود فقط',
    engLoading: 'قراءة الباركود · تحضير التحليل…',
    engReady: 'كل شيء مفعّل',
    engFailed: 'التحليل غير متاح',
    torch: 'الإضاءة',
    stock: 'المخزن',
    inStock: 'في المخزن',
    alerts: 'تنبيهات',
    log: 'السجل',
    parcels: 'طرد',
    none: 'المخزن فارغ\nوجّه الكاميرا نحو أول ملصق.',
    noneAlert: 'لا شيء قديم\nلا يوجد طرد تجاوز مدة الخطر.',
    noneLog: 'السجل فارغ\nلم يخرج أي طرد بعد.',
    sumVal: 'القيمة المحتجزة',
    alertLine: 'لا يوجد طرد تجاوز %1$s يومًا',
    alertHot: '%1$s طرد تجاوز %2$s يومًا',
    alertMany: 'المدة الآن %1$s يومًا',
    tapThreshold: 'اضغط لتغيير المدة',
    ageToday: 'اليوم',
    ageOne: 'يوم واحد',
    ageMany: '%1$s يومًا',
    out: 'خرج',
    backIn: 'إعادته للمخزن',
    edit: 'تعديل',
    del: 'حذف',
    save: 'حفظ',
    saved: 'حُفظ',
    deleted: 'حُذف',
    restored: 'أُعيد إلى المخزن',
    tracking: 'رقم التتبع',
    client: 'الزبون',
    dest: 'الوجهة',
    amount: 'المبلغ',
    cr: 'الدفع عند الاستلام',
    phone: 'الهاتف',
    date: 'التاريخ',
    rawTitle: 'النص المقروء من الملصق',
    details: 'التفاصيل',
    needTrack: 'رقم التتبع هو 7 أرقام',
    manual: 'إدخال يدوي',
    exportDone: 'تم تصدير %1$s سطرًا',
    dupe: 'هذا الرقم مسجَّل مسبقًا',
    scanned: 'المسح جارٍ',
    paused: 'متوقّف',
  },
  fr: {
    dir: 'ltr',
    app: 'KaziStock',
    gateTitle: 'Suivi du magasin',
    gateSub: 'Cadrez l\'étiquette — elle est lue et enregistrée, puis passez à la suivante',
    gateNote: 'Rien ne quitte le téléphone. Aucun internet, aucun serveur.',
    gateDenied: 'Caméra refusée. Autorisez-la dans les réglages du navigateur.',
    gateStart: 'Commencer',
    loading: 'Préparation du moteur…',
    engBarcodeOnly: 'Code-barres seul',
    engLoading: 'Code-barres · préparation de la lecture…',
    engReady: 'Tout est actif',
    engFailed: 'Lecture texte indisponible',
    torch: 'Lampe',
    stock: 'Magasin',
    inStock: 'Dans le magasin',
    alerts: 'Alertes',
    log: 'Journal',
    parcels: 'colis',
    none: 'Le magasin est vide\nCadrez la caméra sur la première étiquette.',
    noneAlert: 'Rien de vieux\nAucun colis ne dépasse la limite.',
    noneLog: 'Journal vide\nAucun colis n\'est encore sorti.',
    sumVal: 'Valeur immobilisée',
    alertLine: 'Aucun colis au-delà de %1$s jours',
    alertHot: '%1$s colis au-delà de %2$s jours',
    alertMany: 'Le délai est maintenant de %1$s jours',
    tapThreshold: 'Appuyez pour changer le délai',
    ageToday: 'Aujourd\'hui',
    ageOne: '1 jour',
    ageMany: '%1$s jours',
    out: 'Sorti',
    backIn: 'Remettre au magasin',
    edit: 'Modifier',
    del: 'Supprimer',
    save: 'Enregistrer',
    saved: 'Enregistré',
    deleted: 'Supprimé',
    restored: 'Remis au magasin',
    tracking: 'Numéro de suivi',
    client: 'Client',
    dest: 'Destination',
    amount: 'Montant',
    cr: 'Paiement à la livraison',
    phone: 'Téléphone',
    date: 'Date',
    rawTitle: 'Texte lu sur l\'étiquette',
    details: 'Détails',
    needTrack: 'Le numéro de suivi fait 7 chiffres',
    manual: 'Saisie manuelle',
    exportDone: '%1$s lignes exportées',
    dupe: 'Ce numéro est déjà enregistré',
    scanned: 'Lecture en cours',
    paused: 'En pause',
  },
  en: {
    dir: 'ltr',
    app: 'KaziStock',
    gateTitle: 'Warehouse watch',
    gateSub: 'Frame the label — it is read and recorded, then move to the next one',
    gateNote: 'Nothing leaves the phone. No internet, no server.',
    gateDenied: 'Camera refused. Allow it in the browser settings.',
    gateStart: 'Start',
    loading: 'Preparing the engine…',
    engBarcodeOnly: 'Barcode only',
    engLoading: 'Barcode · preparing text reading…',
    engReady: 'Everything active',
    engFailed: 'Text reading unavailable',
    torch: 'Torch',
    stock: 'Warehouse',
    inStock: 'In the warehouse',
    alerts: 'Alerts',
    log: 'Log',
    parcels: 'parcels',
    none: 'The warehouse is empty\nFrame the camera on the first label.',
    noneAlert: 'Nothing old\nNo parcel goes past the limit.',
    noneLog: 'Log is empty\nNo parcel has left yet.',
    sumVal: 'Value immobilised',
    alertLine: 'No parcel beyond %1$s days',
    alertHot: '%1$s parcels beyond %2$s days',
    alertMany: 'The limit is now %1$s days',
    tapThreshold: 'Tap to change the limit',
    ageToday: 'Today',
    ageOne: '1 day',
    ageMany: '%1$s days',
    out: 'Out',
    backIn: 'Put back in the warehouse',
    edit: 'Edit',
    del: 'Delete',
    save: 'Save',
    saved: 'Saved',
    deleted: 'Deleted',
    restored: 'Put back in the warehouse',
    tracking: 'Tracking number',
    client: 'Client',
    dest: 'Destination',
    amount: 'Amount',
    cr: 'Cash on delivery',
    phone: 'Phone',
    date: 'Date',
    rawTitle: 'Text read on the label',
    details: 'Details',
    needTrack: 'The tracking number is 7 digits',
    manual: 'Manual entry',
    exportDone: '%1$s rows exported',
    dupe: 'This number is already recorded',
    scanned: 'Scanning',
    paused: 'Paused',
  },
};

/* ─────────────────────────── 2. المخزن (التخزين) ─────────────────────────── */

const LS_KEY = 'kazistock.v1';
const ALERT_DAYS_MIN = 1, ALERT_DAYS_MAX = 30;

const db = { items: [], lang: 'ar', alertDays: 3, sound: true };

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) Object.assign(db, JSON.parse(raw));
  } catch (e) { /* مخزّن تالف: نبدأ من جديد بدل أن نتعطّل */ }
}
function persist() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(db)); }
  catch (e) { console.warn('stockage indisponible', e); }
}

const T = (key, ...args) => {
  const t = (I18N[db.lang] && I18N[db.lang][key]) || I18N.en[key] || key;
  return args.length ? t.replace(/%(\d)\$s/g, (_, i) => args[i - 1]) : t;
};

const inWarehouse = () => db.items.filter(i => !i.outAt);
const exited = () => db.items.filter(i => i.outAt);
const valueOf = i => (i.amount || 0) + (i.cr || 0);
const inValue = () => inWarehouse().reduce((s, i) => s + valueOf(i), 0);

function daysSince(ts) {
  const DAY = 86400000;
  const a = new Date(ts); a.setHours(0, 0, 0, 0);
  const b = new Date(); b.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((b - a) / DAY));
}
function ageLabel(d) {
  return d <= 0 ? T('ageToday') : (d === 1 ? T('ageOne') : T('ageMany', d));
}

/* ─────────────────────────── 3. قراءة رقم التتبع ───────────────────────────
   منقول حرفيًا عن TrackingReader (تطبيق بون كازي) — المنطق مُختبَر على
   نفس الملصق، ولا يجوز أن يختلف بين التطبيقين.
   ──────────────────────────────────────────────────────────────────────── */

const TRACK_LEN = 7;
const TRACK_CHARS = '[0-9OoIl|]';

function normalizeOcr(text) {
  let out = '';
  for (const ch of String(text)) {
    const c = ch.codePointAt(0);
    if (c >= 0x0660 && c <= 0x0669) out += String.fromCharCode(48 + (c - 0x0660)); // ٠-٩
    else if (c >= 0x06F0 && c <= 0x06F9) out += String.fromCharCode(48 + (c - 0x06F0)); // ۰-۹
    else if (c === 0x00A0 || c === 0x202F || c === 0x2009) out += ' ';
    else out += ch;
  }
  return out;
}
function toDigits(run) {
  let s = '';
  for (const ch of run) {
    if (ch >= '0' && ch <= '9') s += ch;
    else if (ch === 'O' || ch === 'o') s += '0';
    else if (ch === 'l' || ch === 'I' || ch === '|') s += '1';
    else return null;
  }
  return s.length === TRACK_LEN ? s : null;
}
/** regex جديدة لكل نداء: `lastIndex` عالة مشتركة على كائن regex واحد
 *  يجعل النتيجة تعتمد على ترتيب الاستدعاءات — عيب صامت. */
function firstSeven(line) {
  const re = new RegExp(TRACK_CHARS + '{5,12}', 'g');
  let m;
  while ((m = re.exec(line)) !== null) {
    const d = toDigits(m[0]);
    if (d) return d;
  }
  return null;
}
/** رقم التتبع من نص التحليل: 7 أرقام، و«tracking» له الأولوية. */
function extractTracking(text) {
  const lines = normalizeOcr(text).split(/\r?\n/);
  for (const line of lines) {
    if (/tracking/i.test(line)) { const m = firstSeven(line); if (m) return m; }
  }
  for (const line of lines) { const m = firstSeven(line); if (m) return m; }
  return null;
}
/** من محتوى الباركود: صيغة KAZI TOUR هي X-AAAAAAA-BBBBBBB-YY، فالتتبع هو
 *  المجموعة **الثانية**. أي ترتيب آخر لا نُجتهد في تفسيره: نمرّره إلى
 *  خوارزمية النص، وهي أكثر تحفّظًا. */
function trackingFromBarcode(raw) {
  const s = String(raw || '').trim();
  const groups = s.match(/\d{7}/g);
  if (groups && groups.length >= 2) {
    // نؤكّد أن الملف منطقي: البادئة قصيرة، والذيل قصير
    const m = s.match(/^[A-Za-z0-9]{0,3}[-_ ](\d{7})[-_ ](\d{7})[-_ ](\d{2,4})$/);
    if (m) return m[2];
    return groups[1];
  }
  return extractTracking(s);
}

/* ─────────────────────────── 4. استخراج بقية بيانات الملصق ─────────────────────
   لا نعرف تخطيط الملصق بالضبط، فالمختبَر هنا هو **أفضل تقدير**:
   نبحث عن الكلمة المفتاحية المرافقة للقيمة (بعدة لغات)، ثم نلجأ إلى
   قواعد عامة (رقم هاتف جزائري، تاريخ، مبلغ بخانتين عشريتين).

   ومبدأ لا يُخترق: **النص الكامل يُحفظ دائمًا**. إن أخطأ التقدير، فالأصل
   موجود ويمكن مراجعته وتعديله — لا يضيع شيء.
   ──────────────────────────────────────────────────────────────────────── */

const FIELDS = {
  client: ['client', 'nom', 'name', 'destinataire', 'expediteur', 'الزبون', 'العميل', 'المرسل', 'اسم'],
  dest:   ['destinataire', 'destinataire :', 'destination', 'destin', 'adresse', 'address',
           'livré à', 'ville', 'gare', 'الوجهة', 'العنوان', 'المدينة', 'المرسل إليه'],
  amount: ['montant', 'amount', 'valeur', 'value', 'prix', 'المبلغ', 'القيمة', 'المجموع', 'قيمة'],
  cr:     ['c.r', 'cr', 'contre remboursement', 'contre-remboursement', 'paiement a la livraison',
           'pay on delivery', 'cod', 'الدفع عند الاستلام', 'عند الاستلام', 'الدفع'],
  date:   ['date', 'التاريخ', 'المؤرخة'],
  phone:  ['tel', 'telephone', 'phone', 'gsm', 'mobile', 'الهاتف', 'هاتف', 'تلفون', 'رقم'],
};

const SEP_IN = '\\s:\\-–—=.,/()\\[\\u066B\\u066C';   // فواصل تُقبل قبل القيمة
const SEP_ED = '\\s:\\-–—.,;';                      // فواصل تُقبل بعدها

function cleanValue(v) {
  return String(v)
    .replace(new RegExp('^[' + SEP_IN + ']+'), '')
    .replace(new RegExp('[' + SEP_ED + ']+$'), '')
    .trim();
}
const isLetter = ch => !!ch && /[\p{L}\p{N}]/u.test(ch);

/** موضع الكلمة المفتاحية داخل السطر، بشرط أن تكون **كلمة** لا جزءًا من أخرى:
 *  « client » في « Client: X » تُقبل، وفي « Cleanning » تُرفض. */
function aliasHit(low, alias) {
  const a = alias.toLowerCase();
  let from = 0, i;
  while ((i = low.indexOf(a, from)) >= 0) {
    from = i + 1;
    const before = i > 0 ? low[i - 1] : '';
    const after = low[i + a.length] || '';
    if (isLetter(before) || isLetter(after)) continue;
    return i;
  }
  return -1;
}

/** يزيل الكلمة المفتاحية من السطر تاركًا القيمة فقط.
 *  عند تعدّد الكلمات المطابقة في سطر واحد، نفوز بـ**الأطول**: فهي الأدقّ
 *  (« destinataire » أخصب من « dest »). */
function valueAfterAlias(line, aliases) {
  const low = line.toLowerCase();
  let bestA = null, bestV = null;
  for (const a of aliases) {
    const i = aliasHit(low, a);
    if (i < 0) continue;
    const rest = cleanValue(line.slice(i + a.length));
    if (!rest) continue;
    if (!bestA || a.length > bestA.length) { bestA = a; bestV = rest; }
  }
  return bestV;
}

/** أول مبلغ في قيمة، لا القيمة كاملة: التحليل البصري يلصق أحيانًا آخر
 *  رمزٍ من الباركود بالسطر نفسه، فتصير « 3 000,00 K-1020304-7654321-26 »
 *  مبلغًا لا معنى له. نأخذ عددًا واحدًا فقط، ونرفض ما يتجاوز الحدّ. */
function moneyToken(v) {
  if (v == null) return null;
  const m = String(v).match(/\d{1,3}(?:[  .]\d{3})*(?:,\d{1,2})|\d+(?:[.,]\d{1,2})?/);
  return m ? m[0] : null;
}
const PLAUSIBLE = 1e12;   // au-delà, ce n'est pas un montant de transport

function parseMoney(s) {
  if (s == null) return 0;
  let t = normalizeOcr(String(s)).replace(/[^\d.,]/g, '').trim();
  if (!t) return 0;
  const lc = t.lastIndexOf(','), ld = t.lastIndexOf('.');
  if (lc >= 0 && ld >= 0) {
    const dec = lc > ld ? ',' : '.', thou = lc > ld ? '.' : ',';
    t = t.split(thou).join('').replace(dec, '.');
  } else if (lc >= 0 || ld >= 0) {
    const sep = lc >= 0 ? ',' : '.';
    const n = t.split(sep).length - 1;
    const frac = t.slice(t.lastIndexOf(sep) + 1);
    t = (n === 1 && frac.length === 2) ? t.split(sep).join('.') : t.split(sep).join('');
  }
  const v = parseFloat(t);
  return isFinite(v) ? v : 0;
}

/* التحقّق من كل حقل على حِدة: نصّي يُقبل بالحروف، ومالي لا يُقبل إلا
   إذا كان رقمًا، وهاتف لا يُقبل إلا بطول معقول. */
function fieldOk(key, v) {
  if (!v) return false;
  switch (key) {
    case 'amount':
    case 'cr': {
      const n = parseMoney(moneyToken(v));
      return n > 0 && n < PLAUSIBLE;
    }
    case 'phone':
      return cleanPhone(v) !== null;
    case 'date':
      return /\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}/.test(v);
    default:
      return /[\p{L}]/u.test(v) && v.length <= 60;   // اسم أو وجهة: لا أرقام وحدها
  }
}
function fieldSet(out, key, v) {
  if (!fieldOk(key, v)) return false;
  if (key === 'amount' || key === 'cr') out[key] = parseMoney(moneyToken(v));
  else if (key === 'phone') out.phone = cleanPhone(v);
  else if (key === 'date') {
    const m = v.match(/(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/);
    out.date = m[1].padStart(2, '0') + '/' + m[2].padStart(2, '0') + '/' + m[3];
  } else out[key] = v;
  return true;
}
const filled = (out, key) => key === 'amount' || key === 'cr' ? out[key] > 0 : out[key] !== '';

/** رقم هاتف: 9 أو 10 أرقام، والفواصل تُحذف. `null` إن لم يكن رقمًا. */
function cleanPhone(v) {
  if (!v) return null;
  const t = String(v).replace(/[^\d]/g, '');
  if (t.length < 9 || t.length > 13) return null;
  return t;
}

function extractFields(text) {
  const out = { client: '', dest: '', amount: 0, cr: 0, phone: '', date: '' };
  if (!text) return out;
  const lines = normalizeOcr(text).split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1) قيمة موجودة بعد كلمة مفتاحية، في نفس السطر
  for (const line of lines) {
    for (const key of Object.keys(FIELDS)) {
      if (filled(out, key)) continue;
      const v = valueAfterAlias(line, FIELDS[key]);
      if (v) fieldSet(out, key, v);
    }
  }

  // 2) قواعد عامة لما لم يُلتقط أعلاه
  const whole = normalizeOcr(text);
  if (!out.phone) {
    // سطرًا سطرًا: لو فُصل رقمٌ عن سطره بعلامة سطر new، لانضمّ رقمان
    // مختلفان في رقمٍ واحد خاطئ. ثم نتحقّق من الطول — لا نتعرّف على رقم
    // من نصٍّ كثير كالرقم المرجعي.
    for (const line of lines) {
      const cands = line.match(/\+?\d[\d .()\/-]{7,18}\d/g) || [];
      for (const c of cands) {
        const p = cleanPhone(c);
        if (p && (p[0] === '0' || p.length === 10)) { out.phone = p; break; }
      }
      if (out.phone) break;
    }
  }
  if (!out.date) {
    const m = whole.match(/\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})\b/);
    if (m) out.date = m[1].padStart(2, '0') + '/' + m[2].padStart(2, '0') + '/' + m[3];
  }
  if (!out.amount || !out.cr) {
    // مبالغ بخانتين عشريتين، الأصغر قيمةً هو الدفعة عند الاستلام غالبًا
    const amounts = (whole.match(/\b\d{1,3}(?:[.,\s]\d{3})*,\d{2}\b|\b\d+[.,]\d{2}\b/g) || [])
      .map(parseMoney).filter(v => v > 0).sort((a, b) => b - a);
    if (!out.amount && amounts.length) out.amount = amounts[0];
    if (!out.cr && amounts.length > 1) out.cr = amounts[1];
  }
  return out;
}

/* ─────────────────────────── 5. محرّكا القراءة ─────────────────────────── */

const VENDOR = {
  worker: 'vendor/tesseract/worker.min.js',
  core: 'vendor/tesseract/core',
  lang: 'vendor/tesseract/lang',
};

const engine = {
  ocrWorker: null,
  ocrState: 'idle',   // idle | loading | ready | failed
  native: null,
  zxing: null,
};

function hasNativeBarcode() {
  return 'BarcodeDetector' in window &&
    typeof BarcodeDetector.getSupportedFormats === 'function';
}
async function initNativeBarcode() {
  if (!hasNativeBarcode()) return false;
  try {
    const want = ['code_128', 'code_39', 'code_93', 'codabar', 'ean_13', 'ean_8', 'itf', 'upc_a', 'qr_code', 'data_matrix'];
    const have = await BarcodeDetector.getSupportedFormats();
    const use = want.filter(f => have.includes(f));
    if (!use.length) return false;
    engine.native = new BarcodeDetector({ formats: use });
    return true;
  } catch (e) { return false; }
}
function initZxing() {
  try {
    if (!window.ZXing) return false;
    const hints = new Map();
    hints.set(window.ZXing.DecodeHintType.POSSIBLE_FORMATS, [
      window.ZXing.BarcodeFormat.CODE_128, window.ZXing.BarcodeFormat.CODE_39,
      window.ZXing.BarcodeFormat.CODE_93, window.ZXing.BarcodeFormat.CODABAR,
      window.ZXing.BarcodeFormat.EAN_13, window.ZXing.BarcodeFormat.ITF,
      window.ZXing.BarcodeFormat.UPC_A, window.ZXing.BarcodeFormat.QR_CODE,
      window.ZXing.BarcodeFormat.DATA_MATRIX,
    ]);
    hints.set(window.ZXing.DecodeHintType.TRY_HARDER, true);
    const r = new window.ZXing.MultiFormatReader();
    r.setHints(hints);
    engine.zxing = r;
    return true;
  } catch (e) { return false; }
}

/** تهيئة محرّك التحليل البصري. الملفات محلية، فلا شبكة ولا طرف ثالث. */
async function initOcr() {
  if (engine.ocrState !== 'idle') return;
  if (!window.Tesseract) { engine.ocrState = 'failed'; paintEngine(); return; }
  engine.ocrState = 'loading'; paintEngine();
  try {
    // ننتظر عامل الخدمة حتى يسيطر على الصفحة: هو من يعيد توجيه ملف
    // نواة WebAssembly إلى النسخة المتوافقة مع هذا المتصفح.
    await waitForController();
    const w = await window.Tesseract.createWorker('eng', 1, {
      workerPath: VENDOR.worker,
      corePath: VENDOR.core,
      langPath: VENDOR.lang,
      gzip: true,
      lstmOnly: true,
      logger: m => { if (m.status && m.status !== 'recognizing text') paintEngine(m.status); },
    });
    await w.setParameters({ preserve_interword_spaces: '1' });
    engine.ocrWorker = w;
    engine.ocrState = 'ready';
  } catch (e) {
    console.warn('OCR indisponible', e);
    engine.ocrState = 'failed';
  }
  paintEngine();
}

function waitForController() {
  if (!('serviceWorker' in navigator)) return Promise.resolve();
  if (navigator.serviceWorker.controller) return Promise.resolve();
  return new Promise(res => {
    const t = setTimeout(res, 2500);
    navigator.serviceWorker.addEventListener('controllerchange', () => { clearTimeout(t); res(); }, { once: true });
  });
}

/* ─────────────────────────── 6. الكاميرا والحلقة ─────────────────────────── */

const els = {};
let stream = null, torchOn = false, paused = false, camStarted = false;
let audioCtx = null;

const COOLDOWN_MS = 800;      // لا تُسجَّل ملصقة جديدة فورًا بعد واحدة
const OCR_GAP_MS = 950;       // إيقاع القراءة البصرية
const BARCODE_GAP_MS = 90;
const PENDING_TTL_MS = 1600;  // عمر رقم الباركود المنتظر قبل أن يُهمَل

let lastBarcodeTry = 0, lastOcrTry = 0, lastTry = 0;
let cooldownUntil = 0, lastCommitted = null, pendingTracking = null, pendingAt = 0;

async function startCamera() {
  els.gateNote.classList.remove('bad');
  els.btnStart.disabled = true;
  els.btnStart.textContent = T('loading');
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false,
    });
  } catch (e) {
    els.gateNote.textContent = T('gateDenied');
    els.gateNote.classList.add('bad');
    els.btnStart.disabled = false;
    els.btnStart.textContent = T('gateStart');
    return;
  }
  els.video.srcObject = stream;
  try { await els.video.play(); } catch (e) { /* بعض المتصفحات تؤجل التشغيل */ }
  await waitVideoSize();

  camStarted = true;
  els.gate.classList.add('hidden');
  ensureAudio();
  await initNativeBarcode();   // promises rapides, mais on ne perd pas la course
  initZxing();
  initOcr();          // لا ننتظر: الباركود يعمل فورًا، والتحليل يجيء في الخلفية
  loop.raf = requestAnimationFrame(tick);
}

/** نقل إطار منطقة القراءة إلى لوحة، بتدرّج رمادي وتباين معزَّز.
 *  لكل محرّك لوحته الخاصة: OCR يعمل غير متزامن فيدفع إطاراته بعد
 *  انتهاء الدالة، فلو تشاركا اللوحة لقرأ محركٌ بياناتَ محرّكٍ آخر. */
function grabRoi(maxW, slot) {
  const v = els.video;
  if (!v.videoWidth) return null;
  const vr = v.getBoundingClientRect();
  const r = els.roi.getBoundingClientRect();
  if (!vr.width || !vr.height) return null;
  // الفيديو object-fit:cover → لا بد من حساب مقياس التغطية يدويًا
  const cover = Math.max(v.videoWidth / vr.width, v.videoHeight / vr.height);
  const sx = (r.left - vr.left) * cover;
  const sy = (r.top - vr.top) * cover;
  const sw = r.width * cover, sh = r.height * cover;
  if (sw < 20 || sh < 20) return null;

  const scale = Math.min(1, maxW / sw);
  const w = Math.round(sw * scale), h = Math.round(sh * scale);
  const c = grabCanvas(w, h, slot);
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(v, sx, sy, sw, sh, 0, 0, w, h);
  return enhance(ctx, w, h);
}

/** تدرّج رمادي + تمديد التباين: الورق الحراري باهت، والمحرّك يحتاج دقة.
 *  نُعيد أيضًا مصفوفة الإضاءة نفسها: ZXing يقبلها كما هي، فلا نُجبره
 *  على تفكيك RGBA — ومن يفكّكه يقرأ **بايت الشفافية** على أنه أزرق،
 *  فتزدوج الخلفية الفاتحة في الحساب ويصير الرمز غير مقروء. */
function enhance(ctx, w, h) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  let min = 255, max = 0;
  const lum = new Uint8ClampedArray(w * h);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const y = (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000 | 0;
    lum[p] = y; if (y < min) min = y; if (y > max) max = y;
  }
  const range = Math.max(1, max - min);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const y = ((lum[p] - min) * 255 / range) | 0;
    const c2 = y < 0 ? 0 : (y > 255 ? 255 : y);
    lum[p] = c2;
    d[i] = d[i + 1] = d[i + 2] = c2;
  }
  ctx.putImageData(img, 0, 0);
  return { canvas: ctx.canvas, lum, w, h };
}
const _canvases = {};
function grabCanvas(w, h, slot) {
  let c = _canvases[slot];
  if (!c) { c = _canvases[slot] = document.createElement('canvas'); }
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  return c;
}

/* الحلقة لا تُؤجَّل بـ`setTimeout`: طلبات القراءة تتراكم أحيانًا أسرع
   من تنفيذها، فنبدأ طلبًا جديدًا فوق القديم. `busy` قفل منفرد، و`tick`
   يعود بـ`requestAnimationFrame` وحده. */
const loop = { raf: 0, ocrBusy: false, zxingBusy: false };

async function tick() {
  if (!camStarted) return;
  loop.raf = requestAnimationFrame(tick);
  const now = Date.now();
  if (paused || now - lastTry < 45) return;
  lastTry = now;
  if (document.hidden) return;

  if (pendingTracking && now - pendingAt > PENDING_TTL_MS) {
    pendingTracking = null;   // الباركود انتظر طويلًا: يُهمَل
  }

  // 1) الباركود — سريع جدًا، ودقيق بلا أي حال
  if (now - lastBarcodeTry >= BARCODE_GAP_MS && !loop.zxingBusy) {
    lastBarcodeTry = now;
    loop.zxingBusy = true;
    try { await readBarcode(); } catch (e) { /* إطار غير صالح */ }
    finally { loop.zxingBusy = false; }
  }

  // 2) التحليل البصري — أبطأ، لكنه يعطي بقية البيانات
  if (engine.ocrState === 'ready' && !loop.ocrBusy && now - lastOcrTry >= OCR_GAP_MS) {
    lastOcrTry = now;
    loop.ocrBusy = true;
    try { await readOcr(); } catch (e) { /* إطار واحد فشل: نتجاهله */ }
    finally { loop.ocrBusy = false; }
  }
}

async function readBarcode() {
  // 1) إن توفّر مكشّف المتصفح فهو الأسرع والأدق
  if (engine.native) {
    try {
      const found = await engine.native.detect(els.video);
      if (found && found.length && found[0].rawValue) { onBarcode(found[0].rawValue); return; }
    } catch (e) { /* إطار غير صالح: نكمل بالمحرّك البديل */ }
  }
  // 2) ZXing المضمَّن: يعمل في كل المتصفحات، بمن فيها التي بلا مكشّف
  if (engine.zxing) onBarcode(zxingFromFrame());
}

function zxingFromFrame() {
  const f = grabRoi(1000, 'zx');
  if (!f) return null;
  try {
    // مصفوفة الإضاءة جاهزة من enhance(): ZXing يقبلها كما هي
    const src = new window.ZXing.RGBLuminanceSource(f.lum, f.w, f.h);
    const bmp = new window.ZXing.BinaryBitmap(new window.ZXing.HybridBinarizer(src));
    const res = engine.zxing.decodeWithState(bmp);
    return res ? res.getText() : null;
  } catch (e) {
    return null;
  } finally {
    try { engine.zxing.reset(); } catch (e) { /* لا شيء */ }
  }
}

async function readOcr() {
  const f = grabRoi(1100, 'ocr');
  if (!f) return;
  const res = await engine.ocrWorker.recognize(f.canvas);
  onOcr(res && res.data ? res.data.text : '');
}

/* ─────────────────────────── 7. نقطة الالتقاء: الحفظ ─────────────────────────── */

function onBarcode(raw) {
  const t = trackingFromBarcode(raw);
  if (!t) return;
  if (engine.ocrState === 'ready') {
    // ننتظر التحليل البصري: هو سيأتي ببقية البيانات، ورقم التتبع دقيق هنا
    pendingTracking = t; pendingAt = Date.now();
  } else {
    if (canCommit(t)) commit(t, {}, '', 'barcode');
  }
}

function onOcr(text) {
  const fromText = text ? extractTracking(text) : null;
  const t = fromText || pendingTracking;
  if (!t) return;
  if (!canCommit(t)) return;
  const src = fromText && pendingTracking ? 'barcode+ocr' : (fromText ? 'ocr' : 'barcode');
  commit(t, text ? extractFields(text) : {}, text || '', src);
}

/** يمنع تكرار الملصق الواحد: نفس الرقم، أو نافذة تبريد، أو إدخال مزدوج. */
function canCommit(t) {
  const now = Date.now();
  if (now < cooldownUntil) return false;
  if (t === lastCommitted) return false;          // ما زال أمام العدسة
  if (db.items.some(i => i.tracking === t && !i.outAt)) return false;  // مسجَّل فعلًا
  return true;
}

function commit(tracking, fields, raw, src) {
  lastCommitted = tracking;
  pendingTracking = null;
  cooldownUntil = Date.now() + COOLDOWN_MS;

  const rec = {
    id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    tracking,
    client: fields.client || '',
    dest: fields.dest || '',
    amount: fields.amount || 0,
    cr: fields.cr || 0,
    phone: fields.phone || '',
    date: fields.date || '',
    raw: raw || '',
    src: src || '',
    at: Date.now(),
    outAt: 0,
  };
  db.items.push(rec);
  persist();
  paintFlash(rec);
  paintStrip(rec);
  paintCount();
  feedback();
  // لا نوقف المسح ولا نفتح أي شاشة: هذا هو المطلوب — «ثم أمرّر على الثاني»
  if (listOpen) paintList();
}

function feedback() {
  if (db.sound) beep();
  if (navigator.vibrate) { try { navigator.vibrate(60); } catch (e) { /* غير مدعوم */ } }
}

/** بعض الأجهزة لا تُعلن أبعاد الفيديو حتى وصول أول إطار. */
function waitVideoSize() {
  const v = els.video;
  if (v.videoWidth) return Promise.resolve();
  return new Promise(res => {
    const done = () => { v.removeEventListener('loadedmetadata', done); res(); };
    v.addEventListener('loadedmetadata', done);
    setTimeout(done, 2500);
  });
}

function ensureAudio() {
  if (audioCtx) { if (audioCtx.state === 'suspended') audioCtx.resume(); return; }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  } catch (e) { audioCtx = null; }
}
function beep() {
  if (!audioCtx) return;
  try {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'sine'; o.frequency.value = 1180;
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.16, audioCtx.currentTime + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.16);
    o.connect(g).connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + 0.18);
  } catch (e) { /* لا صوت */ }
}

/* ─────────────────────────── 8. العرض ─────────────────────────── */

const money = v => (Math.round(v * 100) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DA';

function paintEngine(status) {
  const dot = els.engineDot, txt = els.engineText;
  dot.className = 'dot';
  if (engine.ocrState === 'ready') {
    dot.classList.add('ok');
    txt.textContent = paused ? T('paused') : T('engReady');
  } else if (engine.ocrState === 'loading') {
    dot.classList.add('busy');
    txt.textContent = (status ? status + ' · ' : '') + T('engLoading');
  } else if (engine.ocrState === 'failed') {
    dot.classList.add('wait');
    txt.textContent = T('engFailed');
  } else {
    dot.classList.add('wait');
    txt.textContent = T('engBarcodeOnly');
  }
}

let flashTimer = 0;
function paintFlash(rec) {
  els.flashNum.textContent = rec.tracking;
  const bits = [];
  if (rec.client) bits.push(`<b>${esc(rec.client)}</b>`);
  if (rec.dest) bits.push(`<b>${esc(rec.dest)}</b>`);
  if (rec.amount) bits.push(`${T('amount')}: <b>${esc(money(rec.amount))}</b>`);
  if (rec.cr) bits.push(`${T('cr')}: <b>${esc(money(rec.cr))}</b>`);
  if (rec.phone) bits.push(`<b>${esc(rec.phone)}</b>`);
  els.flashRows.innerHTML = bits.slice(0, 4).join(' · ');
  els.flash.classList.add('show');
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => els.flash.classList.remove('show'), 1100);
}

function paintStrip(rec) {
  const s = els.strip;
  s.innerHTML = '';
  const recent = db.items.slice(-3).reverse();
  for (const r of recent) {
    const sp = document.createElement('span');
    sp.textContent = r.tracking;
    if (r === rec) sp.className = 'fresh';
    s.appendChild(sp);
  }
}

function paintCount() {
  const today = new Date().toDateString();
  const n = db.items.filter(i => new Date(i.at).toDateString() === today).length;
  els.countBig.innerHTML = `${n}<small>${T('parcels')}</small>`;
}

function toast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => els.toast.classList.remove('show'), 1900);
}

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ─────────────────────────── 9. قائمة المخزن ─────────────────────────── */

let tab = 'in', listOpen = false, editingId = null;

function openList() { listOpen = true; els.viewList.classList.remove('hidden'); paintList(); }
function closeList() { listOpen = false; els.viewList.classList.add('hidden'); }

function paintList() {
  // النسخ إلى مصفوفة جديدة: `sort` على النتيجة مباشرةً يحرّك ترتيب
  // `db.items` نفسه، فيصبح «الأحدث أولًا» غير صحيح بعد أي تبديل تبويب.
  const inList = inWarehouse().slice().sort((a, b) => b.at - a.at);
  const alerting = inList.filter(i => daysSince(i.at) >= db.alertDays);
  const out = exited().slice().sort((a, b) => b.outAt - a.outAt);

  let items, label, count, value;
  if (tab === 'in') { items = inList; label = T('inStock'); count = inList.length; value = inValue(); }
  else if (tab === 'alert') { items = alerting; label = T('alerts'); count = alerting.length; value = alerting.reduce((s, i) => s + valueOf(i), 0); }
  else { items = out; label = T('log'); count = out.length; value = out.reduce((s, i) => s + valueOf(i), 0); }

  els.sumLabel.textContent = label;
  els.sumCount.textContent = `${count} ${T('parcels')}`;
  els.sumValue.textContent = money(value);

  const line = els.btnAlertLine;
  if (alerting.length) {
    line.className = 'sumAlert hot';
    line.textContent = T('alertHot', alerting.length, db.alertDays) + ' · ' + T('tapThreshold');
  } else {
    line.className = 'sumAlert';
    line.textContent = T('alertLine', db.alertDays) + ' · ' + T('tapThreshold');
  }

  els.items.innerHTML = '';
  if (!items.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.style.whiteSpace = 'pre-line';
    li.textContent = tab === 'in' ? T('none') : (tab === 'alert' ? T('noneAlert') : T('noneLog'));
    els.items.appendChild(li);
    return;
  }
  for (const it of items) els.items.appendChild(card(it, tab === 'out'));
}

function card(it, gone) {
  const li = document.createElement('li');
  const d = daysSince(it.at);
  const hot = !gone && d >= db.alertDays;
  const sev = !gone && d >= db.alertDays + 3 ? 'a2' : (hot ? 'a1' : '');
  li.className = 'card' + (hot ? ' hot' : '') + (gone ? ' gone' : '');

  const meta = [];
  if (it.client) meta.push(esc(it.client));
  if (it.dest) meta.push(esc(it.dest));
  if (it.phone) meta.push(esc(it.phone));
  if (it.date) meta.push(esc(it.date));

  li.innerHTML =
    `<div class="cTop">
       <span class="cNum">${esc(it.tracking)}</span>
       <span class="cAge ${sev}">${gone ? T('out') : ageLabel(d)}</span>
     </div>` +
    (meta.length ? `<div class="cMeta">${meta.join(' · ')}</div>` : '') +
    (valueOf(it) ? `<div class="cVal">${esc(money(valueOf(it)))}</div>` : '');

  li.addEventListener('click', () => openSheet(it));
  return li;
}

/* ─────────────────────────── 10. لوحة التحرير ─────────────────────────── */

/** سجل فارغ للإدخال اليدوي: نفس الشكل تمامًا كسجل مقروء. */
function newRecord() {
  return {
    id: '', tracking: '', client: '', dest: '', amount: 0, cr: 0,
    phone: '', date: '', raw: '', src: 'manual', at: Date.now(), outAt: 0,
  };
}

function openSheet(it, isNew) {
  editingId = isNew ? null : it.id;
  els.sheetTitle.textContent = T(isNew ? 'manual' : 'details');
  els.fTracking.value = it.tracking || '';
  els.fClient.value = it.client || '';
  els.fDest.value = it.dest || '';
  els.fAmount.value = it.amount ? String(it.amount) : '';
  els.fCr.value = it.cr ? String(it.cr) : '';
  els.fPhone.value = it.phone || '';
  els.fDate.value = it.date || '';
  els.rawText.textContent = it.raw || '';
  els.rawBox.classList.toggle('hidden', !it.raw);
  els.btnDelete.classList.toggle('hidden', !!isNew);
  els.btnOut.classList.toggle('hidden', !!isNew || !!it.outAt);
  els.btnBackIn.classList.toggle('hidden', !!isNew || !it.outAt);
  els.sheetMask.classList.remove('hidden');
  els.sheet.classList.remove('hidden');
  try { els.fTracking.focus(); } catch (e) { /* بعض الأجهزة لا تُظهر لوحة المفاتيح */ }
}

function closeSheet() {
  els.sheetMask.classList.add('hidden');
  els.sheet.classList.add('hidden');
  editingId = null;
  if (paused && camStarted) { paused = false; paintEngine(); }   // المسح يستأنف
}

function saveSheet() {
  const t = els.fTracking.value.trim();
  if (!/^\d{7}$/.test(t)) { toast(T('needTrack')); return; }
  // لا يُقبل رقمُ تتبّعٍ موجودٍ في المخزن أصلًا: ذلك تكرار، لا طرد جديد
  const clash = db.items.find(i => i.tracking === t && i.id !== editingId && !i.outAt);
  if (clash) { toast(T('dupe')); return; }

  let it;
  if (editingId === null) {
    it = newRecord();
    it.tracking = t;
    db.items.push(it);
  } else {
    it = db.items.find(i => i.id === editingId);
    if (!it) return closeSheet();
    it.tracking = t;
  }
  it.client = els.fClient.value.trim();
  it.dest = els.fDest.value.trim();
  it.amount = parseMoney(els.fAmount.value);
  it.cr = parseMoney(els.fCr.value);
  it.phone = els.fPhone.value.trim();
  it.date = els.fDate.value.trim();

  persist(); closeSheet(); paintList(); paintCount(); paintStrip({});
  if (listOpen) paintList();
  toast(T('saved'));
}

/* ─────────────────────────── 11. اللغة والتصدير ─────────────────────────── */

function applyLang() {
  const d = I18N[db.lang].dir;
  document.documentElement.lang = db.lang;
  document.documentElement.dir = d;
  document.title = I18N[db.lang].app;
  els.gateTitle.textContent = T('gateTitle');
  els.gateSub.textContent = T('gateSub');
  els.gateNote.textContent = T('gateNote');
  if (!camStarted) els.btnStart.textContent = T('gateStart');
  els.listTitle.textContent = T('stock');
  els.sheetTitle.textContent = T('details');
  els.rawBox.querySelector('.rawHead').textContent = T('rawTitle');
  const lbl = { fTracking: 'tracking', fClient: 'client', fDest: 'dest', fAmount: 'amount', fCr: 'cr', fPhone: 'phone', fDate: 'date' };
  for (const [id, key] of Object.entries(lbl)) {
    const sp = els[id].closest('label').querySelector('span');
    if (sp) sp.textContent = T(key);
  }
  els.btnSave.textContent = T('save');
  els.btnDelete.textContent = T('del');
  els.btnOut.textContent = T('out');
  els.btnBackIn.textContent = T('backIn');
  for (const b of document.querySelectorAll('.tab')) {
    b.textContent = T({ in: 'inStock', alert: 'alerts', out: 'log' }[b.dataset.tab]);
  }
  paintEngine(); paintCount();
  if (listOpen) paintList();
}

function cycleLang() {
  const order = ['ar', 'fr', 'en'];
  db.lang = order[(order.indexOf(db.lang) + 1) % order.length];
  persist();
  applyLang();
  if (listOpen) paintList();
}

function exportCsv() {
  if (!db.items.length) return toast(T('none'));
  const head = ['tracking', 'client', 'dest', 'amount', 'cr', 'phone', 'date', 'at', 'outAt', 'src'];
  const lines = [head.join(',')];
  for (const i of db.items) {
    lines.push([i.tracking, i.client, i.dest, i.amount, i.cr, i.phone, i.date,
      new Date(i.at).toISOString(), i.outAt ? new Date(i.outAt).toISOString() : '', i.src]
      .map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
  }
  const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `kazistock-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  toast(T('exportDone', db.items.length));
}

/* ─────────────────────────── 12. الإقلاع ─────────────────────────── */

function cacheEls() {
  for (const id of ['viewScan', 'viewList', 'video', 'roi', 'brackets', 'gate', 'gateTitle', 'gateSub',
    'gateNote', 'btnStart', 'btnLang', 'btnList', 'btnTorch', 'btnManual', 'engineDot', 'engineText',
    'flash', 'flashNum', 'flashRows', 'strip', 'countBig', 'scanBottom', 'listTitle', 'btnBack',
    'btnExport', 'sumLabel', 'sumCount', 'sumValue', 'btnAlertLine', 'tabs', 'items', 'sheetMask',
    'sheet', 'sheetTitle', 'btnSheetClose', 'fTracking', 'fClient', 'fDest', 'fAmount', 'fCr',
    'fPhone', 'fDate', 'rawBox', 'rawText', 'btnDelete', 'btnOut', 'btnBackIn', 'btnSave', 'toast']) {
    els[id] = document.getElementById(id);
  }
}

function wire() {
  els.btnStart.addEventListener('click', startCamera);
  els.btnLang.addEventListener('click', cycleLang);
  els.btnList.addEventListener('click', openList);
  els.btnBack.addEventListener('click', closeList);
  els.btnExport.addEventListener('click', exportCsv);
  els.btnManual.addEventListener('click', () => {
    // إدخال يدوي يوقف المسح ما دامت اللوحة مفتوحة
    paused = true; paintEngine();
    openSheet(newRecord(), true);
  });
  els.btnTorch.addEventListener('click', toggleTorch);
  els.btnAlertLine.addEventListener('click', () => {
    const n = db.alertDays >= ALERT_DAYS_MAX ? ALERT_DAYS_MIN : db.alertDays + 1;
    db.alertDays = n; persist(); paintList(); toast(T('alertMany', n));
  });
  els.tabs.addEventListener('click', e => {
    const b = e.target.closest('.tab'); if (!b) return;
    tab = b.dataset.tab;
    for (const x of els.tabs.children) x.classList.toggle('on', x === b);
    paintList();
  });
  els.btnSheetClose.addEventListener('click', closeSheet);
  els.sheetMask.addEventListener('click', closeSheet);
  els.btnSave.addEventListener('click', saveSheet);
  els.btnDelete.addEventListener('click', () => {
    const it = db.items.find(i => i.id === editingId);
    if (!it) return closeSheet();
    db.items = db.items.filter(i => i.id !== editingId);
    persist(); closeSheet(); paintList(); paintCount(); toast(T('deleted'));
  });
  els.btnOut.addEventListener('click', () => {
    const it = db.items.find(i => i.id === editingId);
    if (!it) return closeSheet();
    it.outAt = Date.now();
    persist(); closeSheet(); paintList(); paintCount(); toast(T('out'));
  });
  els.btnBackIn.addEventListener('click', () => {
    const it = db.items.find(i => i.id === editingId);
    if (!it) return closeSheet();
    it.outAt = 0; it.at = Date.now();
    persist(); closeSheet(); paintList(); paintCount(); toast(T('restored'));
  });
  document.addEventListener('visibilitychange', () => { lastTry = 0; });
  window.addEventListener('beforeunload', persist);
}

function toggleTorch() {
  if (!stream) return;
  const track = stream.getVideoTracks()[0];
  const caps = track.getCapabilities ? track.getCapabilities() : {};
  if (!caps.torch) { toast(T('engFailed')); return; }
  torchOn = !torchOn;
  track.applyConstraints({ advanced: [{ torch: torchOn }] }).catch(() => { torchOn = false; });
  els.btnTorch.classList.toggle('on', torchOn);
}

function init() {
  cacheEls(); load(); wire(); applyLang();
  paintCount(); paintEngine();
  paintStrip({});
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* يعمل بدونه، لكن بلا عمل دون اتصال */ });
  }
}

document.addEventListener('DOMContentLoaded', init);
