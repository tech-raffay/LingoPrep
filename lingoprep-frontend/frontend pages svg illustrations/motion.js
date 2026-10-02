(function () {
  if (window.__lpMotion) return; window.__lpMotion = true;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.2,.7,.2,1)';
  var seen = new WeakSet();
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; io.unobserve(el);
      var d = +(el.dataset.lpDelay || 0);
      setTimeout(function () {
        el.style.opacity = '1'; el.style.transform = 'none'; el.style.filter = 'none';
        setTimeout(function () {
          el.style.transition = el.dataset.lpTrans || ''; el.style.willChange = '';
          if (el.dataset.lpFloat) floatIt(el);
        }, 950);
      }, d);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;

  function prep(el, delay) {
    if (seen.has(el) || !el.getBoundingClientRect || el.offsetParent === null) return;
    seen.add(el);
    if (reduce || !io) { if (el.dataset.lpFloat && !reduce) floatIt(el); return; }
    el.dataset.lpTrans = el.style.transition || '';
    el.dataset.lpDelay = delay || 0;
    el.style.opacity = '0'; el.style.transform = 'translateY(26px)'; el.style.filter = 'blur(6px)';
    el.style.willChange = 'opacity, transform';
    void el.offsetWidth;
    el.style.transition = 'opacity .9s ' + EASE + ', transform .9s ' + EASE + ', filter .9s ' + EASE;
    io.observe(el);
  }
  function floatIt(el) {
    var img = el.tagName === 'IMG' ? el : el.querySelector('img[src*="illustrations/"]');
    if (!img || img.__lpF || !img.animate) return; img.__lpF = true;
    img.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-9px)' }, { transform: 'translateY(0)' }],
      { duration: 6000 + Math.random() * 1500, iterations: Infinity, easing: 'ease-in-out', composite: 'add', delay: Math.random() * 800 });
  }
  function isGrid(el) { var d = getComputedStyle(el).display; return d === 'grid' || d === 'inline-grid'; }
  function scan() {
    document.querySelectorAll('section, main').forEach(function (sec) {
      var inner = sec.children.length === 1 ? sec.children[0] : sec;
      Array.prototype.forEach.call(inner.children, function (ch, i) {
        if (/^(SC-FOR|SC-IF)$/.test(ch.tagName)) return;
        var target = ch;
        if (isGrid(ch) && ch.children.length > 1) {
          Array.prototype.forEach.call(ch.children, function (g, j) { markFloat(g); prep(g, j * 110); });
          return;
        }
        markFloat(target); prep(target, i * 90);
      });
    });
    document.querySelectorAll('img[src*="illustrations/"]').forEach(function (img) {
      if (!seen.has(img)) { var p = img.closest('[data-lp-trans]'); if (!p) { img.dataset.lpFloat = 1; prep(img, 0); } }
    });
  }
  function markFloat(el) { if (el.matches('img[src*="illustrations/"]') || el.querySelector('img[src*="illustrations/"]')) el.dataset.lpFloat = 1; }
  var q = false;
  function schedule() { if (q) return; q = true; requestAnimationFrame(function () { q = false; scan(); }); }
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  schedule();
  function navShadow() {
    var y = window.scrollY || document.scrollingElement.scrollTop;
    document.querySelectorAll('nav').forEach(function (n) {
      if (getComputedStyle(n).position !== 'sticky') return;
      n.style.transition = 'box-shadow .35s ease';
      n.style.boxShadow = y > 8 ? '0 10px 30px rgba(18,23,43,.07)' : 'none';
    });
  }
  window.addEventListener('scroll', navShadow, { passive: true });
  document.documentElement.style.scrollBehavior = reduce ? 'auto' : 'smooth';
})();
