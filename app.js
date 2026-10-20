const EXERCISES = { 
  'Грудь': ['Жим лёжа', 'Жим на наклонной скамье', 'Жим гантелей лёжа', 'Бабочка (пек-дек)', 'Сведение рук в кроссовере'],
  'Спина': ['Тяга блока к поясу', 'Тяга блока сверху', 'Тяга гантели в наклоне', 'Становая тяга', 'Румынская тяга', 'Подтягивания', 'Тяга Т-грифа', 'Гиперэкстензия', 'Шраги с гантелями'],
  'Ноги': ['Присед в Смите', 'Присед со штангой', 'Жим ногами', 'Разгибание ног', 'Сгибание ног лёжа', 'Сведение ног в тренажёре', 'Разведение ног в тренажёре', 'Выпады с гантелями', 'Подъёмы на носки (стоя)'],
  'Плечи': ['Жим гантелей сидя', 'Жим штанги стоя', 'Жим в тренажёре (на плечи)', 'Махи гантелями в стороны', 'Махи гантелями в наклоне', 'Обратная бабочка', 'Тяга к подбородку'],
  'Бицепс': ['Подъём штанги на бицепс', 'Молотки', 'Сгибание рук с гантелями', 'Сгибание на скамье Скотта'],
  'Трицепс': ['Жим узким хватом', 'Разгибание на блоке', 'Французский жим', 'Разгибание гантели из-за головы'],
  'Предплечья': ['Сгибание запястий', 'Разгибание запястий', 'Фермерская прогулка', 'Вис на турнике'],
  'Пресс': ['Скручивания', 'Планка', 'Подъём ног в висе', 'Боковая планка', 'Велосипед'],
  'Кардио': ['Бег', 'Скакалка', 'Эллипс', 'Кардио (дорожка/велик)']
};
const ALL_EX = Object.values(EXERCISES).flat();

const ACHIEVEMENTS = {
  first_w: { icon: '👟', name: 'Первый шаг' }, first_water: { icon: '💧', name: 'Первые капли' }, first_weight: { icon: '⚖️', name: 'На весах' },
  read_know: { icon: '🧠', name: 'Знаток' }, lift_100: { icon: '💪', name: 'Сотка' }, lift_200: { icon: '🦍', name: 'Двухсотка' },
  ton_1: { icon: '🏋️', name: 'Тонна' }, ton_10: { icon: '🚛', name: 'Железный человек' }, streak_3: { icon: '🔥', name: 'Разогрев' },
  streak_7: { icon: '📅', name: 'Неделя' }, streak_30: { icon: '🌋', name: 'Железная воля' }, work_50: { icon: '🛠️', name: 'Трудоголик' },
  work_100: { icon: '🎖️', name: 'Ветеран' }, env_all: { icon: '🌍', name: 'Универсал' }, ex_20: { icon: '🎯', name: 'Многостаночник' },
  pair_w: { icon: '🤝', name: 'Напарник' }, water_2000: { icon: '🌊', name: 'Водохлеб' }, water_7: { icon: '🐳', name: 'Гидратация' },
  weight_10: { icon: '📊', name: 'Контроль' }, plan_created: { icon: '📝', name: 'Архитектор' }, early_bird: { icon: '🌅', name: 'Ранняя пташка' },
  night_owl: { icon: '🦉', name: 'Полуночник' }, cardio_10: { icon: '🏃', name: 'Бегун' }, water_5000: { icon: '🚰', name: 'Аквамен' },
  iron_marathon: { icon: '⏳', name: 'Железный марафон' }, heavy_50: { icon: '🏗️', name: 'Тяжеловес' }, king_squat: { icon: '👑', name: 'Король приседа' },
  bench_master: { icon: '🛋️', name: 'Жимовик' }, perfect_week: { icon: '🌟', name: 'Безупречная неделя' }, all_rounder: { icon: '🔀', name: 'Мастер на все руки' },
  bju_master: { icon: '🥗', name: 'Пищевой аналитик' }, ocean: { icon: '🌍', name: 'Океан' }, transform: { icon: '🦋', name: 'Трансформация' },
  pair_10: { icon: '🫂', name: 'Вместе веселее' }, collector: { icon: '📦', name: 'Коллекционер' }, prog_guru: { icon: '🧙‍♂️', name: 'Гуру программ' },
  friday_warrior: { icon: '⚔️', name: 'Пятничный воин' }, marathon_50: { icon: '🏃‍♂️', name: 'Марафонец' }, early_6: { icon: '🐓', name: 'Ранняя пташка 2' },
  marathon_100: { icon: '🏅', name: 'Марафонец 2' }, thousand_sets: { icon: '🔢', name: 'Тысячник' }, ocean_500: { icon: '🐋', name: 'Океан 2' },
  furnace: { icon: '🔥', name: 'Печка' }, obsessed: { icon: '🧟', name: 'Одержимый' }, rebrand: { icon: '📛', name: 'Ребрендинг' },
  new_start: { icon: '🔄', name: 'Новый старт' }, early_bird_2: { icon: '🌄', name: 'До рассвета' }, heavy_50t: { icon: '🚜', name: 'Тяжелоатлет' },
  jackpot: { icon: '🎰', name: 'Джекпот' }
};

const LS='fitdiary-v21';
function loadDB(){ 
  try{ const v=JSON.parse(localStorage.getItem(LS)); if(v&&v.athletes) return v; }catch(e){}
  return {version:21, cupSize:250, defaultTimer:90, athletes:{a:'Я', b:'Партнёр'}, friends:[], gender:{a:'male', b:'female'}, current:'a', session:null, sessionType:'my', weights:[], bodyMeasurements:[], workouts:[], myPlan: null, pairPlan: null, water:{}, restDays:[], achievements:[], envsUsed:[], weeklyDigestShown: ''}; 
}
let db = loadDB(); 
if(!db.myPlan || Object.keys(db.myPlan).length === 0) db.myPlan = { "День 1 (База)": ["Жим лёжа", "Тяга блока к поясу", "Присед в Смите"], "День 2 (Низ/Верх)": ["Становая тяга", "Жим гантелей сидя", "Подъём штанги на бицепс"] };
if(!db.pairPlan || Object.keys(db.pairPlan).length === 0) db.pairPlan = { "Совместный день 1": ["Жим лёжа", "Тяга блока к поясу", "Приседания"] };
if(!db.friends) db.friends = []; if(!db.bodyMeasurements) db.bodyMeasurements = [];
if(!db.water) db.water={}; if(!db.cupSize) db.cupSize=250; if(!db.restDays) db.restDays=[]; if(!db.achievements) db.achievements=[]; if(!db.envsUsed) db.envsUsed=[]; if(!db.defaultTimer) db.defaultTimer=90; if(!db.gender) db.gender={a:'male', b:'female'};
const save = () => localStorage.setItem(LS, JSON.stringify(db)); const $ = s => document.querySelector(s); const today = () => new Date().toLocaleDateString('sv-SE');

function saveNickname(val) { if(!val.trim()) return; db.athletes.a = val.trim(); save(); renderAll(); unlockAch('rebrand'); }
function resetData() { if(confirm('ВНИМАНИЕ! Вы уверены, что хотите удалить ВСЕ данные?')) { localStorage.removeItem(LS); location.reload(); } }

let audioCtx;
function playBeep() { try { if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(880, audioCtx.currentTime); gain.gain.setValueAtTime(0.1, audioCtx.currentTime); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); setTimeout(()=>{ osc.stop(); }, 200); } catch(e) {} }
let timerInt = null;
function startTimer(sec) { clearInterval(timerInt); let time = sec; const timerEl = $('#headerTimer'); timerEl.style.display = 'block'; timerEl.classList.remove('blink'); const update = () => { const m = Math.floor(time/60), s = time%60; timerEl.textContent = `${m<10?'0':''}${m}:${s<10?'0':''}${s}`; if(time <= 0) { clearInterval(timerInt); timerEl.textContent = "ГОТОВО!"; timerEl.classList.add('blink'); playBeep(); if(navigator.vibrate) navigator.vibrate([200,100,200]); setTimeout(()=>{ timerEl.style.display = 'none'; }, 5000); } time--; }; update(); timerInt = setInterval(update, 1000); }
function stopTimer() { clearInterval(timerInt); $('#headerTimer').style.display = 'none'; }

function showToast(icon, title, text) { const toast = document.createElement('div'); toast.className = 'toast'; toast.innerHTML = `<div style="font-size: 32px;">${icon}</div><div><div style="font-weight:800; font-size:16px;">${title}</div><div style="font-size:13px; opacity:0.9;">${text}</div></div>`; $('#toastContainer').appendChild(toast); setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(-100%)'; setTimeout(()=>toast.remove(), 400); }, 4000); }
function unlockAch(id) { if(db.achievements.includes(id)) return; db.achievements.push(id); save(); const a = ACHIEVEMENTS[id]; if(a) showToast(a.icon, 'Достижение!', a.name); if(navigator.vibrate) navigator.vibrate([100, 50, 100]); }

function checkAchievements() {
  const p = db.current; const myW = db.workouts.filter(w=>w.p===p);
  if(myW.length > 0) unlockAch('first_w');
  if(db.weights.filter(w=>w.p===p).length > 0) unlockAch('first_weight');
  if(db.weights.filter(w=>w.p===p).length >= 10) unlockAch('weight_10');
  let maxLift = Math.max(0, ...myW.map(w=>w.weight)); if(maxLift >= 100) unlockAch('lift_100'); if(maxLift >= 200) unlockAch('lift_200');
  if(myW.some(w=>w.ex.includes('Присед') && w.weight >= 150)) unlockAch('king_squat'); if(myW.some(w=>w.ex.includes('Жим лёжа') && w.weight >= 120)) unlockAch('bench_master');
  let tonnage = myW.reduce((sum, w) => sum + (w.weight * w.reps * w.sets), 0); if(tonnage >= 1000) unlockAch('ton_1'); if(tonnage >= 10000) unlockAch('ton_10'); if(tonnage >= 50000) unlockAch('heavy_50t'); 
  if(myW.length >= 50) unlockAch('work_50'); if(myW.length >= 100) unlockAch('work_100'); if(myW.length >= 100) unlockAch('marathon_100');
  if(new Set(myW.map(w=>w.ex)).size >= 20) unlockAch('ex_20');
  const totalSets = myW.reduce((s,w)=>s+w.sets, 0); if(totalSets >= 1000) unlockAch('thousand_sets');
  const cardioCount = myW.filter(w => w.ex.includes('Бег') || w.ex.includes('Скакалка') || w.ex.includes('Кардио')).length; if(cardioCount >= 10) unlockAch('cardio_10');
  if(Object.keys(db.myPlan).length > 2) unlockAch('plan_created'); if(Object.keys(db.myPlan).length >= 5) unlockAch('prog_guru');
  const now = new Date(); const h = now.getHours(); const d = now.getDay(); if(h < 8) unlockAch('early_bird'); if(h < 6) unlockAch('early_bird_2'); if(h >= 22) unlockAch('night_owl'); if(d === 5 && h >= 17) unlockAch('friday_warrior');
  let totalWaterDays = 0; let maxWater = 0; let totalWater = 0; Object.values(db.water[p] || {}).forEach(v => { if(v>0) totalWaterDays++; if(v>maxWater) maxWater=v; totalWater+=v; });
  if(maxWater >= 2000) unlockAch('water_2000'); if(maxWater >= 5000) unlockAch('water_5000'); if(totalWater >= 100000) unlockAch('ocean'); if(totalWater >= 500000) unlockAch('ocean_500'); if(totalWaterDays >= 7) unlockAch('water_7'); if(totalWaterDays > 0) unlockAch('first_water');
  if(db.achievements.length >= 10) unlockAch('collector'); if(db.achievements.length >= 40) unlockAch('jackpot');
  renderProfile();
}

function showWeeklyDigest() { const lastSunday = new Date(); lastSunday.setDate(lastSunday.getDate() - lastSunday.getDay()); const lastSundayStr = lastSunday.toLocaleDateString('sv-SE'); if(new Date().getDay() === 0 && db.weeklyDigestShown !== lastSundayStr) { const p = db.current; const weekW = db.workouts.filter(w=>w.p===p && new Date(w.date) >= lastSunday); if(weekW.length > 0) { const ton = weekW.reduce((s,w)=>s+(w.weight*w.reps*w.sets),0); setTimeout(() => { showToast('📊', 'Итоги недели!', `Тренировок: ${new Set(weekW.map(w=>w.date)).size}, Тоннаж: ${ton} кг`); db.weeklyDigestShown = lastSundayStr; save(); }, 2000); } } }

const KNOWLEDGE = `<h3>💡 Советы по тренировкам</h3><p><b>Разминка:</b> 5-10 минут кардио и суставная гимнастика спасут от травм.</p><p><b>Техника:</b> Лучше 5 повторений с идеальной техникой, чем 15 с кривой спиной.</p><p><b>Прогрессия:</b> Добавляй 1-2 кг каждую неделю или делай на 1 повторение больше.</p><p><b>Восстановление:</b> Мышцы растут во сне. Спи 7-8 часов.</p><h3>🍏 Питание</h3><p><b>Набор массы:</b> +10-15% калорий. Белка 1.6-2г на кг веса.</p><p><b>Похудение:</b> Дефицит калорий. Сохраняй высокий белок.</p>`;
function openKnowledge() { $('#modalBody').innerHTML = KNOWLEDGE; $('#infoModal').classList.add('on'); unlockAch('read_know'); }
$('#modalClose').onclick = () => $('#infoModal').classList.remove('on'); 
$('#infoModal').onclick = (e) => { if(e.target.id === 'infoModal') $('#infoModal').classList.remove('on'); };

// РЕДАКТОР ПРОГРАММ
let isEditing = { my: false, pair: false };
function toggleEditMode(type) { isEditing[type] = !isEditing[type]; renderPlanList(type); }
function renderPlanList(type) {
  const plan = type === 'my' ? db.myPlan : db.pairPlan; const container = type === 'my' ? $('#myPlanList') : $('#pairPlanList'); const addBtn = type === 'my' ? $('#addDayBtnMy') : $('#addDayBtnPair');
  if (isEditing[type]) { addBtn.style.display = 'block'; let html = ''; for (let [dayName, exs] of Object.entries(plan)) { html += `<div class="edit-day-row"><div><div class="edit-day-name">${dayName}</div><div class="edit-day-exs">${exs.join(', ') || 'Пусто'}</div></div><div class="edit-btns"><button class="edit-btn-icon" onclick="addExToDay('${type}', '${dayName}')">+</button><button class="edit-btn-icon" style="color:var(--del)" onclick="deleteDay('${type}', '${dayName}')">×</button></div></div>`; } container.innerHTML = html || '<div class="muted">Нет дней.</div>'; } else { addBtn.style.display = 'none'; let html = ''; for (let [dayName, exs] of Object.entries(plan)) { if (exs.length === 0) continue; html += `<button class="day
