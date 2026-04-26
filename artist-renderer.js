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
    var sourceLinks = getSourceLinks(story).filter(function (source) {
      return !/Britannica/i.test(source.label || "");
    });
    var sourceTier = story.sourceTier || "generated";
    var sourceBadge = sourceTier === "curated" ? "Curated Source Set" : "Reference Reviewed";
    var editorialStandard = sourceTier === "curated"
      ? "Hand-curated reference pack for this artist profile"
      : "Original editorial overview with reference links for verification";
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
      '<p>This page is written as an original editorial profile for discovery, context, and cultural learning. Release dates, chart milestones, awards, and public-record details are supported with reference links where useful.</p>',
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

  function buildOptionalStorySection(id, title, html) {
    if (!html) return "";
    return '<section class="glass panel story-section" id="' + escapeHtml(id) + '" data-story-title="' + escapeHtml(title) + '"><h2>' + escapeHtml(title) + "</h2>" + html + "</section>";
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
      '<a href="stories.html">Stories</a>',
      '<a href="artist.html">Artists</a>',
      '<a href="category.html">Categories</a>',
      '<a href="timeline.html">Timeline</a>',
      '<a href="map.html">Map</a>',
      '<a href="contact.html">Contact</a>',
      "</nav>",
      '<a href="stories.html" class="nav-btn">Read Stories</a>',
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
      '<section class="glass panel story-section" id="biography" data-story-title="Full Biography"><h2>' + escapeHtml(story.biographyTitle || "Biography") + "</h2>" + (story.biographyHtml || "") + buildSectionCitationHtml(story, "biography", story.biographyTitle || "Biography") + "</section>",
      buildOptionalStorySection("rise", "Rise to Fame", story.riseToFameHtml),
      '<section class="glass panel story-section" id="timeline" data-story-title="Timeline"><h2>Career Timeline</h2>' + (story.timelineHtml || "") + buildSectionCitationHtml(story, "timeline", "Career Timeline") + "</section>",
      buildOptionalStorySection("key-works", "Key Albums & Songs", story.keyWorksHtml),
      buildOptionalStorySection("challenges", "Challenges & Controversies", story.challengesHtml),
      buildOptionalStorySection("impact", "Cultural Impact", story.culturalImpactHtml),
      buildOptionalStorySection("legacy", "Legacy", story.legacyHtml),
      "</div>",
      '<aside class="side-stack">',
      '<div class="artist-layout-column">',
      '<section class="glass panel story-section" data-story-title="Details"><h2>Profile Details</h2>' + (story.detailsHtml || "") + buildSectionCitationHtml(story, "details", "Profile Details") + "</section>",
      '<section class="glass panel story-section" data-story-title="Eras"><h2>Highlighted Eras</h2>' + (story.erasHtml || "") + "</section>",
      '<section class="glass panel music-panel story-section" data-story-title="Music"><h2>Music Integration</h2>' + (story.musicHtml || "") + "</section>",
      "</div>",
      '<div class="artist-layout-column">',
      '<section class="glass panel story-section" data-story-title="Sources"><h2>Sources & Review</h2>' + buildCredibilityHtml(story) + "</section>",
      relatedSection,
      "</div>",
      "</aside>",
      "</div>",
      "</div>",
      "</section>",
      "</main>",
      '<footer><div class="container footer-wrap"><div><strong class="footer-brand">Rap Stories</strong><p>A premium digital vault for hip-hop culture, artist stories, timelines, rankings, and editorial guides.</p></div><div class="footer-links"><a href="about.html">About</a><a href="artist.html">Artists</a><a href="contact.html">Contact</a><a href="stories.html">Stories</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></div></div></footer>',
      '<div class="story-rail" id="storyRail" aria-label="Story chapters"></div>',
      '<button class="story-mode-toggle" id="storyModeToggle" type="button">Story Mode: On</button>',
      nextStoryButton
    ].join("");
  }

  function getOrderedStorySlugs() {
    const stories = window.ARTIST_STORIES || {};
    const pinnedFirst = ["21-savage"];
    return Object.keys(stories).sort(function (leftSlug, rightSlug) {
      const leftPinned = pinnedFirst.indexOf(leftSlug);
      const rightPinned = pinnedFirst.indexOf(rightSlug);

      if (leftPinned !== -1 || rightPinned !== -1) {
        return (leftPinned === -1 ? 999 : leftPinned) - (rightPinned === -1 ? 999 : rightPinned);
      }

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

  function getStoryModeSections() {
    const storyOrder = ["Intro", "Full Biography", "Biography", "Rise to Fame", "Timeline", "Key Albums & Songs", "Challenges & Controversies", "Cultural Impact", "Legacy", "Details", "Sources", "Eras", "Related", "Music", "Explore"];
    return Array.from(document.querySelectorAll(".story-section")).filter(function (section) {
      return section.isConnected && section.getClientRects().length;
    }).sort(function (a, b) {
      const aTitle = a.dataset.storyTitle || "";
      const bTitle = b.dataset.storyTitle || "";
      const aIndex = storyOrder.indexOf(aTitle);
      const bIndex = storyOrder.indexOf(bTitle);

      if (aIndex !== -1 || bIndex !== -1) {
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      }

      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      const aTop = Math.round(aRect.top + window.pageYOffset);
      const bTop = Math.round(bRect.top + window.pageYOffset);

      if (Math.abs(aTop - bTop) < 40) {
        return aRect.left - bRect.left;
      }

      return aTop - bTop;
    });
  }

  function setupStoryMode() {
    const body = document.body;
    const rail = document.getElementById("storyRail");
    const toggle = document.getElementById("storyModeToggle");
    const progressBar = document.getElementById("storyProgressBar");
    const sections = getStoryModeSections();

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

      if (document.documentElement.scrollHeight - window.innerHeight - window.pageYOffset < 12) {
        activeIndex = sections.length - 1;
        bestDistance = 0;
      }

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

  function setupArtistLayoutPolish() {
    const leftColumn = document.querySelector(".artist-layout-column:first-child");
    const rightColumn = document.querySelector(".artist-layout-column:nth-child(2)");
    if (!leftColumn || !rightColumn) return;

    function lineUpColumnBottoms() {
      const leftLast = leftColumn.lastElementChild;
      const rightLast = rightColumn.lastElementChild;
      if (!leftLast || !rightLast) return;

      leftLast.style.minHeight = "";
      rightLast.style.minHeight = "";

      if (window.innerWidth <= 820) return;

      const leftBottom = leftColumn.getBoundingClientRect().bottom;
      const rightBottom = rightColumn.getBoundingClientRect().bottom;
      const difference = Math.round(Math.abs(leftBottom - rightBottom));
      const extraHeight = Math.min(difference, 120);

      if (difference < 6) return;

      if (leftBottom < rightBottom) {
        leftLast.style.minHeight = (leftLast.offsetHeight + extraHeight) + "px";
      } else {
        rightLast.style.minHeight = (rightLast.offsetHeight + extraHeight) + "px";
      }
    }

    requestAnimationFrame(lineUpColumnBottoms);
    window.addEventListener("resize", lineUpColumnBottoms);
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
    setupArtistLayoutPolish();
    setupStoryMode();
    setupSwipeNavigation(navigation);
  });
})();




