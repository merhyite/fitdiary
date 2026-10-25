// ================= ВАШ ПЛАН =================
const PLAN = {
  'Вт (Грудь/Спина/Ноги)': [
    'Жим лёжа', 'Тяга блока сверху (широкий)', 'Жим на наклонной', 
    'Тяга блока сверху (узкий обратный)', 'Бабочка', 'Шраги', 
    'Жим ногами', 'Разгибание ног', 'Подъемы на носки'
  ],
  'Пт (Руки/Плечи/Ноги)': [
    'Сгибание на бицепс', 'Жим в тренажере (плечи)', 'Молотки', 
    'Тяга к подбородку', 'Разгибание на блоке', 'Обратная бабочка', 
    'Сгибание ног', 'Разведение ног', 'Подъемы на носки'
  ]
};

// ХРАНИЛИЩЕ
let db = JSON.parse(localStorage.getItem('fitdiary_plan')) || {
  activeSession: null, name: 'Атлет', timer: 90
};
const save = () => localStorage.setItem('fitdiary_plan', JSON.stringify(db));
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
  let html = '';
  for (let [day, exs] of Object.entries(PLAN)) {
    html += `<div class="day-block">
      <div class="day-header" onclick="toggleDay(this)">
        ${day} <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
      </div>
      <div class="day-body">
        ${exs.map(ex => `<div class="ex-item">${ex}</div>`).join('')}
        <button class="primary" onclick="startDay('${day}')" style="margin-top:15px;">Начать тренировку</button>
      </div>
    </div>`;
  }
  $('planList').innerHTML = html;
}

function toggleDay(header) {
  const body = header.nextElementSibling;
  const isOpen = body.classList.contains('open');
  document.querySelectorAll('.day-body').forEach(b => b.classList.remove('open'));
  document.querySelectorAll('.day-header').forEach(h => h.classList.remove('open'));
  if (!isOpen) { body.classList.add('open'); header.classList.add('open'); }
}

// ================= ТРЕНИРОВКА =================
function startDay(day) {
  const exs = PLAN[day];
  if (!exs) return;
  
  // Создаем сессию. Каждое упражнение имеет 3 подхода по умолчанию
  db.activeSession = { 
    day: day, 
    date: today(), 
    exercises: exs.map(e => ({ ex: e, sets: [{ w: '', r: '', done: false }, { w: '', r: '', done: false }, { w: '', r: '', done: false }] })) 
  };
  save();
  switchTab('workout', document.querySelector('[data-tab="workout"]'));
  renderSession();
}

function renderSession() {
  const card = $('activeSession');
  const noSession = $('noSession');
  
  if (!db.activeSession) { 
    card.style.display = 'none'; 
    noSession.style.display = 'block'; 
    return; 
  }
  
  card.style.display = 'block';
  noSession.style.display = 'none';
  $('sessionTitle').textContent = db.activeSession.day;
  
  let html = '';
  db.activeSession.exercises.forEach((ex, i) => {
    html += `<div class="sess-ex">
      <div class="sess-title">${ex.ex}</div>`;
    ex.sets.forEach((set, j) => {
      html += `<div class="set-row">
        <span>Подх ${j+1}</span>
        <input type="number" placeholder="кг" value="${set.w}" onchange="updateSet(${i}, ${j}, 'w', this.value)">
        <input type="number" placeholder="повт" value="${set.r}" onchange="updateSet(${i}, ${j}, 'r', this.value)">
        <button class="done-btn ${set.done ? 'on' : ''}" onclick="toggleSetDone(${i}, ${j})">${set.done ? '✓' : '○'}</button>
      </div>`;
    });
    html += `<button class="ghost" onclick="addSet(${i})" style="padding:8px; font-size:12px;">+ Подход</button></div>`;
  });
  $('sessionList').innerHTML = html;
}

function updateSet(exIdx, setIdx, field, val) { 
  db.activeSession.exercises[exIdx].sets[setIdx][field] = val; 
  save(); 
}

function addSet(exIdx) { 
  db.activeSession.exercises[exIdx].sets.push({ w: '', r: '', done: false }); 
  save(); 
  renderSession(); 
}

// ЗАВЕРШЕНИЕ ПОДХОДА (И ЗАПУСК ТАЙМЕРА)
function toggleSetDone(exIdx, setIdx) {
  const set = db.activeSession.exercises[exIdx].sets[setIdx];
  set.done = !set.done;
  save();
  if (set.done) {
    startTimer(db.timer);
  }
  renderSession();
}

function finishSession() {
  if (!db.activeSession) return;
  db.activeSession = null;
  save();
  renderSession();
  alert('Тренировка завершена!');
}

function cancelSession() {
  if (confirm('Отменить тренировку?')) {
    db.activeSession = null;
    save();
    renderSession();
  }
}

// ================= ПРОФИЛЬ =================
function renderProfile() {
  $('userName').value = db.name;
  $('timerSetting').value = db.timer;
}
function saveName(val) { db.name = val.trim() || 'Атлет'; save(); }
function saveTimer(val) { db.timer = parseInt(val); save(); }
function resetData() {
  if (confirm('Удалить все данные?')) {
    localStorage.removeItem('fitdiary_plan');
    location.reload();
  }
}

// ================= НАВИГАЦИЯ =================
function switchTab(tab, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('on'));
  $(`page-${tab}`).classList.add('on');
  document.querySelectorAll('.bottom button').forEach(b => b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  
  if (tab === 'workout') renderSession();
  if (tab === 'profile') renderProfile();
}

// ================= СТАРТ =================
function init() {
  renderPlan();
  renderSession();
  renderProfile();
}
init();
if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js'); }
