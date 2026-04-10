(function () {
  var REVIEW_DATE = "2026-04-10";
  var FAVORITES_KEY = "rapStoriesFavorites";
  var RECENTS_KEY = "rapStoriesRecents";
  var RECENT_LIMIT = 6;

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getMeta(name) {
    return document.querySelector('meta[name="' + name + '"]');
  }

  function updatePageMeta(story) {
    if (story.title) {
      document.title = story.title;
    }

    const description = getMeta("description");
    if (description && story.description) {
      description.setAttribute("content", story.description);
    }
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

  function getBaseUrl() {
    if (window.RAP_STORIES_CONFIG && window.RAP_STORIES_CONFIG.baseUrl) {
      return window.RAP_STORIES_CONFIG.baseUrl;
    }
    return window.RAP_STORIES_BASE_URL || "https://example.com";
  }

  function upsertHeadLink(id, rel, href, asValue) {
    if (!href) return;
    var link = document.getElementById(id);
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      document.head.appendChild(link);
    }
    link.rel = rel;
    link.href = href;
    if (asValue) {
      link.as = asValue;
    } else {
      link.removeAttribute("as");
    }
  }

  function formatReviewDate(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function getSourceLinks(story) {
    if (Array.isArray(story.sources) && story.sources.length) {
      return story.sources;
    }

    var name = story.name || "artist";
    var encoded = encodeURIComponent(name);

    return [
      {
        label: "Wikipedia overview",
        href: "https://en.wikipedia.org/wiki/Special:Search?search=" + encoded,
        note: "Quick public reference for biography, timeline, and context."
      },
      {
        label: "AllMusic search",
        href: "https://www.allmusic.com/search/all/" + encoded,
        note: "Useful for discography context, credits, and stylistic framing."
      },
      {
        label: "Billboard search",
        href: "https://www.billboard.com/search/" + encoded + "/",
        note: "Useful for chart-era milestones, interviews, and coverage."
      },
      {
        label: "Rolling Stone search",
        href: "https://www.rollingstone.com/search/" + encoded + "/",
        note: "Useful for feature writing, interviews, and cultural commentary."
      }
    ];
  }

  function readStoredList(key) {
    try {
      var value = window.localStorage.getItem(key);
      var parsed = value ? JSON.parse(value) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeStoredList(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      return;
    }
  }

  function getSectionSources(story, sectionId) {
    var links = getSourceLinks(story);
    var byLabel = function (pattern) {
      return links.filter(function (link) {
        return pattern.test((link.label || "") + " " + (link.note || ""));
      });
    };

    if (Array.isArray(story.sectionSources) && story.sectionSources.length) {
      return story.sectionSources;
    }

    if (sectionId === "biography") return byLabel(/Wikipedia|Britannica|AllMusic/i).slice(0, 3);
    if (sectionId === "timeline") return byLabel(/Billboard|Wikipedia|Discogs/i).slice(0, 3);
    if (sectionId === "music") return byLabel(/AllMusic|Discogs|Billboard/i).slice(0, 3);
    if (sectionId === "details") return links.slice(0, 2);
    return links.slice(0, 2);
  }

  function buildSectionCitationHtml(story, sectionId, title) {
    var links = getSectionSources(story, sectionId);
    if (!links.length) return "";
    return [
      '<div class="section-citations">',
      '<div class="section-citations-label">Reference points for ' + escapeHtml(title) + "</div>",
      '<div class="section-citations-list">',
      links.map(function (link) {
        return '<a class="section-citation-link" href="' + escapeHtml(link.href) + '" target="_blank" rel="noopener noreferrer">' +
          '<strong>' + escapeHtml(link.label) + '</strong>' +
          '<span>' + escapeHtml(link.note || "Reference link") + "</span>" +
          "</a>";
      }).join(""),
      "</div>",
      "</div>"
    ].join("");
  }

  function buildCredibilityHtml(story) {
    var reviewDate = story.reviewDate || REVIEW_DATE;
    var formattedDate = formatReviewDate(reviewDate);
    var sourceLinks = getSourceLinks(story);
    var sourceTier = story.sourceTier || "generated";
    var sourceBadge = sourceTier === "curated" ? "Curated Source Set" : "Source Check Enabled";
    var editorialStandard = sourceTier === "curated"
      ? "Hand-curated reference pack for this artist profile"
      : "Narrative summary with recommended source verification";
    var reviewNotes = story.reviewNotes
      ? '<p class="credibility-note">' + escapeHtml(story.reviewNotes) + "</p>"
      : "";

    return [
      '<div class="credibility-intro">',
      '<div class="credibility-badges">',
      '<span class="credibility-badge">Editorial Profile</span>',
      '<span class="credibility-badge">Reviewed ' + escapeHtml(formattedDate) + "</span>",
      '<span class="credibility-badge">' + escapeHtml(sourceBadge) + "</span>",
      "</div>",
      '<p>This page is an editorial summary designed for discovery and context. For exact release dates, legal details, chart history, or credit-level accuracy, cross-check the reference links below.</p>',
      reviewNotes,
      "</div>",
      '<div class="credibility-meta">',
      '<div class="info-row"><span class="info-label">Last Reviewed</span><div class="info-value">' + escapeHtml(formattedDate) + "</div></div>",
      '<div class="info-row"><span class="info-label">Review Type</span><div class="info-value">Editorial artist overview</div></div>',
      '<div class="info-row"><span class="info-label">Editorial Standard</span><div class="info-value">' + escapeHtml(editorialStandard) + "</div></div>",
      "</div>",
      '<div class="source-list">',
      sourceLinks.map(function (source) {
        return '<a class="source-card" href="' + escapeHtml(source.href) + '" target="_blank" rel="noopener noreferrer">' +
          '<strong>' + escapeHtml(source.label) + '</strong>' +
          '<span>' + escapeHtml(source.note || "Reference link") + "</span>" +
          '<em>Open source &rarr;</em>' +
          "</a>";
      }).join(""),
      "</div>"
    ].join("");
  }

  function updateStructuredData(story, slug) {
    const baseUrl = getBaseUrl().replace(/\/$/, "");
    const pageUrl = baseUrl + "/" + slug + ".html";
    const imageUrl = story.image ? baseUrl + "/" + String(story.image).replace(/^\//, "") : undefined;
    const themes = Array.from(document.querySelectorAll(".tag")).map(function (tag) {
      return tag.textContent.trim();
    }).filter(Boolean);
    const reviewDate = story.reviewDate || REVIEW_DATE;

    const payload = {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      name: story.title || (story.name + " | Rap Stories"),
      description: story.description || story.summary || "",
      url: pageUrl,
      dateModified: reviewDate,
      publisher: {
        "@type": "Organization",
        name: "Rap Stories",
        url: baseUrl + "/"
      },
      isPartOf: {
        "@type": "WebSite",
        name: "Rap Stories",
        url: baseUrl + "/"
      },
      mainEntity: {
        "@type": "Person",
        name: story.name,
        description: story.summary || story.description || "",
        image: imageUrl,
        knowsAbout: themes
      }
    };

    if (!imageUrl) delete payload.mainEntity.image;
    if (!themes.length) delete payload.mainEntity.knowsAbout;

    upsertHeadLink("artistCanonicalLink", "canonical", pageUrl);
    if (imageUrl) {
      upsertHeadLink("artistHeroPreload", "preload", imageUrl, "image");
    }

    upsertStructuredData("artistStructuredData", payload);
  }

  function renderShell(story, navigation) {
    const app = document.getElementById("artistApp");
    if (!app) return;

    const relatedSection = story.relatedHtml ? [
      '<section class="glass panel story-section" data-story-title="Related">',
      "<h2>Related Stories</h2>",
      story.relatedHtml,
      "</section>"
    ].join("") : "";

    const continueReadingSection = [
      '<section class="glass panel story-section" data-story-title="Continue">',
      "<h2>Continue Reading</h2>",
      '<div class="continue-reading-list" id="continueReadingPanel"><p class="continue-empty">Your recently viewed artists will appear here.</p></div>',
      "</section>"
    ].join("");

    const nextStoryButton = navigation && navigation.next ? (
      '<a class="mobile-next-story" href="' + escapeHtml(navigation.next.file) + '" aria-label="Next story: ' + escapeHtml(navigation.next.name) + '">' +
      '<span class="mobile-next-label">Next Story</span>' +
      '<strong>' + escapeHtml(navigation.next.name) + ' &rarr;</strong>' +
      "</a>"
    ) : "";

    const storyPager = navigation ? [
      '<nav class="story-pager" aria-label="Artist navigation">',
      navigation.previous ? '<a class="story-pager-link" href="' + escapeHtml(navigation.previous.file) + '"><span>Previous Story</span><strong>&larr; ' + escapeHtml(navigation.previous.name) + "</strong></a>" : '<div class="story-pager-link is-disabled"><span>Previous Story</span><strong>Start of Archive</strong></div>',
      navigation.next ? '<a class="story-pager-link" href="' + escapeHtml(navigation.next.file) + '"><span>Next Story</span><strong>' + escapeHtml(navigation.next.name) + ' &rarr;</strong></a>' : '<div class="story-pager-link is-disabled"><span>Next Story</span><strong>End of Archive</strong></div>',
      "</nav>"
    ].join("") : "";

    app.innerHTML = [
      '<div class="story-progress"><div class="story-progress-bar" id="storyProgressBar"></div></div>',
      '<header id="mainHeader">',
      '<div class="container nav">',
      '<a class="brand" href="index.html"><div class="brand-mark">RS</div><span class="brand-text">RAP STORIES</span></a>',
      '<nav class="nav-links">',
      '<a href="index.html">Home</a>',
      '<a href="artist-archive.html">Archive</a>',
      '<a href="artist.html">Artist</a>',
      '<a href="category.html">Categories</a>',
      '<a href="timeline.html">Timeline</a>',
      '<a href="map.html">Map</a>',
      '<a href="contact.html">Contact</a>',
      "</nav>",
      '<a href="artist.html" class="nav-btn">Back to Artists</a>',
      "</div>",
      "</header>",
      "<main>",
      '<section class="hero story-section" data-story-title="Intro">',
      '<div class="container">',
      '<div class="breadcrumb"><a href="index.html">Home</a> / <a href="artist.html">Artists</a> / <span>' + escapeHtml(story.name) + "</span></div>",
      storyPager,
      '<div class="hero-layout">',
      '<aside class="glass artist-image">',
      '<div class="artist-image-content">',
      '<span class="artist-tag">Artist Profile</span>',
      "<h2>" + escapeHtml(story.name) + "</h2>",
      "<p>" + (story.heroBlurb || "") + "</p>",
      "</div>",
      "</aside>",
      '<section class="glass hero-info">',
      '<span class="eyebrow">Rap Stories Profile</span>',
      "<h1>The Story of <span>" + escapeHtml(story.name) + "</span></h1>",
      '<p class="summary">' + (story.summary || "") + "</p>",
      '<div class="quick-facts">' + (story.quickFactsHtml || "") + "</div>",
      '<div class="hero-buttons"><a href="#biography" class="btn btn-primary">Read Biography</a><a href="#timeline" class="btn">View Timeline</a><button class="btn btn-secondary" id="favoriteToggle" type="button" aria-pressed="false">Save Artist</button></div>',
      '<div class="artist-stats">' + (story.statsHtml || "") + "</div>",
      "</section>",
      "</div>",
      '<div class="content-layout">',
      '<div class="content-stack">',
      '<section class="glass panel story-section" id="biography" data-story-title="Biography"><h2>Biography</h2>' + (story.biographyHtml || "") + buildSectionCitationHtml(story, "biography", "Biography") + "</section>",
      '<section class="glass panel story-section" id="timeline" data-story-title="Timeline"><h2>Career Timeline</h2>' + (story.timelineHtml || "") + buildSectionCitationHtml(story, "timeline", "Career Timeline") + "</section>",
      "</div>",
      '<aside class="side-stack">',
      '<section class="glass panel story-section" data-story-title="Details"><h2>Profile Details</h2>' + (story.detailsHtml || "") + buildSectionCitationHtml(story, "details", "Profile Details") + "</section>",
      '<section class="glass panel story-section" data-story-title="Sources"><h2>Sources & Review</h2>' + buildCredibilityHtml(story) + "</section>",
      '<section class="glass panel story-section" data-story-title="Themes"><h2>Key Themes</h2>' + (story.themesHtml || "") + "</section>",
      '<section class="glass panel story-section" data-story-title="Eras"><h2>Highlighted Eras</h2>' + (story.erasHtml || "") + "</section>",
      '<section class="glass panel music-panel story-section" data-story-title="Music"><h2>Music Integration</h2>' + (story.musicHtml || "") + buildSectionCitationHtml(story, "music", "Music Integration") + "</section>",
      continueReadingSection,
      relatedSection,
      "</aside>",
      "</div>",
      "</div>",
      "</section>",
      "</main>",
      '<footer><div class="container footer-wrap"><div><strong style="color:white;">Rap Stories</strong><p>Preserving the stories behind the legends.</p></div><div class="footer-links"><a href="about.html">About</a><a href="artist.html">Artists</a><a href="contact.html">Contact</a><a href="privacy.html">Privacy</a></div></div></footer>',
      '<div class="story-rail" id="storyRail" aria-label="Story chapters"></div>',
      '<button class="story-mode-toggle" id="storyModeToggle" type="button">Story Mode: On</button>',
      nextStoryButton
    ].join("");
  }

  function getOrderedStorySlugs() {
    const stories = window.ARTIST_STORIES || {};
    return Object.keys(stories).sort(function (leftSlug, rightSlug) {
      const leftStory = stories[leftSlug] || {};
      const rightStory = stories[rightSlug] || {};
      const leftName = (leftStory.name || leftSlug).trim();
      const rightName = (rightStory.name || rightSlug).trim();
      return leftName.localeCompare(rightName, undefined, {
        sensitivity: "base",
        numeric: true
      });
    });
  }

  function getNavigation(slug) {
    const stories = window.ARTIST_STORIES || {};
    const order = getOrderedStorySlugs();
    const index = order.indexOf(slug);

    if (index === -1) return null;

    function toNavItem(targetSlug) {
      const target = stories[targetSlug];
      if (!target) return null;
      return {
        slug: targetSlug,
        name: target.name,
        file: targetSlug + ".html"
      };
    }

    return {
      previous: index > 0 ? toNavItem(order[index - 1]) : null,
      next: index < order.length - 1 ? toNavItem(order[index + 1]) : null
    };
  }

  function setupSwipeNavigation(navigation) {
    if (!navigation || !navigation.next && !navigation.previous) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    function isInteractiveTarget(target) {
      return !!target.closest("a, button, input, select, textarea, .story-rail");
    }

    document.addEventListener("touchstart", function (event) {
      if (event.touches.length !== 1 || isInteractiveTarget(event.target)) {
        tracking = false;
        return;
      }

      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      tracking = true;
    }, { passive: true });

    document.addEventListener("touchend", function (event) {
      if (!tracking || event.changedTouches.length !== 1) return;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      tracking = false;

      if (Math.abs(deltaX) < 70 || Math.abs(deltaY) > 50) return;

      if (deltaX < 0 && navigation.next) {
        window.location.href = navigation.next.file;
      } else if (deltaX > 0 && navigation.previous) {
        window.location.href = navigation.previous.file;
      }
    }, { passive: true });
  }

  function setupStoryMode() {
    const body = document.body;
    const rail = document.getElementById("storyRail");
    const toggle = document.getElementById("storyModeToggle");
    const progressBar = document.getElementById("storyProgressBar");
    const sections = Array.from(document.querySelectorAll(".story-section"));

    if (!rail || !toggle || !progressBar || !sections.length) return;

    const storageKey = "rapStoriesStoryMode";
    let storyMode = localStorage.getItem(storageKey);
    storyMode = storyMode === null ? true : storyMode === "on";

    rail.innerHTML = "";

    sections.forEach(function (section, index) {
      const title = section.dataset.storyTitle || "Section " + (index + 1);
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "story-dot";
      dot.setAttribute("aria-label", title);
      dot.title = title;
      dot.addEventListener("click", function () {
        const y = section.getBoundingClientRect().top + window.pageYOffset - 110;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      });
      rail.appendChild(dot);
    });

    const dots = Array.from(rail.querySelectorAll(".story-dot"));

    function applyMode() {
      body.classList.toggle("story-mode", storyMode);
      toggle.textContent = "Story Mode: " + (storyMode ? "On" : "Off");
      localStorage.setItem(storageKey, storyMode ? "on" : "off");
    }

    function updateProgress() {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = Math.max(0, Math.min(100, progress)) + "%";
    }

    function updateActiveSection() {
      let activeIndex = 0;
      let bestDistance = Infinity;

      sections.forEach(function (section, index) {
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(rect.top - 140);
        if (distance < bestDistance) {
          bestDistance = distance;
          activeIndex = index;
        }
      });

      sections.forEach(function (section, index) {
        section.classList.toggle("active", index === activeIndex);
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle("active", index === activeIndex);
      });
    }

    toggle.addEventListener("click", function () {
      storyMode = !storyMode;
      applyMode();
      updateActiveSection();
    });

    applyMode();
    updateProgress();
    updateActiveSection();

    window.addEventListener("scroll", function () {
      updateProgress();
      updateActiveSection();
    }, { passive: true });

    window.addEventListener("resize", function () {
      updateProgress();
      updateActiveSection();
    });
  }

  function renderNotFound(slug) {
    const app = document.getElementById("artistApp");
    if (!app) return;
    app.innerHTML = [
      '<main class="page-loading">',
      '<section class="glass loading-card">',
      "<h1>Artist story not found</h1>",
      "<p>We could not load the story for <strong>" + escapeHtml(slug) + "</strong>. Try returning to the archive and opening the page again.</p>",
      '<p><a class="nav-btn" href="artist-archive.html">Open Archive</a></p>',
      "</section>",
      "</main>"
    ].join("");
  }

  function setupFavoritesAndRecents(story, slug) {
    var favoriteToggle = document.getElementById("favoriteToggle");
    var continuePanel = document.getElementById("continueReadingPanel");
    var stories = window.ARTIST_STORIES || {};
    if (!story) return;

    var favorites = readStoredList(FAVORITES_KEY);
    var recents = readStoredList(RECENTS_KEY).filter(function (item) {
      return item && item.slug && stories[item.slug] && item.slug !== slug;
    });

    var nextRecent = [{ slug: slug, name: story.name, file: slug + ".html" }].concat(recents)
      .filter(function (item, index, list) {
        return list.findIndex(function (candidate) { return candidate.slug === item.slug; }) === index;
      })
      .slice(0, RECENT_LIMIT);
    writeStoredList(RECENTS_KEY, nextRecent);

    function renderFavoriteState() {
      if (!favoriteToggle) return;
      var isFavorite = favorites.indexOf(slug) !== -1;
      favoriteToggle.textContent = isFavorite ? "Saved Artist" : "Save Artist";
      favoriteToggle.setAttribute("aria-pressed", isFavorite ? "true" : "false");
      favoriteToggle.classList.toggle("is-active", isFavorite);
    }

    if (favoriteToggle) {
      favoriteToggle.addEventListener("click", function () {
        var isFavorite = favorites.indexOf(slug) !== -1;
        favorites = isFavorite
          ? favorites.filter(function (item) { return item !== slug; })
          : favorites.concat(slug);
        writeStoredList(FAVORITES_KEY, favorites);
        renderFavoriteState();
      });
    }

    if (continuePanel) {
      var recentItems = nextRecent.filter(function (item) { return item.slug !== slug; }).slice(0, 4);
      continuePanel.innerHTML = recentItems.length ? recentItems.map(function (item) {
        return '<a class="continue-card" href="' + escapeHtml(item.file) + '">' +
          '<strong>' + escapeHtml(item.name) + '</strong>' +
          '<span>Continue this story path</span>' +
          "</a>";
      }).join("") : '<p class="continue-empty">Open more artists and your recent story path will appear here.</p>';
    }

    renderFavoriteState();
  }

  document.addEventListener("DOMContentLoaded", function () {
    const page = window.ARTIST_PAGE || {};
    const stories = window.ARTIST_STORIES || {};
    const sourceData = window.ARTIST_SOURCE_DATA || {};
    const baseStory = stories[page.slug];
    const story = baseStory ? Object.assign({}, baseStory, sourceData[page.slug] || {}) : null;

    if (!story) {
      renderNotFound(page.slug || "unknown artist");
      return;
    }

    document.documentElement.style.setProperty("--artist-image", 'url("' + story.image + '")');
    updatePageMeta(story);
    const navigation = getNavigation(page.slug);

    renderShell(story, navigation);
    updateStructuredData(story, page.slug);
    setupFavoritesAndRecents(story, page.slug);
    setupStoryMode();
    setupSwipeNavigation(navigation);
  });
})();

