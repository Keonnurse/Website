// Keon Nurse, personal site. Three small behaviours, and the page works without any of them.
(() => {
  const root = document.documentElement;
  root.classList.add('js');

  // 1. Light and dark toggle. Follows the system until the visitor picks one.
  const themeButton = document.getElementById('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function savedTheme() {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  }
  function currentTheme() {
    return root.dataset.theme || (systemDark.matches ? 'dark' : 'light');
  }
  function labelThemeButton() {
    themeButton.textContent = currentTheme() === 'dark' ? 'Light mode' : 'Dark mode';
  }

  if (themeButton) {
    const saved = savedTheme();
    if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;
    themeButton.hidden = false;
    labelThemeButton();

    themeButton.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) { /* private mode, ignore */ }
      labelThemeButton();
    });
    systemDark.addEventListener('change', labelThemeButton);
  }

  // 2. Highlight the nav link for the section currently on screen.
  const links = new Map();
  document.querySelectorAll('.top nav a[href^="#"]').forEach((link) => {
    links.set(link.getAttribute('href').slice(1), link);
  });

  if ('IntersectionObserver' in window && links.size) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.removeAttribute('aria-current'));
        const active = links.get(entry.target.id);
        if (active) active.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-35% 0px -60% 0px' });

    document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section));
  }

  // 3. Click a project image to see it full size.
  const zoom = document.getElementById('zoom');
  const zoomImage = zoom ? zoom.querySelector('img') : null;

  if (zoom && zoomImage && typeof zoom.showModal === 'function') {
    document.querySelectorAll('.shots img').forEach((img) => {
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Enlarge: ' + img.alt);

      const open = () => {
        zoomImage.src = img.src;
        zoomImage.alt = img.alt;
        zoom.showModal();
      };
      img.addEventListener('click', open);
      img.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open();
        }
      });
    });

    // A click on the dark backdrop, outside the picture, closes it. Escape already does.
    zoom.addEventListener('click', (event) => {
      if (event.target === zoom) zoom.close();
    });
  }

  // 4. Make each collapsed gallery look like something to open:
  //    a fanned peek of its photos, a clear "View" line, and a round arrow button.
  //    Without this script the plain toggle still works.
  document.querySelectorAll('details.gallery').forEach((gallery) => {
    const summary = gallery.querySelector('summary');
    if (!summary) return;

    const count = summary.querySelector('.count');
    const n = count ? count.textContent.trim() : '';
    if (count) count.remove();
    const title = summary.textContent.trim();
    const isPhotos = /^\d+$/.test(n);
    const what = isPhotos ? `${n} images` : 'details and map';
    summary.textContent = '';

    const photos = [...gallery.querySelectorAll('img')].slice(0, 3);
    if (photos.length) {
      const peek = document.createElement('span');
      peek.className = 'peek';
      peek.setAttribute('aria-hidden', 'true');
      photos.forEach((photo) => {
        const thumb = document.createElement('img');
        thumb.src = photo.getAttribute('src');
        thumb.alt = '';
        thumb.loading = 'lazy';
        peek.appendChild(thumb);
      });
      summary.appendChild(peek);
    }

    const text = document.createElement('span');
    text.className = 'sum-text';
    const titleEl = document.createElement('span');
    titleEl.className = 'sum-title';
    titleEl.textContent = title;
    const hint = document.createElement('span');
    hint.className = 'sum-hint';
    hint.innerHTML = `<span class="when-closed">View ${what}</span><span class="when-open">Hide ${isPhotos ? 'images' : 'details'}</span>`;
    text.append(titleEl, hint);
    summary.appendChild(text);

    const arrow = document.createElement('span');
    arrow.className = 'sum-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    summary.appendChild(arrow);

    gallery.classList.add('fancy');
  });
})();
