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
})();
