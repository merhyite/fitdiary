// ================= БАЗА УПРАЖНЕНИЙ =================
const EXERCISES = {
  'Грудь': ['Жим лёжа', 'Жим на наклонной', 'Жим гантелей лёжа', 'Бабочка', 'Сведение в кроссовере'],
  'Спина': ['Тяга блока сверху', 'Тяга блока к поясу', 'Становая тяга', 'Подтягивания', 'Шраги'],
  'Ноги': ['Присед', 'Жим ногами', 'Выпады', 'Разгибание ног', 'Сгибание ног', 'Подъемы на носки'],
  'Плечи': ['Жим гантелей сидя', 'Махи в стороны', 'Махи в наклоне', 'Тяга к подбородку'],
  'Руки': ['Подъем на бицепс', 'Молотки', 'Жим узким хватом', 'Разгибание на блоке'],
  'Пресс': ['Скручивания', 'Планка', 'Подъем ног']
};

// ХРАНИЛИЩЕ
let db = JSON.parse(localStorage.getItem('fitdiary_clean')) || {
  plan: {}, workouts: [], activeSession: null, name: 'Атлет', timer: 90
};
const save = () => localStorage.setItem('fitdiary_clean', JSON.stringify(db));
const $ = id => document.getElementById(id);
const today = () => new Date().toLocaleDateString('sv-SE');

// ================= ТАЙМЕР =================
let timerInt;
function startTimer(sec) {
  clearInterval(timerInt);
  let endTime = Date.now() + sec * 1000;
  let timerEl = $('timerDisplay');
  if (!timerEl) {
    // Создаем элемент таймера, если его нет в шапке (на всякий случай)
    timerEl = document.createElement('div');
    timerEl.id = 'timerDisplay';
    timerEl.style.cssText = 'display:block; color:var(--acc); font-weight:800; font-size:18px;';
    timerEl.onclick = stopTimer;
    document.querySelector('.topbar').appendChild(timerEl);
  }
  timerEl.style.display = 'block';

  const update = () => {
    const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    const m = Math.floor(remaining / 60), s = remaining % 60;
    timerEl.textContent = `⏱ ${m<10?'0':''}${m}:${s<10?'0':''}${s}`;
    if (remaining <= 0) {
      clearInterval(timerInt);
      timerEl.textContent = "ГОТОВО!";
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      setTimeout(() => { timerEl.style.display = 'none'; }, 5000);
    }
  };
  update();
  timerInt = setInterval(update, 1000);
}
function stopTimer() { 
  clearInterval(timerInt); 
  const t = $('timerDisplay');
  if(t) t.style.display = 'none'; 
}

// ================= ПЛАН НА НЕДЕЛЮ =================
function renderPlan() {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  $('planList').innerHTML = days.map(day => {
    const exs = db.plan[day] || [];
    return `<div class="plan-day">
      <div class="plan-header" onclick="toggleDay('${day}', this)">
        ${day} <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
      </div>
      <div class="plan-body" id="day-body-${day}">
        <button class="ghost" onclick="openExModal('${day}')" style="margin-bottom:10px;">+ Добавить упражнение</button>
        <div>
          ${exs.map(ex => `<div class="ex-in-plan">${ex} <button class="del-btn" onclick="removeEx('${day}', '${ex}')">×</button></div>`).join('')}
        </div>
        ${exs.length > 0 ? `<button class="primary" onclick="startDay('${day}')" style="margin-top:10px;">Начать тренировку</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

function toggleDay(day, header) {
  const body = $(`day-body-${day}`);
  const isOpen = body.classList.contains('open');
  document.querySelectorAll('.plan-body').forEach(b => b.classList.remove('open'));
  document.querySelectorAll('.plan-header').forEach(h => h.classList.remove('open'));
  if (!isOpen) { body.classList.add('open'); header.classList.add('open'); }
}

function removeEx(day, ex) { 
  db.plan[day] = db.plan[day].filter(e => e !== ex); 
  save(); 
  renderPlan(); 
}

// ================= МОДАЛКА =================
let currentDay = '';
function openExModal(day) {
  currentDay = day;
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
      let html = `<div class="ex-cat-title">${cat}</div>`;
      filtered.forEach(ex => { html += `<div class="ex-modal-item" onclick="addExToPlan('${ex}')">${ex}</div>`; });
      container.innerHTML += html;
    }
  }
}
function addExToPlan(ex) {
  if (!db.plan[currentDay]) db.plan[currentDay] = [];
  if (!db.plan[currentDay].includes(ex)) {
    db.plan[currentDay].push(ex);
    save(); 
    renderPlan();
  }
  closeExModal();
}

// ================= ТРЕНИРОВКА =================
function startDay(day) {
  const exs = db.plan[day] || [];
  if (exs.length === 0) return alert('Нет упражнений');
  
  // Создаем активную сессию
  db.activeSession = { day: day, date: today(), exercises: exs.map(e => ({ ex: e, sets: [{ w: '', r: '' }] })) };
  save();
  
  // Переключаемся на вкладку "Тренировка"
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
  $('sessionTitle').textContent = `Тренировка: ${db.activeSession.day}`;
  
  let html = '';
  db.activeSession.exercises.forEach((ex, i) => {
    html += `<div class="workout-ex">
      <div class="workout-ex-title">${ex.ex}</div>`;
    ex.sets.forEach((set, j) => {
      html += `<div class="set-row">
        <span>Подх ${j+1}</span>
        <input type="number" placeholder="кг" value="${set.w}" onchange="updateSet(${i}, ${j}, 'w', this.value)">
        <input type="number" placeholder="повт" value="${set.r}" onchange="updateSet(${i}, ${j}, 'r', this.value)">
        <button class="del-btn" onclick="removeSet(${i}, ${j})">×</button>
      </div>`;
    });
    html += `<button class="ghost" onclick="addSet(${i})" style="padding:8px; font-size:12px; margin-top:5px;">+ Подход</button>
    <button class="primary" onclick="completeSet(${i})" style="padding:8px; font-size:12px; margin-top:5px;">✓ Выполнено (Таймер)</button></div>`;
  });
  $('sessionList').innerHTML = html;
}

function updateSet(exIdx, setIdx, field, val) { 
  db.activeSession.exercises[exIdx].sets[setIdx][field] = val; 
  save(); 
}
function addSet(exIdx) { 
  db.activeSession.exercises[exIdx].sets.push({ w: '', r: '' }); 
  save(); 
  renderSession(); 
}
function removeSet(exIdx, setIdx) { 
  if (db.activeSession.exercises[exIdx].sets.length > 1) { 
    db.activeSession.exercises[exIdx].sets.splice(setIdx, 1); 
    save(); 
    renderSession(); 
  } 
}

// ТАЙМЕР ЗАПУСКАЕТСЯ ЗДЕСЬ
function completeSet(exIdx) {
  startTimer(db.timer);
  alert('Подход записан! Отдых пошел.');
}

function finishSession() {
  if (!db.activeSession) return;
  db.workouts.push({ date: db.activeSession.date, exercises: db.activeSession.exercises });
  db.activeSession = null;
  save(); 
  renderSession();
  alert('Тренировка завершена!');
}
function cancelSession() { 
  if (confirm('Отменить?')) { 
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
function saveName(val) { 
  db.name = val.trim() || 'Атлет'; 
  save(); 
}
function saveTimer(val) { 
  db.timer = parseInt(val); 
  save(); 
}
function resetData() { 
  if (confirm('Удалить ВСЁ?')) { 
    localStorage.removeItem('fitdiary_clean'); 
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
