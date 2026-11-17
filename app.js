'use strict';
/* =====================================================================
 * 拼讀大冒險 Phonics Adventure  —  主程式
 * 純前端。學習紀錄存在瀏覽器 localStorage；
 * 若在家長專區設定了「雲端同步」，會同步到你自己的 Google 試算表（Apps Script）。
 * ===================================================================== */

/* ---------------------------- 小工具 ---------------------------- */
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, n) => shuffle(a).slice(0, n);
const pad = n => String(n).padStart(2, '0');
const dstr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => dstr(new Date());
const nowStr = () => { const d = new Date(); return `${dstr(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const hhmm = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5);
const weekStart = () => { const d = new Date(); const w = (d.getDay() + 6) % 7; d.setDate(d.getDate() - w); return dstr(d); };
const lev = (a, b) => {
  const m = a.length, n = b.length; let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
};

/* ---------------------------- 單元資料整理 ---------------------------- */
const UNIT_BY_ID = {};
const parseWord = (s, u) => {
  const [a, zh, e, p] = s.split('|');
  const o = { w: a, zh: zh || '', e: e || '', p: p || '' };
  if (u.syl) { o.sy = a; o.w = a.replace(/-/g, ''); }
  o.unit = u;
  return o;
};
UNITS.forEach(u => { u.own = u.raw.map(s => parseWord(s, u)); u.words = u.own; UNIT_BY_ID[u.id] = u; });
UNITS.forEach(u => {
  if (u.from) { // 綜合單元：題庫＝自己的單字＋來源單元的全部單字；畫面上只顯示抽樣的單字
    const seen = new Set(), pool = [], cur = [], curSeen = new Set();
    const add = w => { if (!seen.has(w.w)) { seen.add(w.w); pool.push(w); } };
    const curAdd = w => { if (!curSeen.has(w.w)) { curSeen.add(w.w); cur.push(w); } };
    u.own.forEach(add); u.from.forEach(id => UNIT_BY_ID[id].words.forEach(add));
    u.own.forEach(curAdd);
    u.from.forEach(id => {
      const src = UNIT_BY_ID[id].words, L = src.length, k = Math.min(u.take || 6, L);
      for (let j = 0; j < k; j++) curAdd(src[Math.floor(j * L / k)]);
    });
    u.pool = pool; u.words = cur;
  }
  u.pats = [...new Set((u.pool || u.words).map(w => w.p).filter(Boolean))];
});
const poolOf = u => u.pool || u.words;
const poolFor = (w, qu) => (qu && qu.pool && qu.pool.includes(w)) ? qu.pool : poolOf(w.unit);
const findWord = (w, unitId) => {
  const u = UNIT_BY_ID[unitId];
  let r = u && poolOf(u).find(x => x.w === w);
  if (r) return r;
  for (const x of UNITS) { r = poolOf(x).find(y => y.w === w); if (r) return r; }
  return null;
};
const LADDER = ['short', 'blends', 'digraphs', 'magice', 'teams', 'rctrl', 'diph', 'silent', 'affix', 'syl'].map(id => UNITS.findIndex(u => u.id === id)).filter(i => i >= 0);

/* ---------------------------- 儲存（多位使用者） ---------------------------- */
const K_IDX = 'phonics-adventure-v2:index', K_PROF = 'phonics-adventure-v2:p:', K_CFG = 'phonics-adventure-v2:cfg', K_OLD = 'phonics-adventure-v1';
const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
const lsDel = k => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } };
const idOf = name => name.trim().toLowerCase().replace(/\s+/g, '-');
const validName = n => /^[A-Za-z][A-Za-z '\-]{0,19}$/.test(n.trim());
function readIndex() {
  try { const j = JSON.parse(lsGet(K_IDX)); if (j && Array.isArray(j.names)) return j; } catch (e) { /* ignore */ }
  return { last: '', names: [] };
}
const writeIndex = ix => lsSet(K_IDX, JSON.stringify(ix));
function readLegacy() {
  try { const s = JSON.parse(lsGet(K_OLD)); if (s && s.v && s.units && !lsGet(K_OLD + ':used')) return s; } catch (e) { /* ignore */ }
  return null;
}
function defaultState() {
  return {
    v: 2, name: '', created: today(), placement: null,
    units: {}, boss: {}, history: [], hseq: 0, sentSeq: 0, wrong: {}, learned: {}, days: [], time: {},
    achv: {}, goals: [], recCount: 0, gameCount: 0, reviewFixed: 0, updated: 0, fresh: false,
    settings: { pass: 3, rate: 0.7, voice: '', qn: 15, hard: false }
  };
}
function normalize(s) {
  const d = defaultState();
  const st = Object.assign(d, s, { settings: Object.assign(d.settings, (s && s.settings) || {}) });
  if (st.settings.rate === 0.85) st.settings.rate = 0.7;
  let mx = st.hseq || 0;
  st.history.forEach(h => { if (h.n) mx = Math.max(mx, h.n); });
  st.history.forEach(h => { if (!h.n) h.n = ++mx; });
  st.hseq = mx;
  return st;
}
let ID = '';
let S = defaultState();
function save(noTouch) {
  if (!ID) return;
  if (!noTouch) S.updated = Date.now();
  lsSet(K_PROF + ID, JSON.stringify(S));
}
const U = id => (S.units[id] = S.units[id] || { stars: 0, attempts: 0, skipped: false, unlocked: false, last: '' });
const addHistory = o => { S.history.push(Object.assign({ n: ++S.hseq }, o)); if (S.history.length > 1000) S.history = S.history.slice(-1000); };

/* ---------------------------- 進度計算 ---------------------------- */
const LEVELS = [[0, '🌱 拼讀新芽'], [12, '🐣 發音小雞'], [28, '🦊 聲音偵探'], [48, '🚀 拼讀太空人'], [68, '🏆 拼讀高手'], [88, '🦉 單字智者'], [110, '👑 英文小博士']];
const MAXSTARS = UNITS.length * 5 + 15;
const totalStars = () => UNITS.reduce((n, u) => n + U(u.id).stars, 0) + [1, 2, 3].reduce((n, s) => n + ((S.boss[s] && S.boss[s].stars) || 0), 0);
const passedUnits = () => UNITS.filter(u => U(u.id).stars >= S.settings.pass).length;
const learnedCount = () => Object.keys(S.learned).length;
function levelInfo() {
  const t = totalStars(); let i = 0;
  LEVELS.forEach((l, k) => { if (t >= l[0]) i = k; });
  const next = LEVELS[i + 1];
  return { title: LEVELS[i][1], need: next ? next[0] - t : 0, nextTitle: next ? next[1] : '' };
}
function streak() {
  const set = new Set(S.days); const d = new Date();
  if (!set.has(dstr(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(dstr(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
const starsFor = pct => pct >= 100 ? 5 : pct >= 90 ? 4 : pct >= 80 ? 3 : pct >= 70 ? 2 : pct >= 60 ? 1 : 0;
const PCT = [0, 60, 70, 80, 90, 100];
const starsHTML = (n, max = 5) => `<span class="stars">${Array.from({ length: max }, (_, i) => `<span class="st ${i < n ? 'on' : ''}">★</span>`).join('')}</span>`;
function isUnlocked(i) {
  if (i === 0) return true;
  const u = UNITS[i], prev = U(UNITS[i - 1].id), me = U(u.id);
  if (me.unlocked || me.skipped || me.stars > 0 || prev.stars >= S.settings.pass || prev.skipped) return true;
  return UNITS.slice(i + 1).some(x => U(x.id).stars > 0); // 後面的關卡已經玩過，就不必再卡關
}
const stageDone = st => UNITS.filter(u => u.stage === st).every(u => U(u.id).stars >= S.settings.pass || U(u.id).skipped);
const minutesOn = d => Math.round((S.time[d] || 0) / 60);

/* ---------------------------- 成就 ---------------------------- */
const stagePassed = st => UNITS.filter(u => u.stage === st).every(u => U(u.id).stars >= S.settings.pass);
const ACH = [
  { id: 'first', e: '🎯', n: '第一次挑戰', d: '完成第 1 次測驗', f: () => S.history.some(h => h.type === 'quiz') },
  { id: 'perfect', e: '💯', n: '完美滿分', d: '一次測驗全部答對', f: () => S.history.some(h => (h.type === 'quiz' || h.type === 'boss') && h.total >= 10 && h.correct === h.total) },
  { id: 'star5', e: '🌟', n: '五星單元', d: '任一單元拿到 5 顆星', f: () => UNITS.some(u => U(u.id).stars >= 5) },
  { id: 'star5x5', e: '✨', n: '五星收藏家', d: '5 個單元拿到 5 顆星', f: () => UNITS.filter(u => U(u.id).stars >= 5).length >= 5 },
  { id: 'streak3', e: '🔥', n: '連續 3 天', d: '連續學習 3 天', f: () => streak() >= 3 },
  { id: 'streak5', e: '🔥', n: '連續 5 天', d: '連續學習 5 天', f: () => streak() >= 5 },
  { id: 'streak7', e: '🏅', n: '連續 7 天', d: '連續學習 7 天', f: () => streak() >= 7 },
  { id: 'streak14', e: '🎖️', n: '連續 14 天', d: '連續學習 14 天', f: () => streak() >= 14 },
  { id: 'words50', e: '📘', n: '50 個單字', d: '答對過 50 個不同單字', f: () => learnedCount() >= 50 },
  { id: 'words100', e: '📗', n: '100 個單字', d: '答對過 100 個不同單字', f: () => learnedCount() >= 100 },
  { id: 'words200', e: '📚', n: '200 個單字', d: '答對過 200 個不同單字', f: () => learnedCount() >= 200 },
  { id: 'words400', e: '🗂️', n: '400 個單字', d: '答對過 400 個不同單字', f: () => learnedCount() >= 400 },
  { id: 'rec10', e: '🎤', n: '小小朗讀者', d: '錄音練習 10 次', f: () => S.recCount >= 10 },
  { id: 'game5', e: '🎮', n: '遊戲高手', d: '完成配對遊戲 5 次', f: () => S.gameCount >= 5 },
  { id: 'review10', e: '🔧', n: '錯字剋星', d: '在複習中修正 10 個錯字', f: () => S.reviewFixed >= 10 },
  { id: 'units3', e: '🚩', n: '三關達陣', d: '通過 3 個單元', f: () => passedUnits() >= 3 },
  { id: 'units10', e: '🏁', n: '十關達陣', d: '通過 10 個單元', f: () => passedUnits() >= 10 },
  { id: 'boss1', e: '🏰', n: '打敗大魔王', d: '通過任一階段的大魔王挑戰', f: () => [1, 2, 3].some(s => S.boss[s] && S.boss[s].stars >= S.settings.pass) },
  { id: 'stage1', e: '🥉', n: '基礎完成', d: '通過第一階段所有單元', f: () => stagePassed(1) },
  { id: 'stage2', e: '🥈', n: '進階完成', d: '通過第二階段所有單元', f: () => stagePassed(2) },
  { id: 'stage3', e: '🥇', n: '中高年級挑戰完成', d: '通過第三階段所有單元', f: () => stagePassed(3) },
  { id: 'all', e: '👑', n: '拼讀大師', d: '通過全部單元', f: () => passedUnits() >= UNITS.length }
];
function checkAch() {
  ACH.forEach(a => {
    if (!S.achv[a.id] && a.f()) { S.achv[a.id] = today(); toast(`${a.e} 新成就：${a.n}！`, true); }
  });
}

/* ---------------------------- 目標與獎勵 ---------------------------- */
const isQuizH = h => h.type === 'quiz' || h.type === 'review' || h.type === 'boss';
const GOAL_TYPES = {
  quizzes: { n: '完成測驗', unit: '次', since: true, val: g => S.history.filter(h => h.t.slice(0, 10) >= g.from && isQuizH(h)).length },
  perfect: { n: '測驗滿分', unit: '次', since: true, val: g => S.history.filter(h => h.t.slice(0, 10) >= g.from && (h.type === 'quiz' || h.type === 'boss') && h.total >= 10 && h.correct === h.total).length },
  minutes: { n: '學習時間', unit: '分鐘', since: true, val: g => Math.round(Object.keys(S.time).filter(d => d >= g.from).reduce((n, d) => n + S.time[d], 0) / 60) },
  streak: { n: '連續學習', unit: '天', since: false, val: () => streak() },
  stars: { n: '累計星星', unit: '顆', since: false, val: () => totalStars() },
  units: { n: '通過單元', unit: '個', since: false, val: () => passedUnits() },
  words: { n: '學過的單字', unit: '個', since: false, val: () => learnedCount() }
};
const goalText = g => {
  const T = GOAL_TYPES[g.type];
  return `${g.days ? g.days + ' 天內：' : ''}${T.n}${T.since ? '' : '達到'} ${g.target} ${T.unit}`;
};
function checkGoals() {
  S.goals.forEach(g => {
    if (g.status !== 'active' || !GOAL_TYPES[g.type]) return;
    if (GOAL_TYPES[g.type].val(g) >= g.target) {
      g.status = 'achieved'; g.doneAt = today();
      toast(`🎉 目標達成：${goalText(g)}！去找爸媽領獎勵吧`, true);
    } else if (g.days && daysBetween(g.from, today()) > g.days) {
      g.status = 'expired';
    }
  });
}

/* ---------------------------- 提示訊息 / 音效 ---------------------------- */
function toast(msg, gold) {
  const box = $('#toasts'); if (!box) return;
  const el = document.createElement('div');
  el.className = 'toast' + (gold ? ' gold' : '');
  el.textContent = msg; box.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 450); }, gold ? 4200 : 2800);
}
let ac = null;
function beep(ok) {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const t = ac.currentTime;
    (ok ? [[660, 0], [880, .12]] : [[200, 0]]).forEach(([f, d]) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(.001, t + d);
      g.gain.exponentialRampToValueAtTime(.18, t + d + .02);
      g.gain.exponentialRampToValueAtTime(.001, t + d + .22);
      o.connect(g); g.connect(ac.destination); o.start(t + d); o.stop(t + d + .25);
    });
  } catch (e) { /* ignore */ }
}

/* ---------------------------- 語音合成（念單字） ---------------------------- */
const Speech = {
  voices: [],
  token: 0,
  PAUSE: 1000, // 字母與單字之間的停頓（毫秒）
  load() {
    if (!('speechSynthesis' in window)) return;
    const v = speechSynthesis.getVoices();
    if (v && v.length) this.voices = v.filter(x => /^en/i.test(x.lang));
  },
  pick() {
    let v = this.voices.find(x => x.voiceURI === S.settings.voice);
    if (!v) {
      const us = this.voices.filter(x => /en[-_]US/i.test(x.lang));
      v = us.find(x => /samantha|ava|allison|nicky|aaron|google us/i.test(x.name)) || us[0] || this.voices[0];
    }
    return v;
  },
  // 文字中用 | 分段，段與段之間會停頓，例如 'ay|apple' → 「ay」停一下再「apple」
  async say(text, opts = {}) {
    const parts = String(text).split('|');
    const my = ++this.token;
    for (let i = 0; i < parts.length; i++) {
      if (my !== this.token) return;
      await this.speak(parts[i], opts);
      if (i < parts.length - 1) await new Promise(r => setTimeout(r, this.PAUSE));
    }
  },
  speak(text, opts = {}) {
    return new Promise(res => {
      if (!('speechSynthesis' in window)) { toast('這個瀏覽器不支援語音功能'); return res(); }
      try {
        if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        const v = this.pick(); if (v) u.voice = v;
        u.rate = opts.slow ? 0.5 : S.settings.rate;
        let done = false;
        const fin = () => { if (!done) { done = true; res(); } };
        u.onend = fin; u.onerror = fin;
        setTimeout(fin, 9000);
        speechSynthesis.speak(u);
      } catch (e) { res(); }
    });
  }
};
if ('speechSynthesis' in window) { Speech.load(); speechSynthesis.onvoiceschanged = () => Speech.load(); }
// 字母名稱用拼音寫出來，避免語音把大寫字母讀成 "capital A"
const LETTER_SAY = { a: 'ay', b: 'bee', c: 'see', d: 'dee', e: 'ee', f: 'eff', g: 'gee', h: 'aitch', i: 'eye', j: 'jay', k: 'kay', l: 'el', m: 'em', n: 'en', o: 'oh', p: 'pee', q: 'cue', r: 'are', s: 'ess', t: 'tee', u: 'you', v: 'vee', w: 'double you', x: 'ex', y: 'why', z: 'zee' };
const letterWord = w => `${LETTER_SAY[w[0].toLowerCase()] || w[0]}|${w}`;
const spokenText = wd => wd.unit.id === 'letters' ? letterWord(wd.w) : wd.w;
const qSpeak = q => q.letters ? letterWord(q.w) : q.w;

/* ---------------------------- 錄音 ---------------------------- */
const Rec = {
  rec: null, chunks: [], url: null, stream: null,
  supported() { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder); },
  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const types = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/aac'];
    const mt = types.find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t));
    this.rec = new MediaRecorder(this.stream, mt ? { mimeType: mt } : undefined);
    this.chunks = [];
    this.rec.ondataavailable = e => { if (e.data && e.data.size) this.chunks.push(e.data); };
    this.rec.start();
  },
  stop() {
    return new Promise(res => {
      if (!this.rec || this.rec.state === 'inactive') return res(null);
      this.rec.onstop = () => {
        if (this.stream) this.stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(this.chunks, { type: this.rec.mimeType || 'audio/mp4' });
        if (this.url) URL.revokeObjectURL(this.url);
        this.url = URL.createObjectURL(blob);
        res(this.url);
      };
      this.rec.stop();
    });
  },
  play() { if (this.url) { const a = new Audio(this.url); a.play().catch(() => toast('無法播放錄音')); } }
};

/* ---------------------------- 拼法標示（高亮 / 挖空） ---------------------------- */
function ranges(w, p) {
  if (!p) return [];
  if (p.includes('_')) {
    const i = w.indexOf(p[0]);
    return (i >= 0 && i < w.length - 1 && w.endsWith('e')) ? [[i, i + 1], [w.length - 1, w.length]] : [];
  }
  const suf = p.startsWith('-'), q = p.replace(/-/g, '');
  const i = suf ? w.lastIndexOf(q) : w.indexOf(q);
  return i < 0 ? [] : [[i, i + q.length]];
}
function markWord(w, p, fn) {
  const r = ranges(w, p); let out = '', pos = 0;
  r.forEach(([a, b]) => { out += esc(w.slice(pos, a)) + fn(w.slice(a, b)); pos = b; });
  return out + esc(w.slice(pos));
}
const blankWord = (w, p) => ranges(w, p).length ? markWord(w, p, () => '＿') : null;
const wordMarkup = wd => wd.sy ? esc(wd.sy.replace(/-/g, '·')) : markWord(wd.w, wd.p, s => `<mark>${esc(s)}</mark>`);

/* ---------------------------- 狀態 ---------------------------- */
let Q = null; // 目前的測驗
const ui = {
  view: 'login', unit: null, tab: 'listen',
  say: { i: 0, recording: false, has: false },
  game: null, result: null, speakQ: false, playing: false, busy: '',
  parent: { ok: false, tab: 'overview', gate: null }
};
function go(view, o = {}) {
  stopAll();
  Object.assign(ui, { view }, o);
  render();
  window.scrollTo(0, 0);
}
function stopAll() {
  ui.playing = false; Speech.token++;
  try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) { /* ignore */ }
  if (ui.say.recording) { try { Rec.stop(); } catch (e) { /* ignore */ } ui.say.recording = false; }
}
function afterActivity() {
  const t = today(); if (!S.days.includes(t)) S.days.push(t);
  checkAch(); checkGoals(); save(); Cloud.schedule();
}

/* ====================================================================
 * 雲端同步（Google 試算表 + Apps Script）
 * ==================================================================== */
const URL_OK = /^https:\/\/script\.google\.com\/(a\/[^/]+\/)?macros\/s\/[\w-]+\/exec$/;
const slim = st => Object.assign({}, st, { history: st.history.slice(-400), fresh: false });
function adopt(remote) { // 用雲端的資料取代目前使用者的資料
  const nm = S.name; S = normalize(remote); S.name = nm || S.name; S.fresh = false; save(true);
  if (ui.view === 'home') render();
}
const Cloud = {
  cfg: null, status: '', timer: null, dirty: false, busy: false,
  load() { try { const j = JSON.parse(lsGet(K_CFG)); this.cfg = (j && j.url && j.key && URL_OK.test(j.url)) ? j : null; } catch (e) { this.cfg = null; } },
  enabled() { return !!this.cfg; },
  setCfg(url, key) { this.cfg = { url, key }; lsSet(K_CFG, JSON.stringify(this.cfg)); },
  clearCfg() { this.cfg = null; lsDel(K_CFG); this.setStatus(''); },
  setStatus(t) { this.status = t; const el = document.getElementById('cloudst'); if (el) el.textContent = this.enabled() && t ? '☁️ ' + t : ''; },
  err(e) {
    const m = String((e && e.message) || e);
    if (/bad key/i.test(m)) return '家庭密碼不正確';
    if (/abort/i.test(m)) return '連線逾時';
    if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return '連不上雲端（請確認網路，或部署時「誰可以存取」是否選「所有人」）';
    return m;
  },
  async call(payload) {
    if (!this.cfg) throw new Error('尚未設定雲端同步');
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const to = setTimeout(() => ctl && ctl.abort(), 25000);
    try {
      const r = await fetch(this.cfg.url, {
        method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow',
        body: JSON.stringify(Object.assign({ key: this.cfg.key }, payload)), signal: ctl ? ctl.signal : undefined
      });
      const txt = await r.text(); let j;
      try { j = JSON.parse(txt); } catch (e) { throw new Error('回應格式不正確（請確認貼的是「部署」後的網頁應用程式網址）'); }
      if (!j.ok) throw new Error(j.error || '雲端回應錯誤');
      return j;
    } finally { clearTimeout(to); }
  },
  summary() {
    const mins = Math.round(Object.values(S.time).reduce((n, v) => n + v, 0) / 60);
    return { stars: totalStars(), streak: streak(), learned: learnedCount(), level: levelInfo().title, passed: passedUnits(), wrong: Object.keys(S.wrong).length, minutes: mins, last: nowStr() };
  },
  async push() {
    if (!this.enabled() || !ID) return false;
    const myId = ID; this.busy = true; this.setStatus('同步中…');
    try {
      if (S.fresh) { // 這位使用者是在沒網路時建立的：先確認雲端有沒有舊資料，避免蓋掉
        const r = await this.call({ action: 'get', name: myId });
        if (myId !== ID) return false;
        if (r.state && !S.history.length && !Object.keys(S.learned).length) { adopt(JSON.parse(r.state)); this.setStatus('已從雲端還原'); return true; }
        S.fresh = false;
      }
      const evs = S.history.filter(h => h.n > (S.sentSeq || 0));
      const r = await this.call({
        action: 'put', name: myId, display: S.name, updated: S.updated, state: JSON.stringify(slim(S)),
        events: evs.map(h => [h.t, ({ quiz: '單元測驗', review: '複習', boss: '大魔王', placement: '分級' })[h.type] || h.type, h.type === 'boss' ? `第${h.stage}階段` : h.unit ? ((UNIT_BY_ID[h.unit] || {}).name || h.unit) : '', h.correct, h.total, h.stars || 0, h.n]),
        summary: this.summary()
      });
      if (r.stale) { this.setStatus('雲端有比較新的進度，更新中…'); this.syncDown(); return true; } // 另一台裝置比較晚存，不要蓋掉它
      if (myId === ID) { S.sentSeq = S.hseq; save(true); }
      this.setStatus('已同步 ' + hhmm());
      return true;
    } catch (e) { this.setStatus('⚠️ 暫時連不上，稍後會再試'); this.lastErr = this.err(e); return false; }
    finally { this.busy = false; }
  },
  schedule() {
    if (!this.enabled() || !ID) return;
    this.dirty = true; clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 6000);
  },
  async flush() {
    clearTimeout(this.timer);
    if (!this.enabled() || !ID || !this.dirty) return true;
    if (this.busy) { this.timer = setTimeout(() => this.flush(), 3000); return false; }
    this.dirty = false;
    const ok = await this.push();
    if (!ok) { this.dirty = true; this.timer = setTimeout(() => this.flush(), 60000); }
    return ok;
  },
  async syncDown() { // 開啟時悄悄檢查雲端有沒有比較新的進度
    if (!this.enabled() || !ID) return;
    try {
      const r = await this.call({ action: 'get', name: ID });
      if (!r.state) { this.schedule(); return; }
      const remote = normalize(JSON.parse(r.state));
      if ((remote.updated || 0) > (S.updated || 0) + 1500 && ui.view === 'home') { adopt(remote); toast('☁️ 已從雲端取得最新進度'); this.setStatus('已同步 ' + hhmm()); }
      else if ((S.updated || 0) > (remote.updated || 0) + 1500) this.schedule();
      else this.setStatus('已同步 ' + hhmm());
    } catch (e) { this.setStatus('⚠️ 暫時連不上雲端'); }
  }
};
Cloud.load();
(function parseCfgHash() { // 設定連結：網址後面的 #cfg=... 只會留在這台裝置，不會送到任何伺服器
  const m = /[#&]cfg=([^&]+)/.exec(location.hash || '');
  if (!m) return;
  try {
    const j = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(m[1])))));
    if (j.u && j.k && URL_OK.test(j.u)) { Cloud.setCfg(j.u, String(j.k)); setTimeout(() => toast('✅ 已設定雲端同步'), 400); }
  } catch (e) { /* ignore */ }
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ignore */ }
})();

/* ====================================================================
 * 登入（輸入英文名字）
 * ==================================================================== */
function openProfile(id, name, st, needPush) {
  ID = id; S = st; S.name = name;
  const ix = readIndex();
  if (!ix.names.some(x => x.id === id)) ix.names.push({ id, name });
  ix.last = id; writeIndex(ix); save(true);
  ui.parent.ok = false; ui.parent.gate = null;
  Cloud.setStatus(Cloud.enabled() ? (needPush ? '同步中…' : '已同步') : '');
  go('home');
  if (Cloud.enabled() && needPush) { Cloud.dirty = true; Cloud.schedule(); }
}
async function doLogin(raw, adoptLegacy) {
  const name = String(raw || '').trim().replace(/\s+/g, ' ');
  if (!validName(name)) { toast('請用英文輸入名字（A–Z，最多 20 個字）'); return; }
  const id = idOf(name);
  let local = null, remote = null, online = false;
  try { const t = lsGet(K_PROF + id); if (t) local = normalize(JSON.parse(t)); } catch (e) { /* ignore */ }
  if (Cloud.enabled()) {
    ui.busy = '☁️ 正在連線，取得進度…'; render();
    try { const r = await Cloud.call({ action: 'get', name: id }); online = true; if (r.state) remote = normalize(JSON.parse(r.state)); } catch (e) { /* 離線 */ }
    ui.busy = '';
  }
  let st = null, needPush = false;
  if (local && remote) {
    if ((remote.updated || 0) > (local.updated || 0)) { st = remote; toast('☁️ 已從雲端取得最新進度'); }
    else { st = local; needPush = (local.updated || 0) > (remote.updated || 0); }
  } else if (remote) st = remote;
  else if (local) { st = local; needPush = online; }
  if (!st) {
    const legacy = adoptLegacy ? readLegacy() : null;
    if (legacy) { st = normalize(legacy); st.updated = Date.now(); lsSet(K_OLD + ':used', '1'); }
    else { st = defaultState(); st.fresh = Cloud.enabled() && !online; }
    needPush = true;
  }
  if (Cloud.enabled() && !online && !local) toast('目前連不上雲端，先在這台裝置開始，之後連線會自動同步');
  openProfile(id, name, st, needPush);
}
function viewLogin() {
  const ix = readIndex(), legacy = readLegacy();
  let h = `<div class="card gate login"><h1>🌟 拼讀大冒險</h1><div class="loginsub">Phonics Adventure</div>
    <p class="q2">Hello! What's your name?</p>`;
  if (ix.names.length) {
    h += `<div class="profiles">${ix.names.map(n => `<button class="btn pbtn" data-act="pickp" data-n="${esc(n.name)}">👤 ${esc(n.name)}</button>`).join('')}</div><p class="hint">點自己的名字，或在下面輸入名字</p>`;
  }
  h += `<input id="loginname" class="spell" type="text" maxlength="20" placeholder="Type your English name" autocomplete="off" autocapitalize="words" autocorrect="off" spellcheck="false">
    <div class="row"><button class="btn green" style="font-size:22px;padding:14px 40px" data-act="login-go">Let's go! →</button></div>`;
  if (legacy) h += `<label class="legacy"><input type="checkbox" id="adopt" checked> 接續這台 iPad 原本的學習紀錄（家長：只有第一位使用者要勾選）</label>`;
  if (ui.busy) h += `<div class="busy">${esc(ui.busy)}</div>`;
  return h + '</div>';
}

/* ====================================================================
 * 畫面：首頁
 * ==================================================================== */
function viewHome() {
  const L = levelInfo(), st = streak(), active = S.days.includes(today());
  let h = `<div class="top">
    <div class="hello"><h1>👋 ${esc(S.name)}，今天也來闖關吧！</h1>
      <div class="lvl">${L.title}</div>
      <div class="next">${L.need ? `再 ${L.need} 顆星升級為 ${L.nextTitle}` : '已達最高等級！'}</div>
      <div class="cloudst" id="cloudst">${Cloud.enabled() && Cloud.status ? '☁️ ' + esc(Cloud.status) : ''}</div></div>
    <div class="chips">
      <div class="stat"><b>⭐ ${totalStars()}</b><span>星星</span></div>
      <div class="stat"><b>🔥 ${st}</b><span>連續天數</span></div>
      <div class="stat"><b>📚 ${learnedCount()}</b><span>學過單字</span></div>
    </div></div>`;
  if (!S.placement) {
    h += `<div class="banner"><div><h3>🎯 先做「分級小測驗」</h3><p>大約 5 分鐘，會的單元可以直接跳過，從適合的地方開始。</p></div>
      <div class="row"><button class="btn orange" data-act="placement">開始分級</button><button class="btn ghost" data-act="skipplace">從頭開始</button></div></div>`;
  }
  h += `<div class="today ${active ? 'done' : ''}">${active ? '✅ 今天已完成學習，太棒了！' : '📌 今日任務：完成一次測驗或練習，維持連續天數！'}</div>`;
  [1, 2, 3].forEach(stage => {
    h += `<div class="stage"><h2>${STAGES[stage].name}</h2><div class="sub">${STAGES[stage].sub}</div><div class="tiles">`;
    UNITS.forEach((u, i) => {
      if (u.stage !== stage) return;
      const us = U(u.id), lock = !isUnlocked(i);
      h += `<button class="tile ${lock ? 'locked' : ''}" data-act="openunit" data-i="${i}">
        <span class="no">${i + 1}</span>${lock ? '<span class="lock">🔒</span>' : ''}
        <div class="ticon">${u.icon}</div><div class="tname">${u.name}</div><div class="ten">${u.en}</div>
        ${starsHTML(us.stars)}
        ${us.skipped && us.stars === 0 ? '<div class="tag">分級已跳過 ✓</div>' : ''}</button>`;
    });
    const ok = stageDone(stage), b = S.boss[stage] || { stars: 0 };
    h += `<button class="tile boss ${ok ? '' : 'locked'}" data-act="boss" data-s="${stage}">${ok ? '' : '<span class="lock">🔒</span>'}
      <div class="ticon">🏰</div><div class="tname">第 ${stage} 階段大魔王</div><div class="ten">${ok ? '20 題綜合挑戰' : '通過本階段所有單元後開放'}</div>${starsHTML(b.stars)}</button>`;
    h += '</div></div>';
  });
  const wc = Object.keys(S.wrong).length;
  h += `<div class="bottomnav">
    <button class="btn purple" data-act="review">📒 複習清單${wc ? `<span class="badge">${wc}</span>` : ''}</button>
    <button class="btn orange" data-act="ach">🏅 我的成就</button>
    <button class="btn ghost" data-act="parent">👨‍👩‍👧 家長專區</button>
    <button class="btn ghost" data-act="switchuser">👤 換人</button></div>`;
  return h;
}

/* ====================================================================
 * 畫面：單元（Listen / Say / Play / Quiz）
 * ==================================================================== */
function viewUnit() {
  const u = UNIT_BY_ID[ui.unit], us = U(u.id);
  const tabs = [['listen', '👂 聽 Listen'], ['say', '🗣️ 說 Say'], ['play', '🎮 玩 Play'], ['quiz', '📝 測驗 Quiz']];
  let h = `<div class="uhead"><button class="btn ghost small" data-act="home">← 返回</button>
    <h2>${u.icon} ${u.name} <span class="en">${u.en}</span></h2>${starsHTML(us.stars)}</div>
    <div class="tabs">${tabs.map(t => `<button class="tab ${ui.tab === t[0] ? 'on' : ''}" data-act="tab" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>`;
  if (ui.tab === 'listen') h += tabListen(u);
  if (ui.tab === 'say') h += tabSay(u);
  if (ui.tab === 'play') h += tabPlay(u);
  if (ui.tab === 'quiz') h += tabQuiz(u, us);
  return h;
}
function tabListen(u) {
  let h = `<div class="tip">💡 ${esc(u.tip)}</div>
    <div class="row left"><button class="btn green" id="playall" data-act="playall">▶ 全部播放</button>
    <span class="muted">點每張卡片都可以聽發音（共 ${u.words.length} 個字${u.pool ? `，題庫有 ${u.pool.length} 個字` : ''}）</span></div><div class="wgrid">`;
  u.words.forEach((w, i) => {
    h += `<button class="wcard" id="wc${i}" data-act="speak" data-i="${i}">
      <div class="we">${w.e || '&nbsp;'}</div><div class="ww">${wordMarkup(w)}</div><div class="wz">${esc(w.zh)}</div>
      ${w.sy ? `<div class="sylbtn"><span class="pill" data-act="syl" data-i="${i}">👏 分段唸（${w.sy.split('-').length}）</span></div>` : ''}</button>`;
  });
  return h + '</div>';
}
function tabSay(u) {
  const s = ui.say, w = u.words[s.i];
  return `<div class="card saybox">
    <div class="saycount">${s.i + 1} / ${u.words.length}</div>
    <div class="bigemoji">${w.e || ''}</div><div class="bigword">${wordMarkup(w)}</div><div class="zh">${esc(w.zh)}</div>
    <div class="row"><button class="btn" data-act="say-normal">🔊 聽標準發音</button><button class="btn orange" data-act="say-slow">🐢 慢速</button></div>
    <div class="row"><button class="btn ${s.recording ? 'red pulse' : 'purple'}" data-act="rec">${s.recording ? '⏹ 停止錄音' : '🎤 換我唸'}</button>
      <button class="btn green" data-act="rec-play" ${s.has ? '' : 'disabled'}>▶️ 聽我的聲音</button></div>
    <p class="hint">① 先聽標準發音　② 按「換我唸」跟著唸　③ 播放自己的聲音比一比　④ 請爸媽聽聽看</p>
    <div class="row"><button class="btn ghost" data-act="say-prev">← 上一個</button><button class="btn ghost" data-act="say-next">下一個 →</button></div></div>`;
}
function tabPlay(u) {
  if (!ui.game) newGame(u);
  const g = ui.game;
  let h = `<div class="card"><div class="qprompt">🎧 聽音配對：翻開卡片，找出「單字」和對應的「🔊 聲音」</div>
    <div class="qinfo"><div><b>${g.moves}</b>步數</div><div><b>${g.matched.length / 2}/${g.cards.length / 2}</b>配對</div></div><div class="game">`;
  g.cards.forEach((c, i) => {
    const open = g.open.includes(i), done = g.matched.includes(i);
    h += `<button class="gcard ${open ? 'open' : ''} ${done ? 'done' : ''}" data-act="flip" data-i="${i}">
      ${(open || done) ? (c.kind === 'text' ? `${esc(c.w)}<span class="small">${esc(c.zh)}</span>` : '🔊') : '❓'}</button>`;
  });
  h += '</div>';
  if (g.matched.length === g.cards.length) h += `<div class="unlockmsg">🎉 全部配對成功！共用了 ${g.moves} 步</div>`;
  return h + `<div class="row"><button class="btn orange" data-act="newgame">🔄 重新開始</button></div></div>`;
}
function tabQuiz(u, us) {
  const pass = S.settings.pass, n = S.settings.qn || 15;
  return `<div class="card result"><h2>${u.icon} ${u.name} 小測驗</h2>
    <div class="qinfo"><div><b>${n}</b>題</div><div><b>${pass} ★</b>過關門檻（${PCT[pass]}%）</div><div><b>${us.attempts}</b>已挑戰次數</div></div>
    <p>目前最佳：</p>${starsHTML(us.stars)}
    <p class="hint">題型：聽音選字、聽音選意思、聽音選圖、看字選圖、補上拼法、找出不一樣的字、聽寫拼字<br>${UNITS.indexOf(u) > 0 ? '其中有幾題會複習前面關卡的字<br>' : ''}${S.settings.hard ? '🔥 挑戰模式：開（沒有圖示與中文提示）<br>' : ''}星星：60%＝1★、70%＝2★、80%＝3★、90%＝4★、100%＝5★</p>
    <div class="row"><button class="btn green" data-act="startquiz" style="font-size:22px;padding:16px 36px">🚀 開始挑戰</button></div></div>`;
}

/* ----- 配對遊戲 ----- */
function newGame(u) {
  const ws = pick(u.words, 6);
  const cards = [];
  ws.forEach((w, i) => { cards.push({ k: i, kind: 'text', w: w.w, zh: w.zh }); cards.push({ k: i, kind: 'audio', w: w.w, wd: w }); });
  ui.game = { cards: shuffle(cards), open: [], matched: [], moves: 0, lock: false };
}
function flipCard(i) {
  const g = ui.game; if (!g || g.lock || g.open.includes(i) || g.matched.includes(i)) return;
  const c = g.cards[i];
  g.open.push(i);
  if (c.kind === 'audio') Speech.say(spokenText(c.wd)); else Speech.say(c.w);
  if (g.open.length === 2) {
    g.moves++;
    const [a, b] = g.open.map(x => g.cards[x]);
    if (a.k === b.k && a.kind !== b.kind) {
      g.matched.push(...g.open); g.open = []; beep(true);
      if (g.matched.length === g.cards.length) { S.gameCount++; afterActivity(); toast('🎉 配對完成！'); }
    } else {
      g.lock = true; beep(false);
      setTimeout(() => { g.open = []; g.lock = false; if (ui.view === 'unit' && ui.tab === 'play') render(); }, 1100);
    }
  }
  render();
}

/* ====================================================================
 * 測驗引擎
 * ==================================================================== */
// 題型：lw 聽音選字／lm 聽音選意思／lp 聽音選圖／rp 看字選圖／rm 看字選意思／fp 補上拼法／ct 數音節／odd 找出不一樣的字／sp 聽寫
const STD = ['lw', 'main', 'lm', 'sp', 'rp', 'lp', 'main', 'sp', 'lw', 'rm', 'odd', 'lm', 'sp', 'main', 'lp', 'rp', 'sp', 'lw', 'rm', 'odd', 'main', 'sp', 'lm', 'lw', 'rp'];
const HARD = ['sp', 'rp', 'main', 'sp', 'rm', 'lw', 'sp', 'odd', 'main', 'sp', 'rp', 'lw', 'sp', 'rm', 'main', 'odd', 'sp', 'lm', 'rp', 'sp', 'main', 'sp', 'rm', 'odd', 'sp'];
const kindsFor = (n, hard) => Array.from({ length: n }, (_, i) => (hard ? HARD : STD)[i % 25]);
const similar = (wd, others, n) => others.map(x => ({ x, d: lev(x.w, wd.w) + Math.random() * 1.5 })).sort((a, b) => a.d - b.d).slice(0, n).map(o => o.x);
function findOddGroup(wd, pool) {
  if (!wd.p) return null;
  const g = {};
  pool.forEach(x => { if (x.p && x.p !== wd.p && x.w !== wd.w) (g[x.p] = g[x.p] || []).push(x); });
  const ok = Object.keys(g).filter(p => g[p].length >= 3);
  if (!ok.length) return null;
  const p = ok[Math.floor(Math.random() * ok.length)];
  return { p, words: pick(g[p], 3) };
}
function makeQ(wd, kind, pool, hard) {
  const u = wd.unit;
  const pats = [...new Set(pool.map(x => x.p).filter(Boolean))];
  const emo = pool.filter(x => x.e).length >= 4;
  let t = kind, odd = null;
  if (t === 'main') t = wd.sy ? 'ct' : (blankWord(wd.w, wd.p) && pats.length >= 2 ? 'fp' : 'lw');
  if (t === 'odd') { odd = findOddGroup(wd, pool); if (!odd) t = 'lw'; }
  if ((t === 'lp' || t === 'rp') && !(wd.e && emo)) t = t === 'rp' ? 'rm' : 'lm';
  if ((t === 'lm' || t === 'rm') && !wd.zh) t = 'lw';
  const q = { t, w: wd.w, zh: wd.zh, e: wd.e, unit: u.id, sy: wd.sy, letters: u.id === 'letters', hard: !!hard, silent: t === 'rp' || t === 'rm' || t === 'odd' };
  const others = pool.filter(x => x.w !== wd.w);
  if (t === 'lw') { q.ans = wd.w; q.opts = shuffle([wd.w, ...similar(wd, others, 3).map(x => x.w)]); }
  if (t === 'lm' || t === 'rm') { const zs = [...new Set(others.map(x => x.zh).filter(z => z && z !== wd.zh))]; q.ans = wd.zh; q.opts = shuffle([wd.zh, ...pick(zs, 3)]); }
  if (t === 'lp' || t === 'rp') { const es = [...new Set(others.map(x => x.e).filter(e => e && e !== wd.e))]; q.ans = wd.e; q.opts = shuffle([wd.e, ...pick(es, 3)]); }
  if (t === 'fp') { q.blank = blankWord(wd.w, wd.p); q.ans = wd.p; q.opts = shuffle([wd.p, ...pick(pats.filter(p => p !== wd.p), 3)]); }
  if (t === 'ct') { q.ans = String(wd.sy.split('-').length); q.opts = ['1', '2', '3', '4', '5']; }
  if (t === 'sp') q.ans = wd.w;
  if (t === 'odd') { q.ans = wd.w; q.common = odd.p; q.opts = shuffle([wd.w, ...odd.words.map(x => x.w)]); }
  return q;
}
function pickQuizWords(u, n) { // 複習前面關卡 → 這關錯過的字 → 其餘隨機
  const pool = poolOf(u), idx = UNITS.indexOf(u), used = new Set(), out = [];
  const take = w => { if (w && !used.has(w.w) && out.length < n) { used.add(w.w); out.push(w); } };
  if (idx > 0) {
    const want = Math.min(4, Math.round(n * 0.2));
    const prev = shuffle(UNITS.slice(Math.max(0, idx - 3), idx).flatMap(x => x.words)).sort((a, b) => (S.wrong[b.w] ? 1 : 0) - (S.wrong[a.w] ? 1 : 0));
    for (const w of prev) { if (out.length >= want) break; take(w); }
  }
  shuffle(pool.filter(w => S.wrong[w.w])).slice(0, Math.round(n * 0.25)).forEach(take);
  shuffle(pool).forEach(take);
  while (out.length < n) out.push(pool[Math.floor(Math.random() * pool.length)]);
  return shuffle(out);
}
function buildUnitQs(u, n, hard) {
  const ws = pickQuizWords(u, n), kinds = kindsFor(n, hard);
  return ws.map((w, i) => makeQ(w, kinds[i], poolFor(w, u), hard));
}
function buildBossQs(stage, n) {
  const all = [], seen = new Set();
  UNITS.filter(u => u.stage === stage).forEach(u => poolOf(u).forEach(w => { if (!seen.has(w.w)) { seen.add(w.w); all.push(w); } }));
  const wrong = shuffle(all.filter(w => S.wrong[w.w])).slice(0, 5), used = new Set(wrong.map(w => w.w));
  const ws = shuffle([...wrong, ...shuffle(all.filter(w => !used.has(w.w))).slice(0, n - wrong.length)]);
  const kinds = kindsFor(n, true);
  return ws.map((w, i) => makeQ(w, kinds[i], poolOf(w.unit), true));
}
function startQuiz(mode, unitId, stage) {
  Q = { mode, unitId, stage, qs: [], i: 0, ok: 0, log: [], answered: false, chosen: null, lastOk: false, rung: 0, groupOk: 0 };
  const hard = !!S.settings.hard, n = S.settings.qn || 15;
  if (mode === 'unit') Q.qs = buildUnitQs(UNIT_BY_ID[unitId], n, hard);
  if (mode === 'boss') Q.qs = buildBossQs(stage, 20);
  if (mode === 'review') {
    const ws = Object.entries(S.wrong).sort((a, b) => b[1].count - a[1].count).slice(0, 10)
      .map(([w, v]) => findWord(w, v.unit)).filter(Boolean);
    if (!ws.length) { toast('複習清單是空的，太棒了！'); return; }
    Q.qs = shuffle(ws).map((w, i) => makeQ(w, STD[i % STD.length], poolOf(w.unit), hard));
  }
  if (mode === 'placement') startGroup();
  ui.speakQ = !Q.qs[0].silent;
  go('quiz');
}
function startGroup() {
  const u = UNITS[LADDER[Q.rung]], pool = poolOf(u);
  Q.qs = pick(pool, 3).map((w, i) => makeQ(w, ['main', 'lw', 'sp'][i], poolFor(w, u), false));
  Q.i = 0; Q.groupOk = 0; Q.answered = false;
}
function record(q, ok) {
  if (ok) {
    S.learned[q.w] = (S.learned[q.w] || 0) + 1;
    if (Q.mode === 'review' && S.wrong[q.w]) { delete S.wrong[q.w]; S.reviewFixed++; }
  } else {
    const p = S.wrong[q.w];
    S.wrong[q.w] = { count: (p ? p.count : 0) + 1, unit: q.unit, last: today() };
  }
}
function answerQ(v) {
  if (Q.answered) return;
  const q = Q.qs[Q.i];
  const ok = q.t === 'sp' ? v.trim().toLowerCase() === q.ans : v === q.ans;
  Q.answered = true; Q.chosen = v; Q.lastOk = ok;
  if (ok) { Q.ok++; Q.groupOk++; }
  Q.log.push({ w: q.w, ok, unit: q.unit });
  record(q, ok); beep(ok); save();
  render();
  Speech.say(qSpeak(q));
}
function nextQ() {
  Q.i++; Q.answered = false;
  if (Q.i >= Q.qs.length) { if (Q.mode === 'placement') return placeGroupDone(); return finishQuiz(); }
  ui.speakQ = !Q.qs[Q.i].silent; render();
}
function placeGroupDone() {
  if (Q.groupOk >= 2) {
    Q.rung++;
    if (Q.rung >= LADDER.length) return finishPlacement(null);
    startGroup(); ui.speakQ = !Q.qs[0].silent; render();
  } else finishPlacement(Q.rung === 0 ? 1 : LADDER[Q.rung - 1] + 1);
}
function finishPlacement(startIdx) {
  const upto = startIdx === null ? UNITS.length : startIdx;
  for (let i = 0; i < upto; i++) { if (i === 0 && upto < 2) continue; U(UNITS[i].id).skipped = true; }
  S.placement = { date: today(), start: upto };
  const correct = Q.log.filter(x => x.ok).length;
  addHistory({ t: nowStr(), type: 'placement', unit: '', correct, total: Q.log.length, stars: 0 });
  afterActivity();
  ui.result = { placement: true, start: startIdx, correct, total: Q.log.length };
  go('result');
}
function finishQuiz() {
  const total = Q.log.length, correct = Q.log.filter(x => x.ok).length;
  const pct = total ? Math.round(correct / total * 100) : 0;
  const r = { mode: Q.mode, unitId: Q.unitId, stage: Q.stage, total, correct, wrong: Q.log.filter(x => !x.ok), stars: 0, pass: false, newPass: false };
  if (Q.mode === 'unit') {
    const us = U(Q.unitId), was = us.stars >= S.settings.pass;
    r.stars = starsFor(pct); us.attempts++; us.last = today();
    if (r.stars > us.stars) us.stars = r.stars;
    r.pass = r.stars >= S.settings.pass; r.newPass = !was && us.stars >= S.settings.pass;
    addHistory({ t: nowStr(), type: 'quiz', unit: Q.unitId, correct, total, stars: r.stars });
  } else if (Q.mode === 'boss') {
    const b = S.boss[Q.stage] = S.boss[Q.stage] || { stars: 0, attempts: 0, last: '' };
    r.stars = starsFor(pct); b.attempts++; b.last = today();
    if (r.stars > b.stars) b.stars = r.stars;
    r.pass = r.stars >= S.settings.pass;
    addHistory({ t: nowStr(), type: 'boss', unit: '', stage: Q.stage, correct, total, stars: r.stars });
  } else {
    addHistory({ t: nowStr(), type: 'review', unit: '', correct, total, stars: 0 });
  }
  afterActivity();
  ui.result = r; go('result');
}

/* ----- 測驗畫面 ----- */
const PROMPTS = {
  lw: '🔊 聽聽看，選出你聽到的單字', lm: '🔊 聽聽看，選出正確的中文意思', lp: '🔊 聽聽看，選出對應的圖',
  sp: '🔊 聽聽看，把單字拼出來', fp: '🔊 聽聽看，缺少的是哪一個拼法？', ct: '👏 這個字有幾個音節？',
  rp: '👀 看字，選出對應的圖（這題先不播放聲音）', rm: '👀 看字，選出正確的中文意思（這題先不播放聲音）', odd: '🔎 找出不一樣的字：4 個字裡有 3 個的拼法相同'
};
function viewQuiz() {
  const q = Q.qs[Q.i], n = Q.qs.length;
  const title = Q.mode === 'placement' ? `🎯 分級測驗・第 ${Q.rung + 1} 組 / ${LADDER.length}` : Q.mode === 'review' ? '📒 複習清單' : Q.mode === 'boss' ? `🏰 第 ${Q.stage} 階段大魔王` : `${UNIT_BY_ID[Q.unitId].icon} ${UNIT_BY_ID[Q.unitId].name}`;
  const pct = Q.mode === 'placement' ? (Q.rung / LADDER.length * 100) : (Q.i + (Q.answered ? 1 : 0)) / n * 100;
  const canListen = !q.silent || Q.answered;
  let h = `<div class="qbar"><button class="btn ghost small" data-act="quitquiz">✕ 離開</button><div class="title">${title}</div>
    <div class="progress"><i style="width:${pct}%"></i></div><div class="title">${Q.i + 1} / ${n}</div></div>
    <div class="card qcard"><div class="qprompt">${PROMPTS[q.t]}</div>`;
  if (canListen) h += `<div class="row"><button class="btn orange" data-act="qplay">🔊 再聽一次</button><button class="btn ghost" data-act="qslow">🐢 慢速</button></div>`;
  const hint = q.hard && !Q.answered ? '' : `${q.e || ''} ${esc(q.zh)}`;
  if (q.t === 'fp') h += `<div class="qstim">${q.blank}</div><div class="qhint">${hint}</div>`;
  if (q.t === 'ct') h += `<div class="qstim">${esc(q.w)}</div><div class="qhint">${q.e || ''} ${esc(q.zh)}</div>`;
  if (q.t === 'rp' || q.t === 'rm') h += `<div class="qstim">${esc(q.sy ? q.sy.replace(/-/g, '·') : q.w)}</div>`;
  if (q.t === 'sp') h += `<div class="qhint">${hint}</div>
    <input id="spellin" class="spell" type="text" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" ${Q.answered ? 'disabled value="' + esc(Q.chosen) + '"' : ''}>
    ${Q.answered ? '' : '<div class="row"><button class="btn green" data-act="spellgo">✔ 送出答案</button></div>'}`;
  if (q.opts) {
    h += `<div class="opts">`;
    q.opts.forEach(o => {
      let cls = (q.t === 'lp' || q.t === 'rp') ? 'emo' : (q.t === 'lm' || q.t === 'rm') ? 'zhopt' : '';
      if (Q.answered) { if (o === q.ans) cls += ' right'; else if (o === Q.chosen) cls += ' wrong'; }
      h += `<button class="opt ${cls}" data-act="qans" data-v="${esc(o)}" ${Q.answered ? 'disabled' : ''}>${esc(o)}</button>`;
    });
    h += '</div>';
  }
  if (Q.answered) {
    const shown = q.sy ? q.sy.replace(/-/g, '·') : q.w;
    if (q.t === 'odd') h += Q.lastOk ? `<div class="feedback ok">✅ 答對了！其他三個字都有「${esc(q.common)}」</div>` : `<div class="feedback bad">❌ 不一樣的是「${esc(q.ans)}」，其他三個字都有「${esc(q.common)}」</div>`;
    else h += Q.lastOk
      ? `<div class="feedback ok">✅ 答對了！ ${q.e || ''} ${esc(shown)}　${esc(q.zh)}</div>`
      : `<div class="feedback bad">❌ 正確答案是：${esc(q.t === 'sp' || q.t === 'lw' ? q.w : q.ans)}　（${q.e || ''} ${esc(shown)}　${esc(q.zh)}）</div>`;
    h += `<div class="row"><button class="btn green" style="font-size:22px;padding:14px 40px" data-act="nextq">${Q.i + 1 >= n && Q.mode !== 'placement' ? '看成績 →' : '下一題 →'}</button></div>`;
  }
  return h + '</div>';
}

/* ----- 結果畫面 ----- */
function viewResult() {
  const r = ui.result;
  if (r.placement) {
    const sName = r.start === null ? null : UNITS[r.start];
    return `<div class="card result"><h2>🎯 分級完成！</h2>
      <p class="score">答對 ${r.correct} / ${r.total} 題</p>
      ${sName ? `<div class="unlockmsg">建議從第 ${r.start + 1} 單元「${sName.name}」開始</div><p class="muted">前面的單元已經標示為「分級已跳過」，隨時可以回去複習拿星星。</p>`
        : `<div class="unlockmsg">太厲害了！所有單元都通過分級，全部解鎖！</div><p class="muted">仍然可以回到每個單元挑戰，拿滿 5 顆星。</p>`}
      <div class="row"><button class="btn green" data-act="${sName ? 'gounit' : 'home'}" data-i="${r.start}">${sName ? '前往' + sName.name : '回首頁'}</button><button class="btn ghost" data-act="home">回首頁</button></div></div>`;
  }
  const u = r.unitId ? UNIT_BY_ID[r.unitId] : null, idx = u ? UNITS.indexOf(u) : -1;
  const msgs = ['再加油，多聽幾次再來！', '有進步，繼續努力！', '不錯喔！', '很棒！過關了！', '太厲害了！', '完美！滿分！'];
  let h = `<div class="card result">`;
  if (r.mode === 'unit' || r.mode === 'boss') {
    h += `<h2>${r.mode === 'boss' ? '🏰 ' : ''}${msgs[r.stars]}</h2><div class="starpop">${starsHTML(r.stars).replace('class="stars"', 'class="stars big"')}</div>
      <p class="score">答對 ${r.correct} / ${r.total} 題（${Math.round(r.correct / r.total * 100)}%）</p>`;
    if (r.mode === 'unit' && r.newPass) h += `<div class="unlockmsg">🔓 通過了！${idx + 1 < UNITS.length ? '下一關已解鎖' : '你完成了所有單元！'}</div>`;
    else if (r.mode === 'boss' && r.pass) h += `<div class="unlockmsg">🏰 打敗了第 ${r.stage} 階段大魔王！</div>`;
    else if (!r.pass) h += `<p class="muted">要拿到 ${S.settings.pass} 顆星以上才算過關，回去聽一聽再挑戰吧！</p>`;
  } else {
    h += `<h2>複習完成！</h2><p class="score">答對 ${r.correct} / ${r.total} 題</p>
      <p class="muted">答對的字已從複習清單移除，還剩 ${Object.keys(S.wrong).length} 個。</p>`;
  }
  if (r.wrong.length) {
    h += `<p>這些字要多注意（點一下可以聽）：</p><div class="chiprow">${r.wrong.map(x => `<button class="chip" data-act="speakw" data-w="${esc(x.w)}" data-u="${esc(x.unit)}">🔊 ${esc(x.w)}</button>`).join('')}</div>`;
  }
  h += `<div class="row">`;
  if (r.mode === 'unit') {
    h += `<button class="btn orange" data-act="retry" data-i="${idx}">🔄 再挑戰</button>`;
    if (r.pass && idx + 1 < UNITS.length) h += `<button class="btn green" data-act="gounit" data-i="${idx + 1}">下一關 →</button>`;
    h += `<button class="btn ghost" data-act="gounit" data-i="${idx}">回單元</button>`;
  } else if (r.mode === 'boss') h += `<button class="btn orange" data-act="boss" data-s="${r.stage}">🔄 再挑戰</button>`;
  else if (Object.keys(S.wrong).length) h += `<button class="btn orange" data-act="review">再複習一次</button>`;
  return h + `<button class="btn ghost" data-act="home">回首頁</button></div></div>`;
}

/* ====================================================================
 * 畫面：成就
 * ==================================================================== */
function viewAch() {
  const got = ACH.filter(a => S.achv[a.id]).length;
  return `<div class="uhead"><button class="btn ghost small" data-act="home">← 返回</button><h2>🏅 我的成就　${got} / ${ACH.length}</h2></div>
    <div class="agrid">${ACH.map(a => `<div class="ach ${S.achv[a.id] ? '' : 'locked'}"><div class="ae">${a.e}</div><b>${a.n}</b><small>${a.d}</small>${S.achv[a.id] ? `<div class="date">✔ ${S.achv[a.id]}</div>` : ''}</div>`).join('')}</div>`;
}

/* ====================================================================
 * 畫面：家長專區
 * ==================================================================== */
function bars(vals, labels, colorFn, max) {
  const W = 560, H = 140, n = vals.length, bw = W / n, m = max || Math.max(1, ...vals);
  let s = `<svg viewBox="0 0 ${W} ${H + 22}" class="chart">`;
  vals.forEach((v, i) => {
    const bh = Math.max(0, (H - 20) * v / m);
    s += `<rect x="${i * bw + 4}" y="${H - bh}" width="${bw - 8}" height="${bh}" rx="4" fill="${colorFn(v, i)}"/>`;
    s += `<text x="${i * bw + bw / 2}" y="${H + 14}" text-anchor="middle" font-size="10" fill="#64748b">${esc(labels[i])}</text>`;
    if (v) s += `<text x="${i * bw + bw / 2}" y="${H - bh - 3}" text-anchor="middle" font-size="10" fill="#334155">${v}</text>`;
  });
  return s + '</svg>';
}
function viewParent() {
  const P = ui.parent;
  if (!P.ok) {
    if (!P.gate) P.gate = { a: 13 + Math.floor(Math.random() * 7), b: 4 + Math.floor(Math.random() * 6), c: 11 + Math.floor(Math.random() * 19) };
    const g = P.gate;
    return `<div class="card gate"><h2>👨‍👩‍👧 家長專區</h2><p class="muted">請先回答下面的算式，確認是大人喔</p>
      <div class="q">${g.a} × ${g.b} + ${g.c} = ？</div>
      <input id="gateans" type="number" inputmode="numeric"><div class="row"><button class="btn green" data-act="gatego">進入</button><button class="btn ghost" data-act="home">返回</button></div></div>`;
  }
  const tabs = [['overview', '📊 概覽'], ['records', '📋 紀錄與錯字'], ['goals', '🎁 目標與獎勵'], ['cloud', '☁️ 雲端同步'], ['settings', '⚙️ 設定與備份']];
  let h = `<div class="uhead"><button class="btn ghost small" data-act="home">← 離開家長專區</button><h2>👨‍👩‍👧 家長專區　<span class="en">目前使用者：${esc(S.name)}</span></h2></div>
    <div class="tabs">${tabs.map(t => `<button class="tab ${P.tab === t[0] ? 'on' : ''}" data-act="ptab" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>`;
  if (P.tab === 'overview') h += parentOverview();
  if (P.tab === 'records') h += parentRecords();
  if (P.tab === 'goals') h += parentGoals();
  if (P.tab === 'cloud') h += parentCloud();
  if (P.tab === 'settings') h += parentSettings();
  return h;
}
function parentOverview() {
  const L = levelInfo(), ws = weekStart();
  const weekMin = Object.keys(S.time).filter(d => d >= ws).reduce((n, d) => n + S.time[d], 0) / 60;
  const totalMin = Object.values(S.time).reduce((n, v) => n + v, 0) / 60;
  const weekQ = S.history.filter(h => h.t.slice(0, 10) >= ws && h.type !== 'placement').length;
  let h = `<div class="cards">
    <div class="stat"><b>${L.title}</b><span>目前等級</span></div>
    <div class="stat"><b>⭐ ${totalStars()}/${MAXSTARS}</b><span>累計星星</span></div>
    <div class="stat"><b>🔥 ${streak()}</b><span>連續學習天數</span></div>
    <div class="stat"><b>📚 ${learnedCount()}</b><span>學過單字</span></div>
    <div class="stat"><b>${Math.round(weekMin)} 分</b><span>本週學習時間</span></div>
    <div class="stat"><b>${weekQ}</b><span>本週測驗次數</span></div>
    <div class="stat"><b>${Math.round(totalMin)} 分</b><span>累計學習時間</span></div>
    <div class="stat"><b>${S.recCount}</b><span>錄音次數</span></div></div>`;
  const days = [], vals = [];
  for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = dstr(d); days.push(`${d.getMonth() + 1}/${d.getDate()}`); vals.push(minutesOn(k)); }
  h += `<div class="card"><h3>近 14 天學習分鐘數</h3>${bars(vals, days, () => '#60a5fa')}</div>`;
  const qh = S.history.filter(isQuizH).slice(-20);
  if (qh.length) {
    const pv = qh.map(x => Math.round(x.correct / x.total * 100));
    h += `<div class="card"><h3>最近 ${qh.length} 次測驗正確率（%）</h3>${bars(pv, qh.map((x, i) => i + 1), v => v >= 80 ? '#22c55e' : v >= 60 ? '#f59e0b' : '#ef4444', 100)}<div class="hint">綠色 ≥ 80%　橘色 60–79%　紅色 &lt; 60%</div></div>`;
  }
  h += `<div class="card"><h3>各單元進度</h3><div class="tscroll"><table><tr><th>#</th><th>單元</th><th>最佳星數</th><th>挑戰次數</th><th>最近一次</th><th>狀態</th></tr>`;
  UNITS.forEach((u, i) => {
    const us = U(u.id);
    h += `<tr><td>${i + 1}</td><td>${u.icon} ${u.name}</td><td>${starsHTML(us.stars)}</td><td>${us.attempts}</td><td>${us.last || '-'}</td>
      <td>${us.stars >= S.settings.pass ? '<span class="pill g">已通過</span>' : us.skipped ? '<span class="pill">分級跳過</span>' : isUnlocked(i) ? '<span class="pill">進行中</span>' : '<span class="pill r">未解鎖</span>'}</td></tr>`;
  });
  [1, 2, 3].forEach(s => { const b = S.boss[s] || { stars: 0, attempts: 0, last: '' }; h += `<tr><td>🏰</td><td>第 ${s} 階段大魔王</td><td>${starsHTML(b.stars)}</td><td>${b.attempts}</td><td>${b.last || '-'}</td><td>${b.stars >= S.settings.pass ? '<span class="pill g">已通過</span>' : '<span class="pill">-</span>'}</td></tr>`; });
  return h + '</table></div></div>';
}
function parentRecords() {
  const typeName = { quiz: '單元測驗', review: '複習', placement: '分級', boss: '大魔王' };
  let h = `<div class="card"><h3>最近測驗紀錄</h3><div class="tscroll"><table><tr><th>時間</th><th>類型</th><th>單元</th><th>答對</th><th>星數</th></tr>`;
  S.history.slice(-60).reverse().forEach(x => {
    const un = x.type === 'boss' ? `第 ${x.stage} 階段` : x.unit ? esc((UNIT_BY_ID[x.unit] || { name: x.unit }).name) : '-';
    h += `<tr><td>${x.t}</td><td>${typeName[x.type] || x.type}</td><td>${un}</td><td>${x.correct}/${x.total}（${Math.round(x.correct / x.total * 100)}%）</td><td>${x.type === 'quiz' || x.type === 'boss' ? '★'.repeat(x.stars) || '-' : '-'}</td></tr>`;
  });
  if (!S.history.length) h += '<tr><td colspan="5" class="muted">還沒有紀錄</td></tr>';
  h += '</table></div></div>';
  const ws = Object.entries(S.wrong).sort((a, b) => b[1].count - a[1].count);
  h += `<div class="card"><h3>常錯單字（${ws.length}）</h3><p class="muted">點一下可聽發音，這些字很適合你直接陪他練習。</p><div class="chiprow">`;
  ws.slice(0, 60).forEach(([w, v]) => { h += `<button class="chip" data-act="speakw" data-w="${esc(w)}" data-u="${esc(v.unit)}">${esc(w)} ×${v.count}</button>`; });
  if (!ws.length) h += '<span class="muted">目前沒有錯字，真棒！</span>';
  return h + '</div></div>';
}
function parentGoals() {
  let h = `<div class="card"><h3>🎁 目標與獎勵</h3><p class="muted">設定目標與獎勵內容。達成時孩子會看到提示，由你確認後按「已兌換」。獎勵由你實際發放，網頁只負責記錄。（目標是每位使用者各自設定）</p>`;
  const order = { achieved: 0, active: 1, expired: 2, redeemed: 3 };
  [...S.goals].sort((a, b) => order[a.status] - order[b.status]).forEach(g => {
    const T = GOAL_TYPES[g.type]; if (!T) return;
    const v = Math.min(T.val(g), g.target), pct = Math.round(v / g.target * 100);
    h += `<div class="goal ${g.status}"><div class="gtitle">${esc(goalText(g))}</div>
      <div class="muted">獎勵：${esc(g.reward || '（未設定）')}　${T.since ? '起算日：' + g.from : ''}</div>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <div>進度 ${v} / ${g.target} ${T.unit}　${g.status === 'achieved' ? '<span class="pill g">已達成，等你發獎勵</span>' : g.status === 'redeemed' ? `<span class="pill">已兌換 ${g.redeemedAt || ''}</span>` : g.status === 'expired' ? '<span class="pill r">已逾期</span>' : '<span class="pill">進行中</span>'}</div>
      <div class="row left">${g.status === 'achieved' ? `<button class="btn green small" data-act="redeem" data-id="${g.id}">✔ 已兌換</button>` : ''}
      <button class="btn ghost small" data-act="delgoal" data-id="${g.id}">刪除</button></div></div>`;
  });
  if (!S.goals.length) h += '<p class="muted">還沒有目標，下面新增一個吧。</p>';
  h += `</div><div class="card"><h3>➕ 新增目標</h3><div class="form">
    <div><label>目標類型</label><select id="g-type">${Object.entries(GOAL_TYPES).map(([k, v]) => `<option value="${k}">${v.n}（${v.unit}）${v.since ? '・從今天起算' : ''}</option>`).join('')}</select></div>
    <div><label>目標數量</label><input id="g-target" type="number" min="1" value="3" inputmode="numeric"></div>
    <div><label>期限</label><select id="g-days"><option value="0">不限期</option><option value="7">7 天內</option><option value="14">14 天內</option><option value="30">30 天內</option></select></div>
    <div><label>獎勵內容</label><input id="g-reward" type="text" placeholder="例如：週末 30 分鐘遊戲時間"></div></div>
    <div class="row left"><button class="btn green" data-act="addgoal">新增目標</button></div>
    <p class="hint" style="text-align:left">範例：「完成測驗 3 次，7 天內」「連續學習 5 天」「累計星星 20 顆」「通過單元 5 個」</p></div>`;
  return h;
}
function parentCloud() {
  const c = Cloud.cfg || {};
  return `<div class="card"><h3>☁️ 雲端同步（Google 試算表）</h3>
    <p class="muted">用來把每位小朋友的進度存到你自己的 Google 試算表，換 iPad 或換裝置時，輸入同一個英文名字就能接續。設定步驟請看 README。</p>
    <p>狀態：<b>${Cloud.enabled() ? '已設定' : '尚未設定'}</b>　<span id="cloudst2">${esc(Cloud.status)}</span></p>
    <div class="setrow"><label>網頁應用程式網址（結尾是 /exec）</label><input id="c-url" type="text" value="${esc(c.url || '')}" placeholder="https://script.google.com/macros/s/.../exec"></div>
    <div class="setrow"><label>家庭密碼（要和 Apps Script 裡的 KEY 完全一樣）</label><input id="c-key" type="text" value="${esc(c.key || '')}" autocomplete="off"></div>
    <div class="row left"><button class="btn green small" data-act="csave">💾 儲存設定</button><button class="btn small" data-act="ctest">🔌 測試連線</button>
      <button class="btn orange small" data-act="cpush">⬆️ 立即上傳目前使用者</button><button class="btn purple small" data-act="cpull">⬇️ 從雲端還原目前使用者</button></div></div>
  <div class="card"><h3>📲 其他裝置要怎麼設定？</h3>
    <p class="muted">按下面的按鈕產生「設定連結」，用 AirDrop 或訊息傳到其他裝置，在 Safari 開啟，就會自動設好雲端同步（網址和密碼只會存在那台裝置，不會被傳送出去）。請只傳給你信任的人。</p>
    <div class="row left"><button class="btn small" data-act="clink" ${Cloud.enabled() ? '' : 'disabled'}>🔗 產生設定連結</button><button class="btn red small" data-act="cclear" ${Cloud.enabled() ? '' : 'disabled'}>停用這台裝置的雲端同步</button></div>
    <textarea id="c-link" placeholder="連結會顯示在這裡" readonly></textarea></div>`;
}
function parentSettings() {
  const vs = Speech.voices, st = S.settings;
  return `<div class="card"><h3>⚙️ 設定（${esc(S.name)}）</h3>
    <div class="setrow"><label>過關門檻（至少幾顆星才解鎖下一關）</label>
      <select id="s-pass">${[1, 2, 3, 4, 5].map(n => `<option value="${n}" ${st.pass === n ? 'selected' : ''}>${n} 顆星（正確率 ${PCT[n]}% 以上）</option>`).join('')}</select></div>
    <div class="setrow"><label>每次單元測驗的題數</label>
      <select id="s-qn">${[10, 15, 20, 25].map(n => `<option value="${n}" ${(st.qn || 15) === n ? 'selected' : ''}>${n} 題</option>`).join('')}</select></div>
    <div class="setrow"><label>挑戰模式</label>
      <select id="s-hard"><option value="0">關：拼字與補字題會顯示圖示和中文提示</option><option value="1" ${st.hard ? 'selected' : ''}>開：不顯示提示，更多拼字與「看字選意思」題</option></select></div>
    <div class="setrow"><label>發音聲音（依 iPad 內建語音而定）</label>
      <select id="s-voice"><option value="">自動（建議）</option>${vs.map(v => `<option value="${esc(v.voiceURI)}" ${st.voice === v.voiceURI ? 'selected' : ''}>${esc(v.name)}（${esc(v.lang)}）</option>`).join('')}</select></div>
    <div class="setrow"><label>語速：<span id="rate-v">${st.rate}</span></label>
      <input id="s-rate" type="range" min="0.5" max="1.1" step="0.05" value="${st.rate}" style="width:100%"></div>
    <div class="row left"><button class="btn orange small" data-act="testvoice">🔊 試聽 "Hello, this is a test"</button><button class="btn green" data-act="savesettings">💾 儲存設定</button></div>
    <p class="hint" style="text-align:left">以上設定是每位使用者各自一份。想要更好聽的語音：iPad「設定 → 輔助使用 → 語音內容 → 聲音 → 英文」可下載 Enhanced / Premium 語音。</p></div>
  <div class="card"><h3>💾 備份與還原（目前使用者）</h3>
    <p class="muted">資料存在這台 iPad 的瀏覽器裡；有設定雲端同步的話，也會存在你的 Google 試算表。</p>
    <div class="row left"><button class="btn small" data-act="exportdl">⬇️ 下載備份檔</button><button class="btn ghost small" data-act="exporttxt">📋 顯示備份文字</button></div>
    <div class="setrow"><label>還原：選擇備份檔</label><input id="imp-file" type="file" accept=".json,application/json"></div>
    <div class="setrow"><label>或貼上備份文字</label><textarea id="imp-text" placeholder="貼上備份內容"></textarea></div>
    <div class="row left"><button class="btn orange small" data-act="import">還原資料</button></div></div>
  <div class="card"><h3>🧰 進階</h3><div class="row left">
    <button class="btn ghost small" data-act="unlockall">🔓 解鎖全部單元</button>
    <button class="btn ghost small" data-act="replace">🎯 重新做分級測驗</button>
    <button class="btn red small" data-act="reset">🗑️ 清除這位使用者在這台裝置的紀錄</button></div></div>`;
}

/* ====================================================================
 * 渲染與事件
 * ==================================================================== */
function render() {
  const v = ui.view;
  const html = v === 'login' ? viewLogin() : v === 'home' ? viewHome() : v === 'unit' ? viewUnit() : v === 'quiz' ? viewQuiz() : v === 'result' ? viewResult() : v === 'ach' ? viewAch() : v === 'parent' ? viewParent() : '';
  $('#app').innerHTML = html;
  if (v === 'quiz' && ui.speakQ) { ui.speakQ = false; Speech.say(qSpeak(Q.qs[Q.i])); }
}
function openUnit(i, tab) {
  if (!isUnlocked(i)) { toast(`🔒 先通過上一關（至少 ${S.settings.pass} 顆星）`); return; }
  ui.say = { i: 0, recording: false, has: false }; ui.game = null;
  go('unit', { unit: UNITS[i].id, tab: tab || 'listen' });
}
async function toggleRec() {
  if (!Rec.supported()) { toast('這個瀏覽器不支援錄音'); return; }
  if (!ui.say.recording) {
    try { if ('speechSynthesis' in window) speechSynthesis.cancel(); await Rec.start(); ui.say.recording = true; }
    catch (e) { toast('無法使用麥克風：請到「設定 → Safari → 麥克風」允許，並重新整理頁面'); return; }
  } else {
    await Rec.stop(); ui.say.recording = false; ui.say.has = true; S.recCount++; afterActivity();
  }
  render();
}
async function playAll(u) {
  const btn = $('#playall');
  if (ui.playing) { ui.playing = false; Speech.token++; try { speechSynthesis.cancel(); } catch (e) { /* ignore */ } return; }
  ui.playing = true; if (btn) btn.textContent = '⏹ 停止';
  for (let i = 0; i < u.words.length && ui.playing; i++) {
    const el = $('#wc' + i); if (el) { el.classList.add('playing'); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    await Speech.say(spokenText(u.words[i]));
    if (el) el.classList.remove('playing');
    await new Promise(r => setTimeout(r, 450));
  }
  ui.playing = false; const b = $('#playall'); if (b) b.textContent = '▶ 全部播放';
}
async function sayParts(w) {
  for (const p of w.sy.split('-')) { await Speech.say(p, { slow: true }); await new Promise(r => setTimeout(r, 250)); }
  await new Promise(r => setTimeout(r, 300)); Speech.say(w.w);
}
function download(name, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function importData(text) {
  try {
    const d = JSON.parse(text);
    if (!d || !d.v || !d.units) throw new Error('bad');
    const nm = S.name; S = normalize(d); S.name = nm; S.updated = Date.now(); save(true); Cloud.schedule();
    toast('✅ 已還原資料'); go('parent', { parent: Object.assign(ui.parent, { tab: 'overview' }) });
  } catch (e) { toast('備份內容格式不正確'); }
}
const val = id => { const el = document.getElementById(id); return el ? el.value : ''; };
async function switchUser() {
  toast('儲存中…');
  save(true); // 只是換人，沒有新的學習紀錄，不能更新「最後修改時間」，也不要強制上傳，否則會蓋掉雲端較新的進度
  await Promise.race([Cloud.flush(), new Promise(r => setTimeout(r, 8000))]);
  save(true); ID = ''; S = defaultState(); ui.parent.ok = false; Q = null;
  go('login');
}
async function cloudAction(act) {
  try {
    if (act === 'csave') {
      const url = val('c-url').trim(), key = val('c-key').trim();
      if (!URL_OK.test(url)) return toast('網址格式不對：要是 https://script.google.com/macros/s/…/exec');
      if (!key) return toast('請輸入家庭密碼');
      Cloud.setCfg(url, key); toast('✅ 已儲存，按「測試連線」確認'); return render();
    }
    if (act === 'ctest') {
      if (!Cloud.enabled()) return toast('請先儲存網址與密碼');
      toast('連線測試中…'); await Cloud.call({ action: 'ping' }); return toast('✅ 連線成功！');
    }
    if (act === 'cpush') {
      if (!Cloud.enabled()) return toast('請先儲存網址與密碼');
      toast('上傳中…'); Cloud.dirty = true; const ok = await Cloud.flush();
      return toast(ok ? '✅ 已上傳到雲端' : '上傳失敗：' + (Cloud.lastErr || '請稍後再試'));
    }
    if (act === 'cpull') {
      if (!Cloud.enabled()) return toast('請先儲存網址與密碼');
      toast('讀取中…'); const r = await Cloud.call({ action: 'get', name: ID });
      if (!r.state) return toast('雲端還沒有這位使用者的紀錄');
      if (confirm('要用雲端的紀錄取代這台裝置上「' + S.name + '」的紀錄嗎？')) { adopt(JSON.parse(r.state)); toast('✅ 已從雲端還原'); go('parent', { parent: Object.assign(ui.parent, { tab: 'overview' }) }); }
      return;
    }
    if (act === 'clink') {
      const code = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify({ u: Cloud.cfg.url, k: Cloud.cfg.key })))));
      const ta = document.getElementById('c-link'); ta.value = location.origin + location.pathname + '#cfg=' + code; ta.focus(); ta.select();
      return toast('連結已顯示在下方，可全選複製');
    }
    if (act === 'cclear') { if (confirm('停用後，這台裝置不會再同步（雲端的資料不會被刪除）。確定嗎？')) { Cloud.clearCfg(); toast('已停用'); render(); } }
  } catch (e) { toast('失敗：' + Cloud.err(e)); }
}

function onAct(act, el) {
  const d = el.dataset;
  switch (act) {
    case 'login-go': { const a = document.getElementById('adopt'); return void doLogin(val('loginname'), a ? a.checked : false); }
    case 'pickp': return void doLogin(d.n, false);
    case 'switchuser': return void switchUser();
    case 'home': return go('home');
    case 'ach': return go('ach');
    case 'parent': ui.parent.ok = false; ui.parent.gate = null; return go('parent', { parent: Object.assign(ui.parent, { tab: 'overview' }) });
    case 'openunit': return openUnit(+d.i);
    case 'gounit': return openUnit(+d.i);
    case 'tab': ui.tab = d.t; stopAll(); if (d.t === 'play') ui.game = null; return render();
    case 'speak': { const u = UNIT_BY_ID[ui.unit]; return void Speech.say(spokenText(u.words[+d.i])); }
    case 'speakw': { const w = findWord(d.w, d.u); return void Speech.say(w ? spokenText(w) : d.w); }
    case 'syl': { const u = UNIT_BY_ID[ui.unit]; return void sayParts(u.words[+d.i]); }
    case 'playall': return void playAll(UNIT_BY_ID[ui.unit]);
    case 'say-normal': return void Speech.say(spokenText(UNIT_BY_ID[ui.unit].words[ui.say.i]));
    case 'say-slow': return void Speech.say(UNIT_BY_ID[ui.unit].words[ui.say.i].w, { slow: true });
    case 'say-prev': case 'say-next': {
      if (ui.say.recording) return toast('請先停止錄音');
      const n = UNIT_BY_ID[ui.unit].words.length;
      ui.say.i = (ui.say.i + (act === 'say-next' ? 1 : n - 1)) % n; ui.say.has = false; return render();
    }
    case 'rec': return void toggleRec();
    case 'rec-play': return Rec.play();
    case 'flip': return flipCard(+d.i);
    case 'newgame': ui.game = null; return render();
    case 'startquiz': return startQuiz('unit', ui.unit);
    case 'retry': return startQuiz('unit', UNITS[+d.i].id);
    case 'boss': if (!stageDone(+d.s)) return toast('🔒 先通過這個階段的所有單元'); return startQuiz('boss', null, +d.s);
    case 'review': return startQuiz('review');
    case 'placement': return startQuiz('placement');
    case 'skipplace': S.placement = { date: today(), start: 0, skipped: true }; save(); return render();
    case 'quitquiz': if (confirm('要離開測驗嗎？這次的成績不會計算。')) { Q = null; return go('home'); } return;
    case 'qplay': return void Speech.say(qSpeak(Q.qs[Q.i]));
    case 'qslow': return void Speech.say(Q.qs[Q.i].w, { slow: true });
    case 'qans': return answerQ(d.v);
    case 'spellgo': { const v = val('spellin'); if (!v.trim()) return toast('先把答案拼出來喔'); return answerQ(v); }
    case 'nextq': return nextQ();
    /* 家長專區 */
    case 'gatego': {
      const g = ui.parent.gate;
      if (+val('gateans') === g.a * g.b + g.c) { ui.parent.ok = true; return render(); }
      ui.parent.gate = null; toast('答案不對，換一題'); return render();
    }
    case 'ptab': ui.parent.tab = d.t; return render();
    case 'addgoal': {
      const target = Math.max(1, parseInt(val('g-target'), 10) || 1);
      S.goals.push({ id: 'g' + Date.now(), type: val('g-type'), target, days: parseInt(val('g-days'), 10) || 0, reward: val('g-reward').trim().slice(0, 60), from: today(), status: 'active' });
      checkGoals(); save(); Cloud.schedule(); toast('已新增目標'); return render();
    }
    case 'redeem': { const g = S.goals.find(x => x.id === d.id); if (g) { g.status = 'redeemed'; g.redeemedAt = today(); save(); Cloud.schedule(); toast('已記錄兌換'); } return render(); }
    case 'delgoal': if (confirm('確定要刪除這個目標嗎？')) { S.goals = S.goals.filter(x => x.id !== d.id); save(); Cloud.schedule(); render(); } return;
    case 'testvoice': S.settings.voice = val('s-voice'); S.settings.rate = +val('s-rate'); return void Speech.say('Hello, this is a test. Cat, dog, ship, rain.');
    case 'savesettings':
      S.settings.pass = +val('s-pass'); S.settings.qn = +val('s-qn') || 15; S.settings.hard = val('s-hard') === '1';
      S.settings.voice = val('s-voice'); S.settings.rate = +val('s-rate');
      save(); Cloud.schedule(); toast('✅ 已儲存'); return render();
    case 'csave': case 'ctest': case 'cpush': case 'cpull': case 'clink': case 'cclear': return void cloudAction(act);
    case 'exportdl': return download(`phonics-backup-${S.name}-${today()}.json`, JSON.stringify(S));
    case 'exporttxt': { const ta = document.getElementById('imp-text'); ta.value = JSON.stringify(S); ta.focus(); ta.select(); return toast('已顯示在下方文字框，可全選複製'); }
    case 'import': {
      const f = document.getElementById('imp-file').files[0];
      if (f) { const r = new FileReader(); r.onload = () => importData(String(r.result)); r.readAsText(f); return; }
      const t = val('imp-text').trim(); if (!t) return toast('請選擇備份檔或貼上備份文字'); return importData(t);
    }
    case 'unlockall': UNITS.forEach(u => { U(u.id).unlocked = true; }); save(); Cloud.schedule(); return toast('已解鎖全部單元');
    case 'replace': S.placement = null; UNITS.forEach(u => { U(u.id).skipped = false; }); save(); Cloud.schedule(); toast('回到首頁就可以重新分級'); return;
    case 'reset':
      if (confirm(`這會清除「${S.name}」在這台裝置上的學習紀錄。若有雲端同步，下次用同一個名字登入會從雲端還原。確定嗎？`)) {
        lsDel(K_PROF + ID); const ix = readIndex(); ix.names = ix.names.filter(x => x.id !== ID); ix.last = ''; writeIndex(ix);
        ID = ''; S = defaultState(); Q = null; go('login');
      }
      return;
  }
}
document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (el) onAct(el.dataset.act, el); });
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if (e.target.id === 'spellin') { e.preventDefault(); onAct('spellgo', e.target); }
  if (e.target.id === 'gateans') { e.preventDefault(); onAct('gatego', e.target); }
  if (e.target.id === 'loginname') { e.preventDefault(); onAct('login-go', e.target); }
});
document.addEventListener('input', e => {
  if (e.target.id === 's-rate') { const o = document.getElementById('rate-v'); if (o) o.textContent = e.target.value; }
});

/* ---------------------------- 學習時間統計 ---------------------------- */
let lastInt = Date.now(), tick = 0;
['pointerdown', 'keydown', 'touchstart'].forEach(ev => document.addEventListener(ev, () => { lastInt = Date.now(); }, { passive: true }));
setInterval(() => {
  if (ID && document.visibilityState === 'visible' && Date.now() - lastInt < 60000) {
    const d = today(); S.time[d] = (S.time[d] || 0) + 5;
    if (++tick % 6 === 0) save(true);
  }
}, 5000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { save(true); Cloud.flush(); }
});
window.addEventListener('online', () => { if (Cloud.dirty) Cloud.flush(); });

/* ---------------------------- 啟動 ---------------------------- */
(function boot() {
  const ix = readIndex();
  if (ix.names.length === 1) { // 這台只有一位使用者：直接進入
    const p = ix.names[0], t = lsGet(K_PROF + p.id);
    if (t) {
      try { openProfile(p.id, p.name, normalize(JSON.parse(t)), false); Cloud.syncDown(); return; } catch (e) { /* 資料壞了就回到登入畫面 */ }
    }
  }
  ui.view = 'login'; render();
})();
