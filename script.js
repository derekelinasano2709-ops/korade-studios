(() => {
  "use strict";
  const config = window.KORADE_CONFIG || {};
  const translations = window.KORADE_TRANSLATIONS || {};
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const root = document.documentElement;
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  let language = "en";
  let toastTimer;
  let revealObserver;

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  function translate(nextLanguage) {
    language = translations[nextLanguage] ? nextLanguage : "en";
    const dictionary = translations[language] || translations.en || {};
    root.lang = language;
    $$('[data-i18n]').forEach(element => {
      const translated = dictionary[element.dataset.i18n];
      if (typeof translated === "string") element.innerHTML = translated;
    });
    const select = $("#languageSelect");
    if (select) select.value = language;
    $$('[data-policy]').forEach(panel => {
      panel.innerHTML = dictionary[panel.dataset.policy] ?? (translations.en || {})[panel.dataset.policy] ?? "";
    });
    const description = $("#gameDescription");
    if (description) description.textContent = dictionary.gameDescription || config.game?.description || "";
  }

  function validHttpsUrl(value) {
    if (typeof value !== "string" || !value.trim()) return false;
    try { return new URL(value, location.href).protocol === "https:"; } catch { return false; }
  }

  function setTheme(theme) {
    root.dataset.theme = theme === "light" ? "light" : "dark";
    $("#themeGlyph").textContent = root.dataset.theme === "dark" ? "☼" : "☾";
    $("#themeToggle").setAttribute("aria-label", root.dataset.theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    try { localStorage.setItem("korade-theme", root.dataset.theme); } catch { /* Storage may be disabled. */ }
  }
  let savedTheme = "dark";
  try { savedTheme = localStorage.getItem("korade-theme") || "dark"; } catch { /* Storage may be disabled. */ }
  setTheme(savedTheme);
  $("#themeToggle").addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));
  $("#languageSelect").addEventListener("change", event => translate(event.target.value));
  translate("en");

  // Scroll reveal, with a safe fallback for browsers without IntersectionObserver.
  if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    }), { threshold: .1, rootMargin: "0px 0px -25px 0px" });
    $$(".reveal").forEach(element => revealObserver.observe(element));
  } else {
    $$(".reveal").forEach(element => element.classList.add("is-visible"));
  }

  // Main navigation: closes after selecting a section and when Escape is pressed.
  const nav = $("#mainNav");
  const menuButton = $("#menuToggle");
  function closeMenu() {
    nav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
  }
  menuButton.addEventListener("click", () => {
    const opened = nav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(opened));
    menuButton.setAttribute("aria-label", opened ? "Close navigation" : "Open navigation");
  });
  $$('a[href^="#"]', nav).forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });

  // Official Roblox game link and public thumbnails. If Roblox has no approved artwork,
  // the custom crown fallback remains visible instead of showing a broken image.
  const game = config.game || {};
  const placeId = String(game.placeId || "").trim();
  $("#gameName").textContent = game.name || "KORADE Experience";
  $("#placeIdLabel").textContent = placeId || "—";
  const gameLink = $("#gameLink");
  if (validHttpsUrl(game.url)) {
    gameLink.href = game.url;
    gameLink.target = "_blank";
    gameLink.rel = "noopener noreferrer";
  } else {
    gameLink.href = "#games";
    gameLink.setAttribute("aria-disabled", "true");
    gameLink.addEventListener("click", event => event.preventDefault());
  }

  const gameImage = $("#gameImage");
  const gameFallback = $("#gameFallback");
  const gallery = $("#gameGallery");
  const galleryEmpty = $("#galleryEmpty");
  const seenImages = new Set();
  function addGalleryImage(url, index) {
    if (!validHttpsUrl(url) || seenImages.has(url) || seenImages.size >= 6) return;
    seenImages.add(url);
    const figure = document.createElement("figure");
    figure.className = "gallery-item reveal";
    const image = document.createElement("img");
    image.src = url;
    image.alt = `${game.name || "KORADE game"} — official game image ${index + 1}`;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => figure.remove(), { once: true });
    figure.append(image);
    const caption = document.createElement("figcaption");
    caption.textContent = `GAME ARTWORK / 0${index + 1}`;
    figure.append(caption);
    gallery.append(figure);
    if (revealObserver) revealObserver.observe(figure); else figure.classList.add("is-visible");
    if (galleryEmpty) galleryEmpty.remove();
  }
  function setFeaturedImage(url) {
    if (!validHttpsUrl(url)) return false;
    gameImage.onload = () => {
      gameImage.classList.add("loaded");
      gameFallback.classList.add("hidden");
      gameImage.onload = null;
      gameImage.onerror = null;
    };
    gameImage.onerror = () => {
      gameImage.classList.remove("loaded");
      gameFallback.classList.remove("hidden");
      gameImage.onload = null;
      gameImage.onerror = null;
    };
    gameImage.src = url;
    return true;
  }
  if (validHttpsUrl(game.image)) setFeaturedImage(game.image);
  (Array.isArray(game.screenshots) ? game.screenshots : []).slice(0, 6).forEach((url, index) => addGalleryImage(url, index));

  async function loadRobloxArtwork() {
    if (!placeId) { galleryEmpty?.remove(); return; }
    try {
      const endpoint = `https://thumbnails.roblox.com/v1/places/${encodeURIComponent(placeId)}/thumbnails?size=768x432&format=Png&isCircular=false&returnPolicy=PlaceHolder&count=10`;
      const response = await fetch(endpoint, { mode: "cors", credentials: "omit" });
      if (!response.ok) throw new Error("Roblox thumbnail request failed");
      const payload = await response.json();
      const urls = (payload.data || []).map(item => item.imageUrl).filter(validHttpsUrl);
      if (urls.length) {
        if (!game.image) setFeaturedImage(urls[0]);
        urls.slice(1, 7).forEach((url, index) => addGalleryImage(url, index));
        if (galleryEmpty && gallery.children.length > 0) galleryEmpty.remove();
      }
    } catch (error) {
      // Roblox may temporarily block requests or have no public thumbnail. Keep the fallback.
      console.info("KORADE: Roblox thumbnails unavailable; using studio artwork fallback.");
    }
    if (gallery.children.length === 0 && galleryEmpty) {
      const dictionary = translations[language] || translations.en || {};
      galleryEmpty.textContent = dictionary.galleryEmpty || "No additional official screenshots are available yet.";
    }
  }
  loadRobloxArtwork();

  // Copy the public place ID without exposing any account information.
  $("#copyGameId").addEventListener("click", async () => {
    const dictionary = translations[language] || translations.en || {};
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(placeId);
      else {
        const helper = document.createElement("textarea");
        helper.value = placeId; helper.style.position = "fixed"; helper.style.opacity = "0";
        document.body.append(helper); helper.select();
        const copied = document.execCommand("copy"); helper.remove();
        if (!copied) throw new Error("Clipboard unavailable");
      }
      showToast(dictionary.copied || "Game ID copied.");
    } catch {
      showToast((dictionary.copyFailed || "Could not copy. ID: ") + placeId);
    }
  });

  // Gallery lightbox with keyboard and click-outside dismissal.
  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightboxImage");
  function openLightbox(src, alt) {
    if (!validHttpsUrl(src)) return;
    lightboxImage.src = src; lightboxImage.alt = alt || "Game artwork";
    lightbox.hidden = false;
    $("#lightboxClose").focus();
  }
  function closeLightbox() { lightbox.hidden = true; lightboxImage.removeAttribute("src"); }
  $("#imageExpand").addEventListener("click", () => {
    if (gameImage.classList.contains("loaded")) openLightbox(gameImage.currentSrc || gameImage.src, gameImage.alt);
  });
  gallery.addEventListener("click", event => {
    const image = event.target.closest("img");
    if (image) openLightbox(image.currentSrc || image.src, image.alt);
  });
  $("#lightboxClose").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", event => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !lightbox.hidden) closeLightbox(); });

  // Discord link: always open in a separate tab with safe rel attributes.
  const discordInvite = config.discord?.invite;
  const discordLink = $("#discordLink");
  if (validHttpsUrl(discordInvite)) {
    discordLink.href = discordInvite;
    discordLink.target = "_blank";
    discordLink.rel = "noopener noreferrer";
  } else {
    discordLink.href = "#community";
    discordLink.setAttribute("aria-disabled", "true");
    discordLink.addEventListener("click", event => event.preventDefault());
  }

  // Single-open FAQ/policy accordions improve keyboard and screen-reader clarity.
  ["#faqList", "#policyList"].forEach(selector => {
    const container = $(selector);
    container.addEventListener("toggle", event => {
      if (!(event.target instanceof HTMLDetailsElement) || !event.target.open) return;
      $$('details[open]', container).forEach(detail => { if (detail !== event.target) detail.open = false; });
    }, true);
  });

  // Scroll progress and pointer effects.
  const progress = $("#scrollProgress");
  let scrollQueued = false;
  function updateScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${maxScroll > 0 ? window.scrollY / maxScroll : 0})`;
    scrollQueued = false;
  }
  window.addEventListener("scroll", () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  updateScroll();

  const canvas = $("#particleCanvas");
  const context = canvas.getContext?.("2d");
  if (context && !reducedMotion) {
    let particles = [], width = 0, height = 0, frame = 0;
    function resizeCanvas() {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = Math.floor(width * ratio); canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const amount = Math.min(58, Math.max(20, Math.floor(width / 22)));
      particles = Array.from({ length: amount }, () => ({
        x: Math.random() * width, y: Math.random() * height,
        radius: Math.random() * 1.35 + .35,
        vx: (Math.random() - .5) * .2, vy: (Math.random() - .5) * .17,
        alpha: Math.random() * .36 + .1, phase: Math.random() * Math.PI * 2
      }));
    }
    function animateParticles() {
      context.clearRect(0, 0, width, height);
      const rgb = getComputedStyle(root).getPropertyValue("--particle").trim() || "216,182,107";
      particles.forEach(particle => {
        particle.x += particle.vx; particle.y += particle.vy; particle.phase += .008;
        if (particle.x < -5) particle.x = width + 5;
        if (particle.x > width + 5) particle.x = -5;
        if (particle.y < -5) particle.y = height + 5;
        if (particle.y > height + 5) particle.y = -5;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius * (1 + Math.sin(particle.phase) * .2), 0, Math.PI * 2);
        context.fillStyle = `rgba(${rgb},${particle.alpha})`; context.fill();
      });
      if (!coarsePointer) {
        for (let i = 0; i < particles.length; i++) for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j], distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance < 95) {
            context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y);
            context.strokeStyle = `rgba(${rgb},${(1 - distance / 95) * .06})`;
            context.lineWidth = .6; context.stroke();
          }
        }
      }
      frame = requestAnimationFrame(animateParticles);
    }
    resizeCanvas(); animateParticles();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(frame);
      else if (!reducedMotion) animateParticles();
    });
  }

  if (!coarsePointer && !reducedMotion) {
    const glow = $("#cursorGlow");
    window.addEventListener("pointermove", event => {
      glow.style.left = `${event.clientX}px`; glow.style.top = `${event.clientY}px`;
      glow.classList.add("active");
    }, { passive: true });
    $$(".magnetic").forEach(element => {
      element.addEventListener("pointermove", event => {
        const rect = element.getBoundingClientRect();
        const dx = event.clientX - rect.left - rect.width / 2;
        const dy = event.clientY - rect.top - rect.height / 2;
        element.style.transform = `translate(${dx * .055}px,${dy * .08}px)`;
      });
      element.addEventListener("pointerleave", () => element.style.transform = "");
    });
    $$(".tilt-card").forEach(card => {
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(1000px) rotateY(${x * 2.5}deg) rotateX(${-y * 2.5}deg) translateY(-2px)`;
      });
      card.addEventListener("pointerleave", () => card.style.transform = "");
    });
    const heroStage = $("#heroStage");
    heroStage.addEventListener("pointermove", event => {
      const rect = heroStage.getBoundingClientRect();
      heroStage.style.setProperty("--mx", `${(event.clientX - rect.left - rect.width / 2) * .025}px`);
      heroStage.style.setProperty("--my", `${(event.clientY - rect.top - rect.height / 2) * .025}px`);
    });
    heroStage.addEventListener("pointerleave", () => {
      heroStage.style.setProperty("--mx", "0px"); heroStage.style.setProperty("--my", "0px");
    });
  }


  // Enhanced cursor ring and deeper 3D card tilt for mouse/trackpad users.
  if (!coarsePointer && !reducedMotion) {
    const ring = $("#cursorRing");
    window.addEventListener("pointermove", event => {
      ring.style.left = `${event.clientX}px`;
      ring.style.top = `${event.clientY}px`;
      ring.classList.add("active");
    }, { passive: true });
    document.addEventListener("pointerover", event => {
      if (event.target.closest("a,button,.gallery-item,summary")) ring.classList.add("hover");
    });
    document.addEventListener("pointerout", event => {
      if (event.target.closest("a,button,.gallery-item,summary")) ring.classList.remove("hover");
    });
    $$(".tilt-card").forEach(card => {
      card.addEventListener("pointermove", event => {
        const r = card.getBoundingClientRect();
        const px = (event.clientX-r.left)/r.width, py = (event.clientY-r.top)/r.height;
        card.style.transform = `perspective(1200px) rotateX(${(0.5-py)*7}deg) rotateY(${(px-0.5)*8}deg) translateY(-5px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  // Hard-set the two key CTA destinations, independent of config loading or translation.
  const officialDestinations = {
    "#gameLink": "https://www.roblox.com/es/games/137764992604751/Smash-Eggs-For-Animals",
    "#discordLink": "https://discord.gg/aSZxVj3bW"
  };
  Object.entries(officialDestinations).forEach(([selector, url]) => {
    const anchor = $(selector);
    if (!anchor) return;
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.referrerPolicy = "no-referrer";
    anchor.removeAttribute("aria-disabled");
  });

  // 16+ is a community self-declaration, never represented as verified age.
  const ageModal = $("#ageModal");
  let ageConfirmed = false;
  try { ageConfirmed = sessionStorage.getItem("korade-age-confirmed") === "yes"; } catch { /* Session storage may be disabled. */ }
  if (!ageConfirmed) ageModal.hidden = false;
  $("#ageConfirm").addEventListener("click", () => {
    try { sessionStorage.setItem("korade-age-confirmed", "yes"); } catch { /* The prompt still closes for this page view. */ }
    ageModal.hidden = true;
  });
  $("#ageDecline").addEventListener("click", () => {
    const dictionary = translations[language] || translations.en || {};
    const card = $(".age-modal-card");
    card.innerHTML = `<img src="assets/korade-crown.png" class="modal-crown" alt=""><h2>${dictionary.underAge || "KORADE community spaces are intended for people aged 16 or older."}</h2><p>${dictionary.ageDisclaimer || "This is a self-declaration, not formal age verification."}</p>`;
    $("#main").setAttribute("inert", "");
  });

  $("#year").textContent = String(new Date().getFullYear());
  function hideLoader() { $("#pageLoader").classList.add("loaded"); }
  window.addEventListener("load", () => setTimeout(hideLoader, 350), { once: true });
  setTimeout(hideLoader, 2200); // Never leave the page covered if an external asset stalls.
})();
