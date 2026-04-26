
(function(){
  const sections = Array.from(document.querySelectorAll('.story-section'));
  const rail = document.getElementById('storyRail');
  const bar = document.getElementById('storyProgressBar');
  const toggle = document.getElementById('storyModeToggle');
  if (!sections.length) return;

  document.body.classList.add('story-mode');

  function buildRail() {
    if (!rail) return;
    rail.innerHTML = '';
    sections.forEach((section, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'story-dot';
      dot.title = section.dataset.storyTitle || `Chapter ${index + 1}`;
      dot.setAttribute('aria-label', dot.title);
      dot.addEventListener('click', () => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      rail.appendChild(dot);
    });
  }

  function updateActive() {
    const viewportMid = window.scrollY + window.innerHeight * 0.38;
    let activeIndex = 0;
    sections.forEach((section, index) => {
      if (section.offsetTop <= viewportMid) activeIndex = index;
    });
    sections.forEach((section, index) => {
      section.classList.toggle('active', index === activeIndex);
    });
    const dots = rail ? Array.from(rail.children) : [];
    dots.forEach((dot, index) => dot.classList.toggle('active', index === activeIndex));

    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const progress = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
    if (bar) bar.style.width = progress + '%';
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('story-mode');
      const on = document.body.classList.contains('story-mode');
      toggle.textContent = `Story Mode: ${on ? 'On' : 'Off'}`;
      updateActive();
    });
  }

  buildRail();
  updateActive();
  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', updateActive);
})();
