// ================= БАЗА УПРАЖНЕНИЙ =================
const EXERCISES = {
  'Грудь': ['Жим лёжа (штанга / Смит)', 'Жим на наклонной (штанга / Смит)', 'Жим гантелей лёжа', 'Жим гантелей на наклонной', 'Сведение рук в тренажере (Бабочка)', 'Сведение рук в кроссовере', 'Отжимания на брусьях (грудь)'],
  'Спина': ['Тяга блока сверху (широкий хват)', 'Тяга блока сверху (узкий обратный хват)', 'Подтягивания (прямой / обратный)', 'Тяга блока к поясу (прямой хват)', 'Тяга блока к поясу (обратный хват)', 'Тяга штанги в наклоне (штанга / Смит)', 'Тяга гантели в наклоне', 'Тяга Т-грифа', 'Становая тяга (штанга / Смит)', 'Румынская тяга (штанга / Смит)', 'Гиперэкстензия', 'Шраги со штангой (штанга / Смит)', 'Шраги с гантелями'],
  'Ноги': ['Присед (штанга / Смит)', 'Фронтальный присед (штанга / Смит)', 'Жим ногами', 'Болгарский сплит-присед (гантели)', 'Выпады с гантелями', 'Разгибание ног в тренажере', 'Сгибание ног в тренажере (лёжа)', 'Ягодичный мостик (штанга / Смит)', 'Разведение ног в тренажере', 'Сведение ног в тренажере', 'Подъемы на носки (стоя)', 'Подъемы на носки (сидя)'],
  'Плечи': ['Жим штанги стоя (армейский)', 'Жим гантелей сидя', 'Жим в тренажере (на плечи)', 'Махи гантелями в стороны', 'Махи гантелями в наклоне', 'Обратная бабочка', 'Тяга к подбородку (штанга / Смит)'],
  'Руки': ['Подъем штанги на бицепс', 'Молотки (гантели)', 'Сгибание на скамье Скотта', 'Сгибание на бицепс в тренажере', 'Жим узким хватом (штанга / Смит)', 'Разгибание на блоке (веревка)', 'Французский жим', 'Отжимания на брусьях (трицепс)'],
  'Предплечья': ['Сгибание запястий со штангой', 'Разгибание запястий со штангой', 'Фермерская прогулка (гантели)'],
  'Пресс': ['Скручивания на полу', 'Скручивания на наклонной скамье', 'Скручивания с весом', 'Подъем ног в висе', 'Планка', 'Скручивания в кроссовере'],
  'Кардио': ['Беговая дорожка', 'Эллиптический тренажер', 'Лыжный тренажер', 'Гребной тренажер', 'Велотренажер']
};

// ДОСТИЖЕНИЯ
const ACHIEVEMENTS = {
  first_w: { name: 'Первый шаг', desc: 'Завершить первую тренировку' },
  streak_3: { name: 'Разогрев', desc: 'Серия 3 дня' },
  streak_7: { name: 'Неделя', desc: 'Серия 7 дней' },
  streak_30: { name: 'Железная воля', desc: 'Серия 30 дней' },
  lift_100: { name: 'Сотка', desc: 'Поднять 100 кг' },
  weight_10: { name: 'Контроль', desc: 'Записать 10 замеров веса' },
  plan_created: { name: 'Архитектор', desc: 'Создать свой план' },
  water_2000: { name: 'Водохлеб', desc: 'Выпить 2 литра за день' },
  no_skip: { name: 'Без пропусков', desc: '5 тренировок подряд' },
  full_body: { name: 'Универсал', desc: 'Тренировка всех групп мышц' }
};

// ХРАНИЛИЩЕ
let db = JSON.parse(localStorage.getItem('fitdiary_v40')) || {
  plan: {}, workouts: [], weights: [],
  activeSession: null, name: 'Атлет', timer: 90, achievements: []
};
const save = () => localStorage.setItem('fitdiary_v40', JSON.stringify(db));
const $ = id => document.getElementById(id);
const today = () => new Date().toLocaleDateString('sv-SE');

// ================= ТАЙМЕР =================
let timerInt;
function startTimer(sec) {
  clearInterval(timerInt);
  let endTime = Date.now() + sec * 1000;
  $('timerDisplay').style.display = 'block';
  const update = () => {
    const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    const m = Math.floor(remaining / 60), s = remaining % 60;
    $('timerDisplay').textContent = `${m<10?'0':''}${m}:${s<10?'0':''}${s}`;
    if (remaining <= 0) {
      clearInterval(timerInt);
      $('timerDisplay').textContent = "ГОТОВО!";
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      setTimeout(() => { $('timerDisplay').style.display = 'none'; }, 5000);
    }
  };
  update();
  timerInt = setInterval(update, 1000);
}
function stopTimer() { clearInterval(timerInt); $('timerDisplay').style.display = 'none'; }

// ================= ПЛАН =================
function renderPlan() {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  $('planList').innerHTML = days.map(day => {
    const exs = db.plan[day] || [];
    return `<div class="acc-item">
      <div class="acc-header" onclick="toggleDay('${day}', this)">
        ${day} ${exs.length > 0 ? `<span style="font-size:12px; color:var(--muted); margin-left:10px;">(${exs.length})</span>` : ''}
        <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
      </div>
      <div class="acc-body" id="day-body-${day}">
        <button class="ghost" onclick="openExModal('${day}')" style="margin-bottom:10px;">+ Добавить упражнение</button>
        <div id="day-list-${day}">
          ${exs.map(ex => `<div class="ex-list-item" style="cursor:default;">${ex} <button class="del" style="width:auto; padding:2px 8px; margin:0; font-size:14px;" onclick="removeEx('${day}', '${ex}')">×</button></div>`).join('')}
        </div>
        ${exs.length > 0 ? `<button class="primary" onclick="startDay('${day}')" style="margin-top:10px;">Начать тренировку</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

function toggleDay(day, header) {
  const body = $(`day-body-${day}`);
  const isOpen = body.classList.contains('open');
  document.querySelectorAll('.acc-body').forEach(b => b.classList.remove('open'));
  document.querySelectorAll('.acc-header').forEach(h => h.classList.remove('open'));
  if (!isOpen) { body.classList.add('open'); header.classList.add('open'); }
}

function removeEx(day, ex) { db.plan[day] = db.plan[day].filter(e => e !== ex); save(); renderPlan(); }

// ================= МОДАЛКА =================
let currentDayForEx = '';
function openExModal(day) {
  currentDayForEx = day;
  renderExModalBody('');
  $('exModal').classList.add('on');
}
function closeExModal() { $('exModal').classList.remove('on'); }
function renderExModalBody(query) {
  const container = $('exModalBody');
  container.innerHTML = '';
  for (let [cat, exs] of Object.entries(EXERCISES)) {
    const filtered = exs.filter(ex => ex.toLowerCase().includes(query));
    if (filtered.length > 0) {
      let html = `<div class="acc-item">
        <div class="acc-header" onclick="toggleModalCat(this)">${cat} <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></div>
        <div class="acc-body">`;
      filtered.forEach(ex => { html += `<div class="ex-list-item" onclick="addExToPlan('${ex}')">${ex}</div>`; });
      html += `</div></div>`;
      container.innerHTML += html;
    }
  }
}
function toggleModalCat(header) {
  const body = header.nextElementSibling;
  body.classList.toggle('open');
  header.classList.toggle('open');
}
function addExToPlan(ex) {
  if (!db.plan[currentDayForEx]) db.plan[currentDayForEx] = [];
  if (!db.plan[currentDayForEx].includes(ex)) {
    db.plan[currentDayForEx].push(ex);
    if (!db.achievements.includes('plan_created')) db.achievements.push('plan_created');
    save(); renderPlan();
  }
  closeExModal();
}

// ================= ТРЕНИРОВКА =================
function startDay(day) {
  const exs = db.plan[day] || [];
  if (exs.length === 0) return alert('Нет упражнений');
  db.activeSession = { day: day, date: today(), exercises: exs.map(e => ({ ex: e, sets: [{ w: '', r: '', done: false }] })) };
  save(); renderSession();
  $('activeSession').scrollIntoView({ behavior: 'smooth' });
}

function renderSession() {
  const card = $('activeSession');
  if (!db.activeSession) { card.style.display = 'none'; return; }
  card.style.display = 'block';
  $('sessionTitle').textContent = `Тренировка: ${db.activeSession.day}`;
  
  let html = '';
  db.activeSession.exercises.forEach((ex, i) => {
    html += `<div class="sess-ex">
      <div class="sess-ex-title">${ex.ex}</div>`;
    ex.sets.forEach((set, j) => {
      html += `<div class="set-row">
        <div class="set-num">Подход ${j+1}</div>
        <input type="number" placeholder="кг" value="${set.w}" onchange="updateSet(${i}, ${j}, 'w', this.value)">
        <input type="number" placeholder="повт" value="${set.r}" onchange="updateSet(${i}, ${j}, 'r', this.value)">
        <button onclick="removeSet(${i}, ${j})">×</button>
        <button class="${set.done ? 'primary' : 'ghost'}" style="width: auto; padding: 8px 12px; margin: 0;" onclick="toggleSetDone(${i}, ${j})">${set.done ? '✓' : 'Выполнено'}</button>
      </div>`;
    });
    html += `<button class="ghost" onclick="addSet(${i})" style="padding:8px; font-size:12px;">+ Подход</button></div>`;
  });
  $('sessionList').innerHTML = html;
}

function updateSet(exIdx, setIdx, field, val) { db.activeSession.exercises[exIdx].sets[setIdx][field] = val; save(); }
function addSet(exIdx) { db.activeSession.exercises[exIdx].sets.push({ w: '', r: '', done: false }); save(); renderSession(); }
function removeSet(exIdx, setIdx) { if (db.activeSession.exercises[exIdx].sets.length > 1) { db.activeSession.exercises[exIdx].sets.splice(setIdx, 1); save(); renderSession(); } }

// ТАЙМЕР ЗАПУСКАЕТСЯ ТОЛЬКО ЗДЕСЬ!
function toggleSetDone(exIdx, setIdx) {
  const set = db.activeSession.exercises[exIdx].sets[setIdx];
  set.done = !set.done;
  save();
  if (set.done) {
    startTimer(db.timer); // Запускаем таймер после выполнения
  }
  renderSession();
}

function finishSession() {
  if (!db.activeSession) return;
  db.workouts.push({ date: db.activeSession.date, exercises: db.activeSession.exercises });
  if (!db.achievements.includes('first_w')) db.achievements.push('first_w');
  db.activeSession = null;
  save(); renderSession(); renderProfile();
  alert('Тренировка завершена!');
}
function cancelSession() { if (confirm('Отменить?')) { db.activeSession = null; save(); renderSession(); } }

// ================= ВЕС И ПРОГРЕСС =================
function addWeight() {
  const d = $('wDate').value;
  const kg = parseFloat($('wKg').value);
  if (!d || !kg) return alert('Заполните поля');
  db.weights = db.weights.filter(w => w.date !== d);
  db.weights.push({ date: d, kg });
  db.weights.sort((a,b) => b.date.localeCompare(a.date));
  save(); renderWeightResult();
  if (db.weights.length >= 10 && !db.achievements.includes('weight_10')) db.achievements.push('weight_10');
  renderProfile();
}
function renderWeightResult() {
  const list = db.weights.slice(0, 5);
  $('weightResult').innerHTML = list.map((w, i) => {
    let change = '';
    if (i < list.length - 1) {
      const diff = w.kg - list[i+1].kg;
      change = diff !== 0 ? `<span style="color:${diff > 0 ? 'var(--ok)' : 'var(--del)'}">${diff > 0 ? '+' : ''}${diff.toFixed(1)} кг</span>` : '';
    }
    return `<div style="display:flex; justify-content:space-between; font-size:14px; padding:5px 0;"><span>${w.date}</span><span>${w.kg} кг ${change}</span></div>`;
  }).join('');
}

function renderMuscleMap() {
  const groups = { 'Грудь': 0, 'Спина': 0, 'Ноги': 0, 'Плечи': 0, 'Руки': 0, 'Пресс': 0 };
  db.workouts.forEach(w => {
    w.exercises.forEach(ex => {
      for (let [cat, exs] of Object.entries(EXERCISES)) {
        if (exs.includes(ex.ex) && groups[cat] !== undefined) groups[cat] += ex.sets.length;
      }
    });
  });
  const total = Object.values(groups).reduce((s,v) => s+v, 0) || 1;
  let html = '';
  for (let [g, v] of Object.entries(groups)) {
    const pct = Math.round((v/total)*100);
    html += `<div class="muscle-bar"><div class="muscle-name">${g}</div><div class="muscle-progress"><div class="muscle-fill" style="width:${pct}%"></div></div><div class="muscle-percent">${pct}%</div></div>`;
  }
  $('muscleMap').innerHTML = html;
}

function renderHistoryEx() {
  const names = [...new Set(db.workouts.flatMap(w => w.exercises.map(e => e.ex)))];
  $('historyEx').innerHTML = names.map(n => `<option>${n}</option>`).join('');
  updateHistoryResult();
}
function updateHistoryResult() {
  const ex = $('historyEx').value;
  const rows = db.workouts.filter(w => w.exercises.some(e => e.ex === ex));
  if (rows.length < 2) { $('historyResult').innerHTML = '<div style="color:var(--muted)">Мало данных</div>'; return; }
  const getMax = (w) => { const e = w.exercises.find(x => x.ex === ex); return Math.max(...e.sets.map(s => s.w)); };
  const last = rows[rows.length - 1], prev = rows[rows.length - 2];
  const lastMax = getMax(last), prevMax = getMax(prev);
  const diff = lastMax - prevMax;
  const pct = prevMax > 0 ? ((diff / prevMax) * 100).toFixed(1) : 0;
  $('historyResult').innerHTML = `
    <div style="font-size:14px; padding:5px 0;">Прошлый раз: <b>${prevMax} кг</b></div>
    <div style="font-size:14px; padding:5px 0;">Сейчас: <b>${lastMax} кг</b></div>
    <div style="font-size:14px; padding:5px 0; color:${diff >= 0 ? 'var(--ok)' : 'var(--del)'};">Изменение: ${diff > 0 ? '+' : ''}${diff} кг (${pct}%)</div>
  `;
}

// ================= ПРОФИЛЬ =================
function renderProfile() {
  $('userName').value = db.name;
  $('timerSetting').value = db.timer;
  $('streakDisplay').textContent = calcStreak();
  
  let html = '';
  for (let [id, a] of Object.entries(ACHIEVEMENTS)) {
    const got = db.achievements.includes(id);
    html += `<div class="ach-item ${got ? 'got' : ''}" onclick="alert('${a.name}: ${a.desc}')">
      <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      <div>${a.name}</div>
    </div>`;
  }
  $('achList').innerHTML = html;
}

function calcStreak() {
  if (db.workouts.length === 0) return 0;
  const dates = [...new Set(db.workouts.map(w => w.date))].sort().reverse();
  const todayStr = today();
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('sv-SE');
  if (dates[0] !== todayStr && dates[0] !== yesterday) return 0;
  let streak = 1;
  let cur = new Date(dates[0]);
  for (let i = 1; i < dates.length; i++) {
    let prev = new Date(dates[i]);
    let diff = Math.round((cur - prev) / (1000 * 60 * 60 * 24));
    if (diff <= 2) { streak++; cur = prev; } else { break; }
  }
  return streak;
}

function saveName(val) { db.name = val.trim() || 'Атлет'; save(); }
function saveTimer(val) { db.timer = parseInt(val); save(); }
function resetData() { if (confirm('Удалить ВСЁ?')) { localStorage.removeItem('fitdiary_v40'); location.reload(); } }

// ================= НАВИГАЦИЯ =================
function switchTab(tab, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('on'));
  $(`page-${tab}`).classList.add('on');
  document.querySelectorAll('.bottom button').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  if (tab === 'progress') { renderWeightResult(); renderMuscleMap(); renderHistoryEx(); }
  if (tab === 'profile') renderProfile();
}

// ================= СТАРТ =================
function init() {
  $('wDate').value = today();
  renderPlan();
  renderSession();
  renderWeightResult();
  renderMuscleMap();
  renderHistoryEx();
  renderProfile();
}
init();
if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js'); }
