(function () {
  const CORE_PAGES = new Set([
    "index.html",
    "artist-archive.html",
    "artist.html",
    "category.html",
    "timeline.html",
    "explorer.html",
    "graph.html",
    "collections.html",
    "rankings.html",
    "map.html",
    "contact.html",
    "about.html",
    "privacy.html",
    "thank-you.html",
    "thank-you-premium.html",
    "intro.html"
  ]);

  const TEXT_REPLACEMENTS = [
    ["\u00e2\u20ac\u201c", "\u2013"],
    ["\u00e2\u20ac\u201d", "\u2014"],
    ["\u00e2\u20ac\u02dc", "\u2018"],
    ["\u00e2\u20ac\u2122", "\u2019"],
    ["\u00e2\u20ac\u0153", "\u201c"],
    ["\u00e2\u20ac\u009d", "\u201d"],
    ["\u00e2\u20ac\u00a6", "\u2026"],
    ["\u00e2\u2020\u2019", "\u2192"],
    ["\u00c2", ""]
  ];

window.RAP_STORIES_BASE_URL = window.RAP_STORIES_BASE_URL
  || (window.RAP_STORIES_CONFIG && window.RAP_STORIES_CONFIG.baseUrl)
  || "https://example.com";
  const THEME_STORAGE_KEY = "rapStoriesTheme";
  const THEMES = [
    { id: "obsidian", label: "Obsidian" },
    { id: "midnight", label: "Midnight" },
    { id: "ember", label: "Ember" }
  ];

  function cleanText(value) {
    if (!value) return value;
    let next = value;
    TEXT_REPLACEMENTS.forEach(function (pair) {
      next = next.split(pair[0]).join(pair[1]);
    });
    return next;
  }

  function cleanTree(root) {
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach(function (node) {
      const cleaned = cleanText(node.nodeValue);
      if (cleaned !== node.nodeValue) {
        node.nodeValue = cleaned;
      }
    });

    root.querySelectorAll("[title],[aria-label],[placeholder],[content]").forEach(function (element) {
      ["title", "aria-label", "placeholder", "content"].forEach(function (attr) {
        if (element.hasAttribute(attr)) {
          const value = element.getAttribute(attr);
          const cleaned = cleanText(value);
          if (cleaned !== value) {
            element.setAttribute(attr, cleaned);
          }
        }
      });
    });
  }

  function getCurrentPage() {
    return window.location.pathname.split("/").pop() || "index.html";
  }

  function getStoredTheme() {
    try {
      return window.localStorage.getItem(THEME_STORAGE_KEY) || THEMES[0].id;
    } catch (error) {
      return THEMES[0].id;
    }
  }

  function getTheme(themeId) {
    return THEMES.find(function (theme) { return theme.id === themeId; }) || THEMES[0];
  }

  function applyTheme(themeId) {
    const theme = getTheme(themeId);
    document.documentElement.setAttribute("data-theme", theme.id);
    document.documentElement.style.colorScheme = "dark";
    return theme;
  }

  function persistTheme(themeId) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch (error) {
      return;
    }
  }

  function injectThemeToggleStyles() {
    if (document.getElementById("themeToggleStyles")) return;
    const style = document.createElement("style");
    style.id = "themeToggleStyles";
    style.textContent = [
      ".skip-link{position:fixed;top:14px;left:14px;z-index:4000;padding:12px 16px;border-radius:999px;background:#fff7bf;color:#111;font-weight:900;box-shadow:0 18px 40px rgba(0,0,0,.28);transform:translateY(-150%);transition:transform .2s ease}",
      ".skip-link:focus{transform:translateY(0)}",
      "a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,[tabindex]:focus-visible{outline:2px solid rgba(212,175,55,0.72)!important;outline-offset:3px}",
      ".nav-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}",
      ".theme-toggle{min-height:48px;padding:12px 16px;border-radius:999px;border:1px solid rgba(255,255,255,0.10);background:var(--panel,rgba(255,255,255,0.05));color:var(--text,#f4f4f5);font:inherit;font-weight:800;letter-spacing:.2px;cursor:pointer;box-shadow:var(--shadow,0 16px 40px rgba(0,0,0,0.2));transition:transform .2s ease,border-color .2s ease,background .2s ease}",
      ".theme-toggle:hover{transform:translateY(-2px);border-color:rgba(212,175,55,0.28);background:rgba(255,255,255,0.08)}",
      ".theme-toggle:focus-visible{outline:2px solid rgba(212,175,55,0.65);outline-offset:3px}",
      ".theme-toggle-theme{color:var(--accent,#d4af37)}",
      "@media (max-width:820px){.nav-actions{justify-content:center}.theme-toggle{width:100%;justify-content:center}}"
    ].join("");
    document.head.appendChild(style);
  }

  function setupThemeToggle() {
    injectThemeToggleStyles();

    const nav = document.querySelector(".nav");
    if (!nav) return;

    let actions = nav.querySelector(".nav-actions");
    const cta = nav.querySelector(".nav-btn");
    if (!actions) {
      actions = document.createElement("div");
      actions.className = "nav-actions";
      if (cta) {
        cta.parentNode.insertBefore(actions, cta);
        actions.appendChild(cta);
      } else {
        nav.appendChild(actions);
      }
    }

    let button = document.getElementById("themeToggle");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.id = "themeToggle";
      button.className = "theme-toggle";
      actions.insertBefore(button, actions.firstChild || null);
    }

    function renderButton(theme) {
      button.innerHTML = 'Theme: <span class="theme-toggle-theme">' + theme.label + "</span>";
      button.setAttribute("aria-label", "Change color theme. Current theme: " + theme.label);
      button.title = "Switch theme";
    }

    let activeTheme = applyTheme(getStoredTheme());
    renderButton(activeTheme);

    button.addEventListener("click", function () {
      const currentIndex = THEMES.findIndex(function (theme) { return theme.id === activeTheme.id; });
      const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];
      activeTheme = applyTheme(nextTheme.id);
      persistTheme(activeTheme.id);
      renderButton(activeTheme);
    });
  }

  function setupSkipLink() {
    if (document.querySelector(".skip-link")) return;
    var main = document.querySelector("main");
    if (!main) return;
    if (!main.id) {
      main.id = "mainContent";
    }
    var link = document.createElement("a");
    link.className = "skip-link";
    link.href = "#" + main.id;
    link.textContent = "Skip to content";
    document.body.insertBefore(link, document.body.firstChild || null);
  }

  function applyCommonAriaLabels() {
    var labelMap = {
      vaultSearch: "Search the Rap Stories vault",
      vaultEra: "Filter by era",
      vaultCategory: "Filter by category",
      vaultSort: "Sort artists",
      explorerSearch: "Search the explorer",
      explorerEra: "Filter explorer by era",
      explorerCategory: "Filter explorer by category",
      explorerCity: "Filter explorer by city",
      explorerRegion: "Filter explorer by region",
      explorerTag: "Filter explorer by tag",
      explorerRanking: "Filter explorer by ranking",
      explorerCredibility: "Filter explorer by credibility",
      explorerSort: "Sort explorer results",
      artistDirectorySearch: "Search artists",
      artistDirectorySort: "Sort artist directory",
      timelineSearch: "Search the timeline",
      timelineDecade: "Filter timeline by decade",
      timelineClearHighlight: "Clear highlighted timeline path",
      vaultSearchBtn: "Open filtered vault results",
      explorerReset: "Reset explorer filters"
    };

    Object.keys(labelMap).forEach(function (id) {
      var element = document.getElementById(id);
      if (element && !element.getAttribute("aria-label")) {
        element.setAttribute("aria-label", labelMap[id]);
      }
    });
  }

  function setActiveNav() {
    const current = getCurrentPage();
    const links = document.querySelectorAll(".nav-links a");
    if (!links.length) return;

    links.forEach(function (link) {
      const href = link.getAttribute("href");
      const active = current === href;
      link.classList.toggle("active", active);
      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    if (Array.from(links).some(function (link) { return link.classList.contains("active"); })) {
      return;
    }

    if (!CORE_PAGES.has(current)) {
      const artistLink = document.querySelector('.nav-links a[href="artist.html"]');
      if (artistLink) {
        artistLink.classList.add("active");
        artistLink.setAttribute("aria-current", "page");
      }
    }
  }

  function setupHeader() {
    const header = document.getElementById("mainHeader");
    if (!header) return;

    let lastScrollY = window.pageYOffset;

    function offset() {
      document.body.style.paddingTop = header.offsetHeight + "px";
    }

    function onScroll() {
      const currentScrollY = window.pageYOffset;

      if (window.innerWidth <= 768) {
        if (currentScrollY <= 8) {
          header.classList.remove("hidden");
        } else if (currentScrollY > lastScrollY + 4) {
          header.classList.add("hidden");
        } else if (currentScrollY < lastScrollY - 4) {
          header.classList.remove("hidden");
        }
      } else {
        header.classList.remove("hidden");
      }

      lastScrollY = currentScrollY;
    }

    offset();
    onScroll();

    window.addEventListener("load", offset);
    window.addEventListener("resize", function () {
      offset();
      if (window.innerWidth > 768) {
        header.classList.remove("hidden");
      }
    });
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function formatStat(number) {
    return new Intl.NumberFormat("en-GB").format(number);
  }

  function getVaultData() {
    return window.VAULT_DATA || null;
  }

  function getBaseUrl() {
    const configured = window.RAP_STORIES_CONFIG && window.RAP_STORIES_CONFIG.baseUrl
      ? window.RAP_STORIES_CONFIG.baseUrl
      : window.RAP_STORIES_BASE_URL;
    return String(configured || "https://example.com").replace(/\/$/, "");
  }

  function upsertStructuredData(id, payload) {
    if (!payload) return;
    let script = document.getElementById(id);
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = id;
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(payload, null, 2);
  }

  function setupStructuredData() {
    const current = getCurrentPage();
    const baseUrl = getBaseUrl();
    const title = document.title;
    const descriptionMeta = document.querySelector('meta[name="description"]');
    const description = descriptionMeta ? descriptionMeta.getAttribute("content") : "";
    const pageUrl = baseUrl + "/" + current;

    upsertStructuredData("siteStructuredData", {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Rap Stories",
      url: baseUrl + "/",
      description: "Rap Stories is a digital archive of artist profiles, scenes, categories, maps, and timelines across hip-hop culture."
    });

    const typeMap = {
      "index.html": "WebPage",
      "artist-archive.html": "CollectionPage",
      "artist.html": "CollectionPage",
      "category.html": "CollectionPage",
      "timeline.html": "CollectionPage",
      "explorer.html": "CollectionPage",
      "graph.html": "CollectionPage",
      "collections.html": "CollectionPage",
      "rankings.html": "CollectionPage",
      "map.html": "WebPage",
      "about.html": "AboutPage",
      "contact.html": "ContactPage"
    };

    if (typeMap[current]) {
      upsertStructuredData("pageStructuredData", {
        "@context": "https://schema.org",
        "@type": typeMap[current],
        name: title,
        description: description,
        url: pageUrl,
        isPartOf: {
          "@type": "WebSite",
          name: "Rap Stories",
          url: baseUrl + "/"
        }
      });
    }
  }

  function updateHomeStats() {
    const page = document.querySelector("[data-vault-page='index']");
    const data = getVaultData();
    if (!page || !data || !Array.isArray(data.artists)) return;

    const stats = page.querySelectorAll(".stat-card");
    if (stats.length < 4) return;

    const cities = new Set();
    const tags = new Set();

    data.artists.forEach(function (artist) {
      if (artist.city) {
        artist.city.split("/").forEach(function (city) {
          const trimmed = city.trim();
          if (trimmed) cities.add(trimmed);
        });
      }
      (artist.tags || []).forEach(function (tag) {
        if (tag) tags.add(tag);
      });
    });

    const values = [
      formatStat(data.artists.length),
      formatStat((data.categories || []).length + 4),
      formatStat(cities.size),
      formatStat(tags.size)
    ];

    stats.forEach(function (card, index) {
      const value = card.querySelector("h3");
      if (value && values[index]) {
        value.textContent = values[index];
      }
    });
  }

  function updateTimelineStats() {
    const statValues = document.querySelectorAll(".stats .stat strong");
    const data = getVaultData();
    if (!statValues.length || !data || !Array.isArray(data.artists)) return;

    const eras = new Set(data.artists.map(function (artist) {
      return artist.era;
    }).filter(Boolean));

    if (statValues[0]) statValues[0].textContent = formatStat(data.artists.length);
    if (statValues[1]) statValues[1].textContent = formatStat(eras.size);
  }

  function setupInertialScroll() {
    return;
  }

  function setupParallax() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const heroImages = Array.from(document.querySelectorAll(".artist-image"));
    const heroCards = Array.from(document.querySelectorAll(".hero-card"));
    const thumbs = Array.from(document.querySelectorAll(".artist-thumb img, .timeline-thumb img"));
    const targets = heroImages.concat(heroCards, thumbs);
    if (!targets.length) return;

    let ticking = false;

    function update() {
      const viewportHeight = window.innerHeight || 1;
      heroImages.forEach(function (element) {
        const rect = element.getBoundingClientRect();
        const progress = (rect.top + rect.height * 0.5 - viewportHeight * 0.5) / viewportHeight;
        element.style.setProperty("--parallax-shift", (-progress * 28).toFixed(2) + "px");
      });
      heroCards.forEach(function (element) {
        const rect = element.getBoundingClientRect();
        const progress = (rect.top + rect.height * 0.5 - viewportHeight * 0.5) / viewportHeight;
        element.style.setProperty("--hero-parallax", (-progress * 18).toFixed(2) + "px");
      });
      thumbs.forEach(function (element) {
        const rect = element.getBoundingClientRect();
        const progress = (rect.top + rect.height * 0.5 - viewportHeight * 0.5) / viewportHeight;
        element.style.setProperty("--thumb-parallax", (-progress * 16).toFixed(2) + "px");
      });
      ticking = false;
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
  }

  function setupRevealMotion() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const selectors = [
      ".hero-card",
      ".artist-card",
      ".category-card",
      ".timeline-card",
      ".panel",
      ".story-pager-link",
      ".map-panel",
      ".sidebar"
    ];

    const nodes = Array.from(document.querySelectorAll(selectors.join(",")));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });

    nodes.forEach(function (node, index) {
      node.classList.add("motion-reveal");
      node.style.setProperty("--reveal-delay", Math.min(index % 6, 5) * 70 + "ms");
      observer.observe(node);
    });
  }

  function setupGlowTracking() {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const targets = document.querySelectorAll(".artist-card, .category-card, .timeline-card, .panel, .hero-info, .story-pager-link, .related-card, .album");
    targets.forEach(function (target) {
      target.addEventListener("pointermove", function (event) {
        const rect = target.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        target.style.setProperty("--glow-x", x.toFixed(2) + "%");
        target.style.setProperty("--glow-y", y.toFixed(2) + "%");
      });
    });
  }

  applyTheme(getStoredTheme());

  document.addEventListener("DOMContentLoaded", function () {
    cleanTree(document.body);
    setupSkipLink();
    setActiveNav();
    setupThemeToggle();
    setupHeader();
    applyCommonAriaLabels();
    updateHomeStats();
    updateTimelineStats();
    setupInertialScroll();
    setupParallax();
    setupRevealMotion();
    setupGlowTracking();
    setupStructuredData();
  });
})();
