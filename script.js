'use strict';
const legacyPages = {"about": "about.html", "writing": "about.html", "connect": "about.html", "research": "research.html", "exploits": "research.html", "timeline": "timeline.html", "challenge": "challenge.html", "projects": "tools.html", "books": "books.html", "services": "hire-me.html", "pricing": "hire-me.html", "tool-engagements": "hire-me.html", "sample-deliverable": "hire-me.html", "process": "hire-me.html", "faq": "hire-me.html"};
if ((location.pathname.endsWith('/') || location.pathname.endsWith('/index.html')) && legacyPages[location.hash.slice(1)]) { location.replace(legacyPages[location.hash.slice(1)] + location.hash); }

document.getElementById('year').textContent = new Date().getFullYear();
let simpleMode = false;
try { simpleMode = localStorage.getItem('sudoninja-simple-mode') === 'true'; } catch {}
function applySimpleMode() {
  document.documentElement.classList.toggle('simple-mode', simpleMode);
  const button = document.getElementById('simple-toggle');
  button.setAttribute('aria-pressed', String(simpleMode));
  button.textContent = simpleMode ? 'Simple mode: on' : 'Simple mode';
  window.dispatchEvent(new CustomEvent('simple-mode-change', {detail: simpleMode}));
}
document.getElementById('simple-toggle').addEventListener('click', () => {
  simpleMode = !simpleMode;
  try { localStorage.setItem('sudoninja-simple-mode', String(simpleMode)); } catch {}
  applySimpleMode();
});
applySimpleMode();

// Content stays visible if animations or IntersectionObserver are unavailable.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const runningAnimations = new Set();
window.addEventListener('simple-mode-change', () => {
  if (simpleMode) runningAnimations.forEach(animation => animation.cancel());
});
function reveal(element, delay = 0) {
  if (simpleMode || reducedMotion.matches || !element.animate) return;
  const animation = element.animate([
    { opacity: 0, transform: 'translateY(22px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ], { duration: 650, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
  runningAnimations.add(animation);
  animation.onfinish = animation.oncancel = () => runningAnimations.delete(animation);
}

// Stagger the introduction without changing the accessible text.
if (!location.hash) {
  document.querySelectorAll('.hero-copy > *').forEach((element, index) => {
    reveal(element, index * 85);
  });
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const siblings = element.parentElement.classList.contains('content-grid')
        ? Array.from(element.parentElement.children) : [];
      reveal(element, Math.max(0, siblings.indexOf(element) % 3) * 70);
      observer.unobserve(element);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.section-heading, .about > *, .content-card, .stats > *, .table-scroll, .connect').forEach(element => observer.observe(element));
  // Keyboard navigation should never wait for a reveal animation.
  document.addEventListener('focusin', () => {
    runningAnimations.forEach(animation => animation.finish());
  });
  reducedMotion.addEventListener('change', event => {
    if (event.matches) runningAnimations.forEach(animation => animation.cancel());
  });
}

// Matrix-style code rain; bounded canvas resolution and a 24 fps frame rate.
(() => {
  const canvas = document.getElementById('matrix-background');
  const context = canvas.getContext('2d');
  const toggle = document.getElementById('motion-toggle');
  if (!context) return;
  const glyphs = '01アイウエオカキクケコサシスセソタチツテト{}<>/';
  const cell = 24;
  let width = 0, height = 0, frame = 0, last = 0, streams = [];
  let paused = reducedMotion.matches;
  let ramRain = false;
  function seed() {
    streams = Array.from({ length: Math.ceil(width / cell) }, (_, index) => ({
      x: index * cell + cell / 2,
      y: Math.random() * (height + 450) - 250,
      speed: 28 + Math.random() * 40,
      length: 8 + Math.floor(Math.random() * 14),
      characters: Array.from({ length: 24 }, () => glyphs[Math.floor(Math.random() * glyphs.length)])
    }));
  }
  function draw(delta = 0) {
    context.clearRect(0, 0, width, height);
    context.font = ramRain
      ? '18px "Kohinoor Devanagari", "Noto Sans Devanagari", Mangal, sans-serif'
      : '14px ui-monospace, monospace';
    context.textAlign = 'center';
    streams.forEach((stream, column) => {
      stream.y += stream.speed * delta;
      if (stream.y - stream.length * cell > height) stream.y = -cell;
      for (let i = 0; i < stream.length; i++) {
        const y = stream.y - i * cell;
        if (y < -cell || y > height + cell) continue;
        // Whole words need more horizontal and vertical space than code glyphs.
        if (ramRain && (column % 2 || i % 2)) continue;
        const alpha = i === 0 ? .35 : .19 * (1 - i / stream.length);
        context.fillStyle = i === 0 ? `rgba(180,255,175,${alpha})` : `rgba(64,220,105,${alpha})`;
        if (ramRain) context.fillStyle = i === 0
          ? `rgba(255,185,95,${alpha + .08})`
          : `rgba(255,153,51,${alpha + .03})`;
        context.fillText(ramRain ? 'राम' : stream.characters[i], stream.x, y);
      }
      if (delta && Math.random() < .025) {
        const i = Math.floor(Math.random() * stream.characters.length);
        stream.characters[i] = glyphs[Math.floor(Math.random() * glyphs.length)];
      }
    });
  }
  function tick(timestamp) {
    frame = 0;
    if (simpleMode || paused || document.hidden) return;
    if (!last) last = timestamp;
    const elapsed = timestamp - last;
    if (elapsed >= 1000 / 24) {
      draw(Math.min(elapsed / 1000, .1));
      last = timestamp;
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    toggle.textContent = paused ? 'Play background' : 'Pause background';
    toggle.setAttribute('aria-pressed', String(paused));
    window.dispatchEvent(new CustomEvent('background-motion-change', { detail: paused }));
    toggle.title = paused ? 'Background paused. Tap to animate the rain.' : 'Background running. Tap to pause the rain.';
    if (!simpleMode && !paused && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function resize() {
    width = window.innerWidth; height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    seed(); draw();
  }
  toggle.hidden = false;
  toggle.addEventListener('click', () => { paused = !paused; sync(); });
  reducedMotion.addEventListener('change', event => { paused = event.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('simple-mode-change', sync);
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('ram-rain-mode', event => {
    ramRain = event.detail === true;
    canvas.dataset.mode = ramRain ? 'ram' : 'matrix';
    draw(); // Switch immediately, even if background motion is paused.
  });
  canvas.dataset.mode = 'matrix';
  resize(); sync();
})();

// Cursor companions: fly while moving, land above the mask when idle.
(() => {
  const mask = document.getElementById('mask-follower');
  const companion = document.getElementById('hanuman-companion');
  const flying = companion.querySelector('.hanuman-flying');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let maskX = 0, maskY = 0, x = 0, y = 0;
  let lastMove = 0, lastFrame = 0, frame = 0, active = false;
  let previousPointerX = null, previousPointerY = null;
  function hide() {
    mask.classList.remove('is-visible');
    companion.classList.remove('is-visible');
    cancelAnimationFrame(frame); frame = 0; active = false; lastFrame = 0;
    previousPointerX = previousPointerY = null;
  }
  function tick(now) {
    frame = 0;
    if (!active) return;
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, .05) : 1 / 60;
    lastFrame = now;
    const moving = now - lastMove < 240;
    const dockX = Math.max(0, Math.min(maskX - 33, innerWidth - 120));
    const dockY = Math.max(0, maskY - 80);
    // A broad flight path carries Hanuman across the viewport, clear of the cursor.
    const flightWidth = Math.max(0, innerWidth - 140);
    const flightHeight = Math.max(0, innerHeight - 140);
    const targetX = moving ? 10 + flightWidth * (.5 + .46 * Math.sin(now / 1600)) : dockX;
    const targetY = moving ? 10 + flightHeight * (.5 + .37 * Math.sin(now / 1100 + 1)) : dockY;
    const dx = targetX - x, dy = targetY - y;
    const distance = Math.hypot(dx, dy);
    const step = Math.min(distance, (moving ? 650 : 900) * dt);
    if (distance > .1) { x += dx / distance * step; y += dy / distance * step; }
    const seated = !moving && distance < 3;
    companion.dataset.state = seated ? 'seated' : 'flying';
    if (!seated && Math.abs(dx) > 2) {
      flying.style.transform = dx < 0 ? 'scaleX(-1)' : 'scaleX(1)';
      companion.dataset.direction = dx < 0 ? 'left' : 'right';
    }
    if (seated) { x = dockX; y = dockY; }
    companion.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    if (!seated) frame = requestAnimationFrame(tick);
    else lastFrame = 0;
  }
  window.addEventListener('pointermove', event => {
    if (simpleMode || event.pointerType !== 'mouse' || !finePointer.matches || reducedMotion.matches) {
      hide(); return;
    }
    if (event.clientX === previousPointerX && event.clientY === previousPointerY) return;
    previousPointerX = event.clientX; previousPointerY = event.clientY;
    maskX = Math.max(33, Math.min(event.clientX + 16, innerWidth - 87));
    maskY = Math.max(85, Math.min(event.clientY + 16, innerHeight - 58));
    mask.style.transform = `translate3d(${maskX}px, ${maskY}px, 0)`;
    mask.classList.add('is-visible');
    lastMove = performance.now();
    if (!active) { x = maskX - 33; y = maskY - 80; active = true; }
    companion.classList.add('is-visible');
    companion.dataset.state = 'flying';
    if (!frame) frame = requestAnimationFrame(tick);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', hide);
  window.addEventListener('blur', hide);
  window.addEventListener('resize', hide);
  document.addEventListener('visibilitychange', hide);
  document.addEventListener('keydown', hide);
  reducedMotion.addEventListener('change', hide);
  finePointer.addEventListener('change', hide);
  window.addEventListener('simple-mode-change', hide);
})();

// Press-and-hold effect on non-interactive content; one pointer owns each hold.
(() => {
  let timer = 0;
  const soundButton = document.getElementById('sound-toggle');
  const audio = document.getElementById('ram-audio');
  let soundEnabled = true;
  let playbackRequest = 0;
  audio.volume = .65;
  function stopSound() {
    playbackRequest++;
    audio.pause();
  }
  function loadSong() {
    if (simpleMode || !soundEnabled || !timer || document.hidden) return;
    const request = ++playbackRequest;
    audio.play().then(() => {
      // A late load must never start sound after the mouse was released.
      if (request === playbackRequest && (simpleMode || !timer || !soundEnabled || document.hidden)) audio.pause();
    }).catch(error => {
      if (request !== playbackRequest || error.name === 'AbortError') return;
      soundButton.textContent = 'Retry sound';
      soundButton.title = 'Audio could not play. Check your sound settings and try holding again.';
    });
  }
  audio.addEventListener('playing', () => {
    if (simpleMode || !timer || !soundEnabled || document.hidden) { audio.pause(); return; }
    soundButton.textContent = 'Sound on';
    soundButton.title = 'Mute the chant';
  });
  soundButton.hidden = false;
  soundButton.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundButton.textContent = soundEnabled ? 'Sound on' : 'Sound off';
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    if (!soundEnabled) stopSound();
  });
  let x = 0, y = 0;
  const particles = new Set();
  let activePointer = null;
  let touchHold = false, startX = 0, startY = 0;
  const blocked = 'dialog,details,.security-challenge,.interactive-terminal,a,button,input,textarea,select,option,label,[contenteditable]:not([contenteditable="false"]),[role="button"],[role="link"],audio,video,iframe';
  function emptySpace(target) {
    return target instanceof Element && !target.closest(blocked);
  }
  function emit() {
    // Keep the effect bounded even during a long press.
    if (particles.size >= 24) return;
    const word = document.createElement('span');
    word.className = 'ram-particle';
    word.textContent = 'राम';
    word.setAttribute('aria-hidden', 'true');
    word.style.left = `${Math.max(28, Math.min(x, window.innerWidth - 28))}px`;
    word.style.top = `${Math.max(24, Math.min(y, window.innerHeight - 24))}px`;
    document.body.append(word);
    particles.add(word);
    const remove = () => { particles.delete(word); word.remove(); };
    if (!word.animate) { setTimeout(remove, 700); return; }
    const drift = (Math.random() - .5) * 110;
    const reduced = reducedMotion.matches;
    const animation = word.animate(reduced ? [
      { opacity: .9 }, { opacity: 0 }
    ] : [
      { opacity: 0, transform: 'translate(-50%, -50%) scale(.7)' },
      { opacity: 1, offset: .15, transform: 'translate(-50%, -75%) scale(1)' },
      { opacity: 0, transform: `translate(calc(-50% + ${drift}px), -130px) scale(.85)` }
    ], { duration: reduced ? 650 : 1500, easing: 'ease-out', fill: 'forwards' });
    animation.onfinish = animation.oncancel = remove;
  }
  function stop() {
    const wasGenerating = !!timer;
    const pointer = activePointer;
    activePointer = null;
    clearInterval(timer); timer = 0; stopSound();
    document.documentElement.classList.remove('ram-holding');
    if (pointer !== null && document.documentElement.hasPointerCapture?.(pointer)) {
      document.documentElement.releasePointerCapture(pointer);
    }
    if (wasGenerating) window.dispatchEvent(new CustomEvent('ram-rain-mode', { detail: false }));
  }
  window.addEventListener('pointerdown', event => {
    if (simpleMode || event.button !== 0 || !event.isPrimary || !['mouse', 'touch', 'pen'].includes(event.pointerType) || !emptySpace(event.target)) return;
    // Touch keeps native scrolling; a swipe or pointercancel ends the chant.
    if (event.pointerType === 'mouse') event.preventDefault();
    stop(); activePointer = event.pointerId;
    touchHold = event.pointerType !== 'mouse';
    x = startX = event.clientX; y = startY = event.clientY;
    document.documentElement.classList.add('ram-holding');
    try { document.documentElement.setPointerCapture(event.pointerId); } catch { /* Global release listeners remain the fallback. */ }
    emit(); timer = setInterval(emit, 140);
    window.dispatchEvent(new CustomEvent('ram-rain-mode', { detail: true }));
    if (soundEnabled) loadSong();
  }, { passive: false });
  window.addEventListener('pointermove', event => {
    if (!timer || event.pointerId !== activePointer) return;
    if ((!touchHold && !(event.buttons & 1)) ||
        (touchHold && Math.hypot(event.clientX - startX, event.clientY - startY) > 12)) { stop(); return; }
    x = event.clientX; y = event.clientY;
  }, { passive: true });
  window.addEventListener('pointerup', event => {
    if (event.pointerId === activePointer && (touchHold || event.button === 0)) stop();
  });
  window.addEventListener('pointercancel', event => {
    if (event.pointerId === activePointer) stop();
  });
  document.documentElement.addEventListener('lostpointercapture', event => {
    if (event.pointerId === activePointer) stop();
  });
  window.addEventListener('contextmenu', event => {
    if (timer && touchHold) event.preventDefault();
  });
  window.addEventListener('blur', stop);
  window.addEventListener('pagehide', stop);
  window.addEventListener('simple-mode-change', stop);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') stop(); });
})();

// An allowlisted portfolio navigator, never a system shell.
(() => {
  const form = document.getElementById('terminal-form');
  if (!form) return;
  const input = document.getElementById('terminal-input');
  const output = document.getElementById('terminal-output');
  const history = [];
  let historyIndex = 0, draft = '';
  function paragraph(parent, text) {
    const p = document.createElement('p');
    p.textContent = text;
    parent.append(p);
  }
  function link(parent, label, href, external = false) {
    const a = document.createElement('a');
    a.textContent = label; a.href = href;
    if (external) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    parent.append(a);
    return a;
  }
  function listCards(parent, selector) {
    const ul = document.createElement('ul');
    document.querySelectorAll(selector).forEach(card => {
      const title = card.querySelector('h3');
      const destination = card.querySelector('a.text-link');
      if (!title || !destination) return;
      const li = document.createElement('li');
      link(li, title.textContent, destination.href, true);
      ul.append(li);
    });
    parent.append(ul);
  }
  function run(raw) {
    const command = raw.trim().toLowerCase();
    if (!command) return;
    history.push(raw.trim());
    if (history.length > 50) history.shift();
    historyIndex = history.length; draft = ''; input.value = '';
    if (command === 'clear') {
      output.replaceChildren();
      paragraph(output, 'Terminal cleared. Type help for commands.');
      return;
    }
    const entry = document.createElement('div');
    entry.className = 'terminal-entry';
    paragraph(entry, '❯ ' + raw.trim());
    switch (command) {
      case 'help':
        paragraph(entry, 'whoami — About Sanjay Singh\nprojects — Explore all tools\nbooks — Browse publications\ncontact — Email and LinkedIn\nclear — Clear this terminal\nhelp — Show commands');
        paragraph(entry, 'Use ↑ / ↓ for previous commands. Escape clears your input.');
        break;
      case 'whoami':
        paragraph(entry, 'Sanjay Singh / sudoninja');
        paragraph(entry, document.querySelector('.hero-copy .intro').textContent);
        link(entry, 'More about me →', 'about.html#about').className = 'terminal-section-link';
        break;
      case 'projects':
        paragraph(entry, 'Security tools, browser extensions, and desktop utilities:');
        paragraph(entry, 'Explore 15 tools with screenshots, descriptions, and demo links on the Tools page.');
        link(entry, 'Browse the Tools section →', 'tools.html#projects').className = 'terminal-section-link';
        break;
      case 'books':
        paragraph(entry, 'Browse six cybersecurity books and their covers on the Books page.');
        link(entry, 'See book covers →', 'books.html#books').className = 'terminal-section-link';
        break;
      case 'contact':
        document.querySelectorAll('.hero-contact a').forEach(source => {
          const row = document.createElement('p');
          link(row, source.textContent.trim(), source.href, source.href.startsWith('https:'));
          entry.append(row);
        });
        link(entry, 'Contact section →', 'about.html#connect').className = 'terminal-section-link';
        break;
      default:
        paragraph(entry, 'Command not found. Type help to see available commands.');
    }
    output.append(entry);
    while (output.children.length > 20) output.firstElementChild.remove();
    output.scrollTop = Math.max(0, entry.offsetTop - output.offsetTop);
  }
  form.addEventListener('submit', event => { event.preventDefault(); run(input.value); });
  document.querySelectorAll('[data-command]').forEach(button => {
    button.addEventListener('click', () => run(button.dataset.command));
  });
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') { input.value = ''; historyIndex = history.length; draft = ''; }
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    if (historyIndex === history.length) draft = input.value;
    historyIndex = Math.max(0, Math.min(history.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
    input.value = historyIndex === history.length ? draft : history[historyIndex];
  });
})();

// Self-contained educational puzzle; no code execution or network requests.
(() => {
  const form = document.getElementById('challenge-form');
  if (!form) return;
  const feedback = document.getElementById('challenge-feedback');
  const explanation = document.getElementById('challenge-explanation');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const answer = form.querySelector('input:checked');
    if (!answer) return;
    if (answer.value === 'idor') {
      feedback.textContent = 'Correct! The route checks login, but not invoice ownership. Open the explanation below to see the fix.';
    } else if (answer.value === 'sqli') {
      feedback.textContent = 'Not quite. The query is parameterized. Look at which user is allowed to read the requested invoice.';
    } else {
      feedback.textContent = 'Not quite. requireLogin checks the session. Does being signed in grant access to every invoice?';
    }
  });
  form.addEventListener('change', () => { feedback.textContent = ''; });
  document.getElementById('challenge-reset').addEventListener('click', () => {
    form.reset(); feedback.textContent = ''; explanation.open = false;
    form.querySelector('input').focus({preventScroll:true});
  });
})();

// Load third-party video only when a visitor expands its preview.
(() => {
  document.querySelectorAll('.project-demo[data-video-id]').forEach(details => {
    const player = details.querySelector('.demo-player');
    details.addEventListener('toggle', () => {
      if (!details.open) { player.replaceChildren(); return; }
      if (player.firstElementChild) return;
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(details.dataset.videoId) + '?start=0&end=45&rel=0';
      iframe.title = 'SudoShark — 45-second demo preview';
      iframe.allow = 'encrypted-media; picture-in-picture; fullscreen';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      player.append(iframe);
    });
  });
})();

// An opt-in, single-play story with synchronized captions and static step mode.
(() => {
  const dialog = document.getElementById('story-dialog');
  const scene = document.getElementById('epic-scene');
  const jatayu = scene.querySelector('.epic-jatayu');
  const ravana = scene.querySelector('.epic-ravana');
  const wing = scene.querySelector('.jatayu-detail-wing');
  const cry = scene.querySelector('.epic-cry');
  const clash = scene.querySelector('.epic-clash');
  const play = document.getElementById('story-play');
  const progress = document.getElementById('story-progress');
  const previous = document.getElementById('story-prev');
  const next = document.getElementById('story-next');
  const chapters = [
    [0, 'An approaching chariot', 'Ravana carries Sita away in his flying chariot. Jatayu approaches to help her.'],
    [5, 'Jatayu intervenes', 'Jatayu challenges Ravana and fights to protect Sita.'],
    [10, 'A wounded wing', 'Ravana strikes Jatayu. A wing falls away, and the wounded bird descends.'],
    [14, 'A call to Rama', 'As he falls, Jatayu calls “राम” — Rama.'],
    [20, 'Courage remembered', 'Ravana continues with Sita. This retelling closes with Jatayu’s courage and devotion.']
  ];
  let elapsed = 0, frame = 0, last = null, playing = false, chapter = -1;
  const staticMode = () => simpleMode || reducedMotion.matches;
  const lerp = (a, b, t) => a + (b - a) * Math.max(0, Math.min(t, 1));
  function render() {
    const index = chapters.reduce((value, item, i) => elapsed >= item[0] ? i : value, 0);
    if (chapter !== index) {
      chapter = index;
      document.getElementById('story-chapter').textContent = `0${index + 1} / 05 · ${chapters[index][1]}`;
      document.getElementById('story-caption-text').textContent = chapters[index][2];
    }
    const w = scene.clientWidth, jw = jatayu.offsetWidth, rw = ravana.offsetWidth;
    const centerJ = w * .5 - jw * .85, centerR = w * .5 - rw * .08;
    let jx = lerp(-jw * .35, centerJ, elapsed / 5);
    let rx = lerp(w - rw * .65, centerR, elapsed / 5);
    let jy = 0, ry = 0, rotation = 0;
    if (elapsed >= 5 && elapsed < 10 && !staticMode()) {
      const bob = Math.sin((elapsed - 5) * Math.PI * 1.2);
      jx += bob * 7; rx -= bob * 7; jy = -Math.abs(bob) * 10;
    }
    if (elapsed >= 10) {
      jy = lerp(0, 90, (elapsed - 10) / 7);
      rotation = lerp(0, 25, (elapsed - 10) / 7);
      jx -= lerp(0, 20, (elapsed - 10) / 7);
      rx = lerp(centerR, w + rw, (elapsed - 17) / 7);
      ry = -lerp(0, 30, (elapsed - 17) / 7);
    }
    jatayu.style.transform = `translate(${jx}px, ${jy}px) rotate(${rotation}deg)`;
    ravana.style.transform = `translate(${rx}px, ${ry}px)`;
    const fall = Math.max(0, Math.min((elapsed - 10) / 4, 1));
    const flap = staticMode() || !playing ? 0 : Math.sin(elapsed * 5) * 7;
    wing.style.transform = fall ? `translate(${-30 * fall}px, ${90 * fall}px) rotate(${-65 * fall}deg)` : `rotate(${flap}deg)`;
    wing.style.opacity = String(1 - fall);
    cry.style.opacity = elapsed >= 14 && elapsed < 23 ? '1' : '0';
    clash.style.opacity = elapsed >= 10 && elapsed < 10.5 ? '1' : '0';
    progress.value = elapsed;
    previous.disabled = index === 0; next.disabled = index === chapters.length - 1;
    play.disabled = staticMode();
    play.textContent = playing ? 'Pause' : elapsed >= 24 ? 'Play again' : elapsed > 0 ? 'Resume' : 'Play story';
    document.getElementById('story-motion-note').textContent = staticMode()
      ? 'Motion is off. Use Previous and Next to read the illustrated story.'
      : '24 seconds · Captions included · No automatic sound';
  }
  function pause() { playing = false; cancelAnimationFrame(frame); frame = 0; last = null; render(); }
  function tick(now) {
    if (!playing || !dialog.open) return;
    if (last !== null) elapsed = Math.min(24, elapsed + (now - last) / 1000);
    last = now;
    render();
    if (elapsed >= 24) { pause(); return; }
    frame = requestAnimationFrame(tick);
  }
  function start(restart = false) {
    pause();
    if (restart || elapsed >= 24) elapsed = 0;
    if (!staticMode()) { playing = true; frame = requestAnimationFrame(tick); }
    render();
  }
  document.querySelectorAll('[data-open-story]').forEach(button => button.addEventListener('click', () => {
    elapsed = 0; chapter = -1; dialog.showModal();
    document.documentElement.classList.add('story-open'); render();
  }));
  play.addEventListener('click', () => playing ? pause() : start());
  document.getElementById('story-replay').addEventListener('click', () => start(true));
  function step(direction) {
    pause();
    const target = Math.max(0, Math.min(chapters.length - 1, chapter + direction));
    elapsed = chapters[target][0] + (staticMode() ? 1 : 0);
    render();
  }
  previous.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  dialog.addEventListener('close', () => { pause(); document.documentElement.classList.remove('story-open'); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  window.addEventListener('pagehide', pause);
  window.addEventListener('simple-mode-change', pause);
  reducedMotion.addEventListener('change', pause);
  window.addEventListener('resize', () => { if (dialog.open) render(); });
})();
