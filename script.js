// переключение страниц
const content = document.getElementById("content");
const pages = {
  home: "<h1>Добро пожаловать в RUPTURE</h1><p>Скоро здесь будет взрывной контент ⚡</p>",
  news: "<h1>Новости</h1><p>Пока нет новых объявлений.</p>",
  games: "<h1>Игры</h1><p>Игры в разработке...</p>",
  support: "<h1>Поддержка</h1><p>Свяжитесь с нами: rupturedev@gmail.com</p>",
  about: "<h1>О нас</h1><p>RUPTURE — независимая студия, создающая игры и атмосферу.</p>",
  profile: "<h1>Профиль</h1><p>Вход и персонализация появятся позже.</p>"
};

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const page = btn.dataset.page;
    content.innerHTML = pages[page];
  });
});