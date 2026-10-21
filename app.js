const EXERCISES = {
  'Грудь': ['Жим лёжа', 'Жим на наклонной', 'Жим гантелей лёжа', 'Бабочка', 'Сведение в кроссовере'],
  'Спина': ['Тяга блока сверху (широкий)', 'Тяга блока сверху (узкий)', 'Тяга блока к поясу', 'Тяга штанги в наклоне', 'Становая тяга', 'Подтягивания'],
  'Ноги': ['Присед в Смите', 'Присед со штангой', 'Жим ногами', 'Разгибание ног', 'Сгибание ног лёжа', 'Выпады'],
  'Плечи': ['Жим гантелей сидя', 'Махи в стороны', 'Махи в наклоне', 'Обратная бабочка'],
  'Руки': ['Подъём штанги на бицепс', 'Молотки', 'Жим узким хватом', 'Разгибание на блоке'],
  'Пресс': ['Скручивания', 'Планка', 'Подъём ног']
};

let db = JSON.parse(localStorage.getItem('fitdiary_v35')) || {
  workouts: [],
  weights: [],
  activeSession: null,
  name: 'Атлет',
  timer: 90,
  gender: 'male',
  bestStreak: 0
};
const save = () => localStorage.setItem('fitdiary_v35', JSON.stringify(db));
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

// МОДАЛКА
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
        html += `<div class="ex-item" onclick="addExToSession('${ex}')">${ex}</div>`;
      });
      container.innerHTML += html;
    }
  }
}
function addExToSession(ex) {
  if (!db.activeSession) {
    db.activeSession = { date: today(), exercises: [] };
  }
  db.activeSession.exercises.push({ ex: ex, sets: [{ w: '', r: '' }] });
  save();
  closeExModal();
  renderSession();
}

// ТРЕНИРОВКА
function renderSession() {
  const container = $('sessionList');
  const card = $('activeSession');
  
  if (!db.activeSession || db.activeSession.exercises.length === 0) {
    card.style.display = 'none';
    return;
  }
  
  card.style.display = 'block';
  $('sessionTitle').textContent = `Тренировка`;
  
  let html = '';
  db.activeSession.exercises.forEach((ex, i) => {
    // Ищем прошлый результат
    let lastStr = '';
    const prevWorkouts = db.workouts.filter(w => w.exercises.some(e => e.ex === ex.ex));
    if (prevWorkouts.length > 0) {
      const lastW = prevWorkouts[prevWorkouts.length - 1];
      const lastEx = lastW.exercises.find(e => e.ex === ex.ex);
      if (lastEx) lastStr = `<div class="last-time">Прошлый раз: ${lastEx.sets.map(s => `${s.w}×${s.r}`).join(', ')}</div>`;
    }

    html += `<div class="sess-ex">
      <div class="sess-ex-title">${ex.ex}</div>
      ${lastStr}`;
    
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
  let validExs = [];
  db.activeSession.exercises.forEach(ex => {
    const validSets = ex.sets.filter(s => s.w !== '' || s.r !== '');
    if (validSets.length > 0) {
      validExs.push({ ex: ex.ex, sets: validSets.map(s => ({ w: parseFloat(s.w)||0, r: parseInt(s.r)||0 })) });
    }
  });
  if (validExs.length === 0) return alert('Нет записанных подходов!');

  db.workouts.push({ date: db.activeSession.date, exercises: validExs });
  
  const currentStreak = calculateStreak();
  if (currentStreak > db.bestStreak) db.bestStreak = currentStreak;
  
  db.activeSession = null;
  save();
  alert('Тренировка завершена!');
  renderSession();
  renderHistory();
  renderProfile();
}

function cancelSession() {
  if (confirm('Отменить тренировку?')) {
    db.activeSession = null; save(); renderSession();
  }
}

// ИСТОРИЯ
function renderHistory() {
  const container = $('historyList');
  const list = db.workouts.slice(-10).reverse();
  
  container.innerHTML = list.map(w => {
    let exHtml = w.exercises.map(ex => {
      let setsStr = ex.sets.map(s => `${s.w}×${s.r}`).join(', ');
      return `<div class="hist-ex"><span class="hist-ex-name">${ex.ex}</span> <span class="hist-ex-sets">${setsStr}</span></div>`;
    }).join('');
    
    return `<div class="hist-item">
      <div class="hist-header">
        <span class="hist-date">${w.date}</span>
        <span class="hist-total">${w.exercises.length} упр.</span>
      </div>
      ${exHtml}
    </div>`;
  }).join('') || '<div style="color:var(--muted)">Пока нет тренировок</div>';
}

// ПРОФИЛЬ
function renderProfile() {
  $('userName').value = db.name;
  $('timerSetting').value = db.timer;
  $('genderSetting').value = db.gender;
  
  const streak = calculateStreak();
  $('streakDisplay').textContent = streak;
  $('bestStreak').textContent = db.bestStreak;
  
  if (streak > 0) $('flameIcon').classList.add('active');
  else $('flameIcon').classList.remove('active');

  // Аватар (мужчина/женщина)
  const isMale = db.gender === 'male';
  const svgIcon = isMale 
    ? `<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="3"/><path d="M9 10h6v7h-2v6h-2v-6H9v-7z"/></svg>`
    : `<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="3"/><path d="M9 10h6l1.5 7h-3v6h-3v-6H6.5l2.5-7z"/></svg>`;
  
  $('profileAvatar').innerHTML = svgIcon;
  // Меняем цвет заливки аватара
  $('profileAvatar').style.fill = isMale ? 'var(--acc)' : 'var(--acc)'; 
}

function calculateStreak() {
  if (db.workouts.length === 0) return 0;
  const dates = [...new Set(db.workouts.map(w => w.date))].sort().reverse();
  const todayStr = today();
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('sv-SE');
  if (dates[0] !== todayStr && dates[0] !== yesterday) return 0;
  
  let streak = 1;
  let currentDate = new Date(dates[0]);
  for (let i = 1; i < dates.length; i++) {
    let prevDate = new Date(dates[i]);
    let diff = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
    if (diff <= 2) { streak++; currentDate = prevDate; } else { break; }
  }
  return streak;
}

function saveName(val) { db.name = val.trim() || 'Атлет'; save(); }
function saveTimer(val) { db.timer = parseInt(val); save(); }
function saveGender(val) { db.gender = val; save(); renderProfile(); }
function resetData() { if (confirm('Удалить ВСЕ данные?')) { localStorage.removeItem('fitdiary_v35'); location.reload(); } }

// ВЕС И КАРТА
function addWeight() {
  const d = $('wDate').value;
  const kg = parseFloat($('wKg').value);
  if (!d || !kg) return alert('Укажите дату и вес');
  db.weights = db.weights.filter(w => w.date !== d);
  db.weights.push({ date: d, kg });
  db.weights.sort((a, b) => b.date.localeCompare(a.date));
  save();
  $('wKg').value = '';
  renderWeightList();
}
function renderWeightList() {
  $('weightList').innerHTML = db.weights.slice(0, 5).map(w => 
    `<div class="hist-item"><div class="hist-header"><span class="hist-date">${w.date}</span><span style="color:var(--acc); font-weight:700;">${w.kg} кг</span></div></div>`
  ).join('') || '<div style="color:var(--muted)">Нет записей</div>';
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
  const total = Object.values(groups).reduce((s, v) => s + v, 0) || 1;
  let html = '';
  for (let [g, v] of Object.entries(groups)) {
    const pct = Math.round((v / total) * 100);
    html += `<div class="muscle-bar"><div class="muscle-name">${g}</div><div class="muscle-progress"><div class="muscle-fill" style="width:${pct}%"></div></div><div class="muscle-percent">${pct}%</div></div>`;
  }
  $('muscleMap').innerHTML = html;
}

// НАВИГАЦИЯ
function switchTab(tab, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('on'));
  $(`page-${tab}`).classList.add('on');
  document.querySelectorAll('.bottom button').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  if (tab === 'progress') { renderWeightList(); renderMuscleMap(); }
}

// СТАРТ
function init() {
  $('wDate').value = today();
  renderSession();
  renderHistory();
  renderProfile();
  renderWeightList();
  renderMuscleMap();
}
init();
if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js'); }
