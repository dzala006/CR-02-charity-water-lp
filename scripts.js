// Small script to reveal elements on scroll and toggle a sticky state class on the header.
// Uses IntersectionObserver for performant scroll animations.
(function(){
  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length){
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    reveals.forEach(el => io.observe(el));
  } else {
    // Fallback: make all visible
    reveals.forEach(el => el.classList.add('is-visible'));
  }
  // Header stuck visual feedback: toggle .stuck class when header is pinned
  const header = document.querySelector('.topbar');
  if (header && 'IntersectionObserver' in window){
    // create a tiny sentinel at the top of the document
    const sentinel = document.createElement('div');
    sentinel.style.position = 'absolute';
    sentinel.style.top = '0';
    sentinel.style.width = '1px';
    sentinel.style.height = '1px';
    document.body.prepend(sentinel);

    const headObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting){
          header.classList.add('stuck');
        } else {
          header.classList.remove('stuck');
        }
      });
    }, { root: null, threshold: 0, rootMargin: `-${header.offsetHeight}px 0px 0px 0px` });

    headObserver.observe(sentinel);
  }

  /* Button ripple effect: attach to elements with class `ripple` */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ripples = document.querySelectorAll('.ripple');
  if (!prefersReduced && ripples.length){
    ripples.forEach(btn => {
      btn.addEventListener('pointerdown', function(e){
        const rect = btn.getBoundingClientRect();
        const r = Math.max(rect.width, rect.height);
        const span = document.createElement('span');
        span.className = 'ripple-effect';
        span.style.width = span.style.height = (r * 1.4) + 'px';
        // position center at pointer
        span.style.left = (e.clientX - rect.left - r*0.7) + 'px';
        span.style.top  = (e.clientY - rect.top  - r*0.7) + 'px';
        btn.appendChild(span);
        // remove after animation
        span.addEventListener('animationend', () => span.remove());
      });
    });
  }

  /* Lightweight parallax for hero image */
  if (!prefersReduced){
    const heroImg = document.querySelector('.hero-media img');
    if (heroImg){
      // allow optional float animation if data attribute present
      heroImg.datasetFloat = heroImg.datasetFloat || 'true';
      let lastY = window.scrollY;
      const onScroll = () => {
        const rect = heroImg.getBoundingClientRect();
        const winH = window.innerHeight;
        // element center offset (how far from viewport center)
        const centerOffset = (rect.top + rect.height/2) - (winH/2);
        // map to small translateY
        const max = 24; // px
        const factor = Math.max(-1, Math.min(1, centerOffset / (winH/2)));
        const y = -factor * max;
        heroImg.style.transform = `translateY(${y}px)`;
        lastY = window.scrollY;
      };
      // throttle via rAF
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking){
          window.requestAnimationFrame(() => { onScroll(); ticking = false; });
          ticking = true;
        }
      }, { passive: true });
      // initial
      onScroll();
    }
  }
})();
