/* script.js — Rupture improved
   - Navigation & dropdowns
   - Background canvas with mouse-follow "energy" blobs
   - Magnetic buttons
   - Hiro: local hybrid knowledge, bilingual RU/EN
   - UI sounds, reindex (updates Hiro index)
*/

/* ---------- Config ---------- */
const EMAIL_CONTACT = "rupture.off@gmail.com";
const LANG_KEY = 'rupture_lang';
const SOUND_KEY = 'rupture_sound';
let state = { lang: localStorage.getItem(LANG_KEY) || 'ru', sound: (localStorage.getItem(SOUND_KEY) !== '0') };

/* ---------- Translations (RU + EN) ---------- */
const TRANSLATIONS = {
  ru: {
    nav_home: "Главная",
    nav_games: "Игры ▾",
    nav_news: "Новости ▾",
    nav_community: "Сообщество ▾",
    nav_studio: "Студия ▾",
    nav_support: "Поддержка ▾",
    nav_our_games: "Наши игры",
    nav_latest: "Последние",
    nav_dev_note: "Проект в разработке",
    welcome: "Добро пожаловать в RUPTURE",
    tagline: "Игры с характером — история в каждой тени.",
    cta_games: "Наши игры",
    cta_news: "Последние новости",
    feat_style: "Стиль",
    feat_style_desc: "Фирменная эстетика RUPTURE — чёткие линии, сила и характер.",
    feat_comm: "Сообщество",
    feat_comm_desc: "Все платформы в одном месте — поддержка и донаты.",
    feat_hiro: "Хиро",
    feat_hiro_desc: "AI-сфера — помощник сайта, знает только опубликованное и отвечает честно.",
    games_title: "Игры",
    games_intro: "Каталог проектов RUPTURE.",
    updates: "Последние обновления",
    last_update_label: "Последнее обновление:",
    support_title: "Поддержка",
    support_intro: "Выберите FAQ или напишите — Хиро поможет.",
    faq_title: "FAQ",
    faq_q_updates: "Как публиковать новости?",
    faq_a_updates: "Обновления публикуются в разделе Новости. Отредактируй блок #newsFeed в index.html или добавь пост в news.html, затем нажми «Обновить знания» у Хиро.",
    faq_q_add_game: "Как добавить игру в каталог?",
    faq_a_add_game: "Добавь карточку в блок #gamesList в index.html или скажи Хиро — он подскажет шаблон.",
    faq_q_contact: "Как связаться напрямую?",
    faq_a_contact: "Нажми «Написать по почте» — откроется твой почтовый клиент с шаблоном на rupture.off@gmail.com.",
    btn_hiro: "Написать Хиро",
    btn_mail: "Написать по почте",
    btn_reindex: "Обновить знания",
    hiro_title: "Хиро — AI-сфера",
    hiro_placeholder: "Напиши Хиро: 'Что нового', 'Кто в команде', 'Как публиковать'",
    btn_send: "Отправить",
    quick_news: "Что нового",
    quick_games: "Игры",
    quick_publish: "Как публиковать",
    quick_contact: "Как написать",
    about_title: "О компании",
    about_text: "RUPTURE — независимая студия. Мы создаём проекты с фирменным характером.",
    team: "Команда",
    team_text: "Художники · Программисты · Дизайнеры · Продюсеры",
    privacy_title: "Политика конфиденциальности",
    privacy_text: "©2025 RUPTURE. Все права защищены. Форма обратной связи работает в демо-режиме.",
    contacts: "Контакты"
  },
  en: {
    nav_home: "Home",
    nav_games: "Games ▾",
    nav_news: "News ▾",
    nav_community: "Community ▾",
    nav_studio: "Studio ▾",
    nav_support: "Support ▾",
    nav_our_games: "Our games",
    nav_latest: "Latest",
    nav_dev_note: "Project in development",
    welcome: "Welcome to RUPTURE",
    tagline: "Games with character — a story in every shadow.",
    cta_games: "Our games",
    cta_news: "Latest news",
    feat_style: "Style",
    feat_style_desc: "RUPTURE signature aesthetics — clear lines, power and character.",
    feat_comm: "Community",
    feat_comm_desc: "All platforms in one place — support & donations.",
    feat_hiro: "Hiro",
    feat_hiro_desc: "AI-orb — site assistant, knows only published content and answers honestly.",
    games_title: "Games",
    games_intro: "Catalog of RUPTURE projects.",
    updates: "Latest updates",
    last_update_label: "Last update:",
    support_title: "Support",
    support_intro: "Pick FAQ or write — Hiro will assist.",
    faq_title: "FAQ",
    faq_q_updates: "How to publish news?",
    faq_a_updates: "Post updates in the News section. Edit #newsFeed in index.html or add a post in news.html, then press 'Reindex' for Hiro.",
    faq_q_add_game: "How to add a game to catalog?",
    faq_a_add_game: "Add a card to #gamesList in index.html or ask Hiro — he'll give a template.",
    faq_q_contact: "How to contact directly?",
    faq_a_contact: "Click 'Write by mail' — your mail client will open with a template to rupture.off@gmail.com.",
    btn_hiro: "Write Hiro",
    btn_mail: "Write by mail",
    btn_reindex: "Reindex knowledge",
    hiro_title: "Hiro — AI-orb",
    hiro_placeholder: "Ask Hiro: 'What's new', 'Who is on team', 'How to publish'",
    btn_send: "Send",
    quick_news: "What's new",
    quick_games: "Games",
    quick_publish: "How to publish",
    quick_contact: "How to contact",
    about_title: "About",
    about_text: "RUPTURE is an independent studio. We build projects with signature character.",
    team: "Team",
    team_text: "Artists · Programmers · Designers · Producers",
    privacy_title: "Privacy policy",
    privacy_text: "©2025 RUPTURE. All rights reserved. Contact form is demo mode.",
    contacts: "Contacts"
  }
};

/* ---------- Small sound helper ---------- */
let audioCtx = null;
function playSound(type='click'){
  if(!state.sound) return;
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = (type==='hover') ? 'sine' : 'triangle';
    o.frequency.setValueAtTime(type==='hover'?520:280, audioCtx.currentTime);
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.03, audioCtx.currentTime+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime+0.12);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime+0.13);
  }catch(e){/* silent */ }
}

/* ---------- Apply translations ---------- */
function applyTranslations(){
  const dict = TRANSLATIONS[state.lang] || TRANSLATIONS['ru'];
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(dict[key]) el.textContent = dict[key];
  });
  // placeholders
  const phEls = document.querySelectorAll('[data-i18n-placeholder]');
  phEls.forEach(el=>{
    const key = el.getAttribute('data-i18n-placeholder');
    if(TRANSLATIONS[state.lang] && TRANSLATIONS[state.lang][key]) el.placeholder = TRANSLATIONS[state.lang][key];
  });
}

/* ---------- Nav / Dropdowns ---------- */
function closeAllDropdowns(){
  document.querySelectorAll('.has-dropdown').forEach(h=>{
    h.classList.remove('open');
    const btn = h.querySelector('.drop-toggle'); if(btn) btn.setAttribute('aria-expanded','false');
  });
}
function initDropdowns(){
  document.querySelectorAll('.drop-toggle').forEach(btn=>{
    btn.addEventListener('click',(e)=>{
      e.stopPropagation();
      const parent = btn.closest('.has-dropdown');
      const isOpen = parent.classList.contains('open');
      document.querySelectorAll('.has-dropdown').forEach(h=>{ if(h!==parent) h.classList.remove('open'); h.querySelectorAll('.drop-toggle').forEach(b=>b.setAttribute('aria-expanded','false'))});
      if(!isOpen){ parent.classList.add('open'); btn.setAttribute('aria-expanded','true'); playSound('hover'); }
      else { parent.classList.remove('open'); btn.setAttribute('aria-expanded','false'); playSound('click'); }
    });
  });
  document.addEventListener('click',(e)=>{
    if(!e.target.closest('.topbar')){ closeAllDropdowns(); const nav = document.querySelector('.nav'); if(nav) nav.classList.remove('show'); }
  });
}

/* ---------- Mobile nav ---------- */
function initNavToggle(){
  const navToggle = document.getElementById('navToggle');
  if(!navToggle) return;
  navToggle.addEventListener('click',(e)=>{ e.stopPropagation(); const navEl = document.querySelector('.nav'); if(navEl) navEl.classList.toggle('show'); playSound('click'); });
}

/* ---------- Router ---------- */
function showSection(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const el = document.getElementById(id);
  if(el) el.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}
function routeFromHash(){ const h = location.hash.replace('#','') || 'home'; showSection(h); }

/* ---------- Last update ---------- */
function initLastUpdate(){
  const src = document.getElementById('update-source');
  if(!src) return;
  const raw = src.getAttribute('data-date') || '';
  const lbl = document.getElementById('last-update');
  if(!raw){ if(lbl) lbl.textContent = '—'; return; }
  const d = new Date(raw);
  if(isNaN(d.getTime())) { if(lbl) lbl.textContent = raw; return; }
  const formatted = d.toLocaleDateString(state.lang==='ru'?'ru-RU':'en-US',{day:'2-digit',month:'long',year:'numeric'});
  if(lbl) lbl.textContent = formatted;
}

/* ---------- Search ---------- */
function performSearch(q){
  q = (q||'').trim().toLowerCase();
  const feed = document.getElementById('newsFeed');
  feed.innerHTML = '';
  if(!q){ feed.innerHTML = '<div class="news-item">Введите запрос / Enter a query.</div>'; location.hash='news'; return; }
  const results = [];
  document.querySelectorAll('h1,h2,h3,.card-title,.card-desc,.lead,.news-item').forEach(el=>{
    if(el.textContent.toLowerCase().includes(q)) results.push(el.textContent);
  });
  if(results.length){ results.forEach(r=>{ const node=document.createElement('div'); node.className='news-item'; node.innerHTML=`<strong>Найдено / Found:</strong><div style="margin-top:6px">${r}</div>`; feed.appendChild(node); }); }
  else feed.innerHTML = '<div class="news-item">Ничего не найдено / Nothing found.</div>';
  location.hash='news';
}

/* ---------- Magnetic buttons ---------- */
function initMagnetic(){
  document.querySelectorAll('.magnetic').forEach(btn=>{
    btn.addEventListener('mousemove', e=>{
      const rect = btn.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width/2)) / 12;
      const dy = (e.clientY - (rect.top + rect.height/2)) / 12;
      btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.02)`;
    });
    btn.addEventListener('mouseleave', ()=>{ btn.style.transform = ''; });
    btn.addEventListener('mouseenter', ()=> playSound('hover'));
    btn.addEventListener('click', ()=> playSound('click'));
  });
}

/* ---------- Mail ---------- */
function openMailClient(subject, body){
  const mail = `mailto:${EMAIL_CONTACT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mail;
}

/* ---------- Hiro: indexer & query (bilingual) ---------- */
const Hiro = {
  index: { news:[], games:[], about:[], support:[], privacy:[], news_date:null },
  buildIndex: function(){
    this.index = { news:[], games:[], about:[], support:[], privacy:[], news_date:null };
    // news items
    document.querySelectorAll('#newsFeed .news-item').forEach((n,i)=>{
      const txt = n.textContent.replace(/\s+/g,' ').trim();
      this.index.news.push({ id:`news-${i}`, text:txt });
    });
    const updateEl = document.getElementById('update-source');
    if(updateEl) this.index.news_date = updateEl.getAttribute('data-date') || null;
    // games
    document.querySelectorAll('#gamesList .card').forEach((c,i)=>{
      const t = c.querySelector('.card-title') ? c.querySelector('.card-title').textContent.trim() : '';
      const d = c.querySelector('.card-desc') ? c.querySelector('.card-desc').textContent.trim() : '';
      this.index.games.push({ id:`game-${i}`, title:t, text:d });
    });
    // about
    const aboutEl = document.getElementById('about');
    if(aboutEl) this.index.about = Array.from(aboutEl.querySelectorAll('p, h3')).map(x=>x.textContent.trim()).slice(0,8);
    // support FAQ
    document.querySelectorAll('#faq details').forEach((d,i)=>{
      const q = d.querySelector('summary') ? d.querySelector('summary').textContent.trim() : `faq-${i}`;
      const a = d.querySelector('.faq-body') ? d.querySelector('.faq-body').textContent.trim() : d.textContent.trim();
      this.index.support.push({ q, a });
    });
    // privacy
    const priv = document.getElementById('privacy');
    if(priv) this.index.privacy = Array.from(priv.querySelectorAll('p,h3')).map(x=>x.textContent.trim()).slice(0,8);
    return this.index;
  },

  query: function(q){
    q = (q||'').toLowerCase().trim();
    if(!q) return { answer: this._localize("hiro_prompt_empty"), source:null };

    // direct intent rules (both RU & EN)
    if(q.includes('что нового') || q.includes('последн') || q.includes('обновл') || q.includes("what's new") || q.includes('latest') || q.includes('update')){
      if(this.index.news.length){
        const items = this.index.news.map(n=>`• ${n.text.slice(0,180)}`);
        const date = this.index.news_date ? ` (${this.formatDate(this.index.news_date)})` : '';
        return { answer: `${this._localize('hiro_latest')}${date}\n${items.slice(0,5).join('\n')}`, source:'news' };
      } else return { answer: this._localize('hiro_no_news'), source:'news' };
    }

    if(q.includes('игр') || q.includes('игра') || q.includes('game') || q.includes('games') || q.includes('project')){
      if(this.index.games.length){
        const g = this.index.games.map(g=>`• ${g.title}: ${g.text}`).slice(0,6);
        return { answer: this._localize('hiro_projects') + '\n' + g.join('\n'), source:'games' };
      } else return { answer: this._localize('hiro_no_projects'), source:'games' };
    }

    if(q.includes('как') && q.includes('публиков') || q.includes('how') && q.includes('publish') || q.includes('дата')){
      return { answer: this._localize('hiro_publish_instructions'), source:'support' };
    }

    if(q.includes('донат') || q.includes('поддерж') || q.includes('donate') || q.includes('support')){
      return { answer: this._localize('hiro_donate'), source:'support' };
    }

    if(q.includes('контакт') || q.includes('почт') || q.includes('contact') || q.includes('email')){
      return { answer: this._localize('hiro_contact') + ' ' + EMAIL_CONTACT, source:'support' };
    }

    if(q.includes('коман') || q.includes('team') || q.includes('who')){
      if(this.index.about && this.index.about.length) return { answer: this._localize('hiro_team') + ' ' + this.index.about.slice(0,2).join(' — '), source:'about' };
      else return { answer: this._localize('hiro_no_team'), source:'about' };
    }

    // fallback search across index (simple scoring by substring)
    const candidates = [];
    this.index.news.forEach(n=>{ if(n.text.toLowerCase().includes(q)) candidates.push({type:'news',score:2,text:n.text}); });
    this.index.games.forEach(g=>{ if((g.title+g.text).toLowerCase().includes(q)) candidates.push({type:'game',score:2,text:g.title + ' — ' + g.text}); });
    this.index.about.forEach(a=>{ if(a.toLowerCase().includes(q)) candidates.push({type:'about',score:1,text:a}); });
    this.index.support.forEach(s=>{ if((s.q + ' ' + s.a).toLowerCase().includes(q)) candidates.push({type:'support',score:1,text:s.a}); });

    if(candidates.length){
      candidates.sort((a,b)=>b.score-a.score);
      const top = candidates.slice(0,3).map(c=>`• ${c.text.slice(0,220)}`);
      return { answer: this._localize('hiro_found') + '\n' + top.join('\n'), source:'search' };
    }

    return { answer: this._localize('hiro_none'), source:null };
  },

  formatDate: function(raw){
    const d = new Date(raw);
    if(isNaN(d.getTime())) return raw;
    return d.toLocaleDateString(state.lang==='ru'?'ru-RU':'en-US',{day:'2-digit',month:'long',year:'numeric'});
  },

  /* bilingual localized helper inside Hiro responses */
  _localize: function(key){
    const map = {
      'hiro_prompt_empty': { ru: "Напиши коротко, о чём вопрос: новости, игры, команда, донат, контакт.", en: "Write briefly what you ask: news, games, team, donate, contact." },
      'hiro_latest': { ru: "Последние публикации", en: "Latest publications" },
      'hiro_no_news': { ru: "Пока нет опубликованных обновлений.", en: "No published updates yet." },
      'hiro_projects': { ru: "Статусы проектов:", en: "Project statuses:" },
      'hiro_no_projects': { ru: "Проекты пока не опубликованы. Следите за разделом 'Игры'.", en: "Projects are not published yet. Check the Games section." },
      'hiro_publish_instructions': { ru: "Чтобы опубликовать новость: добавь элемент в #newsFeed в index.html или в отдельный файл news.html, затем нажми 'Обновить знания'.", en: "To publish a news item: add it to #newsFeed in index.html or add a post in news.html, then press 'Reindex knowledge'." },
      'hiro_donate': { ru: "Поддержать можно через Patreon / Boosty — ссылки в Сообществе. Хотите шаблон письма?", en: "You can support via Patreon / Boosty — links in Community. Need a mail template?" },
      'hiro_contact': { ru: "Почта для связи:", en: "Contact email:" },
      'hiro_team': { ru: "Команда:", en: "Team:" },
      'hiro_no_team': { ru: "Информация о команде пока не опубликована.", en: "Team information not published yet." },
      'hiro_found': { ru: "Найдено релевантное:", en: "Relevant results:" },
      'hiro_none': { ru: "Информация по запросу не найдена. Возможно, обновление ещё не опубликовано.", en: "No information found. The update may not be published yet." }
    };
    return (map[key] && map[key][state.lang]) || (map[key] && map[key]['ru']) || '';
  }
};

/* ---------- Hiro UI helpers ---------- */
function appendHiroMessage(text, from='bot'){
  const wrap = document.getElementById('hiroMessages');
  if(!wrap) return;
  const div = document.createElement('div'); div.className = 'hiro-msg ' + (from==='bot' ? 'hiro-bot' : 'hiro-user');
  div.textContent = text;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
  if(from==='bot') triggerOrbPulse();
}

/* process input -> Hiro.query */
function processHiroQuery(q){
  appendHiroMessage(q,'user');
  setTimeout(()=>{
    const res = Hiro.query(q);
    appendHiroMessage(res.answer,'bot');
  }, 350 + Math.random()*480);
}

/* ---------- Hiro init ---------- */
function initHiro(){
  Hiro.buildIndex();
  const input = document.getElementById('hiroInput');
  const send = document.getElementById('hiroSend');
  if(send && input){
    send.addEventListener('click', ()=>{ const v=input.value.trim(); if(!v) return; processHiroQuery(v); input.value=''; });
    input.addEventListener('keydown',(e)=>{ if(e.key==='Enter'){ e.preventDefault(); send.click(); }});
  }
  document.querySelectorAll('.hiro-quick .quick').forEach(btn=>btn.addEventListener('click', ()=> processHiroQuery(btn.getAttribute('data-q')) ));
  const mailBtn = document.getElementById('mailBtn'); if(mailBtn) mailBtn.addEventListener('click', ()=>{ appendHiroMessage(state.lang==='ru' ? "Готовлю шаблон письма..." : "Preparing mail template...", 'bot'); setTimeout(()=>{ appendHiroMessage(state.lang==='ru' ? "Шаблон готов. Нажмите 'Написать по почте'." : "Template ready. Press 'Write by mail'.", 'bot'); },420); });
  const openMailBtn = document.getElementById('openMail'); if(openMailBtn) openMailBtn.addEventListener('click', ()=> openMailClient(state.lang==='ru' ? "Поддержка RUPTURE" : "RUPTURE Support", state.lang==='ru' ? "Здравствуйте! Описываю проблему:\n\n— Что случилось?\n— На каком устройстве?\n— Скрин (если есть):\n" : "Hello! Describe your issue:\n\n- What happened?\n- On which device?\n- Screenshots (if any):\n"));
  const reindexBtn = document.getElementById('reindexBtn'); if(reindexBtn) reindexBtn.addEventListener('click', ()=>{ Hiro.buildIndex(); appendHiroMessage(state.lang==='ru' ? "Хиро обновил знания о сайте." : "Hiro reindexed the site knowledge.", 'bot'); });
  // greeting
  setTimeout(()=> appendHiroMessage(state.lang==='ru' ? "Привет! Я Хиро — помощник сайта. Спрошу только о том, что опубликовано." : "Hello! I'm Hiro — site assistant. I only know published content.", 'bot'), 600);
}

/* ---------- Orb visual pulse ---------- */
function triggerOrbPulse(){
  const pulse = document.querySelector('.hiro-orb .pulse');
  if(!pulse) return;
  pulse.style.boxShadow = '0 0 120px rgba(255,43,43,0.2)';
  setTimeout(()=> pulse.style.boxShadow = '0 0 60px rgba(255,43,43,0.12)', 450);
}

/* ---------- Background (mouse-follow energy blobs) ---------- */
function initBackground(){
  const canvas = document.getElementById('bg-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth, h = canvas.height = innerHeight;
  const blobs = []; const count = 6;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function rand(a,b){return Math.random()*(b-a)+a}
  function create(){
    blobs.length=0;
    for(let i=0;i<count;i++) blobs.push({x:rand(0,w), y:rand(0,h), r:rand(Math.min(w,h)/5, Math.min(w,h)/3), ang:rand(0,Math.PI*2), speed:rand(0.003,0.01), hue:rand(350,10)});
  }
  create();
  let mouseX=w/2, mouseY=h/2;
  window.addEventListener('mousemove', e=>{ mouseX = e.clientX; mouseY = e.clientY; });
  window.addEventListener('resize', ()=>{ w = canvas.width = innerWidth; h = canvas.height = innerHeight; create(); });

  function draw(){
    ctx.clearRect(0,0,w,h);
    // base subtle grain
    const g = ctx.createLinearGradient(0,0,w,h); g.addColorStop(0,'#050204'); g.addColorStop(0.6,'#09060a'); g.addColorStop(1,'#030204');
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);

    blobs.forEach(b=>{
      b.ang += b.speed * (reduced?0.2:1);
      // follow mouse gently: creates impression background "tracks" mouse
      const px = b.x + Math.sin(b.ang)*120 + (mouseX - w/2)*0.03;
      const py = b.y + Math.cos(b.ang)*100 + (mouseY - h/2)*0.03;
      const rad = b.r;
      const grad = ctx.createRadialGradient(px,py,rad*0.05,px,py,rad);
      // primary red core + purple accent
      grad.addColorStop(0, 'rgba(255,43,43,0.18)');
      grad.addColorStop(0.45, 'rgba(123,43,255,0.06)');
      grad.addColorStop(1, 'rgba(3,6,15,0)');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(px,py,rad,0,Math.PI*2); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    });

    // moving streaks towards mouse position (gently)
    for(let i=0;i<30;i++){
      const x = (i*97 + (mouseX*0.015)) % w;
      const y = (i*59 + (mouseY*0.012)) % h;
      ctx.fillStyle = 'rgba(255,255,255,0.012)';
      ctx.fillRect(x,y,1,1);
    }

    // vignette
    const vig = ctx.createRadialGradient(w/2,h/2, Math.min(w,h)/4, w/2,h/2, Math.max(w,h));
    vig.addColorStop(0,'rgba(0,0,0,0)');
    vig.addColorStop(1,'rgba(0,0,0,0.6)');
    ctx.fillStyle = vig; ctx.fillRect(0,0,w,h);
  }

  let raf;
  function loop(){ draw(); raf = requestAnimationFrame(loop); }
  if(!reduced) loop(); else draw();
  return ()=>{ if(raf) cancelAnimationFrame(raf); }
}

/* ---------- Hiro orb visual (click opens support) ---------- */
function initHiroOrb(){
  const container = document.createElement('div'); container.className='hiro-orb'; container.id='hiroOrb';
  const c = document.createElement('canvas'); c.width=200; c.height=200; container.appendChild(c);
  const pulse = document.createElement('div'); pulse.className='pulse'; container.appendChild(pulse);
  document.body.appendChild(container);
  const ctx = c.getContext('2d'); let w=c.width, h=c.height; let t=0;
  function draw(){
    ctx.clearRect(0,0,w,h);
    const cx=w/2, cy=h/2;
    // core radial with red + purple
    const g = ctx.createRadialGradient(cx,cy,6,cx,cy,60);
    g.addColorStop(0,'rgba(255,43,43,0.95)'); g.addColorStop(0.5,'rgba(123,43,255,0.22)'); g.addColorStop(1,'rgba(3,6,15,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,34 + 3*Math.sin(t/6),0,Math.PI*2); ctx.fill();
    // rotating lines
    ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=1;
    for(let i=0;i<6;i++){
      const a = t/40 + i*Math.PI/3;
      ctx.beginPath();
      const x1 = cx + Math.cos(a)*26, y1 = cy + Math.sin(a)*26;
      const x2 = cx + Math.cos(a+0.8)*46, y2 = cy + Math.sin(a+0.8)*46;
      ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    }
    t += 0.9;
    requestAnimationFrame(draw);
  }
  draw();
  container.addEventListener('click', ()=>{ location.hash='support'; const inp = document.getElementById('hiroInput'); if(inp) inp.focus(); });
}

/* ---------- UI wiring ---------- */
function initUI(){
  // translations
  applyTranslations();

  // logo home
  const logoBtn = document.getElementById('logoBtn'); if(logoBtn) logoBtn.addEventListener('click', ()=>{ location.hash='home'; playSound('click'); });

  // data-route links
  document.querySelectorAll('[data-route]').forEach(a=>{
    a.addEventListener('click',(e)=>{ e.preventDefault(); const r = a.getAttribute('data-route'); location.hash = r; closeAllDropdowns(); const nav = document.querySelector('.nav'); if(nav) nav.classList.remove('show'); });
  });

  // search
  const searchBtn = document.getElementById('searchBtn'); const searchInput = document.getElementById('searchInput');
  if(searchBtn) searchBtn.addEventListener('click', ()=> performSearch(searchInput.value));
  if(searchInput) searchInput.addEventListener('keydown',(e)=>{ if(e.key==='Enter') performSearch(e.target.value); });

  // sound toggle
  const soundToggle = document.getElementById('soundToggle');
  if(soundToggle){ soundToggle.addEventListener('click', ()=>{ state.sound = !state.sound; localStorage.setItem(SOUND_KEY, state.sound? '1':'0'); soundToggle.textContent = state.sound ? '🔊':'🔈'; playSound('click'); }); soundToggle.textContent = state.sound ? '🔊':'🔈'; }

  // language toggle
  const langBtn = document.getElementById('langBtn');
  if(langBtn){
    langBtn.addEventListener('click', ()=>{
      state.lang = state.lang === 'ru' ? 'en' : 'ru';
      localStorage.setItem(LANG_KEY, state.lang);
      applyTranslations();
      initLastUpdate();
      langBtn.textContent = state.lang === 'ru' ? '🌐 RU' : '🌐 EN';
      playSound('click');
    });
    langBtn.textContent = state.lang === 'ru' ? '🌐 RU' : '🌐 EN';
  }

  // dropdowns / nav toggle / magnetic
  initDropdowns(); initNavToggle(); initMagnetic();

  // support quick
  const supportQuick = document.getElementById('supportQuick'); if(supportQuick) supportQuick.addEventListener('click', ()=>{ location.hash='support'; });

  // mail button
  const mailBtn = document.getElementById('mailBtn'); if(mailBtn) mailBtn.addEventListener('click', ()=>{ appendHiroMessage(state.lang==='ru' ? "Готовлю шаблон..." : "Preparing template...", 'bot'); setTimeout(()=>{ appendHiroMessage(state.lang==='ru' ? "Готово. Нажмите 'Написать по почте'." : "Ready. Press 'Write by mail'.", 'bot'); }, 420); });

  const openMailBtn = document.getElementById('openMail'); if(openMailBtn) openMailBtn.addEventListener('click', ()=> openMailClient(state.lang==='ru' ? "Поддержка RUPTURE" : "RUPTURE Support", state.lang==='ru' ? "Здравствуйте! Описываю проблему:\n\n— Что случилось?\n— На каком устройстве?\n— Скрин (если есть):\n" : "Hello! Describe your issue:\n\n- What happened?\n- On which device?\n- Screenshots (if any):\n"));

  // reindex handled in Hiro init

  // routing
  initLastUpdate();
  routeFromHash();
  window.addEventListener('hashchange', routeFromHash);
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  // init prefs
  const pref = localStorage.getItem(SOUND_KEY); if(pref === '0') state.sound = false;
  initUI();
  initHiro();
  initBackground();
  initHiroOrb();
  // micro-interactions sound
  document.querySelectorAll('.nav-link, .drop-toggle, .dropdown a, .dropdown button').forEach(el=> el.addEventListener('mouseenter', ()=> playSound('hover')));
});
