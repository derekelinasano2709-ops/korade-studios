(() => {
  "use strict";
  const config = window.KORADE_CONFIG || {};
  const packs = window.KORADE_TRANSLATIONS || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const root = document.documentElement;
  let language = "en";
  const isTouch = matchMedia("(pointer: coarse)").matches;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function translate(lang) {
    language = packs[lang] ? lang : "en";
    const dict = packs[language] || packs.en;
    root.lang = language;
    $$("[data-i18n]").forEach(el => {
      const value = dict[el.dataset.i18n];
      if (value !== undefined) el.innerHTML = value;
    });
    $("#languageSelect").value = language;
  }

  function setTheme(theme) {
    root.dataset.theme = theme;
    $("#themeGlyph").textContent = theme === "dark" ? "☼" : "☾";
    try { localStorage.setItem("korade-theme", theme); } catch (_) {}
  }
  let theme = "dark";
  try { theme = localStorage.getItem("korade-theme") || "dark"; } catch (_) {}
  setTheme(theme === "light" ? "light" : "dark");
  $("#themeToggle").addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));
  $("#languageSelect").addEventListener("change", e => translate(e.target.value));
  translate("en");

  // Scroll reveal observer is initialized before dynamic gallery cards are created.
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("is-visible"); revealObserver.unobserve(entry.target); }
  }), { threshold: .12 });
  // Dynamic game and community content. Broken image URLs gracefully fall back to studio artwork.
  const game = config.game || {};
  $("#gameName").textContent = game.name || "KORADE Experience";
  $("#gameDescription").textContent = game.description || "";
  const gameLink = $("#gameLink");
  if (validUrl(game.url)) {
    gameLink.href = game.url;
    gameLink.classList.remove("is-disabled");
  } else {
    gameLink.classList.add("is-disabled");
    gameLink.addEventListener("click", e => e.preventDefault());
  }
  const gameImage = $("#gameImage");
  const fallback = $("#gameFallback");
  function applyGameImage(url) {
    if (!validUrl(url)) return;
    gameImage.src = url;
    gameImage.classList.add("has-source");
    gameImage.addEventListener("load", () => fallback.classList.add("is-hidden"), { once: true });
    gameImage.addEventListener("error", () => fallback.classList.remove("is-hidden"), { once: true });
  }
  if (validUrl(game.image)) {
    applyGameImage(game.image);
  } else if (game.placeId) {
    // Load official experience artwork from Roblox's public thumbnails API.
    const thumbnailBase = "https://thumbnails.roblox.com/v1/places/" + encodeURIComponent(game.placeId);
    fetch(thumbnailBase + "/thumbnails?format=Png&isCircular=false&size=768x432")
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(data => {
        const urls = (data.data || []).map(item => item.imageUrl).filter(validUrl);
        if (urls[0]) applyGameImage(urls[0]);
        urls.slice(1, 6).forEach((url, index) => addGalleryImage(url, index));
        if (!urls.length) return loadGameIcon();
      })
      .catch(loadGameIcon);
  } else {
    fallback.classList.remove("is-hidden");
  }
  function loadGameIcon() {
    if (!game.placeId) { fallback.classList.remove("is-hidden"); return; }
    const iconApi = "https://thumbnails.roblox.com/v1/places/gameicons?placeIds=" + encodeURIComponent(game.placeId) + "&size=512x512&format=Png&isCircular=false";
    fetch(iconApi).then(response => response.ok ? response.json() : Promise.reject())
      .then(data => applyGameImage(data.data && data.data[0] && data.data[0].imageUrl))
      .catch(() => fallback.classList.remove("is-hidden"));
  }
  const gallery = $("#gameGallery");
  function addGalleryImage(url, index) {
    if (!validUrl(url) || index >= 6) return;
    const figure = document.createElement("figure");
    figure.className = "gallery-item reveal";
    const image = document.createElement("img");
    image.src = url; image.alt = `Smash Eggs For Animals screenshot ${index + 1}`; image.loading = "lazy";
    image.addEventListener("error", () => figure.remove(), { once: true });
    figure.append(image);
    const label = document.createElement("figcaption");
    label.textContent = `GAME IMAGE / 0${index + 1}`;
    figure.append(label); gallery.append(figure);
    revealObserver.observe(figure);
  }
  (Array.isArray(game.screenshots) ? game.screenshots : []).filter(validUrl).slice(0, 6).forEach((url, index) => addGalleryImage(url, index));
  const invite = config.discord && config.discord.invite;
  if (validUrl(invite)) {
    $("#discordLink").href = invite;
    $("#discordNote").hidden = true;
  } else {
    $("#discordLink").classList.add("is-disabled");
    $("#discordLink").addEventListener("click", e => e.preventDefault());
  }
  function validUrl(value) {
    if (typeof value !== "string" || !value.trim()) return false;
    try { return new URL(value).protocol === "https:"; } catch (_) { return false; }
  }

  // Mobile navigation.
  const nav = $("#mainNav"), menu = $("#menuToggle");
  menu.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  $$("a", nav).forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("is-open"); menu.setAttribute("aria-expanded", "false");
  }));

  // Scroll reveal and progress indicator.
  $$(".reveal").forEach(el => revealObserver.observe(el));
  const progress = $("#scrollProgress");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // 2D canvas: floating gold dust and soft connecting trails.
  const canvas = $("#particleCanvas"), ctx = canvas.getContext("2d");
  let particles = [], w = 0, h = 0, raf = 0;
  function resizeCanvas() {
    const dpr = Math.min(devicePixelRatio || 1, 1.6);
    w = innerWidth; h = innerHeight;
    canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(72, Math.max(24, Math.floor(w / 18)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.5 + .35,
      vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .2,
      a: Math.random() * .42 + .12, phase: Math.random() * Math.PI * 2
    }));
  }
  function drawParticles(t = 0) {
    ctx.clearRect(0, 0, w, h);
    const gold = getComputedStyle(root).getPropertyValue("--particle").trim() || "201,166,98";
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.phase += .008;
      if (p.x < -5) p.x = w + 5; if (p.x > w + 5) p.x = -5;
      if (p.y < -5) p.y = h + 5; if (p.y > h + 5) p.y = -5;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 + Math.sin(p.phase) * .25), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${gold},${p.a * (.7 + Math.sin(p.phase) * .3)})`; ctx.fill();
    });
    if (!isTouch) {
      for (let i = 0; i < particles.length; i++) for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
        if (d < 105) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${gold},${(1 - d / 105) * .075})`; ctx.lineWidth = .6; ctx.stroke();
        }
      }
    }
    if (!reducedMotion) raf = requestAnimationFrame(drawParticles);
  }
  resizeCanvas(); drawParticles();
  addEventListener("resize", resizeCanvas, { passive: true });

  // Pointer spotlight, magnetic CTAs and subtle 3D card tilt on desktop.
  if (!isTouch && !reducedMotion) {
    const glow = $("#cursorGlow");
    addEventListener("pointermove", e => {
      glow.style.left = `${e.clientX}px`; glow.style.top = `${e.clientY}px`;
      glow.classList.add("active");
    }, { passive: true });
    $$(".magnetic").forEach(el => {
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect(), dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${dx * .08}px,${dy * .12}px)`;
      });
      el.addEventListener("pointerleave", () => el.style.transform = "");
    });
    $$(".tilt-card").forEach(card => {
      card.addEventListener("pointermove", e => {
        const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(900px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg) translateY(-3px)`;
      });
      card.addEventListener("pointerleave", () => card.style.transform = "");
    });
    const stage = $("#heroStage");
    stage.addEventListener("pointermove", e => {
      const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      stage.style.setProperty("--mx", `${x * 18}px`); stage.style.setProperty("--my", `${y * 18}px`);
    });
    stage.addEventListener("pointerleave", () => { stage.style.setProperty("--mx", "0px"); stage.style.setProperty("--my", "0px"); });
  }

  // 16+ notice is a self-declaration, not identity or age verification.
  const modal = $("#ageModal");
  let confirmed = false;
  try { confirmed = sessionStorage.getItem("korade-age-confirmed") === "yes"; } catch (_) {}
  if (!confirmed) modal.hidden = false;
  $("#ageConfirm").addEventListener("click", () => {
    try { sessionStorage.setItem("korade-age-confirmed", "yes"); } catch (_) {}
    modal.hidden = true;
  });
  $("#ageDecline").addEventListener("click", () => {
    const text = (packs[language] || packs.en).underAge;
    $(".age-modal-card").innerHTML = `<img src="assets/korade-crown.png" class="modal-crown" alt=""><h2>${text}</h2>`;
  });

  $("#year").textContent = new Date().getFullYear();
  addEventListener("load", () => {
    setTimeout(() => $("#pageLoader").classList.add("loaded"), 500);
  });
  if (document.readyState === "complete") setTimeout(() => $("#pageLoader").classList.add("loaded"), 650);
})();