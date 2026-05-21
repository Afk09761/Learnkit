const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
if (!hasFinePointer) {
  cursorDot.style.display = 'none';
  cursorRing.style.display = 'none';
}
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cursorDot.style.left = mx + 'px'; cursorDot.style.top = my + 'px'; });

if (hasFinePointer) {
  (function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  })();
}
document.querySelectorAll('a,button,[tabindex="0"],.chip,.day-b,.goal-row,.career-pill').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});
document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

const pb = document.getElementById('progress-bar');
function updateProgress() {
  const scrollTop = document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  pb.style.transform = `scaleX(${height > 0 ? scrollTop / height : 0})`;
}
window.addEventListener('scroll', updateProgress, { passive: true });

const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
  document.getElementById('back-top').classList.toggle('visible', window.scrollY > 400);
  updateProgress();
}, { passive: true });
document.getElementById('back-top').addEventListener('click', () => {

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
});

const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(a => a.classList.remove('active'));
    const link = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
    if (link) link.classList.add('active');
  });
}, { threshold: 0.4 });
sections.forEach(s => io.observe(s));

const themeBtn = document.getElementById('theme-toggle');
let dark = false;
function applyDark(on) {
  dark = on;
  document.body.classList.toggle('dark-mode', dark);
  document.documentElement.classList.remove('preload-dark');
  themeBtn.textContent = dark ? '☀️' : '🌙';
  themeBtn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  try { localStorage.setItem('lk-dark', dark); } catch(e) {}
}
themeBtn.addEventListener('click', () => applyDark(!dark));

try { if (localStorage.getItem('lk-dark') === 'true') applyDark(true); } catch(e) {}

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); revealObs.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('.stat-num').forEach(num => {
      const target = parseInt(num.getAttribute('data-target') || '0');
      const suffix = num.getAttribute('data-suffix') || '';
      let start = null;
      const run = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1800, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        num.textContent = Math.floor(ease * target) + suffix;
        if (p < 1) requestAnimationFrame(run);
        else num.textContent = target + suffix;
      };
      requestAnimationFrame(run);
    });
    counterObs.unobserve(e.target);
  });
}, { threshold: 0.5 });
const statsEl = document.querySelector('.stats');
if (statsEl) counterObs.observe(statsEl);

document.querySelectorAll('.subject-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.subject-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
    document.querySelectorAll('.subject-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    tab.setAttribute('aria-selected','true');
    const panel = document.getElementById('tab-' + tab.dataset.tab);
    if (panel) { panel.classList.add('active'); panel.focus(); } 
  });
  tab.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tab.click(); } });
});

const wrapper = document.querySelector('.kit-card-wrapper');
if (wrapper) {
  document.querySelector('.hero-visual')?.addEventListener('mousemove', e => {
    const rect = wrapper.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const rx2 = ((e.clientY - cy) / (rect.height / 2)) * 5;
    const ry2 = -((e.clientX - cx) / (rect.width / 2)) * 8;
    wrapper.style.transform = `rotateX(${rx2}deg) rotateY(${ry2}deg)`;
  });
  document.querySelector('.hero-visual')?.addEventListener('mouseleave', () => {
    wrapper.style.transform = '';
  });
}

const days = document.querySelectorAll('.day-b');
days.forEach(d => {
  d.addEventListener('click', () => { days.forEach(x => x.classList.remove('active')); d.classList.add('active'); });
  d.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();d.click();} });
});

function savePlannerState() {
  const state = {};
  document.querySelectorAll('.goal-row').forEach((row, i) => {
    state['goal_' + i] = row.querySelector('.g-check').classList.contains('done');
  });
  try { localStorage.setItem('lk-planner', JSON.stringify(state)); } catch(e) {}
}

function loadPlannerState() {
  try {
    const state = JSON.parse(localStorage.getItem('lk-planner') || '{}');
    document.querySelectorAll('.goal-row').forEach((row, i) => {
      const check = row.querySelector('.g-check');
      const done = state['goal_' + i] || false;
      check.classList.toggle('done', done);
      check.textContent = done ? '✓' : '';
    });
  } catch(e) {}
}

document.querySelectorAll('.goal-row').forEach(row => {
  const check = row.querySelector('.g-check');
  row.addEventListener('click', () => {
    const done = !check.classList.contains('done');
    check.classList.toggle('done', done);
    check.textContent = done ? '✓' : '';
    savePlannerState();
  });
});

loadPlannerState();

document.querySelectorAll('.dl-ph').forEach(ph => {

  ph.addEventListener('click', () => ph.closest('.dl-panel')?.classList.toggle('open'));
});

const modal = document.getElementById('career-modal');
const mName = document.getElementById('modal-career-name');
const mField = document.getElementById('modal-field');
const mBody = document.getElementById('modal-body');
const mClose = document.getElementById('modal-close');
let focusTrap;

const openModal = pill => {
  focusTrap = document.activeElement;
  mName.textContent  = pill.dataset.career  || '';
  mField.textContent = pill.dataset.field   || '';

  const salary = pill.dataset.salary   || '—';
  const outlook = pill.dataset.outlook  || '—';
  const duration = pill.dataset.duration || '—';
  const subjects = pill.dataset.subjects || '—';
  const req = pill.dataset.req      || '—';
  const uni = pill.dataset.uni      || '—';
  const desc = pill.dataset.desc     || '';
  const tips = pill.dataset.tips     || '';
  let resources = [];
  try { resources = JSON.parse(pill.dataset.resources); } catch(e) {}

  mBody.innerHTML = `
    <div class="m-grid">
      <div class="m-stat"><strong>Salary Range</strong><span>${salary}</span></div>
      <div class="m-stat"><strong>Job Outlook</strong><span>${outlook}</span></div>
      <div class="m-stat"><strong>Study Duration</strong><span>${duration}</span></div>
      <div class="m-stat"><strong>Key Subjects</strong><span>${subjects}</span></div>
    </div>
    <div class="m-stat" style="margin-bottom:.7rem;"><strong>Minimum Qualification</strong><span>${req}</span></div>
    <div class="m-stat" style="margin-bottom:1.3rem;"><strong>Top Universities / Routes</strong><span>${uni}</span></div>
    ${desc ? `<div class="m-sect">About this Career</div><p class="m-desc">${desc}</p>` : ''}
    ${tips ? `<div class="m-sect">Getting Started</div><div class="m-tips"><p>💡 ${tips}</p></div>` : ''}
    ${resources.length ? `
      <div class="m-sect">Free Learning Resources</div>
      <div class="m-links">
        ${resources.map(r => `<a class="m-link-row" href="${r.url}" target="_blank" rel="noopener">🔗 ${r.label}<span class="m-link-badge">${r.badge}</span></a>`).join('')}
      </div>` : ''}
  `;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  mClose.focus();
  document.addEventListener('keydown', handleModalKey);
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.removeEventListener('keydown', handleModalKey);
  document.body.style.overflow = '';
  if (focusTrap) focusTrap.focus();
};

const handleModalKey = e => {
  if (e.key === 'Escape') { closeModal(); return; }
  if (e.key === 'Tab') {
    const focusable = [...modal.querySelectorAll('button,a[href],[tabindex="0"]')];
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length-1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }
};

document.querySelectorAll('.career-pill').forEach(p => {
  p.addEventListener('click', () => openModal(p));
  p.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); openModal(p); } });
});
mClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

let timerInterval = null;
let timerMinutes = 25;
let timerSeconds = 25 * 60;
let totalSeconds = 25 * 60;
let running = false;
let sessions = 0;
const timerDisplay = document.getElementById('timer-display');
const timerRingEl = document.getElementById('timer-ring');
const startBtn = document.getElementById('timer-start');
const resetBtn = document.getElementById('timer-reset');
const statusLabel = document.getElementById('timer-status-label');
const CIRCUMF = 2 * Math.PI * 80;

function updateTimerDisplay() {
  const m = Math.floor(timerSeconds / 60);
  const s = timerSeconds % 60;
  timerDisplay.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  const frac = timerSeconds / totalSeconds;
  timerRingEl.style.strokeDashoffset = CIRCUMF * (1 - frac);
}

document.querySelectorAll('.t-mode').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.t-mode').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const min = parseInt(btn.dataset.min);
    stopTimer();
    timerMinutes = min;
    timerSeconds = min * 60;
    totalSeconds = timerSeconds;
    statusLabel.textContent = btn.textContent + ' Time';
    updateTimerDisplay();
  });
});

function startTimer() {
  if (timerSeconds === 0) return;
  running = true;
  startBtn.textContent = '⏸ Pause';
  timerInterval = setInterval(() => {
    timerSeconds--;
    updateTimerDisplay();
    if (timerSeconds <= 0) {
      stopTimer();
      sessions = Math.min(sessions + 1, 4);
      for (let i = 1; i <= 4; i++) {
        document.getElementById('s' + i)?.classList.toggle('done', i <= sessions);
      }
      startBtn.textContent = '▶ Start';
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  running = false;
  startBtn.textContent = '▶ Start';
}

startBtn.addEventListener('click', () => {
  if (running) stopTimer(); else startTimer();
});
resetBtn.addEventListener('click', () => {
  stopTimer();
  const activeMode = document.querySelector('.t-mode.active');
  timerMinutes = parseInt(activeMode?.dataset.min || 25);
  timerSeconds = timerMinutes * 60;
  totalSeconds = timerSeconds;
  updateTimerDisplay();
});
timerRingEl.style.strokeDasharray = CIRCUMF; /* FIX: must be set before first updateTimerDisplay() call */
updateTimerDisplay();

const searchData = [
  { cat:'Subject',  title:'Mathematics — Khan Academy',          url:'https://www.khanacademy.org/math',                type:'Free',  keys:['maths','mathematics','algebra','calculus','geometry','khan'] },
  { cat:'Subject',  title:'Biology — OpenStax Textbook',         url:'https://openstax.org/books/biology-2e/pages/1-introduction', type:'Free PDF', keys:['biology','cells','genetics','evolution'] },
  { cat:'Subject',  title:'Chemistry — Chemguide Notes',         url:'https://www.chemguide.co.uk/',                    type:'Free',  keys:['chemistry','chemical','bonding','organic'] },
  { cat:'Subject',  title:'Physics — PhET Simulations',          url:'https://phet.colorado.edu/en/simulations/filter?subjects=physics', type:'Free', keys:['physics','mechanics','electricity','waves'] },
  { cat:'Subject',  title:'Computer Science — Harvard CS50',     url:'https://cs50.harvard.edu/x/',                     type:'Free',  keys:['computer','coding','programming','software','python','cs50'] },
  { cat:'Subject',  title:'English Literature — Project Gutenberg', url:'https://www.gutenberg.org/browse/scores/top',  type:'Free',  keys:['english','literature','books','shakespeare','essay'] },
  { cat:'Career',   title:'Medicine — Career Profile',           url:'#careers',                                        type:'Career',keys:['medicine','doctor','mbchb','mbbs','health'] },
  { cat:'Career',   title:'Software Engineering — Career Profile', url:'#careers',                                      type:'Career',keys:['software','engineering','coding','tech','developer'] },
  { cat:'Career',   title:'Law — Career Profile',                url:'#careers',                                        type:'Career',keys:['law','legal','llb','barrister','solicitor'] },
  { cat:'Career',   title:'Data Science — Career Profile',       url:'#careers',                                        type:'Career',keys:['data','science','statistics','python','machine learning'] },
  { cat:'Exam',     title:'IGCSE Past Papers — Cambridge',       url:'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse/past-papers/', type:'Free', keys:['igcse','past papers','cambridge','cie','exam'] },
  { cat:'Exam',     title:'KNEC Past Papers — Kenya',            url:'https://www.knec.ac.ke/',                         type:'Free',  keys:['knec','kenya','kcse','national exam','past papers'] },
  { cat:'Scholar',  title:'Chevening Scholarship — UK',          url:'https://www.chevening.org/',                      type:'Scholarship', keys:['chevening','scholarship','uk','funding','masters'] },
  { cat:'Scholar',  title:'MasterCard Foundation Scholars',      url:'https://mastercardfdn.org/all/scholars/',          type:'Scholarship', keys:['mastercard','scholarship','africa','fully funded'] },
  { cat:'Tool',     title:'Pomodoro Study Timer',                 url:'#planner',                                        type:'Tool',  keys:['pomodoro','timer','study','focus','break'] },
  { cat:'Tool',     title:'Knowledge Quiz — Test Yourself',       url:'#quiz',                                           type:'Tool',  keys:['quiz','test','recall','practice','questions'] },
];

const searchInput = document.getElementById('main-search');
const searchResults = document.getElementById('search-results');

function doSearch(q) {
  q = q.trim().toLowerCase();
  if (!q) { searchResults.classList.remove('open'); return; }
  const results = searchData.filter(d => d.keys.some(k => k.includes(q) || q.includes(k)) || d.title.toLowerCase().includes(q) || d.cat.toLowerCase().includes(q)).slice(0, 6);
  if (!results.length) { searchResults.classList.remove('open'); return; }
  searchResults.innerHTML = results.map(r => `
    <a class="sr-item" href="${r.url}" ${r.url.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} role="option">
      <div><div class="sr-cat">${r.cat}</div><div class="sr-title">${r.title}</div></div>
      <span class="sr-type">${r.type}</span>
    </a>
  `).join('');
  searchResults.classList.add('open');
}

searchInput.addEventListener('input',  e => doSearch(e.target.value));
searchInput.addEventListener('keydown', e => { if (e.key === 'Escape') { searchResults.classList.remove('open'); searchInput.blur(); } });
document.addEventListener('click', e => { if (!e.target.closest('.search-bar-wrap')) searchResults.classList.remove('open'); });
document.getElementById('search-submit').addEventListener('click', () => doSearch(searchInput.value));
document.querySelectorAll('.chip').forEach(c => {
  c.addEventListener('click', () => { searchInput.value = c.dataset.q; doSearch(c.dataset.q); searchInput.focus(); });
});

const quizData = [
  { q: 'What does DNA stand for?', opts: ['Deoxyribonucleic Acid','Deoxyribose Nucleic Acid','Di-Nitrogen Acid','Dynamic Nucleic Arrangement'], ans: 0, explain: 'DNA stands for Deoxyribonucleic Acid. It carries the genetic instructions for the development, functioning, and reproduction of all known living organisms.' },
  { q: "What is Newton's Second Law of Motion?", opts: ['Every action has an equal and opposite reaction','An object in motion stays in motion','Force equals mass times acceleration','Objects fall at the same rate regardless of mass'], ans: 2, explain: 'F = ma. Force (in Newtons) equals mass (kg) multiplied by acceleration (m/s²). This is the foundation of classical mechanics.' },
  { q: "What is the chemical symbol for Iron?", opts: ["Ir","Fe","In","Io"], ans: 1, explain: "Iron's symbol Fe comes from the Latin word Ferrum. Iron has atomic number 26 and is one of the most abundant elements on Earth." },
  { q: "In mathematics, what does pi approximately equal?", opts: ["2.718","3.141","1.618","4.000"], ans: 1, explain: "Pi is approximately 3.14159. It is the ratio of a circle's circumference to its diameter. Pi is irrational — its decimal representation never ends or repeats." },
  { q: 'What programming language was Harvard CS50 originally taught in?', opts: ['Python','JavaScript','C','Java'], ans: 2, explain: 'CS50 begins with C because it forces students to understand memory management, pointers, and low-level computing concepts before moving to higher-level languages.' },
  { q: 'Which African country has the most UNESCO World Heritage Sites?', opts: ['Egypt','South Africa','Ethiopia','Morocco'], ans: 0, explain: 'Egypt has the most UNESCO World Heritage Sites in Africa, including the Pyramids of Giza (part of "Memphis and its Necropolis"), Abu Mena, and others. Egypt has 7 inscribed properties.' },
  { q: 'What is the powerhouse of the cell?', opts: ['Nucleus','Ribosome','Mitochondria','Chloroplast'], ans: 2, explain: 'The mitochondria produces ATP (adenosine triphosphate) through cellular respiration — the energy currency of the cell. It has its own DNA, supporting the endosymbiotic theory of its origin.' },
  { q: 'What does ACCA stand for in accounting qualifications?', opts: ['Association of Certified Chartered Accountants','Association of Chartered Certified Accountants','Accredited Council of Certified Accounting','African Certified Chartered Association'], ans: 1, explain: 'ACCA stands for Association of Chartered Certified Accountants. It is recognised in 180+ countries, making it the most globally portable accounting qualification.' },
  // Chemistry
  { q: "What is the chemical formula for water?", opts: ["H2O2","HO","H2O","H3O"], ans: 2, explain: "Water is H2O — two hydrogen atoms bonded to one oxygen atom. This simple molecule covers 71% of Earth's surface and is essential for all known life." },
  { q: "What type of bond forms between sodium and chlorine in table salt?", opts: ["Covalent bond","Ionic bond","Metallic bond","Hydrogen bond"], ans: 1, explain: "Ionic bonds form when one atom transfers electrons to another. Sodium (Na) gives an electron to Chlorine (Cl), forming Na+ and Cl- ions that attract each other — table salt (NaCl)." },
  { q: "What is the pH of a neutral solution?", opts: ["0","14","7","5"], ans: 2, explain: "pH 7 is neutral. Below 7 is acidic (like lemon juice at ~2), above 7 is alkaline/basic (like bleach at ~13). Pure water at 25°C has a pH of exactly 7." },
  // Physics
  { q: "What is the speed of light in a vacuum?", opts: ["300,000 km/s","150,000 km/s","3,000 km/s","30,000 km/s"], ans: 0, explain: "Light travels at approximately 299,792 km/s in a vacuum. This is the universe's ultimate speed limit, denoted by c in Einstein's famous E = mc2." },
  { q: "Which of the following is NOT a renewable energy source?", opts: ["Solar","Wind","Natural gas","Hydroelectric"], ans: 2, explain: "Natural gas is a fossil fuel — it takes millions of years to form and cannot be replenished on a human timescale. Solar, wind, and hydroelectric energy are all naturally replenished." },
  // Geography
  { q: "What is the largest desert in the world by area?", opts: ["Sahara","Arabian","Antarctic","Gobi"], ans: 2, explain: "The Antarctic Desert is the largest at about 14.2 million km2. It is a cold desert — most of Antarctica receives less than 200mm of precipitation per year. The Sahara is the largest HOT desert." },
  { q: "What is the term for the process by which plants release water vapour into the atmosphere?", opts: ["Evaporation","Transpiration","Condensation","Precipitation"], ans: 1, explain: "Transpiration is the process where plants absorb water through roots and release water vapour through tiny pores called stomata in their leaves. It drives the water cycle and cools plants." },
  // English
  { q: "What literary device is used in: 'The wind whispered through the trees'?", opts: ["Metaphor","Simile","Personification","Alliteration"], ans: 2, explain: "Personification gives human qualities to non-human things. Wind cannot literally whisper — this attributes a human action to it, making writing more vivid and engaging." },
  { q: "In Romeo and Juliet, what are the names of the two feuding families?", opts: ["Montague and Capulet","Verona and Venice","Romeo and Paris","Benvolio and Tybalt"], ans: 0, explain: "The Montagues (Romeo's family) and Capulets (Juliet's family) are the feuding families in Verona. Their ancient grudge drives the tragedy of Shakespeare's play." },
  // History
  { q: "In what year did Ghana gain independence from Britain?", opts: ["1957","1960","1963","1948"], ans: 0, explain: "Ghana became the first sub-Saharan African country to gain independence on 6 March 1957, led by Kwame Nkrumah. This inspired independence movements across the continent." },
  { q: "What was the name of the policy of racial segregation in South Africa?", opts: ["Colonialism","Apartheid","Imperialism","Segregation Act"], ans: 1, explain: "Apartheid (Afrikaans for 'apartness') was a system of institutionalised racial segregation in South Africa from 1948 to 1994. Nelson Mandela spent 27 years in prison fighting it." },
  // Computer Science
  { q: "What does CPU stand for?", opts: ["Central Processing Unit","Computer Processing Utility","Core Processing Unit","Central Program Utility"], ans: 0, explain: "The Central Processing Unit is the brain of a computer. It fetches, decodes, and executes instructions. Modern CPUs have multiple cores allowing parallel processing." },
  { q: "Which data structure operates on a First In, First Out (FIFO) principle?", opts: ["Stack","Queue","Tree","Graph"], ans: 1, explain: "A Queue works like a real-life queue — the first item added is the first to be removed (FIFO). A Stack is LIFO (Last In, First Out), like a stack of plates." },
];

let currentQ = 0, score = 0;
const qEl = document.getElementById('quiz-q');
const optsEl = document.getElementById('quiz-opts');
const fbEl = document.getElementById('quiz-fb');
const nextBtn = document.getElementById('quiz-next');
const stepEl = document.getElementById('quiz-step');
const barEl = document.getElementById('quiz-bar');
const liveEl = document.getElementById('quiz-score-live');
const screenEl = document.getElementById('quiz-score-screen');
const containerEl = document.getElementById('quiz-container');

function loadQ(idx) {
  const data = quizData[idx];
  stepEl.textContent = `Question ${idx+1} of ${quizData.length}`;
  barEl.style.width = ((idx+1) / quizData.length * 100) + '%';
  liveEl.textContent = `${score} / ${quizData.length}`; 
  qEl.textContent    = data.q;
  fbEl.className     = 'quiz-feedback';
  fbEl.textContent   = '';
  nextBtn.style.display = 'none';
  optsEl.innerHTML   = data.opts.map((opt, i) => `<button class="quiz-opt" data-i="${i}">${opt}</button>`).join('');
  optsEl.querySelectorAll('.quiz-opt').forEach(btn => {
    btn.addEventListener('click', () => selectOpt(btn, idx));
  });
}

function selectOpt(btn, idx) {
  optsEl.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);
  const chosen = parseInt(btn.dataset.i);
  const correct = quizData[idx].ans;
  if (chosen === correct) {
    btn.classList.add('correct');
    score++;
    fbEl.className = 'quiz-feedback good show';
    fbEl.textContent = '✅ Correct! ' + quizData[idx].explain;
  } else {
    btn.classList.add('wrong');
    optsEl.querySelectorAll('.quiz-opt')[correct].classList.add('correct');
    fbEl.className = 'quiz-feedback bad show';
    fbEl.textContent = '❌ Not quite. ' + quizData[idx].explain;
  }
  liveEl.textContent = `${score} / ${quizData.length}`;
  nextBtn.style.display = (currentQ < quizData.length - 1) ? 'inline-flex' : 'none';
  if (currentQ === quizData.length - 1) {
    setTimeout(showScore, 1200);
  }
}

function showScore() {
  containerEl.style.display = 'none';
  screenEl.classList.add('show');
  const pct = Math.round(score / quizData.length * 100);
  document.getElementById('final-score').textContent = `${score}/${quizData.length}`;
  document.getElementById('final-msg').textContent =
    pct === 100 ? '🏆 Perfect score! Outstanding!' :
    pct >= 75  ? '🌟 Excellent work! Keep it up.' :
    pct >= 50  ? '📚 Good effort — review the explanations to sharpen up.' :
    '💪 Keep studying — every attempt makes you stronger.';
}

nextBtn.addEventListener('click', () => { currentQ++; loadQ(currentQ); });
document.getElementById('quiz-restart').addEventListener('click', () => {
  score = 0; currentQ = 0;
  screenEl.classList.remove('show');
  containerEl.style.display = '';
  liveEl.textContent = `0 / ${quizData.length}`;
  loadQ(0);
});
loadQ(0);

function handleNL(e) {
  e.preventDefault();
  const inp = e.target.querySelector('input[type="email"]');
  const btn = e.target.querySelector('button[type="submit"]');
  if (!inp || !btn) return;
  const email = inp.value.trim();

  if (!email || !email.includes('@') || !email.includes('.')) {
    inp.style.borderColor = '#e84040';
    inp.focus();
    return;
  }
  inp.style.borderColor = '';
  btn.textContent = '✓ Subscribed!';
  btn.style.background = 'var(--forest)';
  inp.value = '';
  inp.disabled = true;
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Subscribe';
    btn.style.background = '';
    inp.disabled = false;
    btn.disabled = false;
  }, 4000);
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
    
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  });
});

document.querySelector('.nav-logo')?.addEventListener('click', e => {
  e.preventDefault();

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
});

const hamburgerBtn = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
let menuOpen = false;

function toggleMenu(force) {
  menuOpen = force !== undefined ? force : !menuOpen;
  hamburgerBtn.classList.toggle('open', menuOpen);
  mobileMenu.classList.toggle('open', menuOpen);
  hamburgerBtn.setAttribute('aria-expanded', String(menuOpen));
  document.body.style.overflow = menuOpen ? 'hidden' : '';
}

hamburgerBtn.addEventListener('click', () => toggleMenu());

mobileMenu.addEventListener('keydown', e => {
  if (!menuOpen) return;
  if (e.key === 'Tab') {
    const focusable = [...mobileMenu.querySelectorAll('a, button, [tabindex="0"]')].filter(el => !el.disabled);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }
});

mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => toggleMenu(false));
});

document.addEventListener('click', e => {
  if (menuOpen && !mobileMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
    toggleMenu(false);
  }
});

const chatBtn = document.getElementById('ai-chat-btn');
const chatPanel = document.getElementById('ai-chat-panel');
const chatClose = document.getElementById('chat-close-btn');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');
const chatMsgs = document.getElementById('chat-messages');
const chatTyping = document.getElementById('chat-typing');
const chatSugsEl = document.getElementById('chat-suggestions');
let chatOpen = false;
let chatHistory = [];

const SYSTEM_PROMPT = `You are LearnKit AI Tutor — a warm, encouraging, and highly knowledgeable study assistant for secondary school students, primarily in Africa. You help with all school subjects including Mathematics, Biology, Chemistry, Physics, English Literature, History, Geography, and Computer Science.

Rules:
- Keep responses concise and clear — 2 to 4 short paragraphs max for explanations
- Use simple language appropriate for a 14–18 year old student
- When explaining concepts, always give a concrete real-world example
- Be encouraging and motivating; many students lack access to teachers
- If asked about careers, mention free resources they can access
- Never be dismissive; every question deserves a thoughtful answer
- Use occasional emojis to keep tone friendly but not excessive
- Format maths expressions in plain text (e.g. x^2 + 3x + 2 = 0)`;

function toggleChat() {
  chatOpen = !chatOpen;
  chatPanel.classList.toggle('open', chatOpen);
  chatPanel.setAttribute('aria-hidden', String(!chatOpen));
  chatBtn.setAttribute('aria-expanded', String(chatOpen));
  if (chatOpen) {
    setTimeout(() => chatInput.focus(), 300);
    // Remove pulse once opened
    chatBtn.style.animation = 'none';
  }
}

chatBtn.addEventListener('click', toggleChat);
chatClose.addEventListener('click', toggleChat);

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (chatOpen) { toggleChat(); return; }
  if (menuOpen) { toggleMenu(false); return; }
});

function appendMsg(role, text) {
  const isBot = role === 'bot';
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.textContent = text;
 
  bubble.innerHTML = bubble.innerHTML.replace(/\n/g, '<br/>');
  const avatar = document.createElement('div');
  avatar.className = 'chat-msg-avatar';
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = isBot ? '🤖' : '🧑🏾';
  div.appendChild(avatar);
  div.appendChild(bubble);
  chatMsgs.appendChild(div);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

async function sendMessage(userText) {
  userText = userText.trim();
  if (!userText) return;

  if (chatHistory.length === 0) chatSugsEl.style.display = 'none';

  appendMsg('user', userText);
  chatInput.value = '';
  chatSendBtn.disabled = true;

  chatHistory.push({ role: 'user', content: userText });

  chatTyping.classList.add('show');
  chatMsgs.scrollTop = chatMsgs.scrollHeight;

  try {

  const apiMessages = chatHistory.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content
  }));

    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...apiMessages],
        max_tokens: 1000
      })
    });

    const data = await response.json();

    if (!response.ok) {
      chatTyping.classList.remove('show');
      appendMsg('bot', '\u26a0\ufe0f ' + (data?.error?.message || 'API error ' + response.status));
      return;
    }

    const replyText = data.choices?.[0]?.message?.content || null;

    if (!replyText) {
      chatTyping.classList.remove('show');
      appendMsg('bot', '\u26a0\ufe0f Empty response received.');
      return;
    }

    chatHistory.push({ role: 'assistant', content: replyText });
    chatTyping.classList.remove('show');
    appendMsg('bot', replyText);

    if (chatHistory.length > 40) chatHistory = chatHistory.slice(-40);

  } catch (err) {
    chatTyping.classList.remove('show');
    appendMsg('bot', '\ud83d\udd0c Could not connect. Please check your internet connection and try again!');
  } finally {
  
    chatSendBtn.disabled = false;
    if (chatOpen) chatInput.focus();
  }
}

chatSendBtn.addEventListener('click', () => sendMessage(chatInput.value));
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(chatInput.value); }
});

document.querySelectorAll('.chat-sug').forEach(sug => {
  sug.addEventListener('click', () => sendMessage(sug.dataset.msg));
});

[chatBtn, chatPanel, chatClose, chatInput, chatSendBtn].forEach(el => {
  if (!el) return;
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});
document.querySelectorAll('.chat-sug').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

const quotes = [
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela", title: "President of South Africa, Nobel Peace Prize Laureate", avatar: "✊🏿" },
  { text: "The function of education is to teach one to think intensively and to think critically. Intelligence plus character — that is the goal of true education.", author: "Martin Luther King Jr.", title: "Civil Rights Leader, Nobel Peace Prize Laureate", avatar: "🕊️" },
  { text: "I was taught that the way of progress was neither swift nor easy.", author: "Marie Curie", title: "First woman to win a Nobel Prize, Pioneer in Radioactivity Research", avatar: "⚗️" },
  { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Wangari Maathai", title: "Kenyan Environmental Activist, Nobel Peace Prize Laureate", avatar: "🌳" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela", title: "President of South Africa, Nobel Peace Prize Laureate", avatar: "✊🏿" },
  { text: "The world is a book, and those who do not travel read only one page.", author: "Philip Emeagwali", title: "Nigerian-American Computer Scientist, Pioneer of the Internet", avatar: "💻" },
  { text: "We need to reshape our own perception of how we view ourselves. We have to step up as women and take the lead.", author: "Beyoncé Knowles-Carter", title: "Artist and Global Humanitarian", avatar: "🌟" },
  { text: "I raise up my voice — not so I can shout, but so that those without a voice can be heard.", author: "Malala Yousafzai", title: "Youngest Nobel Peace Prize Laureate, Education Activist", avatar: "📚" },
  { text: "Once you learn to read, you will be forever free.", author: "Frederick Douglass", title: "Author, Abolitionist, and Statesman", avatar: "📜" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King", title: "Musician and Philosopher", avatar: "🎵" },
  { text: "African children must be educated in a system that reflects their culture, their history and their aspirations.", author: "Kwame Nkrumah", title: "First President of Ghana, Pan-African Philosopher", avatar: "🌍" },
  { text: "You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose.", author: "Dr. Seuss", title: "Author and Educator", avatar: "🎩" },
  { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss", title: "Author and Educator", avatar: "📖" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", title: "Statesman", avatar: "🏅" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein", title: "Theoretical Physicist, Nobel Prize in Physics", avatar: "⚛️" },
];

let currentQuote = 0;
let quoteAutoInterval = null;
let quoteAutoOn = true;

function buildQuoteDots() {
  const dotsEl = document.getElementById('quote-dots');
  dotsEl.innerHTML = quotes.map((_, i) =>
    `<div class="q-dot${i === 0 ? ' active' : ''}" aria-hidden="true"></div>`
  ).join('');
}

function showQuote(idx, animate = true) {
  const q = quotes[idx];
  const textEl = document.getElementById('quote-text');
  const authEl = document.getElementById('quote-author');
  const nameEl = document.getElementById('quote-name');
  const titleEl = document.getElementById('quote-title-el');
  const avatarEl = document.getElementById('quote-avatar');
  const dotsEl = document.getElementById('quote-dots');

  if (animate) {
    textEl.classList.add('fade-out');
    authEl.classList.add('fade-out');
    setTimeout(() => {
      textEl.textContent   = q.text;
      nameEl.textContent   = q.author;
      titleEl.textContent  = q.title;
      avatarEl.textContent = q.avatar;
      textEl.classList.remove('fade-out');
      authEl.classList.remove('fade-out');
    }, 420);
  } else {
    textEl.textContent   = q.text;
    nameEl.textContent   = q.author;
    titleEl.textContent  = q.title;
    avatarEl.textContent = q.avatar;
  }

  // Update dots
  dotsEl.querySelectorAll('.q-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
  currentQuote = idx;
}

function startQuoteAuto() {
  clearInterval(quoteAutoInterval);
  quoteAutoInterval = setInterval(() => {
    showQuote((currentQuote + 1) % quotes.length);
  }, 6000);
}

buildQuoteDots();
showQuote(0, false);
startQuoteAuto();

document.getElementById('quote-prev').addEventListener('click', () => {
  showQuote((currentQuote - 1 + quotes.length) % quotes.length);
  if (quoteAutoOn) startQuoteAuto();
});
document.getElementById('quote-next').addEventListener('click', () => {
  showQuote((currentQuote + 1) % quotes.length);
  if (quoteAutoOn) startQuoteAuto();
});
document.getElementById('quote-auto').addEventListener('click', function() {
  quoteAutoOn = !quoteAutoOn;
  this.classList.toggle('on', quoteAutoOn);
  this.textContent = quoteAutoOn ? '⏵ Auto' : '⏸ Paused';
  this.setAttribute('aria-pressed', String(quoteAutoOn));
  if (quoteAutoOn) startQuoteAuto();
  else clearInterval(quoteAutoInterval);
});

(function() {
  const qs = document.querySelector('.quote-display');
  if (!qs) return;
  let sx = 0;
  qs.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  qs.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) {
      showQuote(dx < 0 ? (currentQuote + 1) % quotes.length : (currentQuote - 1 + quotes.length) % quotes.length);
      if (quoteAutoOn) startQuoteAuto();
    }
  }, { passive: true });
})();

document.querySelectorAll('.vid-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.vid-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
    document.querySelectorAll('.video-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    tab.setAttribute('aria-selected','true');
    const panel = document.getElementById(tab.dataset.vtab);
    if (panel) { panel.classList.add('active'); panel.focus(); } 
  });
  tab.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' '){e.preventDefault();tab.click();} });
});

document.querySelectorAll('.vid-item').forEach(item => {
  const activate = () => {
    const panelId = item.dataset.panel;
    const videoId = item.dataset.vid;
    const title = item.dataset.title;
    const panel = document.getElementById(panelId);
    if (!panel) return;

  
    panel.querySelectorAll('.vid-item').forEach(v => v.classList.remove('active-vid'));
    item.classList.add('active-vid');

  
    const wrap = panel.querySelector('.video-main-wrap');
    const player = wrap ? wrap.querySelector('.yt-thumb-player') : null;
    if (player) {
      player.href = `https://www.youtube.com/watch?v=${videoId}`;
      const img = player.querySelector('img');
      if (img) {
        img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        img.onerror = function(){ this.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; };
        img.alt = title;
      }
      const label = player.querySelector('.yt-open-label');
      if (label) label.textContent = title;
    }
  };
  item.addEventListener('click', activate);
  item.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' '){e.preventDefault();activate();} });
});

const manifestData = {
  name: "LearnKit — Equal Education for Every Student",
  short_name: "LearnKit",
  description: "Free world-class learning resources for every secondary student.",
  start_url: "./",
  display: "standalone",
  background_color: "#fdf8ef",
  theme_color: "#163324",
  icons: [
    { src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect width='192' height='192' rx='32' fill='%23163324'/%3E%3Ctext x='96' y='130' font-size='110' text-anchor='middle'%3E📚%3C/text%3E%3C/svg%3E", sizes: "192x192", type: "image/svg+xml" },
    { src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' rx='80' fill='%23163324'/%3E%3Ctext x='256' y='360' font-size='300' text-anchor='middle'%3E📚%3C/text%3E%3C/svg%3E", sizes: "512x512", type: "image/svg+xml" }
  ]
};
try {
  const blob = new Blob([JSON.stringify(manifestData)], {type: 'application/json'});
  const manifestURL = URL.createObjectURL(blob);
  document.getElementById('pwa-manifest').href = manifestURL;
} catch(e) {}

// and CANNOT intercept page navigations or cache the HTML document itself.
// For full PWA/offline support in production, save the SW code below to a real
// file (e.g. sw.js) served from the same origin, then register it with:
//   navigator.serviceWorker.register('/sw.js')
// The blob: registration below is retained for demo purposes only.
if ('serviceWorker' in navigator) {
  const swCode = `
    const CACHE = 'learnkit-v1';
    const OFFLINE_ASSETS = [
      self.location.href.replace('/sw.js','') || '/'
    ];
    self.addEventListener('install', e => {
      e.waitUntil(
        caches.open(CACHE).then(cache => {
          return fetch(self.location.href.replace('/sw.js','') || '/')
            .then(r => cache.put('/', r))
            .catch(() => {});
        })
      );
      self.skipWaiting();
    });
    self.addEventListener('activate', e => {
      e.waitUntil(caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
      ));
      self.clients.claim();
    });
    self.addEventListener('fetch', e => {
      if (e.request.method !== 'GET') return;
      e.respondWith(
        fetch(e.request)
          .then(r => {
            const clone = r.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
            return r;
          })
          .catch(() => caches.match(e.request).then(r => r || caches.match('/')))
      );
    });
  `;
  try {
    const swBlob = new Blob([swCode], {type: 'application/javascript'});
    const swURL = URL.createObjectURL(swBlob);
    navigator.serviceWorker.register(swURL).catch(() => {});
  } catch(e) {}
}

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;

  setTimeout(() => {
    if (!deferredPrompt) return;
    const banner = document.createElement('div');
    banner.id = 'pwa-banner';
    banner.innerHTML = `
      <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;animation:slideUp .4s var(--ease-smooth) both;">
        <span style="font-size:1.5rem;">📲</span>
        <div>
          <div style="font-weight:700;font-size:.9rem;">Install LearnKit</div>
          <div style="font-size:.75rem;opacity:.75;">Use offline, anytime — no internet needed</div>
        </div>
        <button id="pwa-install-btn" style="margin-left:auto;background:var(--sage);color:white;border:none;padding:.5rem 1.1rem;border-radius:999px;font-weight:700;font-size:.82rem;white-space:nowrap;cursor:pointer;">Install Free</button>
        <button id="pwa-dismiss-btn" style="background:none;border:none;color:inherit;opacity:.5;font-size:1.1rem;padding:.2rem .4rem;line-height:1;cursor:pointer;">✕</button>
      </div>
    `;
    banner.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:var(--cream);border:1px solid var(--sand);border-radius:var(--radius-xl);padding:1rem 1.3rem;box-shadow:var(--shadow-deep);z-index:9000;width:min(420px,calc(100vw - 3rem));color:var(--ink);font-family:var(--font-body);';
    document.body.appendChild(banner);
    document.getElementById('pwa-install-btn').addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      banner.remove();
    });
    document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
      banner.remove();
      deferredPrompt = null;
    });
  }, 3000);
});
