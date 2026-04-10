(function () {
  const RESERVED_FILES = new Set([
    "index.html",
    "artist-archive.html",
    "artist.html",
    "category.html",
    "timeline.html",
    "map.html",
    "contact.html",
    "about.html",
    "privacy.html",
    "thank-you.html",
    "thank-you-premium.html",
    "intro.html"
  ]);

  function currentFile() {
    return window.location.pathname.split("/").pop() || "";
  }

  function scoreArtist(baseArtist, candidate) {
    let score = 0;

    if (candidate.city === baseArtist.city) score += 5;
    if (candidate.category === baseArtist.category) score += 4;
    if (candidate.era === baseArtist.era) score += 3;

    const candidateTags = new Set(candidate.tags || []);
    (baseArtist.tags || []).forEach(function (tag) {
      if (candidateTags.has(tag)) score += 2;
    });

    return score;
  }

  function createCard(artist) {
    const link = document.createElement("a");
    link.className = "related-card glass";
    link.href = artist.file;
    link.innerHTML = [
      '<div class="related-card-image"><img loading="lazy" src="' + artist.image + '" alt="' + artist.name + '"></div>',
      '<div class="related-card-body">',
      '<div class="meta-row"><span class="meta-pill">' + artist.city + '</span><span class="meta-pill">' + artist.era + '</span></div>',
      '<h3>' + artist.name + '</h3>',
      '<p>' + artist.summary + '</p>',
      '<span class="related-link">Open related story &rarr;</span>',
      '</div>'
    ].join('');
    return link;
  }

  function buildRelatedStories() {
    const file = currentFile();
    if (!file || RESERVED_FILES.has(file)) return;
    if (document.getElementById("relatedStories")) return;

    const data = window.VAULT_DATA;
    if (!data || !Array.isArray(data.artists)) return;

    const currentArtist = data.artists.find(function (artist) {
      return artist.file === file;
    });

    if (!currentArtist) return;

    const related = data.artists
      .filter(function (artist) { return artist.file !== file; })
      .map(function (artist) {
        return { artist: artist, score: scoreArtist(currentArtist, artist) };
      })
      .filter(function (entry) { return entry.score > 0; })
      .sort(function (a, b) {
        return b.score - a.score || a.artist.name.localeCompare(b.artist.name);
      })
      .slice(0, 4)
      .map(function (entry) { return entry.artist; });

    if (!related.length) return;

    const footer = document.querySelector("footer");
    if (!footer) return;

    const section = document.createElement("section");
    section.className = "related-stories";
    section.id = "relatedStories";
    section.innerHTML = [
      '<div class="container">',
      '<div class="glass related-shell">',
      '<div class="related-header">',
      '<div>',
      '<span class="eyebrow">Keep Exploring</span>',
      '<h2>Related Stories</h2>',
      '<p>More artists from the same lane, era, or story category so visitors can move through the vault instead of hitting a dead end.</p>',
      '</div>',
      '</div>',
      '<div class="related-grid"></div>',
      '</div>',
      '</div>'
    ].join('');

    const grid = section.querySelector('.related-grid');
    related.forEach(function (artist) {
      grid.appendChild(createCard(artist));
    });

    footer.parentNode.insertBefore(section, footer);
  }

  document.addEventListener("DOMContentLoaded", buildRelatedStories);
})();
