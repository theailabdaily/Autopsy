/* App.Autopsy — inject.js v3 (iframe architecture) */
(function () {
  'use strict';
  if (window.__APP_AUTOPSY) { alert('App.Autopsy is already active on this page!'); return; }
  window.__APP_AUTOPSY = true;

  const ORIGIN = 'https://autopsy-ik.vercel.app';
  const SITE   = location.hostname.replace(/^www\./, '');

  /* ── CREATE IFRAME ────────────────────────────────────────────── */
  /* The iframe runs panel.html from our Vercel server.
     It is 100% isolated from the host page's CSS — zero conflicts. */
  const iframe = document.createElement('iframe');
  iframe.id  = '__aa-iframe';
  iframe.src = ORIGIN + '/panel.html?v=' + Date.now();

  /* All sizing/position done via setAttribute so !important wins
     even on sites that set body { overflow: hidden } or similar   */
  iframe.setAttribute('style', [
    'position: fixed',
    'top: 68px',
    'right: 0',
    'width: 340px',
    'height: calc(100vh - 76px)',
    'min-height: 420px',
    'border: none',
    'border-radius: 16px 0 0 16px',
    'box-shadow: -8px 0 40px rgba(0,0,0,0.28)',
    'z-index: 2147483647',
    'overflow: hidden',
    'transition: transform 0.28s ease'
  ].map(s => s + ' !important').join('; '));

  document.body.appendChild(iframe);

  /* ── STATE ────────────────────────────────────────────────────── */
  let ready     = false;
  let queue     = [];
  let hlEl      = null;
  let timer     = null;

  /* ── MESSAGING ────────────────────────────────────────────────── */
  function send(msg) {
    if (!ready) { queue.push(msg); return; }
    try { iframe.contentWindow.postMessage(msg, ORIGIN); } catch (_) {}
  }

  /* ── LISTEN FROM PANEL ────────────────────────────────────────── */
  function onMsg(e) {
    if (e.origin !== ORIGIN) return;
    if (e.data.type === 'ready') {
      ready = true;
      send({ type: 'init', site: SITE, title: document.title.slice(0, 60) });
      queue.forEach(m => { try { iframe.contentWindow.postMessage(m, ORIGIN); } catch(_) {} });
      queue = [];
    }
    if (e.data.type === 'close') shutdown();
  }
  window.addEventListener('message', onMsg);

  /* ── HOVER DETECTION ──────────────────────────────────────────── */
  function onHover(e) {
    const el = e.target;
    if (!el || el.nodeType !== 1 || el === iframe) return;

    /* Block events that bubbled from inside the iframe — won't
       normally happen since iframes have separate DOM, but be safe */
    try { if (el.id === '__aa-iframe') return; } catch (_) {}

    clearTimeout(timer);
    const d = describeEl(el);

    /* Dashed outline for preview (doesn't feel 'selected' yet) */
    if (hlEl && hlEl !== el) clearHL(hlEl);
    setHL(el, 'dashed');
    hlEl = el;

    send({ type: 'preview', d, site: SITE });

    /* After 0.6 s: solid outline + trigger full analysis */
    timer = setTimeout(() => {
      if (hlEl === el) setHL(el, 'solid');
      send({ type: 'analyze', d, site: SITE, title: document.title.slice(0, 60) });
    }, 600);
  }
  document.addEventListener('mouseover', onHover, true);

  /* ── HIGHLIGHT ────────────────────────────────────────────────── */
  function setHL(el, style) {
    try {
      el.style.setProperty('outline', '2.5px ' + style + ' #DC2626', 'important');
      el.style.setProperty('outline-offset', '2px', 'important');
      if (style === 'solid')
        el.style.setProperty('box-shadow', '0 0 0 4px rgba(220,38,38,0.12)', 'important');
    } catch (_) {}
  }
  function clearHL(el) {
    try {
      el.style.removeProperty('outline');
      el.style.removeProperty('outline-offset');
      el.style.removeProperty('box-shadow');
    } catch (_) {}
  }

  /* ── SHUTDOWN ─────────────────────────────────────────────────── */
  function shutdown() {
    clearTimeout(timer);
    if (hlEl) clearHL(hlEl);
    iframe.remove();
    document.removeEventListener('mouseover', onHover, true);
    window.removeEventListener('message', onMsg);
    delete window.__APP_AUTOPSY;
  }

  /* ── DESCRIBE ELEMENT ─────────────────────────────────────────── */
  function describeEl(el) {
    const tag = el.tagName.toLowerCase();
    const TYPE = {
      img:'Image', input:'Input field', button:'Button', a:'Link',
      select:'Dropdown', textarea:'Text area', form:'Form',
      nav:'Navigation menu', header:'Header section', footer:'Footer',
      video:'Video player', audio:'Audio player',
      h1:'Heading', h2:'Heading', h3:'Heading', h4:'Heading',
      ul:'List', ol:'Numbered list', li:'List item',
      table:'Data table', p:'Paragraph', span:'Text element',
      main:'Main content', section:'Page section', article:'Article',
      aside:'Sidebar', figure:'Figure/image', dialog:'Dialog box'
    };
    let humanType = TYPE[tag] || tag;
    const role = el.getAttribute('role') || '';
    if (role === 'button') humanType = 'Button';
    if (role === 'navigation') humanType = 'Navigation';
    if (role === 'search') humanType = 'Search box';
    if (role === 'banner') humanType = 'Header/Banner';
    if (role === 'dialog') humanType = 'Dialog / Popup';

    const aria  = el.getAttribute('aria-label') || el.getAttribute('title') || '';
    let text = '';
    if (tag === 'img')   text = el.alt || aria || '[image]';
    else if (tag === 'input') text = el.placeholder || aria || el.type + ' input';
    else text = (el.innerText || aria || '').replace(/\s+/g, ' ').trim().slice(0, 90);
    if (!text && aria) text = aria;

    /* Walk ancestors to find a meaningful section name */
    let section = '';
    let p = el.parentElement;
    for (let i = 0; i < 8 && p && p.tagName !== 'BODY'; i++) {
      const cand = p.getAttribute('aria-label') ||
        (p.id && p.id.length > 2 && !/^\d/.test(p.id) ? p.id.replace(/[-_]/g, ' ') : '') ||
        p.getAttribute('data-section') || '';
      if (cand && cand.length > 2 && cand.length < 55) { section = cand; break; }
      p = p.parentElement;
    }

    return { tag, humanType, text: text.slice(0, 90), section };
  }

})();
