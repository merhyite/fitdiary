const EXERCISES = {
  'Грудь': ['Жим лёжа', 'Жим на наклонной', 'Жим гантелей лёжа', 'Бабочка'],
  'Спина': ['Тяга блока сверху', 'Тяга блока к поясу', 'Становая тяга', 'Подтягивания'],
  'Ноги': ['Присед в Смите', 'Присед со штангой', 'Жим ногами', 'Разгибание ног', 'Сгибание ног лёжа'],
  'Плечи': ['Жим гантелей сидя', 'Махи в стороны', 'Махи в наклоне'],
  'Руки': ['Подъём штанги на бицепс', 'Молотки', 'Жим узким хватом', 'Разгибание на блоке']
};

let db = JSON.parse(localStorage.getItem('fitdiary_v36')) || {
  plans: {}, // { "Пн": ["Жим лёжа", "Тяга"], ... }
  activeSession: null,
  name: 'Атлет',
  timer: 90
};
const save = () => localStorage.setItem('fitdiary_v36', JSON.stringify(db));
const $ = id => document.getElementById(id);
const today = () => new Date().toLocaleDateString('sv-SE');

// ТАЙМЕР
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

// ================= СОЗДАНИЕ ПРОГРАММЫ =================
let context = { type: '', day: '' };

function renderPlanList() {
  const container = $('planList');
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  
  container.innerHTML = days.map(day => {
    const exs = db.plans[day] || [];
    return `<div class="day-plan">
      <div>
        <div class="day-plan-title">${day}</div>
        <div class="day-plan-info">${exs.length > 0 ? exs.length + ' упражнений' : 'Отдых'}</div>
      </div>
      <div style="display:flex; gap:5px;">
        <button class="ghost" style="width:auto; padding:8px;" onclick="setupDay('${day}')">⚙️</button>
        ${exs.length > 0 ? `<button class="primary" style="width:auto; padding:8px;" onclick="startDay('${day}')">▶️</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

function setupDay(day) {
  context = { type: 'setup', day: day };
  $('modalTitle').textContent = `Настройка: ${day}`;
  renderExModalList('');
  $('exModal').classList.add('on');
}

function createNewDay() {
  // Не нужно, так как дни фиксированные (Пн-Вс). 
  // Но если хотите, можно добавить кастомные. Пока просто заглушка.
  alert('Дни недели уже созданы. Нажмите ⚙️ чтобы добавить упражнения.');
}

// ================= СТАРТ ТРЕНИРОВКИ =================
function startDay(day) {
  const exs = db.plans[day] || [];
  if (exs.length === 0) return alert('Нет упражнений');
  
  db.activeSession = { 
    day: day, 
    date: today(),
    exercises: exs.map(exName => ({ ex: exName, sets: [{ w: '', r: '' }] }))
  };
  save();
  renderSession();
  $('activeSession').scrollIntoView({ behavior: 'smooth' });
}

function renderSession() {
  const container = $('sessionList');
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
      </div>`;
    });
    
    html += `<button class="ghost" onclick="addSet(${i})" style="padding:8px; font-size:12px; margin-top:5px;">+ Подход</button>
    </div>`;
  });
  container.innerHTML = html;
}

function updateSet(exIdx, setIdx, field, val) { db.activeSession.exercises[exIdx].sets[setIdx][field] = val; save(); }
function addSet(exIdx) { db.activeSession.exercises[exIdx].sets.push({ w: '', r: '' }); save(); renderSession(); }
function removeSet(exIdx, setIdx) { if (db.activeSession.exercises[exIdx].sets.length > 1) { db.activeSession.exercises[exIdx].sets.splice(setIdx, 1); save(); renderSession(); } }

function finishSession() {
  if (!db.activeSession) return;
  alert('Тренировка завершена!');
  db.activeSession = null;
  save();
  renderSession();
}

function cancelSession() {
  if (confirm('Отменить?')) { db.activeSession = null; save(); renderSession(); }
}

// ================= МОДАЛЬНОЕ ОКНО =================
function openExModal() {
  renderExModalList('');
  $('exModal').classList.add('on');
}
function closeExModal() {
  $('exModal').classList.remove('on');
  $('modalSearch').value = '';
}
function filterEx() { renderExModalList($('modalSearch').value.toLowerCase()); }

function renderExModalList(query) {
  const container = $('exListContainer');
  container.innerHTML = '';
  for (let [cat, exs] of Object.entries(EXERCISES)) {
    const filtered = exs.filter(ex => ex.toLowerCase().includes(query));
    if (filtered.length > 0) {
      let html = `<div class="ex-cat">${cat}</div>`;
      filtered.forEach(ex => {
        html += `<div class="ex-item" onclick="selectExercise('${ex}')">${ex}</div>`;
      });
      container.innerHTML += html;
    }
  }
}

function selectExercise(ex) {
  if (context.type === 'setup') {
    const day = context.day;
    if (!db.plans[day]) db.plans[day] = [];
    if (!db.plans[day].includes(ex)) {
      db.plans[day].push(ex);
      save();
      renderPlanList();
    }
    // Не закрываем окно, чтобы можно было добавить несколько упражнений
  }
}

// ================= ПРОФИЛЬ =================
function renderProfile() {
  $('userName').value = db.name;
  $('timerSetting').value = db.timer;
}
function saveName(val) { db.name = val.trim() || 'Атлет'; save(); }
function saveTimer(val) { db.timer = parseInt(val); save(); }
function resetData() { if (confirm('Удалить ВСЕ данные?')) { localStorage.removeItem('fitdiary_v36'); location.reload(); } }

// ================= НАВИГАЦИЯ =================
function switchTab(tab, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('on'));
  $(`page-${tab}`).classList.add('on');
  document.querySelectorAll('.bottom button').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
}

// ================= СТАРТ =================
function init() {
  renderPlanList();
  renderProfile();
}
init();
if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js'); }
