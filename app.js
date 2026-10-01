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
    reference: 'المرجع',
    client: 'المستلم',
    dest: 'وكالة الوصول',
    amount: 'المبلغ',
    cr: 'الدفع عند الاستلام',
    phone: 'الهاتف',
    sender: 'المرسل',
    senderTel: 'هاتف المرسل',
    agenceFrom: 'وكالة الانطلاق',
    parcelNo: 'رقم الطرد',
    parcelType: 'النوع',
    paid: 'حالة الدفع',
    codeTri: 'رمز الفرز',
    remark: 'ملاحظة',
    date: 'تاريخ الإنشاء',
    rawTitle: 'النص المقروء من الملصق',
    details: 'التفاصيل',
    needTrack: 'رقم التتبع هو 7 أرقام',
    manual: 'إدخال يدوي',
    exportDone: 'تم تصدير %1$s سطرًا',
    dupe: 'هذا الرقم مسجَّل مسبقًا',
    scanned: 'المسح جارٍ',
    paused: 'متوقّف',
    /* تحذيرات الملصق — قواعد مواصفة النوع A، القسم 6 */
    alRef: 'المرجع لا ينتهي برقم التتبع',
    alPhone: 'رقم هاتف ناقص — 10 أرقام مطلوبة',
    alCr: 'دفعة عند الاستلام — يجب تحصيلها',
    alZero: 'المبلغ صفر مع «غير مدفوع» — راجع المبلغ',
    alDesk: '«Stop desk» — التسليم في الوكالة',
    alQr: 'الرمز المطبوع والنص المقروء غير متطابقين',
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
    reference: 'Référence',
    client: 'Destinataire',
    dest: 'Agence d\'arrivée',
    amount: 'Montant',
    cr: 'Paiement à la livraison',
    phone: 'Téléphone',
    sender: 'Expéditeur',
    senderTel: 'Tél. expéditeur',
    agenceFrom: 'Agence de départ',
    parcelNo: 'N° de colis',
    parcelType: 'Type',
    paid: 'Statut de paiement',
    codeTri: 'Code de tri',
    remark: 'Remarque',
    date: 'Date de création',
    rawTitle: 'Texte lu sur l\'étiquette',
    details: 'Détails',
    needTrack: 'Le numéro de suivi fait 7 chiffres',
    manual: 'Saisie manuelle',
    exportDone: '%1$s lignes exportées',
    dupe: 'Ce numéro est déjà enregistré',
    scanned: 'Lecture en cours',
    paused: 'En pause',
    /* Alertes étiquette — règles de la spec type A, section 6 */
    alRef: 'La référence ne se termine pas par le tracking',
    alPhone: 'Téléphone incomplet — 10 chiffres requis',
    alCr: 'Paiement à la livraison — à encaisser',
    alZero: 'Montant 0 avec « Non-Payé » — vérifiez le montant',
    alDesk: '« Stop desk » — remise à l\'agence',
    alQr: 'Le QR et le texte imprimé ne concordent pas',
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
    reference: 'Reference',
    client: 'Recipient',
    dest: 'Arrival agency',
    amount: 'Amount',
    cr: 'Cash on delivery',
    phone: 'Phone',
    sender: 'Sender',
    senderTel: 'Sender phone',
    agenceFrom: 'Origin agency',
    parcelNo: 'Parcel no.',
    parcelType: 'Type',
    paid: 'Payment status',
    codeTri: 'Sorting code',
    remark: 'Remark',
    date: 'Created on',
    rawTitle: 'Text read on the label',
    details: 'Details',
    needTrack: 'The tracking number is 7 digits',
    manual: 'Manual entry',
    exportDone: '%1$s rows exported',
    dupe: 'This number is already recorded',
    scanned: 'Scanning',
    paused: 'Paused',
    /* Label alerts — type A spec, section 6 */
    alRef: 'Reference does not end with the tracking number',
    alPhone: 'Incomplete phone — 10 digits required',
    alCr: 'Cash on delivery — to be collected',
    alZero: 'Amount 0 with "Non-Payé" — check the amount',
    alDesk: '"Stop desk" — delivery at the agency',
    alQr: 'QR code and printed text disagree',
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

/* ─────────────────────────── 4. بيانات الملصق، مواصفة النوع A ─────────────────────
   المرجع: `kazi_tour_etiquette_type_a_spec.md`.

   **سبب الاختلاف الجذري:** المواصفة تنصّ في القسم 3 أن الملصق مطبوع في
   **عمودين**، وأن القراءة يجب أن تكون **بكتل** لا سطرًا سطرًا، «وإلا خلط
   المرسل بالمستلم». والكود القديم كان يقرأ سطرًا سطرًا، وجدول مرادفاته كان
   يضع `expediteur` و `destinataire` في الحقل نفسه، فكان يخلط العمودين.

   فالمسار صار: **لقطة واحدة** → تقطيع إلى مناطق بنسبة مواضعها → قراءة كل
   منطقة وحدها. كل الحقول من **لحظة واحدة**، فلا تختلط منطقة مع أخرى ولو
   حرّكتَ الملصق.

   ومبدأ لا يُخترق: **النص الكامل يُحفظ دائمًا**. إن أخطأت القراءة، فالأصل
   موجود ويمكن مراجعته وتعديله — لا يضيع شيء.
   ──────────────────────────────────────────────────────────────────────── */

/* جدول المناطق: نسخٌ من جدول المواصفة القسم 3، بالنسب المئوية على إطار
   القراءة. `qr: true` تعني أن المنطقة تُقرأ بالباركود لا بالتحليل البصري. */
const LABEL_ZONES = [
  { key: 'topLeft',  x: [5, 43],  y: [14, 27], fields: ['tracking', 'reference', 'date'] },
  { key: 'topMid',   x: [45, 74], y: [14, 27], fields: ['parcelNo', 'parcelType', 'paid'] },
  { key: 'codeTri',  x: [7, 43],  y: [38, 52], fields: ['codeTri'] },
  { key: 'qr',       x: [63, 79], y: [37, 58], qr: true },
  { key: 'mid',      x: [20, 80], y: [57, 66], fields: ['amount', 'cr'] },
  { key: 'sender',   x: [9, 33],  y: [66, 78], fields: ['sender', 'senderTel'] },
  { key: 'recipient',x: [59, 80], y: [67, 79], fields: ['client', 'phone'] },
  { key: 'agence',   x: [8, 90],  y: [80, 87], fields: ['agenceFrom', 'dest'] },
  { key: 'remark',   x: [8, 65],  y: [87, 92], fields: ['remark'] },
];

function emptyFields() {
  return {
    tracking: '', reference: '', date: '',
    parcelNo: '', parcelType: '', paid: '', codeTri: '',
    amount: 0, cr: 0,
    sender: '', senderTel: '', client: '', phone: '',
    agenceFrom: '', dest: '', remark: '',
  };
}

/* ── قراءات المناطق. كل واحدة تأخذ نص منطقة واحدة، لا النص كله ── */

/** « Référence : 1-9594567-9554519 ». البادئة قد تكون حرفًا أو رقمًا. */
function parseReference(t) {
  const m = String(t || '').match(
    /([A-Za-z]?\s*\d{0,3}\s*[-\u2013\u2014_]\s*\d{7}\s*[-\u2013\u2014_]\s*\d{7}(?:\s*[-\u2013\u2014_]\s*\d{1,4})?)/);
  return m ? m[1].replace(/\s+/g, '').replace(/[\u2013\u2014]/g, '-') : '';
}
/** المواصفة: « la référence doit se terminer par le tracking ». فإذا وُجدت
 *  مرجعية، فالرقم **نهايتها**؛ وإلا فأي مجموعة سباعية في المنطقة. */
function parseZoneTracking(t) {
  const s = String(t || '');
  const ref = s.match(/(\d{7})\s*[-\u2013\u2014_]\s*(\d{7})/);
  if (ref) return ref[2];
  const n = s.match(/(?:^|\D)(\d{7})(?!\d)/);
  return n ? n[1] : '';
}
/** « Créé le : 2026-10-01 09:04:03 » → ‎01/10/2026 09:04 */
function parseCreated(t) {
  const m = String(t || '').match(
    /(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (!m) return '';
  return m[3] + '/' + m[2] + '/' + m[1] +
    (m[4] ? ' ' + m[4].padStart(2, '0') + ':' + m[5] : '');
}
/** « N° de Colis : 1 / 1 » */
function parseParcelNo(t) {
  const m = String(t || '').match(/(\d{1,3})\s*[\/|]\s*(\d{1,3})/);
  return m ? m[1] + ' / ' + m[2] : '';
}
/** « Type : Carton » */
function parseType(t) {
  const m = String(t || '').match(/\btype\s*[:=]?\s*([A-Za-z][A-Za-z ._-]{1,24})/i);
  return m ? cleanValue(m[1]) : '';
}
/** « Non-Payé » أو « Payé ». الترتيب مقصود: « Non » أولًا وإلا لُقط « Payé»
 *  داخل « Non-Payé » فصار الطرد مدفوعًا وهو غير مدفوع. */
function parsePaid(t) {
  const s = String(t || '');
  if (/non[-\s]?pay/i.test(s)) return 'Non-Pay\u00e9';
  if (/(?:^|[\s:])pay/i.test(s)) return 'Pay\u00e9';
  return '';
}
/** « 3-1/1 » داخل إطار مستطيل — بصمة لا تشبه شيئًا آخر على الملصق. */
function parseCodeTri(t) {
  const m = String(t || '').match(/(\d{1,2})\s*[\u2013\u2014-]\s*(\d{1,2})\s*[\/|]?\s*(\d{1,2})/);
  return m ? m[0].replace(/\s+/g, '') : '';
}
/** مبلغ يسبقَه لفظه: نأخذ **أول عدد بعد اللفظ**. النمط يجمع الأرقام والفواصل
 *  فقط ثم يتولّى `moneyToken` شرحها — فلا نقتطع رقماً ناقصاً. */
function parseZoneMoney(t, re) {
  const s = normalizeOcr(String(t || ''));
  const hit = s.match(re);
  if (!hit) return 0;
  const rest = s.slice(hit.index + hit[0].length);
  const n = rest.match(/\d[\d .,\u00A0]{0,18}/);
  return n ? parseMoney(moneyToken(n[0])) : 0;
}

/** سطرُ هاتف: أرقامه 9..13، وما بقي منه حروف لا يتجاوز حرفين. */
function isPhoneLine(line) {
  const d = line.replace(/\D/g, '');
  if (d.length < 9 || d.length > 13) return false;
  return line.replace(/[\d\s.\-\/()]/g, '').length <= 2;
}
const PERSON_HEAD = /^(exp[eé]diteur|destinataire|client|nom)\b/i;
const PERSON_STRIP = /^\s*(exp[eé]diteur|destinataire|client|nom|tel(?:e?phone)?|t\.?\s?l\.?)\s*[:.]?\s*/i;
const FIELD_TITLE = /exp[eé]diteur|destinataire|client|nom|destination|adresse|address|tel|telephone|montant|total|c\.?\s?r\b|valeur|prix|remarque|tracking|r[eé]f[eé]rence|colis|type|pay[eé]|agence|statut|cr[eé]e/i;

/** « Expéditeur » ثم الاسم (سطر أو سطران) ثم الهاتف. إن ظهر عنوانُ شخصٍ
 *  ثانٍ فالمنطقة تتضمّن عمودين — عندئذ نتوقّف، فلا يُلحق اسمُ المستلم
 *  باسمِ المرسل في خانة واحدة. */
function parsePerson(t) {
  const lines = normalizeOcr(String(t || '')).split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const names = [];
  let tel = '';
  for (let i = 0; i < lines.length; i++) {
    if (i > 0 && PERSON_HEAD.test(lines[i])) break;
    const line = cleanValue(lines[i].replace(PERSON_STRIP, ''));
    if (!line) continue;
    if (!tel && isPhoneLine(line)) { tel = cleanPhone(line) || ''; continue; }
    names.push(line);
  }
  return { name: names.join(' ').trim(), tel };
}
/** وكالتا الانطلاق والوصول : « SEBDOU ────────► LAGHOUAT ».
 *
 *  كان الرمز يقسّم النصّ على محرف السهم وحده فيفشل بصمت: محرّك القراءة
 *  يقرأ السهم المرسوم `-_—` لا `►`، فلا يقع انقسام، فتسقط الكلمةُ
 *  الوحيدة في خانة الوصول فيأخذ الوصول اسم الانطلاق. ولا يظهر الخلل
 *  إلا بمراجعة سجلّ. الآن: إن وُجد سهمٌ مقروء قُسّم عليه؛ وإلا فالموضع
 *  في الملصق هو المرجع، فالأول انطلاقة والآخر وصول. ولا نخمّن بلا
 *  دليل: اسمٌ واحد بلا سهم يُسجَّل انطلاقةً ويبقى الوصول فارغًا ليملأه
 *  العامل من اللائحة. */
const AGENCY_WORD = '[A-Z\u00C0-\u00DE][A-Z\u00C0-\u00DE]{2,}';
/* فاصلٌ بين وكالتَي الانطلاق والوصول.
 *
 *  محرفُ السهم الواحد لا يكفي: محرّك القراءة يرسم السهم `-_—` في أكثر
 *  الأحوال، وهي ثلاثة محارف لا واحد. فنقبل أيّ سهم: المحرفَ الحقيقي،
 *  أو سهمًا ASCII، أو **أيّ** أثرٍ ممحوٍ من محارف الترقيم المتتالية —
 *  لأن موضع الاسم يمينَه أو يسارَه هو ما يحدّد معناه. */
const AGENCY_ARROW = /(?:[>\u25ba\u25b6\u2192]+|->|-{2,}|[-_=~*\u2010-\u2015]{2,})/;
function parseAgence(t) {
  const s = normalizeOcr(String(t || '')).toUpperCase();
  const pick = h => { const m = h.match(new RegExp('(' + AGENCY_WORD + ')')); return m ? m[1] : ''; };
  const halves = s.split(AGENCY_ARROW).map(h => h.trim());
  const all = s.match(new RegExp(AGENCY_WORD, 'g')) || [];
  const uniq = all.filter((w, k) => all.indexOf(w) === k);

  // فاصلٌ مقروء: ما قبل السهم هو الانطلاق، وما بعده هو الوصول.
  // فقد يقع الاسم في القسم الأخير لا الثاني، فنقرأ كلَّ ما بعده.
  if (halves.length >= 2) {
    const from = pick(halves[0] || '');
    const rest = halves.slice(1).map(h => pick(h)).filter(Boolean);
    const to = rest.length ? rest[rest.length - 1] : '';
    if (from && to) return { from, to };
    if (to) return { from: '', to };
    if (from) return { from, to: '' };
  }

  // بلا فاصل مقروء، وهو الغالب لأن السهم يُمحى: ترتيبُ النصّ في الملصق
  // هو المرجع، فالأول انطلاقة والآخر وصول. وبلا دليل نملأ الانطلاق
  // فقط، ويترك العامل الوصول فارغًا ليصحّحه من اللائحة.
  if (uniq.length >= 2) return { from: uniq[0], to: uniq[uniq.length - 1] };
  return { from: uniq.length === 1 ? uniq[0] : '', to: '' };
}
/** « Remarque » نصٌّ حرّ، وتعدّد أسطره لا يفسده: يُوصل بشرطة. */
function tidyFree(t) {
  return normalizeOcr(String(t || '')).split(/\r?\n/)
    .map(s => cleanValue(s.replace(/^\s*remarque\s*[:.]?\s*/i, '')))
    .filter(Boolean).join(' / ');
}

/** التنبيهات — قواعد المواصفة القسم 6، بالترتيب نفسه. */
function validateLabel(rec) {
  const a = [];
  if (rec.reference && rec.tracking &&
      !rec.reference.replace(/\s/g, '').endsWith(rec.tracking)) a.push('alRef');
  if (rec.phone && rec.phone.length !== 10) a.push('alPhone');
  if (rec.senderTel && rec.senderTel.length !== 10) a.push('alPhone');
  if (rec.cr > 0) a.push('alCr');
  if (!rec.amount && /^non/i.test(rec.paid || '')) a.push('alZero');
  if (/stop\s*desk/i.test(rec.remark || '')) a.push('alDesk');
  if (rec.qrConflict) a.push('alQr');
  return a;
}

/** تجميع نهائي: المواضع أولًا، ثم النص العام فيما لم تجده. */
function extractLabel(parts) {
  const out = emptyFields();
  const Z = {};
  for (const p of (parts || [])) Z[p.key] = normalizeOcr(p.text || '');

  const tl = Z.topLeft || '';
  out.reference = parseReference(tl);
  out.tracking = parseZoneTracking(tl);
  out.date = parseCreated(tl);

  const tm = Z.topMid || '';
  out.parcelNo = parseParcelNo(tm);
  out.parcelType = parseType(tm);
  out.paid = parsePaid(tm);
  out.codeTri = parseCodeTri(Z.codeTri || '');

  const mid = Z.mid || '';
  out.amount = parseZoneMoney(mid, /total/i);
  out.cr = parseZoneMoney(mid, /\bc\s*\.?\s*r/i);

  const snd = parsePerson(Z.sender || '');
  out.sender = snd.name; out.senderTel = snd.tel;
  const rcp = parsePerson(Z.recipient || '');
  out.client = rcp.name; out.phone = rcp.tel;

  const ag = parseAgence(Z.agence || '');
  out.agenceFrom = ag.from; out.dest = ag.to;
  out.remark = tidyFree(Z.remark || '');

  /* ── مسار الانحدار: إن كان الإطار منحرفًا لم تصلح المناطق، نبحث في
     النص الكامل عمّا لم يُقرأ. يملأ **الفراغ فقط**، فلا يُفسد ما ضبطته
     المواضع — وهذا ما يحمي المرسل من أن ينزلق إلى حقل المستلم. */
  const whole = (parts || []).map(p => p.text || '').join('\n');
  const g = extractFields(whole);
  const take = (k) => { if (!out[k] && g[k] !== '' && g[k] !== 0) out[k] = g[k]; };
  for (const k of ['client', 'dest', 'phone', 'sender', 'senderTel', 'reference',
                   'remark', 'date', 'amount', 'cr']) take(k);
  if (!out.tracking && g.tracking) out.tracking = g.tracking;
  if (!out.paid) out.paid = parsePaid(whole);
  // المرجع شكلٌ فريد في الملصق كلّه: مجموعتان سباعيتان موصولتان بشرطة.
  // وبلا منطقة يُعرف من لفظه، لا من موضعه — فهذه قراءةٌ آمنة.
  if (!out.reference) out.reference = parseReference(whole);
  // رمز الفرز داخل إطار مستطيل: الموضعُ هو ما يميّزه لا شكلُه. فبلا
  // منطقة يلتقط من سطر المرجع رقمًا لا غير — فنُبقيه للمناطق وحدها.
  return out;
}

/* ─────────────────────────── 4b. مسار الانحدار: النص العام ───────────────────
   يعمل حين تكون المواضع غير مقروءة (إطار منحرف، ملصق بعيد، تكدّس أظرف).
   هنا لا ضمانة للفصل بين العمودين، فالبحث بالكلمة المفتاحية وحدها — وقد
   يخلط. لذلك يُستدعى **بعد** قراءات المواضع، ويلمأ الفراغ فقط.
   ──────────────────────────────────────────────────────────────────────── */

const FIELDS = {
  client: ['client', 'nom', 'name', 'destinataire', 'الزبون', 'العميل', 'العميل'],
  dest:   ['destination', 'destin', 'adresse', 'address', 'livré à', 'ville', 'gare',
           'الوجهة', 'العنوان', 'المدينة'],
  amount: ['montant', 'amount', 'valeur', 'value', 'prix', 'total', 'المبلغ', 'القيمة', 'المجموع'],
  cr:     ['c.r', 'contre remboursement', 'contre-remboursement', 'paiement a la livraison',
           'pay on delivery', 'cod', 'الدفع عند الاستلام', 'عند الاستلام', 'الدفع'],
  sender: ['expéditeur', 'expediteur', 'exp.', 'المرسل'],
  senderTel: ['expéditeur', 'expediteur', 'المرسل'],
  phone:  ['tel', 'telephone', 'phone', 'gsm', 'mobile', 'الهاتف', 'هاتف', 'تلفون'],
  reference: ['référence', 'reference', 'ref'],
  remark: ['remarque', 'ملاحظة', 'ملاحظه'],
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
 *  مبلغًا لا معنى له. نأخذ عددًا واحدًا فقط، ونرفض ما يتجاوز الحدّ.
 *
 *  `+` على grupo الآلاف و `?` على الخانات العشرية — **كلاهما ضروري**:
 *  - بـ `*` كان يُقتطع «8000,00» إلى «800»، لأن `\d{1,3}` يقف عند ثلاثة.
 *  - بلا `?` كان يفشل الفرع كله على «12 500» (مبلغ صحيح بلا كسور) فيعود
 *    إلى «12» وحده. وكلاهما يمرّ بصمت لأن مختبَره كان مبالغًا بخانتين. */
function moneyToken(v) {
  if (v == null) return null;
  const m = String(v).match(/\d{1,3}(?:[  .]\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?/);
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
    case 'senderTel':
      return cleanPhone(v) !== null;
    case 'date':
      return /\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}/.test(v)
          || /\d{4}-\d{2}-\d{2}/.test(v);
    case 'parcelNo':
      return /^\d{1,3}\s*[\/|]\s*\d{1,3}$/.test(cleanValue(v));
    case 'codeTri':
      return /^\d{1,2}-\d{1,2}\/\d{1,2}$/.test(cleanValue(v));
    default:
      return /[\p{L}]/u.test(v) && v.length <= 60;   // اسم أو وجهة: لا أرقام وحدها
  }
}
function fieldSet(out, key, v) {
  if (!fieldOk(key, v)) return false;
  if (key === 'amount' || key === 'cr') out[key] = parseMoney(moneyToken(v));
  else if (key === 'phone' || key === 'senderTel') out[key] = cleanPhone(v);
  else if (key === 'date') {
    const iso = v.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (iso) { out.date = iso[3] + '/' + iso[2] + '/' + iso[1]; return true; }
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

/** كتلة العنوان ثم اسمه: العنوان ثابت في المواصفة (القسم 3)، والاسم في
 *  السطر التالي أو السطرين، والهاتف بعده. نتوقّف عند أي عنوان آخر حتى لا
 *  نجمع الحقول التي تليه في خانة الاسم. */
function personBlock(lines, re) {
  for (let i = 0; i < lines.length; i++) {
    if (!re.test(lines[i])) continue;
    const seg = [];
    for (let j = i + 1; j < lines.length && j <= i + 3; j++) {
      if (FIELD_TITLE.test(lines[j])) break;
      seg.push(lines[j]);
      if (isPhoneLine(lines[j])) break;
    }
    if (seg.length) {
      const p = parsePerson(seg.join('\n'));
      if (p.name || p.tel) return p;
    }
  }
  return { name: '', tel: '' };
}

function extractFields(text) {
  const out = emptyFields();
  if (!text) return out;
  const lines = normalizeOcr(text).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const whole = normalizeOcr(text);
  out.tracking = extractTracking(whole) || '';

  // 0) العناوين الثابتة أولًا: هي الأدقّ، لأنها تحدّد **العمود** لا الكلمة
  const snd = personBlock(lines, /^(exp[eé]diteur|expéditeur)\b/i);
  const rcp = personBlock(lines, /^(destinataire|client)\b/i);
  if (snd.name) out.sender = snd.name;
  if (snd.tel) out.senderTel = snd.tel;
  if (rcp.name) out.client = rcp.name;
  if (rcp.tel) out.phone = rcp.tel;

  // 1) قيمة موجودة بعد كلمة مفتاحية، في نفس السطر
  for (const line of lines) {
    for (const key of Object.keys(FIELDS)) {
      if (filled(out, key)) continue;
      const v = valueAfterAlias(line, FIELDS[key]);
      if (v) fieldSet(out, key, v);
    }
  }

  // 2) قواعد عامة لما لم يُلتقط أعلاه
  if (!out.phone) {
    // سطرًا سطرًا: لو فُصل رقمٌ عن سطره بعلامة سطرٍ جديد، لانضمّ رقمان
    // مختلفان في رقمٍ واحد خاطئ. ثم نتحقّق من الطول — لا نتعرّف على رقم
    // من نصٍّ كثير كالرقم المرجعي.
    //
    // والشرط **أن يبدأ بصفر**: المواصفة القسم 5 تنصّ على ذلك. بدونه كان
    // تاريخ الإنشاء «2026-10-01 09» يمرّ كرقم هاتف من عشرة أرقام.
    //
    // والمهمّ: **لا ننظر إلى رقمٍ ادّعاءه شخصٌ آخر**. لولا هذا الشرط لأخذ
    // هاتفُ المرسل مكان هاتف المستلم — وهو بالضبط ما تحذّر منه المواصفة.
    const claimed = new Set([out.phone, out.senderTel].filter(Boolean));
    for (const line of lines) {
      const cands = line.match(/\+?\d[\d .()\/-]{7,18}\d/g) || [];
      for (const c of cands) {
        const p = cleanPhone(c);
        if (p && p[0] === '0' && p.length >= 9 && p.length <= 10 && !claimed.has(p)) {
          out.phone = p; break;
        }
      }
      if (out.phone) break;
    }
  }
  if (!out.date) {
    const m = normalizeOcr(text).match(/\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})\b/);
    if (m) out.date = m[1].padStart(2, '0') + '/' + m[2].padStart(2, '0') + '/' + m[3];
  }
  if (!out.paid) out.paid = parsePaid(whole);
  // المرجع شكلٌ فريد في الملصق كلّه: مجموعتان سباعيتان موصولتان بشرطة.
  // وبلا منطقة يُعرف من لفظه، لا من موضعه — فهذه قراءةٌ آمنة.
  if (!out.reference) out.reference = parseReference(whole);
  // رمز الفرز داخل إطار مستطيل: الموضعُ هو ما يميّزه لا شكلُه. فبلا
  // منطقة يلتقط من سطر المرجع رقمًا لا غير — فنُبقيه للمناطق وحدها.
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
  lib: 'vendor/tesseract/tesseract.min.js',
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

/** تحميل مكتبة المحرّك عند الحاجة وحدها.
 *
 *  الملف كان مُدرَجًا في قائمة عامل الخدمة ولم يُحمَّل به ولا مرّة: لا وسم
 *  script في الصفحة، ولا نداء يُحمّله. فكان `window.Tesseract` غير
 *  موجود أبدًا، والتحليل البصري **معطّل من الأصل** — والمرور كلّه على
 *  الباركود وحده، والصمت الذي يوهم بأنه يعمل.
 *
 *  التحميل كسول عمدًا: لا نُحمّل 174 ك.ب إلا حين يبدأ المستخدم المسح،
 *  فالنتيجة الأولى تبقى فورية، وإن أخفق الملف يبقى الباركود يعمل. */
let tessPromise = null;
function loadTesseract() {
  if (window.Tesseract) return Promise.resolve(true);
  if (tessPromise) return tessPromise;
  tessPromise = new Promise(res => {
    const s = document.createElement('script');
    s.src = VENDOR.lib;
    s.async = true;
    s.onload = () => res(!!window.Tesseract);
    s.onerror = () => res(false);
    document.head.appendChild(s);
  });
  return tessPromise;
}

/** تهيئة محرّك التحليل البصري. الملفات محلية، فلا شبكة ولا طرف ثالث. */
async function initOcr() {
  if (engine.ocrState !== 'idle') return;
  engine.ocrState = 'loading'; paintEngine();
  try {
    // ننتظر عامل الخدمة حتى يسيطر على الصفحة: هو من يعيد توجيه ملف
    // نواة WebAssembly إلى النسخة المتوافقة مع هذا المتصفح.
    await waitForController();
    if (!await loadTesseract()) throw new Error('moteur absent');
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

/* ── قطع إطار واحد إلى مناطق الملصق (المواصفة القسم 3) ──
   **لقطة واحدة** ثم ثماني قطع. هكذا تأتي كل الحقول من *لحظة واحدة*، فلا
   تختلط منطقة مع أخرى ولو حرّك المستخدمُ الملصق أثناء القراءة.
   لوحة لكل منطقة بالترتيب: مستهلكٌ واحد في كل لحظة، وإعادة الاستخدام
   بالرقم تتفادى التخصيص في كل إطار. */
const ZONE_MIN_W = 420;   // حرفٌ صغير بلا تكبير = قراءة فاشلة

function cropZone(fr, z, i) {
  const sx = Math.round(fr.w * z.x[0] / 100), sy = Math.round(fr.h * z.y[0] / 100);
  const sw = Math.round(fr.w * (z.x[1] - z.x[0]) / 100);
  const sh = Math.round(fr.h * (z.y[1] - z.y[0]) / 100);
  if (sw < 12 || sh < 8) return null;
  const k = Math.min(3, Math.max(1, ZONE_MIN_W / sw));
  const w = Math.round(sw * k), h = Math.round(sh * k);
  const c = grabCanvas(w, h, 'z' + i);
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(fr.canvas, sx, sy, sw, sh, 0, 0, w, h);
  return enhance(ctx, w, h).canvas;
}

function grabZones() {
  const fr = grabRoi(1200, 'ocr');
  if (!fr) return null;
  const zones = [];
  LABEL_ZONES.forEach((z, i) => {
    if (z.qr) return;                       // منطقة الـ QR: للباركود لا للتحليل
    zones.push({ key: z.key, canvas: cropZone(fr, z, i) });
  });
  return zones;
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
  const zones = grabZones();
  if (!zones) return;
  const parts = [];
  for (const z of zones) {
    if (!z.canvas) { parts.push({ key: z.key, text: '' }); continue; }
    try {
      const res = await engine.ocrWorker.recognize(z.canvas);
      parts.push({ key: z.key, text: res && res.data ? res.data.text : '' });
    } catch (e) {
      parts.push({ key: z.key, text: '' });   // منطقة واحدة فشلت: نكمل
    }
  }
  onZones(parts);
}

/* ─────────────────────────── 7. نقطة الالتقاء: الحفظ ─────────────────────────── */

function onBarcode(raw) {
  const t = trackingFromBarcode(raw);
  if (!t) return;
  if (engine.ocrState === 'ready') {
    // ننتظر التحليل البصري: هو سيأتي ببقية البيانات، ورقم التتبع دقيق هنا
    pendingTracking = t; pendingAt = Date.now();
  } else {
    if (canCommit(t)) commit(t, emptyFields(), '', 'barcode', false);
  }
}

/** نقطة دخول بنصٍّ واحد، حين لا تأتي المناطق (قراءة كاملة لملصق مجهول).
 *  تمرّ إلى المحرك نفسه، فلا يوجد مسار ثانٍ للتسجيل. */
function onOcr(text) {
  if (!text) return;
  onZones([{ key: 'whole', text }]);
}

/** نقطة الالتقاط الوحيدة: مناطقُ التسع، أو نصٌّ واحد في مسار الانحدار. */
function onZones(parts) {
  const fields = extractLabel(parts);
  const raw = parts.map(p => (p.text ? String(p.text).trim() : '')).filter(Boolean).join('\n');
  const fromText = fields.tracking || null;

  /* المواصفة القسم 4: **قيمة الـ QR تقدّم على قراءة النص**. رقمٌ من صورة
   * رقمية لا يُخطئ، بخلاف حرفٍ يقرأه محرّك. وكان الكود يفعل العكس. */
  const t = pendingTracking || fromText;
  if (!t) return;
  if (!canCommit(t)) return;

  const qrConflict = !!(pendingTracking && fromText && pendingTracking !== fromText);
  const src = pendingTracking && fromText ? 'barcode+ocr' : (fromText ? 'ocr' : 'barcode');
  commit(t, fields, raw, src, qrConflict);
}

/** يمنع تكرار الملصق الواحد: نفس الرقم، أو نافذة تبريد، أو إدخال مزدوج. */
function canCommit(t) {
  const now = Date.now();
  if (now < cooldownUntil) return false;
  if (t === lastCommitted) return false;          // ما زال أمام العدسة
  if (db.items.some(i => i.tracking === t && !i.outAt)) return false;  // مسجَّل فعلًا
  return true;
}

function commit(tracking, fields, raw, src, qrConflict) {
  lastCommitted = tracking;
  pendingTracking = null;
  cooldownUntil = Date.now() + COOLDOWN_MS;

  const rec = Object.assign(emptyFields(), fields, {
    id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    tracking,
    qrConflict: !!qrConflict,
    raw: raw || '',
    src: src || '',
    at: Date.now(),
    outAt: 0,
  });
  rec.alerts = validateLabel(rec);
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
  // التحذيرات: نقطة حمراء واحدة. التوسيع إلى نصّ يوقف القراءةَ بعينها،
  // والتفصيل كلّه في اللائحة — فلا يُفتح شيء بين ملصق وآخر.
  els.flashFlags.textContent = (rec.alerts && rec.alerts.length) ? '⚠' : '';
  els.flashFlags.title = (rec.alerts || []).map(k => T(k)).join(' · ');
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
    (it.alerts && it.alerts.length
      ? `<div class="cFlags">${it.alerts.map(k => `<span class="warnTag">${esc(T(k))}</span>`).join('')}</div>`
      : '') +
    (meta.length ? `<div class="cMeta">${meta.join(' · ')}</div>` : '') +
    (valueOf(it) ? `<div class="cVal">${esc(money(valueOf(it)))}</div>` : '');

  li.addEventListener('click', () => openSheet(it));
  return li;
}

/* ─────────────────────────── 10. لوحة التحرير ─────────────────────────── */

/** سجل فارغ للإدخال اليدوي: نفس الشكل تمامًا كسجل مقروء. */
function newRecord() {
  return Object.assign(emptyFields(), {
    id: '', qrConflict: false, alerts: [], raw: '', src: 'manual',
    at: Date.now(), outAt: 0,
  });
}

/** الحقول بترتيب العرض في اللوحة: النوى أولًا ثم الهوامش. */
const SHEET_FIELDS = [
  'tracking', 'reference', 'client', 'phone', 'sender', 'senderTel',
  'amount', 'cr', 'paid', 'dest', 'agenceFrom',
  'date', 'parcelNo', 'parcelType', 'codeTri', 'remark',
];
const NUMERIC_FIELDS = { amount: 1, cr: 1 };

function openSheet(it, isNew) {
  editingId = isNew ? null : it.id;
  els.sheetTitle.textContent = T(isNew ? 'manual' : 'details');
  for (const k of SHEET_FIELDS) {
    const box = els['f_' + k];
    if (!box) continue;
    const v = it[k];
    box.value = NUMERIC_FIELDS[k] ? (v ? String(v) : '') : (v || '');
  }
  paintAlerts(it);
  els.rawText.textContent = it.raw || '';
  els.rawBox.classList.toggle('hidden', !it.raw);
  els.btnDelete.classList.toggle('hidden', !!isNew);
  els.btnOut.classList.toggle('hidden', !!isNew || !!it.outAt);
  els.btnBackIn.classList.toggle('hidden', !!isNew || !it.outAt);
  els.sheetMask.classList.remove('hidden');
  els.sheet.classList.remove('hidden');
  try { els.f_tracking.focus(); } catch (e) { /* بعض الأجهزة لا تُظهر لوحة المفاتيح */ }
}

/** تنبيهات الملصق (المواصفة القسم 6) — تُعاد حسابها بعد كل تحرير،
 *  لأنها تعتمد على القيم المعدَّلة لا على ما قُرئ منها. */
function paintAlerts(it) {
  const a = validateLabel(it);
  it.alerts = a;
  els.alertsBox.classList.toggle('hidden', !a.length);
  els.alertsBox.innerHTML = a.map(k => `<span class="warnTag">${esc(T(k))}</span>`).join('');
}

function closeSheet() {
  els.sheetMask.classList.add('hidden');
  els.sheet.classList.add('hidden');
  editingId = null;
  if (paused && camStarted) { paused = false; paintEngine(); }   // المسح يستأنف
}

function saveSheet() {
  const t = els.f_tracking.value.trim();
  if (!/^\d{7}$/.test(t)) { toast(T('needTrack')); return; }
  // لا يُقبل رقمُ تتبّعٍ موجودٍ في المخزن أصلًا: ذلك تكرار، لا طرد جديد
  const clash = db.items.find(i => i.tracking === t && i.id !== editingId && !i.outAt);
  if (clash) { toast(T('dupe')); return; }

  let it;
  if (editingId === null) {
    it = newRecord();
    db.items.push(it);
  } else {
    it = db.items.find(i => i.id === editingId);
    if (!it) return closeSheet();
  }
  it.tracking = t;
  for (const k of SHEET_FIELDS) {
    if (k === 'tracking') continue;
    const box = els['f_' + k];
    if (!box) continue;
    it[k] = NUMERIC_FIELDS[k] ? parseMoney(box.value) : box.value.trim();
  }
  it.alerts = validateLabel(it);

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
  for (const k of SHEET_FIELDS) {
    const box = els['f_' + k];
    if (!box) continue;
    const sp = box.closest('label').querySelector('span');
    if (sp) sp.textContent = T(k);
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
  const cols = SHEET_FIELDS.concat(['alerts', 'at', 'outAt', 'src']);
  const lines = [cols.join(',')];
  for (const i of db.items) {
    lines.push(cols.map(c => {
      let v = i[c];
      if (c === 'at' || c === 'outAt') v = v ? new Date(v).toISOString() : '';
      if (c === 'alerts') v = (i.alerts || []).map(k => T(k)).join(' / ');
      return `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    }).join(','));
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
    'flash', 'flashNum', 'flashRows', 'flashFlags', 'strip', 'countBig', 'scanBottom', 'listTitle',
    'btnBack', 'btnExport', 'sumLabel', 'sumCount', 'sumValue', 'btnAlertLine', 'tabs', 'items',
    'sheetMask', 'sheet', 'sheetTitle', 'btnSheetClose', 'alertsBox', 'rawBox', 'rawText',
    'btnDelete', 'btnOut', 'btnBackIn', 'btnSave', 'toast']) {
    els[id] = document.getElementById(id);
  }
  for (const k of SHEET_FIELDS) els['f_' + k] = document.getElementById('f_' + k);
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
  // التنبيهات تُعاد حسابها مع كل حرف: التحذّر يظهر قبل الحفظ لا بعده
  els.sheet.addEventListener('input', () => {
    const it = editingId === null ? newRecord() : db.items.find(i => i.id === editingId);
    if (!it) return;
    const draft = Object.assign({}, it);
    for (const k of SHEET_FIELDS) {
      const box = els['f_' + k];
      if (box) draft[k] = NUMERIC_FIELDS[k] ? parseMoney(box.value) : box.value.trim();
    }
    paintAlerts(draft);
  });
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
