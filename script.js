'use strict';
document.getElementById('year').textContent = new Date().getFullYear();

// Content stays visible if animations or IntersectionObserver are unavailable.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const runningAnimations = new Set();
function reveal(element, delay = 0) {
  if (reducedMotion.matches || !element.animate) return;
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
    context.font = '14px ui-monospace, monospace';
    context.textAlign = 'center';
    streams.forEach(stream => {
      stream.y += stream.speed * delta;
      if (stream.y - stream.length * cell > height) stream.y = -cell;
      for (let i = 0; i < stream.length; i++) {
        const y = stream.y - i * cell;
        if (y < -cell || y > height + cell) continue;
        const alpha = i === 0 ? .35 : .19 * (1 - i / stream.length);
        context.fillStyle = i === 0 ? `rgba(180,255,175,${alpha})` : `rgba(64,220,105,${alpha})`;
        context.fillText(stream.characters[i], stream.x, y);
      }
      if (delta && Math.random() < .025) {
        const i = Math.floor(Math.random() * stream.characters.length);
        stream.characters[i] = glyphs[Math.floor(Math.random() * glyphs.length)];
      }
    });
  }
  function tick(timestamp) {
    frame = 0;
    if (paused || document.hidden) return;
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
    if (!paused && !document.hidden) frame = requestAnimationFrame(tick);
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
  window.addEventListener('resize', resize, { passive: true });
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
    if (event.pointerType !== 'mouse' || !finePointer.matches || reducedMotion.matches) {
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
})();

// Press-and-hold text effect, limited to empty space and the primary mouse button.
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
    if (!soundEnabled || !timer || document.hidden) return;
    const request = ++playbackRequest;
    audio.play().then(() => {
      // A late load must never start sound after the mouse was released.
      if (request === playbackRequest && (!timer || !soundEnabled || document.hidden)) audio.pause();
    }).catch(error => {
      if (request !== playbackRequest || error.name === 'AbortError') return;
      soundButton.textContent = 'Retry sound';
      soundButton.title = 'Audio could not play. Check your sound settings and try holding again.';
    });
  }
  audio.addEventListener('playing', () => {
    if (!timer || !soundEnabled || document.hidden) { audio.pause(); return; }
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
  const blocked = 'a,button,input,textarea,select,label,[contenteditable],h1,h2,h3,h4,p,span,pre,code,li,td,th,img,nav';
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
  function stop() { clearInterval(timer); timer = 0; stopSound(); }
  window.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary || event.pointerType !== 'mouse' || !emptySpace(event.target)) return;
    stop(); x = event.clientX; y = event.clientY;
    emit(); timer = setInterval(emit, 140);
    if (soundEnabled) loadSong();
  });
  window.addEventListener('pointermove', event => {
    if (!timer) return;
    if (!(event.buttons & 1) || !emptySpace(event.target)) { stop(); return; }
    x = event.clientX; y = event.clientY;
  }, { passive: true });
  window.addEventListener('pointerup', stop);
  window.addEventListener('pointercancel', stop);
  window.addEventListener('blur', stop);
  window.addEventListener('scroll', stop, { passive: true });
  document.documentElement.addEventListener('pointerleave', stop);
  document.addEventListener('visibilitychange', stop);
})();
