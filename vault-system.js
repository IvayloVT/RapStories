(function(){
const data = window.VAULT_DATA || {artists:[], categories:[]};

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
    <div class="artist-thumb"><img src="${artist.image}" alt="${artist.name}"></div>
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

function setupArchive(){
  const root = document.querySelector("[data-vault-page='archive']");
  if(!root) return;
  const grid = document.getElementById("artistGrid");
  const empty = document.getElementById("emptyState");
  const count = document.getElementById("resultCount");
  const search = document.getElementById("vaultSearch");
  const era = document.getElementById("vaultEra");
  const category = document.getElementById("vaultCategory");
  const sort = document.getElementById("vaultSort");
  const chips = document.getElementById("tagChips");
  let activeTag = "all";

  const tags = ["all", ...Array.from(new Set(data.artists.flatMap(a => a.tags))).sort()];
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

function setupCategories(){
  const holder = document.getElementById("vaultCategories");
  if(!holder) return;
  data.categories.forEach(cat => {
    const total = data.artists.filter(a => a.category === cat.name).length;
    const a = make("a","glass category-card");
    a.href = cat.name === "Timeline" ? "timeline.html" : "artist-archive.html?category=" + encodeURIComponent(cat.name);
    a.innerHTML = `<h3>${cat.name}</h3><p>${cat.description}</p><span style="color:var(--accent);font-weight:800;">${total ? total + " related artists" : "Explore"} →</span>`;
    holder.appendChild(a);
  });
}

function setupTimeline(){
  const holder = document.getElementById("timelineEntries");
  if(!holder) return;
  [...data.artists].sort((a,b)=> a.name.localeCompare(b.name)).forEach(a => {
    const block = make("div","glass timeline-entry");
    block.id = a.slug;
    block.innerHTML = `<span class="year">${a.era}</span><h3>${a.name}</h3><p>${a.timeline}</p><div class="meta-row"><span class="meta-pill">${a.city}</span><span class="meta-pill">${a.category}</span><span class="meta-pill">${a.tags[0]}</span></div><a href="${a.file}" style="color:var(--accent);font-weight:800;">Open full story →</a>`;
    holder.appendChild(block);
  });
}

document.addEventListener("DOMContentLoaded", function(){
  setupHeader();
  setupIndex();
  setupArchive();
  setupCategories();
  setupTimeline();
});
})();