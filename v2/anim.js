/* LEP v2 motion — ライブラリ不要・控えめ（2026-06-29 くろーどん）
   1) reveal: 画面に入った要素をフェード＋上移動（IntersectionObserver）
   2) hero : load時ゆっくりズーム＋スクロールで微パララックス
   prefers-reduced-motion: reduce の人には何もしない（CSS側で静止） */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- 1) reveal targets：主要な塊に .reveal を自動付与 --- */
  var selectors = [
    '.section .lead', '.grid-3 .cell', '.full-img', '.biz',
    '.news-list', '.video-wrap', '.proj', '.team .t-card',
    '.gallery .cellimg', '.cta-center'
  ];
  var targets = [];
  selectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) { targets.push(el); });
  });

  if (!reduce && 'IntersectionObserver' in window) {
    targets.forEach(function (el) { el.classList.add('reveal'); });
    /* 同じ行に並ぶ要素は軽いstaggerで順に出す */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = el.getAttribute('data-reveal-delay') || 0;
          el.style.transitionDelay = delay + 'ms';
          el.classList.add('is-visible');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    /* グリッド系は子の順番で stagger（60ms刻み・最大4つ） */
    function stagger(parentSel, childSel) {
      document.querySelectorAll(parentSel).forEach(function (p) {
        var kids = p.querySelectorAll(childSel);
        kids.forEach(function (k, i) {
          k.setAttribute('data-reveal-delay', Math.min(i, 4) * 60);
        });
      });
    }
    stagger('.grid-3', '.cell');
    stagger('.proj-grid', '.proj');
    stagger('.team-grid', '.t-card');
    stagger('.gallery', '.cellimg');

    targets.forEach(function (el) { io.observe(el); });
  }

  /* --- 2) hero: load時ズーム＋スクロール微パララックス --- */
  var heroBg = document.querySelector('.hero-bg');
  if (heroBg && !reduce) {
    /* 次フレームで zoomed を付け、scale1.06→1.0 をゆっくり */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { heroBg.classList.add('zoomed'); });
    });
    /* スクロールパララックス：ヒーロー内だけ・rAFで間引き */
    var hero = document.querySelector('.hero');
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var rect = hero.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          var y = Math.min(window.scrollY, window.innerHeight) * 0.18;
          /* ズーム後のscale1.0を保ちつつY移動だけ足す */
          heroBg.style.transform = 'scale(1.0) translateY(' + y + 'px)';
        }
        ticking = false;
      });
    }
    /* ズーム完了後にパララックス有効化（transitionと競合させない） */
    window.addEventListener('load', function () {
      setTimeout(function () {
        heroBg.style.transition = 'none';
        window.addEventListener('scroll', onScroll, { passive: true });
      }, 8200);
    });
  }
})();
