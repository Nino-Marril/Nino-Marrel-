// All four <section class="page"> elements, in order
  const pages = document.querySelectorAll('.page');
  const total = pages.length;
  let current = 0; // index of the page currently shown

  // Build one dot button per page for the bottom nav
  const dotsWrap = document.getElementById('dots');
  pages.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Go to page ' + (i+1));
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  });
  const dots = dotsWrap.querySelectorAll('.dot');
  const sheetLabel = document.getElementById('sheetLabel');
  const overlay = document.getElementById('loadingOverlay');
  const loaderLabel = document.getElementById('loaderLabel');
  const loaderBar = document.getElementById('loaderBar');
  let loaderTimeout = null;

  // Zero-pad page numbers for the "SHT 01/04" label
  function pad(n){ return String(n).padStart(2,'0'); }

  // Sync the DOM (active page, active dot, sheet label)
  // with whatever `current` is set to
  function render(){
    pages.forEach((p, i) => {
      p.classList.remove('active','leaving');
      if(i === current) p.classList.add('active');
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    sheetLabel.textContent = 'SHT ' + pad(current+1) + '/' + pad(total);
  }

  // Show the loading overlay, restart its progress-bar animation, swap
  // the active page while the overlay fully covers the screen, then
  // fade the overlay back out. This runs on every page change.
  function goTo(i){
    if(i < 0 || i >= total || i === current) return;
    clearTimeout(loaderTimeout);
    loaderLabel.textContent = 'PLOTTING SHEET ' + pad(i+1);

    // force the bar's grow animation to restart from 0 each time
    loaderBar.style.animation = 'none';
    void loaderBar.offsetWidth;
    overlay.classList.add('show');
    loaderBar.style.animation = '';

    // swap the page content once the overlay has covered the screen
    loaderTimeout = setTimeout(() => {
      current = i;
      render();
      // hold briefly, then fade the overlay away to reveal the new page
      loaderTimeout = setTimeout(() => {
        overlay.classList.remove('show');
      }, 180);
    }, 220);
  }

  // Left/right arrow keys still move between pages
  document.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowRight') goTo(current + 1);
    if(e.key === 'ArrowLeft') goTo(current - 1);
  });

  // basic touch swipe support
  let touchStartX = null;
  document.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX);
  document.addEventListener('touchend', e => {
    if(touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if(dx > 60) goTo(current - 1);   // swipe right -> previous page
    if(dx < -60) goTo(current + 1);  // swipe left -> next page
    touchStartX = null;
  });

  render(); // set initial state on load
