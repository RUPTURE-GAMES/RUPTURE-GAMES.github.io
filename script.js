/* script.js — RUPTURE GAMES
   - Background canvas: Hybrid Premium Blur (waves + soft particles + mouse-follow)
   - Launcher (logo Start) open/close & search
   - Dropdown persistence (hover + click)
   - Smooth page routing
   - Globe language toggle (RU <-> EN) with spin + breathing + flash + localStorage
   - News date filter (data-date="YYYY-MM-DD")
   - Hiro assistant: indexer, reindex, quick queries, popup with welcome bubble
   - Micro sounds (pleasant) via WebAudio
   - Magnetic buttons micro-interactions
   - Accessibility-friendly and reduced-motion support
*/

/* --------------------- Config & State --------------------- */
const LS_LANG = 'rupture_lang';
const LS_SOUND = 'rupture_sound';
const state = {
  lang: localStorage.getItem(LS_LANG) || (navigator.language && navigator.language.startsWith('en') ? 'en' : 'ru'),
  sound: localStorage.getItem(LS_SOUND) !== '0', // default true
  pages: ['home','games','news','support','about'],
};

/* --------------------- Translations --------------------- */
const TRANSLATIONS = {
  ru: {
    page_title: "RUPTURE GAMES — Official",
    nav_home: "Главная",
    nav_games: "Игры ▾",
    nav_news: "Новости",
    nav_support: "Поддержка",
    nav_about: "О нас",
    brand_sub: "Игры • Новости • Поддержка",
    launcher_search_ph: "Найти игру, новость или страницу...",
    mini_search_ph: "Поиск / Search",
    home_title: "Добро пожаловать в RUPTURE",
    home_sub: "Игры с характером — атмосфера в каждой тени.",
    btn_games: "Наши игры",
    btn_news: "Новости",
    news_title: "Новости",
    news_filter: "Фильтр по дате:",
    btn_show_all: "Показать все",
    support_title: "Поддержка",
    faq_publish_q: "Как публиковать новости?",
    faq_publish_a: "Добавьте элемент в #newsFeed с атрибутом data-date (YYYY-MM-DD). Затем нажмите «Обновить знания» у Хиро.",
    faq_addgame_q: "Как добавить игру?",
    faq_addgame_a: "Добавьте карточку в #gamesList или запросите шаблон у Хиро.",
    btn_open_hiro: "Открыть Хиро",
    btn_write_mail: "Написать по почте",
    btn_reindex: "Обновить знания",
    about_title: "О компании",
    about_text: "RUPTURE — независимая студия, создающая миры с характером.",
    hiro_title: "Хиро — ассистент",
    hiro_placeholder: "Спроси: 'Что нового', 'Кто в команде', 'Как публиковать'",
    btn_send: "Отправить",
    quick_news: "Что нового",
    quick_games: "Игры",
    quick_publish: "Как публиковать",
    welcome_text: "Привет! Я Хиро — ассистент RUPTURE GAMES. Нажми на сферу, чтобы поговорить."
  },
  en: {
    page_title: "RUPTURE GAMES — Official",
    nav_home: "Home",
    nav_games: "Games ▾",
    nav_news: "News",
    nav_support: "Support",
    nav_about: "About",
    brand_sub: "Games • News • Support",
    launcher_search_ph: "Find a game, news or page...",
    mini_search_ph: "Search / Поиск",
    home_title: "Welcome to RUPTURE",
    home_sub: "Games with character — atmosphere in every shadow.",
    btn_games: "Our games",
    btn_news: "News",
    news_title: "News",
    news_filter: "Filter by date:",
    btn_show_all: "Show all",
    support_title: "Support",
    faq_publish_q: "How to publish news?",
    faq_publish_a: "Add an item to #newsFeed with data-date (YYYY-MM-DD). Then press 'Reindex' in Hiro.",
    faq_addgame_q: "How to add a game?",
    faq_addgame_a: "Add a card to #gamesList or ask Hiro for a template.",
    btn_open_hiro: "Open Hiro",
    btn_write_mail: "Write by mail",
    btn_reindex: "Reindex knowledge",
    about_title: "About",
    about_text: "RUPTURE is an independent studio building worlds with character.",
    hiro_title: "Hiro — assistant",
    hiro_placeholder: "Ask: 'What's new', 'Who is on the team', 'How to publish'",
    btn_send: "Send",
    quick_news: "What's new",
    quick_games: "Games",
    quick_publish: "How to publish",
    welcome_text: "Hi! I'm Hiro — RUPTURE GAMES assistant. Click the orb to chat."
  }
};

/* --------------------- Utils --------------------- */
function t(key){
  return (TRANSLATIONS[state.lang] && TRANSLATIONS[state.lang][key]) || (TRANSLATIONS['ru'][key] || '');
}
function setLang(lang){
  state.lang = lang;
  localStorage.setItem(LS_LANG, lang);
  applyTranslations();
}
function applyTranslations(){
  // text nodes: [data-i18n]
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k = el.getAttribute('data-i18n');
    if(k) el.textContent = t(k);
  });
  // placeholders: [data-i18n-placeholder]
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    const k = el.getAttribute('data-i18n-placeholder');
    if(k) el.placeholder = t(k);
  });
  // title
  document.title = t('page_title') || document.title;
}

/* --------------------- Pleasant UI sounds --------------------- */
let audioCtx = null;
function playTone(freq = 320, type='sine', dur=0.10, vol=0.02){
  if(!state.sound) return;
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, audioCtx.currentTime);
    g.gain.setValueAtTime(vol, audioCtx.currentTime);
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    o.stop(audioCtx.currentTime + dur + 0.02);
  }catch(e){ /* ignore */ }
}
function softClick(){
  playTone(260,'sine',0.08,0.02);
}
function softHover(){
  playTone(540,'sine',0.06,0.01);
}

/* --------------------- Background Canvas (Hybrid Premium Blur) --------------------- */
function initBackgroundCanvas(){
  const canvas = document.getElementById('bg-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  let raf;
  const particles = [];
  const waves = [];
  const particleCount = Math.max(24, Math.floor(Math.min(w,h)/28));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rand(a,b){return Math.random()*(b-a)+a}

  function create(){
    particles.length = 0; waves.length = 0;
    for(let i=0;i<particleCount;i++){
      particles.push({
        x: rand(0,w),
        y: rand(0,h),
        r: rand(0.6,2.6),
        vx: rand(-0.2,0.2),
        vy: rand(-0.05,0.05),
        alpha: rand(0.02,0.12)
      });
    }
    // waves: large soft blobs
    for(let i=0;i<6;i++){
      waves.push({
        x: rand(w*0.1,w*0.9),
        y: rand(h*0.1,h*0.9),
        r: rand(Math.min(w,h)*0.12, Math.min(w,h)*0.45),
        ang: rand(0,Math.PI*2),
        speed: rand(0.003,0.01),
        hueShift: rand(-30,30)
      });
    }
  }

  create();

  let mouseX = w/2, mouseY = h/2;
  window.addEventListener('mousemove', (e)=>{
    mouseX = e.clientX; mouseY = e.clientY;
  });

  window.addEventListener('resize', ()=>{ w = canvas.width = innerWidth; h = canvas.height = innerHeight; create(); });

  function draw(){
    ctx.clearRect(0,0,w,h);

    // base gradient background
    const g = ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0, '#070406');
    g.addColorStop(1, '#030203');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    // soft waves (large)
    waves.forEach((wave,i)=>{
      wave.ang += wave.speed * (reduced?0.2:1);
      // slight mouse parallax
      const px = wave.x + Math.sin(wave.ang) * 120 + (mouseX - w/2) * 0.02;
      const py = wave.y + Math.cos(wave.ang) * 80 + (mouseY - h/2) * 0.02;
      const rad = wave.r * (1 + 0.03 * Math.sin(wave.ang*1.4));
      const grad = ctx.createRadialGradient(px,py,rad*0.05, px,py,rad);
      grad.addColorStop(0, 'rgba(255,43,43,0.18)');
      grad.addColorStop(0.45, 'rgba(138,75,255,0.06)');
      grad.addColorStop(1, 'rgba(3,6,15,0)');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(px,py,rad,0,Math.PI*2); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    });

    // particles
    particles.forEach(p=>{
      p.x += p.vx;
      p.y += p.vy;
      // wrap
      if(p.x < -10) p.x = w+10; if(p.x > w+10) p.x = -10;
      if(p.y < -10) p.y = h+10; if(p.y > h+10) p.y = -10;
      // slight mouse attraction
      const dx = (mouseX - p.x) * 0.0008;
      const dy = (mouseY - p.y) * 0.0008;
      p.x += dx; p.y += dy;
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    });

    // subtle streaks
    for(let i=0;i<18;i++){
      const x = (i*97 + (mouseX*0.02)) % w;
      const y = (i*59 + (mouseY*0.013)) % h;
      ctx.fillStyle = 'rgba(255,255,255,0.006)';
      ctx.fillRect(x,y,1,1);
    }

    // vignette
    const vig = ctx.createRadialGradient(w/2,h/2, Math.min(w,h)/6, w/2,h/2, Math.max(w,h));
    vig.addColorStop(0,'rgba(0,0,0,0)');
    vig.addColorStop(1,'rgba(0,0,0,0.6)');
    ctx.fillStyle = vig; ctx.fillRect(0,0,w,h);
  }

  function loop(){ draw(); raf = requestAnimationFrame(loop); }
  if(!reduced) loop(); else draw();

  return ()=>{ if(raf) cancelAnimationFrame(raf); };
}

/* --------------------- Launcher (logo Start) --------------------- */
function initLauncher(){
  const logoBtn = document.getElementById('logoStart');
  const launcher = document.getElementById('launcher');
  const launcherClose = document.getElementById('launcherClose');
  const launcherSearch = document.getElementById('launcherSearch');
  const launcherSearchBtn = document.getElementById('launcherSearchBtn');

  if(!logoBtn || !launcher) return;

  function openLauncher(){
    launcher.classList.add('show');
    setTimeout(()=> launcher.querySelector('input') && launcher.querySelector('input').focus(), 180);
    playTone(320,'sine',0.08,0.02);
  }
  function closeLauncher(){
    launcher.classList.remove('show');
    playTone(220,'sine',0.07,0.02);
  }

  logoBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    if(launcher.classList.contains('show')) closeLauncher(); else openLauncher();
  });
  launcherClose && launcherClose.addEventListener('click', closeLauncher);

  // click outside closes
  document.addEventListener('click', (e)=>{ if(!e.target.closest('#launcher') && !e.target.closest('#logoStart')) launcher.classList.remove('show'); });

  // launcher search filters local links (data-target)
  launcherSearchBtn && launcherSearchBtn.addEventListener('click', ()=>{
    const q = (launcherSearch.value || '').toLowerCase().trim();
    const links = Array.from(launcher.querySelectorAll('.l-link'));
    links.forEach(l=>{
      const txt = (l.textContent || '').toLowerCase();
      l.style.display = txt.includes(q) || q === '' ? 'block' : 'none';
    });
    playTone(420,'sine',0.06,0.02);
  });
  launcherSearch && launcherSearch.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') launcherSearchBtn.click(); });

  // l-link navigation
  launcher.querySelectorAll('.l-link').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const target = btn.getAttribute('data-target');
      if(target) routeTo(target);
      closeLauncher();
    });
  });

  // open Hiro from launcher
  const openHiroFromLauncher = document.getElementById('openHiroFromLauncher');
  if(openHiroFromLauncher) openHiroFromLauncher.addEventListener('click', ()=>{
    openHiroWindow(); closeLauncher();
  });
}

/* --------------------- Dropdown persistence (hover + click) --------------------- */
function initDropdowns(){
  document.querySelectorAll('.has-dropdown').forEach(parent=>{
    const toggle = parent.querySelector('.drop-toggle');
    const dropdown = parent.querySelector('.dropdown');
    if(!toggle || !dropdown) return;

    // click to toggle (keeps open)
    toggle.addEventListener('click', (e)=>{
      e.stopPropagation();
      const isOpen = parent.classList.contains('open');
      document.querySelectorAll('.has-dropdown').forEach(h=>{ if(h !== parent) h.classList.remove('open'); });
      if(!isOpen){ parent.classList.add('open'); toggle.setAttribute('aria-expanded','true'); playTone(380,'sine',0.06,0.01); }
      else { parent.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); playTone(260,'sine',0.05,0.01); }
    });

    // keep open while mouse over dropdown or toggle (hover)
    let hoverTimeout = null;
    parent.addEventListener('mouseenter', ()=>{ clearTimeout(hoverTimeout); parent.classList.add('open'); toggle.setAttribute('aria-expanded','true'); });
    parent.addEventListener('mouseleave', ()=>{ hoverTimeout = setTimeout(()=>{ parent.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }, 240); });

    // if click inside dropdown (links), keep it open until navigation runs
    dropdown.querySelectorAll('button, a').forEach(el=>{
      el.addEventListener('click', (e)=>{
        const r = el.getAttribute('data-route') || el.getAttribute('data-action');
        if(r === 'openSection' || el.getAttribute('data-route')){
          // navigate
          const route = el.getAttribute('data-route') || el.getAttribute('data-target') || 'home';
          routeTo(route);
        }
        // keep open for slight moment, then close
        setTimeout(()=> parent.classList.remove('open'), 200);
      });
    });
  });

  // click outside to close all
  document.addEventListener('click', (e)=>{
    if(!e.target.closest('.has-dropdown')) document.querySelectorAll('.has-dropdown').forEach(h=>h.classList.remove('open'));
  });
}

/* --------------------- Page routing & transitions --------------------- */
function routeTo(route){
  if(!route) route = 'home';
  // show corresponding section (pages have id = route)
  document.querySelectorAll('.page').forEach(p=>{
    if(p.id === route){
      p.classList.add('show');
      p.classList.remove('fade-page');
      // small entrance
      setTimeout(()=> p.classList.add('fade-page','show'), 6);
      // ensure visible
      setTimeout(()=> p.classList.remove('fade-page'), 420);
    } else {
      p.classList.remove('show');
    }
  });
  // update hash (without adding to history if same)
  if(location.hash.replace('#','') !== route) location.hash = route;
}

/* init router on hash change */
function initRouter(){
  window.addEventListener('hashchange', ()=> {
    const route = location.hash.replace('#','') || 'home';
    routeTo(route);
  });
  // initial
  const initial = location.hash.replace('#','') || 'home';
  routeTo(initial);
  // nav links (data-route)
  document.querySelectorAll('[data-route]').forEach(el=>{
    el.addEventListener('click', (e)=>{
      e.preventDefault();
      const r = el.getAttribute('data-route');
      if(r) routeTo(r);
    });
  });
}

/* --------------------- News date filter --------------------- */
function initNewsFilter(){
  const newsDate = document.getElementById('newsDate');
  const newsClear = document.getElementById('newsClear');
  const newsFeed = document.getElementById('newsFeed');
  if(!newsFeed) return;

  function showAll(){ newsFeed.querySelectorAll('.news-item').forEach(it=> it.style.display = 'block'); }
  function filterBy(dateStr){
    const items = Array.from(newsFeed.querySelectorAll('.news-item'));
    let any = false;
    items.forEach(it=>{
      const d = it.getAttribute('data-date') || '';
      if(!dateStr || dateStr === ''){
        it.style.display = 'block';
        any = true;
      } else if(d === dateStr){
        it.style.display = 'block';
        any = true;
      } else {
        it.style.display = 'none';
      }
    });
    if(!any && dateStr) {
      // show friendly message
      const no = document.createElement('div');
      no.className = 'news-item';
      no.textContent = state.lang === 'ru' ? 'На эту дату ещё нет новостей.' : 'No news for this date yet.';
      newsFeed.appendChild(no);
      setTimeout(()=> { if(no.parentElement) no.remove(); }, 4200);
    }
  }

  newsDate && newsDate.addEventListener('change', (e)=> filterBy(e.target.value));
  newsClear && newsClear.addEventListener('click', ()=> { if(newsDate) newsDate.value = ''; showAll(); playTone(320,'sine',0.06,0.02); });
}

/* --------------------- Globe language toggle --------------------- */
function initLangToggle(){
  const langBtn = document.getElementById('langBtn');
  if(!langBtn) return;
  // set initial state breathing
  langBtn.classList.add('breathing');

  function toggleLang(){
    langBtn.classList.add('spin');
    setTimeout(()=> langBtn.classList.remove('spin'), 1200);
    // flip
    state.lang = (state.lang === 'ru') ? 'en' : 'ru';
    localStorage.setItem(LS_LANG, state.lang);
    applyTranslations();
    // flash softly
    langBtn.classList.add('flash');
    setTimeout(()=> langBtn.classList.remove('flash'), 620);
    // breathing continues
    playTone(420,'sine',0.09,0.02);
    // update text inside if it's a text node
    langBtn.textContent = state.lang === 'ru' ? '🌐 RU' : '🌐 EN';
  }

  langBtn.addEventListener('click', (e)=>{
    e.stopPropagation();
    toggleLang();
  });
  // keyboard accessibility
  langBtn.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); langBtn.click(); } });
}

/* --------------------- Hiro assistant: indexer + query --------------------- */
const Hiro = {
  index: { news:[], games:[], about:[], support:[] },
  buildIndex: function(){
    this.index = { news:[], games:[], about:[], support:[] };
    // news
    document.querySelectorAll('#newsFeed .news-item').forEach((n,i)=>{
      const txt = (n.textContent || '').trim();
      this.index.news.push({ id:`news-${i}`, text:txt, date: n.getAttribute('data-date') || null });
    });
    // games
    document.querySelectorAll('#gamesList .card').forEach((c,i)=>{
      const title = c.querySelector('.card-title') ? c.querySelector('.card-title').textContent.trim() : '';
      const desc = c.querySelector('.card-desc') ? c.querySelector('.card-desc').textContent.trim() : '';
      this.index.games.push({ id:`game-${i}`, title, text:desc });
    });
    // about
    const about = document.getElementById('about');
    if(about) Array.from(about.querySelectorAll('h2,h3,p')).forEach((el,i)=> this.index.about.push(el.textContent.trim()));
    // support FAQ
    document.querySelectorAll('#faq details').forEach((d,i)=>{
      const q = d.querySelector('summary') ? d.querySelector('summary').textContent.trim() : '';
      const a = d.querySelector('.faq-body') ? d.querySelector('.faq-body').textContent.trim() : '';
      this.index.support.push({ q,a });
    });
    return this.index;
  },
  query: function(q){
    q = (q||'').toLowerCase().trim();
    if(!q) return { answer: state.lang === 'ru' ? "Напиши коротко, о чём вопрос: новости, игры, команда, донат, контакт." : "Write briefly what you ask: news, games, team, donate, contact." };
    // basic intents
    if(q.includes('ново') || q.includes('update') || q.includes('what')){
      if(this.index.news && this.index.news.length){
        const list = this.index.news.slice(0,5).map(n=> `• ${n.text.slice(0,160)}`);
        return { answer: (state.lang === 'ru' ? 'Последние публикации:' : "Latest publications:") + '\n' + list.join('\n') };
      } else return { answer: state.lang === 'ru' ? 'Пока нет новостей.' : 'No published updates yet.' };
    }
    if(q.includes('игр') || q.includes('game')){
      if(this.index.games && this.index.games.length){
        const list = this.index.games.map(g=> `• ${g.title || 'Проект'} — ${g.text}`).slice(0,6);
        return { answer: (state.lang === 'ru' ? 'Статусы проектов:' : 'Project statuses:') + '\n' + list.join('\n') };
      } else return { answer: state.lang === 'ru' ? 'Проекты не опубликованы.' : 'Projects are not published yet.' };
    }
    if(q.includes('публи') || q.includes('publish')){
      return { answer: state.lang === 'ru' ? TRANSLATIONS.ru.faq_publish_a : TRANSLATIONS.en.faq_publish_a };
    }
    if(q.includes('контак') || q.includes('почт')){
      return { answer: (state.lang === 'ru' ? 'Почта для связи: ' : 'Contact email: ') + 'rupture.off@gmail.com' };
    }
    if(q.includes('коман') || q.includes('team') || q.includes('who')){
      if(this.index.about && this.index.about.length) return { answer: (state.lang === 'ru' ? 'Команда: ' : 'Team: ') + this.index.about.slice(0,2).join(' — ') };
      else return { answer: state.lang === 'ru' ? 'Информация о команде не опубликована.' : 'Team info not published.' };
    }
    // fallback search across index
    const matches = [];
    this.index.news.forEach(n=>{ if(n.text.toLowerCase().includes(q)) matches.push({type:'news',text:n.text}); });
    this.index.games.forEach(g=>{ if((g.title + ' ' + g.text).toLowerCase().includes(q)) matches.push({type:'game',text: g.title + ' — ' + g.text}); });
    this.index.about.forEach(a=>{ if(a.toLowerCase().includes(q)) matches.push({type:'about',text:a}); });
    this.index.support.forEach(s=>{ if((s.q + ' ' + s.a).toLowerCase().includes(q)) matches.push({type:'faq',text:s.a}); });

    if(matches.length) {
      const top = matches.slice(0,4).map(m=> `• ${m.text.slice(0,160)}`);
      return { answer: (state.lang === 'ru' ? 'Найдено:' : 'Found:') + '\n' + top.join('\n')};
    }
    return { answer: state.lang === 'ru' ? 'Информации не найдено. Возможно, обновление не опубликовано.' : 'No information found. The update may not be published yet.' };
  }
};

/* Hiro UI helpers */
function appendHiroMessage(msg, who='bot'){
  const wrap = document.getElementById('hiro-messages');
  if(!wrap) return;
  const el = document.createElement('div');
  el.className = 'hiro-msg ' + (who === 'bot' ? 'hiro-bot' : 'hiro-user');
  el.textContent = msg;
  wrap.appendChild(el);
  wrap.scrollTop = wrap.scrollHeight;
  if(who === 'bot') triggerOrbPulse();
}
function triggerOrbPulse(){
  const orb = document.querySelector('.hiro-orb');
  if(!orb) return;
  orb.style.transform = 'scale(1.18)';
  setTimeout(()=> orb.style.transform = '', 380);
}

/* init Hiro: wire up send, quick queries, reindex */
function initHiro(){
  const hSend = document.getElementById('hiro-send');
  const hInput = document.getElementById('hiro-input');
  const hOrb = document.getElementById('hiro-orb');
  const hWindow = document.getElementById('hiro-window');
  const hClose = document.getElementById('hiro-close');
  const openHiroBtn = document.getElementById('openHiroBtn');
  const reindexBtn = document.getElementById('reindexBtn');

  function openWindow(){ hWindow.classList.add('show'); hWindow.setAttribute('aria-hidden','false'); Hiro.buildIndex(); appendHiroMessage(state.lang === 'ru' ? 'Чем помочь?' : 'How can I help?', 'bot'); playTone(420,'sine',0.08,0.02); }
  function closeWindow(){ hWindow.classList.remove('show'); hWindow.setAttribute('aria-hidden','true'); playTone(260,'sine',0.06,0.02); }

  // orb click toggles Hiro window
  if(hOrb){
    hOrb.addEventListener('click', ()=>{
      // if welcome bubble visible, hide it
      const welcome = document.getElementById('hiro-welcome');
      if(welcome) welcome.classList.remove('show');
      if(hWindow.classList.contains('show')) closeWindow(); else openWindow();
    });
  }
  if(openHiroBtn) openHiroBtn.addEventListener('click', ()=> openWindow());
  if(hClose) hClose.addEventListener('click', ()=> closeWindow());
  if(hSend && hInput){
    hSend.addEventListener('click', ()=>{
      const q = hInput.value.trim(); if(!q) return;
      appendHiroMessage(q,'user'); hInput.value = ''; playTone(360,'sine',0.06,0.02);
      setTimeout(()=> {
        const res = Hiro.query(q);
        appendHiroMessage(res.answer || res, 'bot');
      }, 340 + Math.random()*300);
    });
    hInput.addEventListener('keydown',(e)=>{ if(e.key === 'Enter'){ e.preventDefault(); hSend.click(); }});
  }
  document.querySelectorAll('.hiro-quick .quick').forEach(btn=> btn.addEventListener('click', ()=> {
    const q = btn.getAttribute('data-q') || btn.textContent; appendHiroMessage(q,'user');
    setTimeout(()=> { const res = Hiro.query(q); appendHiroMessage(res.answer || res,'bot'); }, 300);
  }));

  // reindex
  if(reindexBtn){
    reindexBtn.addEventListener('click', ()=>{
      Hiro.buildIndex();
      appendHiroMessage(state.lang==='ru' ? 'Хиро обновил знания о сайте.' : 'Hiro reindexed the site knowledge.', 'bot');
      playTone(480,'sine',0.09,0.02);
    });
  }
}

/* --------------------- Welcome bubble (3s) --------------------- */
function showWelcomeBubble(){
  const welcome = document.getElementById('hiro-welcome');
  if(!welcome) return;
  welcome.textContent = t('welcome_text') || welcome.textContent;
  welcome.classList.add('show');
  setTimeout(()=> welcome.classList.remove('show'), 3000);
}

/* --------------------- Micro interactions: magnetic hover and hover sounds --------------------- */
function initMagneticAndSounds(){
  document.querySelectorAll('.magnetic').forEach(el=>{
    el.addEventListener('mousemove', (e)=>{
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width/2)) / 12;
      const dy = (e.clientY - (rect.top + rect.height/2)) / 12;
      el.style.transform = `translate(${dx}px, ${dy}px) scale(1.02)`;
    });
    el.addEventListener('mouseleave', ()=> el.style.transform = '');
    el.addEventListener('mouseenter', ()=> softHover());
    el.addEventListener('click', ()=> softClick());
  });

  // micro hover sounds for nav links
  document.querySelectorAll('.nav-link, .drop-toggle, .dropdown-link, .l-link, .btn').forEach(el=>{
    el.addEventListener('mouseenter', ()=> softHover());
  });
}

/* --------------------- Initialize interactive controls --------------------- */
function initUIControls(){
  // logoStart / launcher
  initLauncher();

  // dropdowns
  initDropdowns();

  // routing
  initRouter();

  // news filter
  initNewsFilter();

  // lang toggle
  initLangToggle();

  // Hiro
  initHiro();

  // magnetic & sounds
  initMagneticAndSounds();

  // welcome bubble
  setTimeout(()=> showWelcomeBubble(), 700);

  // Make sure elements with data-i18n are translated initially
  applyTranslations();
}

/* --------------------- Accessibility helpers --------------------- */
function enableKeyboardNav(){
  // allow keyboard open for launcher and lang button
  const logoBtn = document.getElementById('logoStart');
  if(logoBtn) logoBtn.setAttribute('tabindex', '0');
  const langBtn = document.getElementById('langBtn');
  if(langBtn) langBtn.setAttribute('tabindex', '0');
}

/* --------------------- Boot sequence --------------------- */
document.addEventListener('DOMContentLoaded', ()=>{
  // set initial language label for langBtn
  const langBtn = document.getElementById('langBtn');
  if(langBtn) langBtn.textContent = state.lang === 'ru' ? '🌐 RU' : '🌐 EN';

  // initialize background
  const stopBg = initBackgroundCanvas();

  // sound default true
  if(localStorage.getItem(LS_SOUND) === null) localStorage.setItem(LS_SOUND, state.sound ? '1' : '0');

  // wire UI
  initUIControls();

  // show initial route translations
  applyTranslations();

  // safe unload: cancel canvas
  window.addEventListener('pagehide', ()=> { if(stopBg) stopBg(); });
});

/* --------------------- End of script.js --------------------- */
