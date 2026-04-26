$ErrorActionPreference = "Stop"

$project = "C:\Derby University\Scripting and Web Technologies\RapStories"
$cssPath = Join-Path $project "artist-page.css"
$rendererPath = Join-Path $project "artist-renderer.js"

Copy-Item -LiteralPath $cssPath -Destination "$cssPath.bak" -Force
Copy-Item -LiteralPath $rendererPath -Destination "$rendererPath.bak" -Force

$css = Get-Content -LiteralPath $cssPath -Raw
$css = $css -replace '(?s)    \.content-layout \{\r?\n      display: grid;\r?\n      grid-template-columns: 1\.6fr 0\.9fr;\r?\n      gap: 24px;\r?\n      margin-top: 26px;\r?\n    \}\r?\n\r?\n    \.content-stack, \.side-stack \{ display: grid; gap: 22px; \}\r?\n\r?\n    \.side-stack \{\r?\n      align-self: start;\r?\n      position: sticky;\r?\n      top: 96px;\r?\n    \}', @'
    .content-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      margin-top: 26px;
    }

    .content-stack { display: grid; gap: 22px; }

    .side-stack {
      align-self: stretch;
      position: static;
      top: auto;
      display: flex;
      flex-wrap: wrap;
      gap: 22px;
      align-items: start;
    }

    .artist-layout-column {
      display: grid;
      flex: 1 1 calc(50% - 11px);
      gap: 22px;
      min-width: 0;
    }

    .side-stack > .panel,
    .artist-layout-column > .panel {
      min-height: 0;
    }
'@

$css = $css -replace '(?s)    /\* Music Integration \*/\r?\n    \.music-panel \{\r?\n      margin-top: 24px;\r?\n    \}', @'
    .side-stack [data-story-title="Related"] .related-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .side-stack [data-story-title="Related"] .related-card {
      min-height: 0;
      padding: 16px;
    }

    .side-stack [data-story-title="Related"] .related-card h4 {
      font-size: 0.98rem;
      margin-bottom: 6px;
    }

    .side-stack [data-story-title="Related"] .related-card p {
      font-size: 0.82rem;
      line-height: 1.4;
    }

    /* Music Integration */
    .music-panel {
      margin-top: 0;
    }
'@

$css = $css -replace '    \.music-grid \{\r?\n      display: grid;\r?\n      grid-template-columns: 1fr 1fr;', @'
    .music-grid {
      display: grid;
      grid-template-columns: 1fr;
'@

$css = $css -replace '(?s)    @media \(max-width: 1150px\) \{\r?\n      \.hero-layout, \.content-layout \{ grid-template-columns: 1fr; \}\r?\n      \.side-stack \{ position: static; \}\r?\n    \}', @'
    @media (max-width: 1150px) {
      .hero-layout, .content-layout { grid-template-columns: 1fr; }
    }
'@

$css = $css -replace '(?s)    @media \(max-width: 820px\) \{', @'
    @media (max-width: 820px) {
      .side-stack {
        display: grid;
        grid-template-columns: 1fr;
      }

      .artist-layout-column {
        flex-basis: auto;
      }

      .side-stack [data-story-title="Related"] .related-list {
        grid-template-columns: 1fr;
      }

'@

Set-Content -LiteralPath $cssPath -Value $css -Encoding UTF8

$renderer = Get-Content -LiteralPath $rendererPath -Raw
$renderer = $renderer -replace '(?s)    const continueReadingSection = \[\r?\n      ''<section class="glass panel story-section" data-story-title="Continue">'',\r?\n      "<h2>Continue Reading</h2>",\r?\n      ''<div class="continue-reading-list" id="continueReadingPanel"><p class="continue-empty">Your recently viewed artists will appear here\.</p></div>'',\r?\n      "</section>"\r?\n    \]\.join\(""\);\r?\n', ''

$oldSide = @'
      '<aside class="side-stack">',
      '<section class="glass panel story-section" data-story-title="Details"><h2>Profile Details</h2>' + (story.detailsHtml || "") + buildSectionCitationHtml(story, "details", "Profile Details") + "</section>",
      '<section class="glass panel story-section" data-story-title="Sources"><h2>Sources & Review</h2>' + buildCredibilityHtml(story) + "</section>",
      '<section class="glass panel story-section" data-story-title="Themes"><h2>Key Themes</h2>' + (story.themesHtml || "") + "</section>",
      '<section class="glass panel story-section" data-story-title="Eras"><h2>Highlighted Eras</h2>' + (story.erasHtml || "") + "</section>",
      '<section class="glass panel music-panel story-section" data-story-title="Music"><h2>Music Integration</h2>' + (story.musicHtml || "") + buildSectionCitationHtml(story, "music", "Music Integration") + "</section>",
      ecosystemSection,
      continueReadingSection,
      relatedSection,
      "</aside>",
'@

$newSide = @'
      '<aside class="side-stack">',
      '<div class="artist-layout-column">',
      '<section class="glass panel story-section" data-story-title="Details"><h2>Profile Details</h2>' + (story.detailsHtml || "") + buildSectionCitationHtml(story, "details", "Profile Details") + "</section>",
      '<section class="glass panel story-section" data-story-title="Eras"><h2>Highlighted Eras</h2>' + (story.erasHtml || "") + "</section>",
      '<section class="glass panel music-panel story-section" data-story-title="Music"><h2>Music Integration</h2>' + (story.musicHtml || "") + buildSectionCitationHtml(story, "music", "Music Integration") + "</section>",
      "</div>",
      '<div class="artist-layout-column">',
      '<section class="glass panel story-section" data-story-title="Sources"><h2>Sources & Review</h2>' + buildCredibilityHtml(story) + "</section>",
      relatedSection,
      ecosystemSection,
      "</div>",
      "</aside>",
'@

$renderer = $renderer.Replace($oldSide, $newSide)

$setupStoryMode = @'
  function getStoryModeSections() {
    const storyOrder = ["Intro", "Biography", "Timeline", "Details", "Sources", "Eras", "Related", "Music", "Explore"];
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

'@

$renderer = $renderer -replace '  function setupStoryMode\(\) \{', $setupStoryMode + '  function setupStoryMode() {'
$renderer = $renderer -replace '    const sections = Array\.from\(document\.querySelectorAll\("\.story-section"\)\);', '    const sections = getStoryModeSections();'
$renderer = $renderer -replace '(?s)      const scrollTop = window\.pageYOffset;\r?\n      const docHeight = document\.documentElement\.scrollHeight - window\.innerHeight;\r?\n      const progress = docHeight > 0 \? \(scrollTop / docHeight\) \* 100 : 0;\r?\n      progressBar\.style\.width = Math\.max\(0, Math\.min\(100, progress\)\) \+ "%";', @'
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = Math.max(0, Math.min(100, progress)) + "%";
'@

$renderer = $renderer -replace '(?s)      sections\.forEach\(function \(section, index\) \{\r?\n        const rect = section\.getBoundingClientRect\(\);\r?\n        const distance = Math\.abs\(rect\.top - 140\);\r?\n        if \(distance < bestDistance\) \{\r?\n          bestDistance = distance;\r?\n          activeIndex = index;\r?\n        \}\r?\n      \}\);', @'
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
'@

$layoutPolish = @'
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

'@

$renderer = $renderer -replace '  function setupFavoritesAndRecents\(story, slug\) \{', $layoutPolish + '  function setupFavoritesAndRecents(story, slug) {'
$renderer = $renderer -replace '    setupStoryMode\(\);\r?\n    setupSwipeNavigation\(navigation\);', "    setupArtistLayoutPolish();`r`n    setupStoryMode();`r`n    setupSwipeNavigation(navigation);"

Set-Content -LiteralPath $rendererPath -Value $renderer -Encoding UTF8

Write-Host "Artist layout applied to all artist pages."
