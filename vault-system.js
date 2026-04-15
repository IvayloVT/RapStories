(function(){
const data = window.VAULT_DATA || {artists:[], categories:[]};
const rankingDefinitions = [
  {
    id: "drill",
    title: "Top 10 Drill Artists",
    blurb: "A focused ranking of the figures who defined drill’s sound, urgency, storytelling, and wider cultural impact.",
    items: [
      { slug: "chief-keef", note: "The foundational architect whose Chicago rise made drill a global rap language." },
      { slug: "king-von", note: "A cinematic storyteller who pushed drill toward vivid, scene-by-scene narration." },
      { slug: "lil-durk", note: "The key bridge from drill roots to long-term mainstream power." },
      { slug: "pop-smoke", note: "The face of Brooklyn drill’s worldwide breakout and crossover expansion." },
      { slug: "fivio-foreign", note: "A major force in taking New York drill into a larger national spotlight." },
      { slug: "g-herbo", note: "An emotionally raw Chicago voice who gave drill lasting psychological depth." },
      { slug: "lil-reese", note: "One of drill’s early cold-toned originals and a crucial Chicago marker." },
      { slug: "la-capone", note: "A short-lived but deeply influential young voice in drill’s formative era." },
      { slug: "polo-g", note: "A melodic storyteller shaped by drill’s emotional realism, even as he widened the lane." },
      { slug: "doodie-lo", note: "A modern street-rap presence representing drill’s extended influence inside Chicago rap culture." }
    ]
  },
  {
    id: "influential",
    title: "Most Influential Ever",
    blurb: "The artists and architects whose styles, decisions, catalogs, and cultural weight permanently changed hip-hop.",
    items: [
      { slug: "tupac", note: "Mythic scale, political force, and emotional candor made him one of rap’s defining icons." },
      { slug: "biggie", note: "A lyrical giant whose flow, storytelling, and charisma reset the East Coast standard." },
      { slug: "jay-z", note: "A blueprint for lyrical longevity, business power, and generational influence." },
      { slug: "nas", note: "A writer’s writer whose storytelling precision remains a benchmark across eras." },
      { slug: "lil-wayne", note: "A mixtape-era supernova whose punchlines, work rate, and style changed modern rap." },
      { slug: "kanye-west", note: "A sound-shifter whose production and self-mythology altered rap’s emotional palette." },
      { slug: "dr-dre", note: "A producer-architect behind multiple eras, sounds, and superstar breakthroughs." },
      { slug: "eminem", note: "A technical force whose global reach and lyrical innovation reshaped rap’s scale." },
      { slug: "snoop-dogg", note: "A West Coast icon whose style and longevity made him a permanent cultural reference point." },
      { slug: "outkast", note: "A duo that expanded Southern rap, genre freedom, and artistic possibility at once." }
    ]
  },
  {
    id: "controversial",
    title: "Most Controversial",
    blurb: "The artists and figures whose stories remain inseparable from public backlash, scandal, legal trouble, or deep cultural division.",
    items: [
      { slug: "6ix9ine", note: "A viral-era case study in spectacle, legal collapse, and nonstop authenticity debates." },
      { slug: "r-kelly", note: "A towering musical legacy overshadowed by criminal convictions and public reckoning." },
      { slug: "p-diddy", note: "A mogul legacy now heavily reframed by controversy and severe allegations." },
      { slug: "birdman", note: "A business empire builder whose influence is inseparable from contract and loyalty disputes." },
      { slug: "blueface", note: "A modern attention-era figure whose career often moved through conflict as much as music." },
      { slug: "da-baby", note: "A breakout superstar whose momentum became deeply complicated by public backlash." },
      { slug: "kodak-black", note: "A gifted but polarizing figure shaped by legal trouble, volatility, and divided public opinion." },
      { slug: "kanye-west", note: "A generation-defining artist whose cultural reach has repeatedly collided with public controversy." },
      { slug: "gunna", note: "A major modern rap figure pulled into one of the most debated loyalty narratives of his era." },
      { slug: "foolio", note: "A Jacksonville figure whose music and public image stayed tightly bound to conflict and regional controversy." }
    ]
  }
];
const collectionDefinitions = [
  {
    id: "drill-essentials",
    title: "Chicago Drill Essentials",
    blurb: "A focused path through the artists who define, extend, or emotionally reshape drill's Chicago-centered story.",
    slugs: ["chief-keef", "king-von", "lil-durk", "g-herbo", "lil-reese", "la-capone", "polo-g", "doodie-lo"]
  },
  {
    id: "southern-architects",
    title: "Southern Architects",
    blurb: "A collection centered on the artists and moguls who helped define Southern rap's business and sonic power.",
    slugs: ["outkast", "lil-wayne", "birdman", "future", "young-dolph", "kevin-gates", "young-buck", "master-p"]
  },
  {
    id: "women-in-rap",
    title: "Women Who Changed Rap",
    blurb: "A replayable path through high-impact women whose visibility, voice, or crossover power changed the culture.",
    slugs: ["cardi-b", "da-brat", "en-vogue"]
  },
  {
    id: "uk-connections",
    title: "UK Rap Stories",
    blurb: "The archive's current UK-facing lane, showing how London and crossover acts connect into the wider hip-hop network.",
    slugs: ["d-block-europe", "jay-sean", "drake"]
  }
];

function setupHeader(){
  const header = document.getElementById("mainHeader");
  if(!header) return;
  function offset(){ document.body.style.paddingTop = header.offsetHeight + "px"; }
  function scroll(){
    if(window.innerWidth <= 768){
      if(window.pageYOffset <= 5) header.classList.remove("hidden");
      else header.classList.add("hidden");
    } else header.classList.remove("hidden");
  }
  offset(); scroll();
  window.addEventListener("load", offset);
  window.addEventListener("resize", offset);
  window.addEventListener("scroll", scroll, {passive:true});
}

function make(tag, cls, html){
  const el = document.createElement(tag);
  if(cls) el.className = cls;
  if(html !== undefined) el.innerHTML = html;
  return el;
}

function card(artist){
  const a = make("a","artist-card glass");
  a.href = artist.file;
  a.innerHTML = `
    <div class="artist-thumb"><img src="${artist.image}" alt="${artist.name}" loading="lazy" decoding="async"></div>
    <div class="artist-card-body">
      <div class="meta-row">
        <span class="meta-pill">${artist.city}</span>
        <span class="meta-pill">${artist.era}</span>
      </div>
      <h3>${artist.name}</h3>
      <p>${artist.summary}</p>
      <span>Open story →</span>
    </div>`;
  return a;
}

function sortArtists(list, mode){
  const arr = [...list];
  if(mode === "era") arr.sort((a,b)=> a.era.localeCompare(b.era) || a.name.localeCompare(b.name));
  else if(mode === "city") arr.sort((a,b)=> a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
  else arr.sort((a,b)=> a.name.localeCompare(b.name));
  return arr;
}

function normalizeEra(era){
  const value = (era || "").toLowerCase();
  if(value.includes("90")) return "1990s";
  if(value.includes("2000")) return "2000s";
  if(value.includes("2010")) return "2010s";
  if(value.includes("2020")) return "2020s";
  return era || "Other";
}

function getSourceDataMap(){
  return window.ARTIST_SOURCE_DATA || {};
}

function getSourceTier(slug){
  const source = getSourceDataMap()[slug];
  return source && source.sourceTier ? source.sourceTier : "generated";
}

function getRankingBySlug(slug){
  for(const list of rankingDefinitions){
    if(list.items.some(item => item.slug === slug)) return list;
  }
  return null;
}

function getRegion(city){
  const value = (city || "").toLowerCase();
  if(value.includes("london") || value.includes("uk")) return "United Kingdom";
  if(value.includes("toronto") || value.includes("canada")) return "Canada";
  return "United States";
}

function getSortLabel(mode){
  if(mode === "era") return "Sorted by era";
  if(mode === "city") return "Sorted by city";
  return "Sorted A-Z";
}

function buildExplorerUrl(filters){
  const params = new URLSearchParams();
  if(filters.q) params.set("q", filters.q);
  if(filters.era && filters.era !== "all") params.set("era", filters.era);
  if(filters.category && filters.category !== "all") params.set("category", filters.category);
  if(filters.city && filters.city !== "all") params.set("city", filters.city);
  if(filters.region && filters.region !== "all") params.set("region", filters.region);
  if(filters.tag && filters.tag !== "all") params.set("tag", filters.tag);
  if(filters.ranking && filters.ranking !== "all") params.set("ranking", filters.ranking);
  if(filters.credibility && filters.credibility !== "all") params.set("credibility", filters.credibility);
  if(filters.sort && filters.sort !== "a-z") params.set("sort", filters.sort);
  return "explorer.html" + (params.toString() ? "?" + params.toString() : "");
}

function uniqueBySlug(list){
  return list.filter((item, index, array) => array.findIndex(candidate => candidate.slug === item.slug) === index);
}

function getGraphNodes(){
  const seedSlugs = uniqueBySlug(
    rankingDefinitions.flatMap(list => list.items.map(item => ({ slug: item.slug })))
      .concat(data.artists.filter(artist => getSourceTier(artist.slug) === "curated").map(artist => ({ slug: artist.slug })))
  ).map(item => item.slug);

  return uniqueBySlug(
    seedSlugs.map(slug => data.artists.find(artist => artist.slug === slug)).filter(Boolean)
  ).slice(0, 24);
}

function getConnectionReasons(a, b){
  const reasons = [];
  if(a.city === b.city) reasons.push(`Shared city: ${a.city}`);
  if(a.category === b.category) reasons.push(`Shared category: ${a.category}`);
  const sharedTags = (a.tags || []).filter(tag => (b.tags || []).includes(tag));
  if(sharedTags.length) reasons.push(`Shared tag: ${sharedTags[0]}`);
  const rankingA = getRankingBySlug(a.slug);
  const rankingB = getRankingBySlug(b.slug);
  if(rankingA && rankingB && rankingA.id === rankingB.id) reasons.push(`Same ranking: ${rankingA.title}`);
  if(getRegion(a.city) === getRegion(b.city) && a.city !== b.city) reasons.push(`Same region: ${getRegion(a.city)}`);
  return reasons;
}

function getConnectionsForArtist(artist, graphNodes){
  return graphNodes.map(function(candidate){
    if(candidate.slug === artist.slug) return null;
    const reasons = getConnectionReasons(artist, candidate);
    if(!reasons.length) return null;
    return {
      artist: candidate,
      reasons: reasons,
      score: reasons.length
    };
  }).filter(Boolean).sort((a,b) => b.score - a.score || a.artist.name.localeCompare(b.artist.name));
}

function setupExplorer(){
  const root = document.querySelector("[data-vault-page='explorer']");
  if(!root) return;
  const grid = document.getElementById("explorerGrid");
  const empty = document.getElementById("explorerEmpty");
  const count = document.getElementById("explorerCount");
  const summary = document.getElementById("explorerSummary");
  const search = document.getElementById("explorerSearch");
  const era = document.getElementById("explorerEra");
  const category = document.getElementById("explorerCategory");
  const city = document.getElementById("explorerCity");
  const region = document.getElementById("explorerRegion");
  const tag = document.getElementById("explorerTag");
  const ranking = document.getElementById("explorerRanking");
  const credibility = document.getElementById("explorerCredibility");
  const sort = document.getElementById("explorerSort");
  const reset = document.getElementById("explorerReset");
  if(!grid || !empty || !count || !summary) return;

  const cities = Array.from(new Set(data.artists.map(artist => artist.city).filter(Boolean))).sort((a,b)=> a.localeCompare(b));
  const tags = Array.from(new Set(data.artists.flatMap(artist => artist.tags || []).filter(Boolean))).sort((a,b)=> a.localeCompare(b));
  const regions = Array.from(new Set(data.artists.map(artist => getRegion(artist.city)))).sort((a,b)=> a.localeCompare(b));

  function populate(select, values, allLabel){
    if(!select) return;
    select.innerHTML = `<option value="all">${allLabel}</option>` + values.map(value => `<option value="${value}">${value}</option>`).join("");
  }

  populate(city, cities, "All Cities");
  populate(region, regions, "All Regions");
  populate(tag, tags, "All Tags");

  const params = new URLSearchParams(location.search);
  if(search && params.get("q")) search.value = params.get("q");
  if(era && params.get("era")) era.value = params.get("era");
  if(category && params.get("category")) category.value = params.get("category");
  if(city && params.get("city")) city.value = params.get("city");
  if(region && params.get("region")) region.value = params.get("region");
  if(tag && params.get("tag")) tag.value = params.get("tag");
  if(ranking && params.get("ranking")) ranking.value = params.get("ranking");
  if(credibility && params.get("credibility")) credibility.value = params.get("credibility");
  if(sort && params.get("sort")) sort.value = params.get("sort");

  function apply(){
    const query = search ? search.value.toLowerCase().trim() : "";
    const selectedEra = era ? era.value : "all";
    const selectedCategory = category ? category.value : "all";
    const selectedCity = city ? city.value : "all";
    const selectedRegion = region ? region.value : "all";
    const selectedTag = tag ? tag.value : "all";
    const selectedRanking = ranking ? ranking.value : "all";
    const selectedCredibility = credibility ? credibility.value : "all";
    const sortMode = sort ? sort.value : "a-z";

    let list = data.artists.filter(function(artist){
      const rankingMatch = getRankingBySlug(artist.slug);
      const credibilityTier = getSourceTier(artist.slug);
      const haystack = `${artist.name} ${artist.city} ${artist.era} ${artist.category} ${artist.summary} ${artist.timeline} ${(artist.tags || []).join(" ")} ${getRegion(artist.city)} ${rankingMatch ? rankingMatch.title : ""} ${credibilityTier}`.toLowerCase();
      if(query && !haystack.includes(query)) return false;
      if(selectedEra !== "all" && normalizeEra(artist.era) !== selectedEra) return false;
      if(selectedCategory !== "all" && artist.category !== selectedCategory) return false;
      if(selectedCity !== "all" && artist.city !== selectedCity) return false;
      if(selectedRegion !== "all" && getRegion(artist.city) !== selectedRegion) return false;
      if(selectedTag !== "all" && !(artist.tags || []).includes(selectedTag)) return false;
      if(selectedRanking !== "all" && (!rankingMatch || rankingMatch.id !== selectedRanking)) return false;
      if(selectedCredibility !== "all" && credibilityTier !== selectedCredibility) return false;
      return true;
    });

    list = sortArtists(list, sortMode);
    grid.innerHTML = "";

    list.forEach(function(artist){
      const rankingMatch = getRankingBySlug(artist.slug);
      const credibilityTier = getSourceTier(artist.slug);
      const cardEl = card(artist);
      const body = cardEl.querySelector(".artist-card-body");
      if(body){
        const extraMeta = make("div","meta-row");
        extraMeta.innerHTML = `
          <span class="meta-pill">${getRegion(artist.city)}</span>
          <span class="meta-pill">${credibilityTier === "curated" ? "Curated Sources" : "Research Ready"}</span>
          ${rankingMatch ? `<span class="meta-pill">${rankingMatch.title}</span>` : ""}`;
        body.insertBefore(extraMeta, body.querySelector("h3"));
      }
      grid.appendChild(cardEl);
    });

    const activeFilters = [];
    if(query) activeFilters.push(`query "${search.value.trim()}"`);
    if(selectedEra !== "all") activeFilters.push(selectedEra);
    if(selectedCategory !== "all") activeFilters.push(selectedCategory);
    if(selectedCity !== "all") activeFilters.push(selectedCity);
    if(selectedRegion !== "all") activeFilters.push(selectedRegion);
    if(selectedTag !== "all") activeFilters.push(selectedTag);
    if(selectedRanking !== "all"){
      const rankingTitle = rankingDefinitions.find(item => item.id === selectedRanking);
      activeFilters.push(rankingTitle ? rankingTitle.title : selectedRanking);
    }
    if(selectedCredibility !== "all") activeFilters.push(selectedCredibility === "curated" ? "Curated source tier" : "Generated source tier");

    count.textContent = `${list.length} artist${list.length === 1 ? "" : "s"} in explorer`;
    summary.textContent = activeFilters.length
      ? `${activeFilters.join(" | ")} | ${getSortLabel(sortMode)}`
      : `No filters active | ${getSortLabel(sortMode)}`;
    empty.style.display = list.length ? "none" : "block";

    const nextParams = new URLSearchParams();
    if(query) nextParams.set("q", search.value.trim());
    if(selectedEra !== "all") nextParams.set("era", selectedEra);
    if(selectedCategory !== "all") nextParams.set("category", selectedCategory);
    if(selectedCity !== "all") nextParams.set("city", selectedCity);
    if(selectedRegion !== "all") nextParams.set("region", selectedRegion);
    if(selectedTag !== "all") nextParams.set("tag", selectedTag);
    if(selectedRanking !== "all") nextParams.set("ranking", selectedRanking);
    if(selectedCredibility !== "all") nextParams.set("credibility", selectedCredibility);
    if(sortMode !== "a-z") nextParams.set("sort", sortMode);
    history.replaceState(null, "", "explorer.html" + (nextParams.toString() ? "?" + nextParams.toString() : ""));
  }

  [search, era, category, city, region, tag, ranking, credibility, sort].forEach(function(el){
    if(!el) return;
    el.addEventListener("input", apply);
    el.addEventListener("change", apply);
  });

  if(reset){
    reset.addEventListener("click", function(){
      if(search) search.value = "";
      if(era) era.value = "all";
      if(category) category.value = "all";
      if(city) city.value = "all";
      if(region) region.value = "all";
      if(tag) tag.value = "all";
      if(ranking) ranking.value = "all";
      if(credibility) credibility.value = "all";
      if(sort) sort.value = "a-z";
      apply();
    });
  }

  apply();
}

function setupCollections(){
  const root = document.querySelector("[data-vault-page='collections']");
  if(!root) return;
  const holder = document.getElementById("collectionEntries");
  if(!holder) return;
  holder.innerHTML = "";

  collectionDefinitions.forEach(function(collection){
    const artists = uniqueBySlug(collection.slugs.map(slug => data.artists.find(artist => artist.slug === slug)).filter(Boolean));
    const section = make("section", "collection-block");
    section.innerHTML = `
      <div class="glass collection-header">
        <span class="eyebrow small">Curated Collection</span>
        <h3>${collection.title}</h3>
        <p>${collection.blurb}</p>
        <a class="collection-link" href="${buildExplorerUrl({ q: collection.title })}">Explore this lane in Explorer</a>
      </div>
      <div class="artist-grid"></div>`;
    const grid = section.querySelector(".artist-grid");
    artists.forEach(function(artist){ grid.appendChild(card(artist)); });
    holder.appendChild(section);
  });
}

function setupGraph(){
  const root = document.querySelector("[data-vault-page='graph']");
  if(!root) return;
  const stage = document.getElementById("graphStage");
  const linksLayer = document.getElementById("graphLinks");
  const nodesLayer = document.getElementById("graphNodes");
  const select = document.getElementById("graphArtistSelect");
  const summary = document.getElementById("graphSummary");
  const detail = document.getElementById("graphDetail");
  if(!stage || !linksLayer || !nodesLayer || !select || !summary || !detail) return;

  const graphNodes = getGraphNodes();
  const params = new URLSearchParams(location.search);
  let activeSlug = params.get("artist") || (graphNodes[0] ? graphNodes[0].slug : "");
  const width = 980;
  const height = 620;
  const radius = 240;
  const centerX = width / 2;
  const centerY = height / 2;

  select.innerHTML = graphNodes.map(function(artist){
    return `<option value="${artist.slug}">${artist.name}</option>`;
  }).join("");
  if(activeSlug) select.value = activeSlug;

  function nodePosition(index, total){
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  }

  function render(){
    const activeArtist = graphNodes.find(artist => artist.slug === activeSlug) || graphNodes[0];
    if(!activeArtist) return;
    activeSlug = activeArtist.slug;
    select.value = activeSlug;
    const connections = getConnectionsForArtist(activeArtist, graphNodes).slice(0, 8);
    const connectionSet = new Set(connections.map(item => item.artist.slug));

    linksLayer.innerHTML = graphNodes.map(function(artist, index){
      if(artist.slug === activeArtist.slug || !connectionSet.has(artist.slug)) return "";
      const start = nodePosition(graphNodes.findIndex(item => item.slug === activeArtist.slug), graphNodes.length);
      const end = nodePosition(index, graphNodes.length);
      return `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" class="graph-line"></line>`;
    }).join("");

    nodesLayer.innerHTML = graphNodes.map(function(artist, index){
      const position = nodePosition(index, graphNodes.length);
      const isActive = artist.slug === activeArtist.slug;
      const isConnected = connectionSet.has(artist.slug);
      return `
        <a href="${artist.file}" class="graph-node${isActive ? " is-active" : isConnected ? " is-connected" : ""}" data-slug="${artist.slug}" style="left:${position.x}px;top:${position.y}px;">
          <span>${artist.name}</span>
        </a>`;
    }).join("");

    nodesLayer.querySelectorAll(".graph-node").forEach(function(node){
      node.addEventListener("click", function(event){
        if(event.metaKey || event.ctrlKey) return;
        event.preventDefault();
        activeSlug = node.dataset.slug;
        history.replaceState(null, "", "graph.html?artist=" + encodeURIComponent(activeSlug));
        render();
      });
    });

    summary.textContent = `${activeArtist.name} connects across ${connections.length} visible artist paths in this graph view.`;
    detail.innerHTML = `
      <div class="graph-focus-card glass">
        <h3>${activeArtist.name}</h3>
        <p>${activeArtist.summary}</p>
        <div class="meta-row"><span class="meta-pill">${activeArtist.city}</span><span class="meta-pill">${activeArtist.category}</span><span class="meta-pill">${normalizeEra(activeArtist.era)}</span></div>
        <div class="graph-actions"><a class="collection-link" href="${activeArtist.file}">Open story</a><a class="collection-link" href="${buildExplorerUrl({ q: activeArtist.name, city: activeArtist.city })}">Open in Explorer</a></div>
      </div>
      <div class="graph-connection-list">
        ${connections.map(function(item){
          return `<a class="graph-connection-card" href="${item.artist.file}">
            <strong>${item.artist.name}</strong>
            <span>${item.reasons.join(" | ")}</span>
          </a>`;
        }).join("")}
      </div>`;
  }

  select.addEventListener("change", function(){
    activeSlug = select.value;
    history.replaceState(null, "", "graph.html?artist=" + encodeURIComponent(activeSlug));
    render();
  });

  render();
}

function setupArchive(){
  const root = document.querySelector("[data-vault-page='archive']");
  if(!root) return;
  const TAG_PREVIEW_COUNT = 36;
  const grid = document.getElementById("artistGrid");
  const empty = document.getElementById("emptyState");
  const count = document.getElementById("resultCount");
  const search = document.getElementById("vaultSearch");
  const era = document.getElementById("vaultEra");
  const category = document.getElementById("vaultCategory");
  const sort = document.getElementById("vaultSort");
  const chips = document.getElementById("tagChips");
  let activeTag = "all";
  let tagsExpanded = false;

  const tags = ["all", ...Array.from(new Set(data.artists.flatMap(a => a.tags))).sort()];
  const toggleButton = make("button","chip-row-toggle", "More tags <span aria-hidden=\"true\">→</span>");
  toggleButton.type = "button";
  toggleButton.setAttribute("aria-expanded", "false");

  function updateTagVisibility(){
    const buttons = chips.querySelectorAll(".chip");
    buttons.forEach((button, index) => {
      const shouldShow = tagsExpanded || index < TAG_PREVIEW_COUNT;
      button.classList.toggle("chip-hidden", !shouldShow);
    });

    const hasOverflow = buttons.length > TAG_PREVIEW_COUNT;
    if(!hasOverflow){
      toggleButton.hidden = true;
      return;
    }

    toggleButton.hidden = false;
    toggleButton.innerHTML = tagsExpanded ? "Show fewer tags <span aria-hidden=\"true\">→</span>" : "More tags <span aria-hidden=\"true\">→</span>";
    toggleButton.setAttribute("aria-expanded", String(tagsExpanded));
  }

  tags.forEach(tag => {
    const btn = make("button","chip" + (tag==="all" ? " active" : ""), tag==="all" ? "All Tags" : tag);
    btn.type = "button";
    btn.addEventListener("click", () => {
      chips.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      activeTag = tag;
      apply();
    });
    chips.appendChild(btn);
  });
  chips.appendChild(toggleButton);
  toggleButton.addEventListener("click", () => {
    tagsExpanded = !tagsExpanded;
    updateTagVisibility();
  });
  updateTagVisibility();

  function apply(){
    let list = [...data.artists];
    const q = (search.value || "").toLowerCase().trim();
    if(q){
      list = list.filter(a => (`${a.name} ${a.city} ${a.era} ${a.category} ${a.tags.join(" ")} ${a.summary}`).toLowerCase().includes(q));
    }
    if(era.value !== "All Eras") list = list.filter(a => a.era === era.value);
    if(category.value !== "All Categories") list = list.filter(a => a.category === category.value);
    if(activeTag !== "all") list = list.filter(a => a.tags.includes(activeTag));
    list = sortArtists(list, sort.value);
    grid.innerHTML = "";
    list.forEach(a => grid.appendChild(card(a)));
    count.textContent = `${list.length} artist${list.length === 1 ? "" : "s"} found`;
    empty.style.display = list.length ? "none" : "block";
  }

  const params = new URLSearchParams(location.search);
  if(params.get("q")) search.value = params.get("q");
  if(params.get("era")) era.value = params.get("era");
  if(params.get("category")) category.value = params.get("category");

  [search, era, category, sort].forEach(el => {
    el.addEventListener("input", apply);
    el.addEventListener("change", apply);
  });
  apply();
}

function setupIndex(){
  const root = document.querySelector("[data-vault-page='index']");
  if(!root) return;
  const search = document.getElementById("vaultSearch");
  const era = document.getElementById("vaultEra");
  const category = document.getElementById("vaultCategory");
  const button = document.getElementById("vaultSearchBtn");
  const chips = document.getElementById("tagChips");
  const artistCount = document.getElementById("homeArtistCount");
  const categoryHubCount = document.getElementById("homeCategoryHubCount");
  if(artistCount) artistCount.textContent = String(data.artists.length);
  if(categoryHubCount) categoryHubCount.textContent = String(data.categories.length + 4);
  const tags = Array.from(new Set(data.artists.flatMap(a => a.tags))).sort().slice(0,8);
  tags.forEach(tag => {
    const chip = make("button","chip", tag);
    chip.type = "button";
    chip.addEventListener("click", () => {
      const params = new URLSearchParams();
      params.set("q", tag);
      location.href = "artist-archive.html?" + params.toString();
    });
    chips.appendChild(chip);
  });

  function run(){
    const params = new URLSearchParams();
    if(search.value.trim()) params.set("q", search.value.trim());
    if(era.value !== "All Eras") params.set("era", era.value);
    if(category.value !== "All Categories") params.set("category", category.value);
    location.href = "artist-archive.html" + (params.toString() ? "?" + params.toString() : "");
  }

  button.addEventListener("click", run);
  search.addEventListener("keydown", e => { if(e.key === "Enter"){ e.preventDefault(); run(); }});
}

function setupArtistDirectory(){
  const root = document.querySelector("[data-vault-page='artists']");
  if(!root) return;
  const grid = document.getElementById("artistDirectoryGrid");
  const empty = document.getElementById("artistDirectoryEmpty");
  const count = document.getElementById("artistDirectoryCount");
  const search = document.getElementById("artistDirectorySearch");
  const sort = document.getElementById("artistDirectorySort");
  if(!grid || !empty || !count || !search || !sort) return;

  function apply(){
    let list = [...data.artists];
    const q = (search.value || "").toLowerCase().trim();
    if(q){
      list = list.filter(a => (`${a.name} ${a.city} ${a.era} ${a.category} ${a.tags.join(" ")} ${a.summary}`).toLowerCase().includes(q));
    }
    list = sortArtists(list, sort.value);
    grid.innerHTML = "";
    list.forEach(a => grid.appendChild(card(a)));
    count.textContent = `${list.length} artist${list.length === 1 ? "" : "s"} in the vault`;
    empty.style.display = list.length ? "none" : "block";
  }

  search.addEventListener("input", apply);
  sort.addEventListener("change", apply);
  apply();
}

function setupCategories(){
  const holder = document.getElementById("vaultCategories");
  if(!holder) return;
  const count = document.getElementById("categoryCount");
  const artistStat = document.getElementById("categoryArtistStat");
  const hubStat = document.getElementById("categoryHubStat");
  const sceneStat = document.getElementById("categorySceneStat");
  const coverageStat = document.getElementById("categoryCoverageStat");

  data.categories.forEach(cat => {
    const related = data.artists
      .filter(a => a.category === cat.name)
      .sort((a,b)=> a.name.localeCompare(b.name));
    const a = make("a","glass category-card");
    a.href = cat.name === "Timeline" ? "timeline.html" : "artist-archive.html?category=" + encodeURIComponent(cat.name);
    a.innerHTML = `
      <span class="eyebrow small">Category Hub</span>
      <h3>${cat.name}</h3>
      <p>${cat.description}</p>
      <div class="category-mini-list">${related.slice(0,3).map(artist => `<span class="meta-pill">${artist.name}</span>`).join("")}</div>
      <span style="color:var(--accent);font-weight:800;">${related.length ? related.length + " related artists" : "Explore"} →</span>`;
    holder.appendChild(a);
  });

  const rankingsCard = make("a","glass category-card");
  rankingsCard.href = "rankings.html";
  rankingsCard.innerHTML = `
    <span class="eyebrow small">Editorial Hub</span>
    <h3>Legend Rankings</h3>
    <p>Jump into the vault through three curated lists: top drill artists, all-time influence, and the most controversial figures.</p>
    <div class="category-mini-list"><span class="meta-pill">Drill</span><span class="meta-pill">Influence</span><span class="meta-pill">Controversy</span></div>
    <span style="color:var(--accent);font-weight:800;">3 ranking lists →</span>`;
  holder.appendChild(rankingsCard);

  const explorerCard = make("a","glass category-card");
  explorerCard.href = "explorer.html";
  explorerCard.innerHTML = `
    <span class="eyebrow small">Discovery Hub</span>
    <h3>Advanced Explorer</h3>
    <p>Layer query, city, era, region, rankings, tags, and credibility tiers into one live discovery surface.</p>
    <div class="category-mini-list"><span class="meta-pill">Filters</span><span class="meta-pill">Rankings</span><span class="meta-pill">Credibility</span></div>
    <span style="color:var(--accent);font-weight:800;">Open explorer →</span>`;
  holder.appendChild(explorerCard);

  const graphCard = make("a","glass category-card");
  graphCard.href = "graph.html";
  graphCard.innerHTML = `
    <span class="eyebrow small">Network Hub</span>
    <h3>Connections Graph</h3>
    <p>Trace artist relationships by city, category, tags, rankings, and regional lanes in one visual network.</p>
    <div class="category-mini-list"><span class="meta-pill">Graph</span><span class="meta-pill">Influence</span><span class="meta-pill">Scene Links</span></div>
    <span style="color:var(--accent);font-weight:800;">Open graph →</span>`;
  holder.appendChild(graphCard);

  const collectionsCard = make("a","glass category-card");
  collectionsCard.href = "collections.html";
  collectionsCard.innerHTML = `
    <span class="eyebrow small">Replay Hub</span>
    <h3>Collections</h3>
    <p>Move through curated story packs like Chicago drill, Southern architects, UK stories, and more.</p>
    <div class="category-mini-list"><span class="meta-pill">Replay</span><span class="meta-pill">Collections</span><span class="meta-pill">Story Paths</span></div>
    <span style="color:var(--accent);font-weight:800;">Open collections →</span>`;
  holder.appendChild(collectionsCard);

  if(count) count.textContent = `${data.categories.length + 4} category hubs`;
  if(artistStat) artistStat.textContent = String(data.artists.length);
  if(hubStat) hubStat.textContent = String(data.categories.length + 4);
  if(sceneStat) sceneStat.textContent = String(new Set(data.artists.map(a => a.city)).size);
  if(coverageStat) coverageStat.textContent = "Live";
}

function setupTimeline(){
  const holder = document.getElementById("timelineEntries");
  if(!holder) return;
  const artistFilter = document.getElementById("timelineArtistFilter");
  const decadeFilter = document.getElementById("timelineDecadeFilter");
  const clearHighlight = document.getElementById("timelineClearHighlight");
  const resultCount = document.getElementById("timelineResultCount");
  const activePath = document.getElementById("timelineActivePath");
  const explorerLink = document.getElementById("timelineExplorerLink");
  const page = document.querySelector("[data-vault-page='timeline']");
  if(!page){
    [...data.artists].sort((a,b)=> a.name.localeCompare(b.name)).forEach(a => {
      const block = make("div","glass timeline-entry");
      block.id = a.slug;
      block.innerHTML = `<span class="year">${a.era}</span><h3>${a.name}</h3><p>${a.timeline}</p><div class="meta-row"><span class="meta-pill">${a.city}</span><span class="meta-pill">${a.category}</span><span class="meta-pill">${a.tags[0]}</span></div><a href="${a.file}" style="color:var(--accent);font-weight:800;">Open full story →</a>`;
      holder.appendChild(block);
    });
    return;
  }
  let highlightedSlug = "";

  function applyTimelineHighlight(){
    const cards = holder.querySelectorAll(".timeline-card");
    cards.forEach(cardEl => {
      const isActive = !!highlightedSlug && cardEl.dataset.slug === highlightedSlug;
      cardEl.classList.toggle("is-highlighted", isActive);
      cardEl.classList.toggle("is-dimmed", !!highlightedSlug && !isActive);
      cardEl.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    holder.querySelectorAll(".era-block").forEach(section => {
      const highlighted = highlightedSlug ? section.querySelector('.timeline-card.is-highlighted') : null;
      section.classList.toggle("has-highlight", !!highlightedSlug && !!highlighted);
      section.classList.toggle("is-muted", !!highlightedSlug && !highlighted);
    });

    if(activePath){
      if(!highlightedSlug){
        activePath.textContent = "No highlighted path";
      } else {
        const artist = data.artists.find(a => a.slug === highlightedSlug);
        activePath.textContent = artist ? `Highlighted path: ${artist.name}` : "No highlighted path";
      }
    }

    updateTimelineExplorerLink();
  }

  function updateTimelineExplorerLink(){
    if(!explorerLink) return;
    const query = artistFilter ? artistFilter.value.trim() : "";
    const decade = decadeFilter ? decadeFilter.value : "all";
    const highlightedArtist = highlightedSlug ? data.artists.find(a => a.slug === highlightedSlug) : null;
    explorerLink.href = buildExplorerUrl({
      q: highlightedArtist ? highlightedArtist.name : query,
      era: decade === "other" ? "Other" : decade
    });
    explorerLink.textContent = highlightedArtist ? `Open ${highlightedArtist.name} in Explorer` : "Open current view in Explorer";
  }

  function renderTimeline(){
    const query = artistFilter ? artistFilter.value.toLowerCase().trim() : "";
    const decade = decadeFilter ? decadeFilter.value : "all";
    const groups = new Map();

    data.artists.forEach(artist => {
      const normalizedEra = normalizeEra(artist.era);
      const artistHaystack = `${artist.name} ${artist.city} ${artist.category} ${artist.era} ${artist.summary} ${artist.timeline} ${artist.tags.join(" ")}`.toLowerCase();
      const matchesArtist = !query || artistHaystack.includes(query);
      const matchesDecade = decade === "all" || (decade === "other" ? normalizedEra === "Other" : normalizedEra === decade);
      if(!matchesArtist || !matchesDecade) return;
      if(!groups.has(normalizedEra)) groups.set(normalizedEra, []);
      groups.get(normalizedEra).push(artist);
    });

    if(highlightedSlug){
      const highlightStillVisible = Array.from(groups.values()).some(list => list.some(artist => artist.slug === highlightedSlug));
      if(!highlightStillVisible) highlightedSlug = "";
    }

    holder.innerHTML = "";

    const orderedKeys = ["1990s","2000s","2010s","2020s","Other"].filter(key => groups.has(key));
    let total = 0;

    orderedKeys.forEach(key => {
      const list = groups.get(key).sort((a,b)=> a.name.localeCompare(b.name));
      total += list.length;
      const section = make("section","era-block");
      section.dataset.era = key;
      section.innerHTML = `
        <div class="glass era-header">
          <span class="eyebrow small">Era</span>
          <h3>${key}</h3>
          <p>${list.length} connected artist entr${list.length === 1 ? "y" : "ies"} from the vault.</p>
        </div>
        <div class="timeline-grid"></div>`;
      const grid = section.querySelector(".timeline-grid");
      list.forEach(a => {
        const el = make("article","timeline-card glass");
        el.dataset.slug = a.slug;
        el.dataset.era = key;
        el.tabIndex = 0;
        el.setAttribute("role", "button");
        el.setAttribute("aria-pressed", highlightedSlug === a.slug ? "true" : "false");
        el.innerHTML = `
          <div class="timeline-thumb"><img src="${a.image}" alt="${a.name}" loading="lazy" decoding="async"></div>
          <div class="timeline-card-body">
            <div class="timeline-meta">
              <span class="pill">${a.era}</span>
              <span class="pill muted">${a.category}</span>
            </div>
            <h4>${a.name}</h4>
            <p>${a.summary}</p>
            <div class="timeline-card-actions">
              <span class="timeline-path-toggle">Highlight path</span>
              <div class="timeline-card-links">
                <a class="timeline-link" href="${buildExplorerUrl({ q: a.name, era: key })}">Open in Explorer</a>
                <a class="timeline-link" href="${a.file}">Open story →</a>
              </div>
            </div>
          </div>`;
        function toggleHighlight(event){
          if(event) event.preventDefault();
          highlightedSlug = highlightedSlug === a.slug ? "" : a.slug;
          applyTimelineHighlight();
        }
        el.addEventListener("click", function(event){
          if(event.target.closest(".timeline-link")) return;
          toggleHighlight(event);
        });
        el.addEventListener("keydown", function(event){
          if(event.key === "Enter" || event.key === " "){
            toggleHighlight(event);
          }
        });
        grid.appendChild(el);
      });
      holder.appendChild(section);
    });

    if(!orderedKeys.length){
      const empty = make("div","glass empty-state","No timeline entries match those filters right now.");
      empty.style.display = "block";
      holder.appendChild(empty);
    }

    if(resultCount){
      resultCount.textContent = `${total} timeline card${total === 1 ? "" : "s"}`;
    }

    updateTimelineExplorerLink();
    applyTimelineHighlight();
  }

  if(artistFilter) artistFilter.addEventListener("input", renderTimeline);
  if(decadeFilter) decadeFilter.addEventListener("change", renderTimeline);
  if(clearHighlight) clearHighlight.addEventListener("click", function(){
    highlightedSlug = "";
    applyTimelineHighlight();
  });

  renderTimeline();
}

function setupRankings(){
  const holder = document.getElementById("rankingEntries");
  if(!holder) return;

  const artistMap = new Map(data.artists.map(artist => [artist.slug, artist]));
  holder.innerHTML = "";

  rankingDefinitions.forEach(function(list){
    const section = make("section","ranking-block");
    section.innerHTML = `
      <div class="glass ranking-header">
        <span class="eyebrow small">Editorial Ranking</span>
        <h3>${list.title}</h3>
        <p>${list.blurb}</p>
      </div>
      <div class="ranking-grid"></div>`;

    const grid = section.querySelector(".ranking-grid");
    list.items.forEach(function(item, index){
      const artist = artistMap.get(item.slug);
      if(!artist) return;
      const cardEl = make("a","glass ranking-card");
      cardEl.href = artist.file;
      cardEl.innerHTML = `
        <div class="ranking-rank">#${index + 1}</div>
        <div class="ranking-thumb"><img src="${artist.image}" alt="${artist.name}" loading="lazy" decoding="async"></div>
        <div class="ranking-card-body">
          <div class="meta-row">
            <span class="meta-pill">${artist.city}</span>
            <span class="meta-pill">${artist.category}</span>
          </div>
          <h4>${artist.name}</h4>
          <p>${item.note}</p>
          <span class="ranking-link">Open story →</span>
        </div>`;
      grid.appendChild(cardEl);
    });

    holder.appendChild(section);
  });
}

document.addEventListener("DOMContentLoaded", function(){
  setupHeader();
  setupIndex();
  setupExplorer();
  setupCollections();
  setupGraph();
  setupArchive();
  setupArtistDirectory();
  setupCategories();
  setupTimeline();
  setupRankings();
});
})();
