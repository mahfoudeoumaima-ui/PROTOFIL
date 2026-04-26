/* ══════════════════════════════════════
   1. PERSISTENT BACKGROUND PARTICLES
══════════════════════════════════════ */
(function() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function makeStar() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2,
      speed: Math.random() * 0.2 + 0.05,
      a: Math.random(),
      da: (Math.random() - 0.5) * 0.008,
      dx: (Math.random() - 0.5) * 0.12,
      dy: (Math.random() - 0.5) * 0.12,
    };
  }

  for (let i = 0; i < 180; i++) stars.push(makeStar());

  function bgLoop() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.a += s.da;
      if (s.a <= 0 || s.a >= 1) s.da *= -1;
      s.x += s.dx;
      s.y += s.dy;
      if (s.x < 0) s.x = W;
      if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H;
      if (s.y > H) s.y = 0;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      const col = Math.random() > 0.5 ? '180,126,243' : '240,107,160';
      ctx.fillStyle = `rgba(${col},${s.a * 0.7})`;
      ctx.fill();
    });
    requestAnimationFrame(bgLoop);
  }
  bgLoop();
})();

/* ══════════════════════════════════════
   2. INTRO ANIMATION
══════════════════════════════════════ */
(function() {
  const introEl = document.getElementById('intro');
  const textEl  = document.getElementById('intro-text');
  const subEl   = document.querySelector('.intro-sub');
  const canvas  = document.getElementById('intro-canvas');
  const ctx     = canvas.getContext('2d');
  let W, H;
  let particles = [];
  let phase = 'scatter';  // scatter → attract → form → hold → out
  let phaseTimer = 0;
  let raf;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Scatter phase: 300 glowing particles flying around
  const N = 300;
  for (let i = 0; i < N; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      tx: 0, ty: 0,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      r: Math.random() * 1.6 + 0.4,
      a: Math.random() * 0.8 + 0.2,
      hue: Math.random() > 0.5 ? '240,107,160' : '180,126,243',
    });
  }

  let t = 0;
  function loop() {
    raf = requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);
    t++;

    if (phase === 'scatter') {
      // Particles drift freely
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        drawParticle(p);
      });
      if (t > 120) { phase = 'attract'; phaseTimer = t; }

    } else if (phase === 'attract') {
      // Particles drift to center loosely
      const cx = W / 2, cy = H / 2;
      particles.forEach(p => {
        p.vx += (cx - p.x) * 0.003;
        p.vy += (cy - p.y) * 0.003;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx;
        p.y += p.vy;
        drawParticle(p);
      });
      if (t - phaseTimer > 80) {
        // Show text
        textEl.classList.add('visible');
        subEl.classList.add('visible');
        phase = 'hold';
        phaseTimer = t;
      }

    } else if (phase === 'hold') {
      // Particles swirl near center
      const cx = W / 2, cy = H / 2;
      particles.forEach((p, i) => {
        const angle = t * 0.01 + i * 0.02;
        const r = 60 + Math.sin(i * 0.3) * 40;
        p.tx = cx + Math.cos(angle) * r;
        p.ty = cy + Math.sin(angle) * r;
        p.vx += (p.tx - p.x) * 0.04;
        p.vy += (p.ty - p.y) * 0.04;
        p.vx *= 0.9;
        p.vy *= 0.9;
        p.x += p.vx;
        p.y += p.vy;
        drawParticle(p);
      });
      if (t - phaseTimer > 130) {
        phase = 'out';
        phaseTimer = t;
      }

    } else if (phase === 'out') {
      // Particles disperse upward
      particles.forEach(p => {
        p.vy -= 0.15;
        p.a -= 0.012;
        p.x += p.vx;
        p.y += p.vy;
        if (p.a > 0) drawParticle(p);
      });
      if (t - phaseTimer > 60) {
        cancelAnimationFrame(raf);
        // Fade out intro, show main
        introEl.classList.add('fade-out');
        setTimeout(() => {
          introEl.style.display = 'none';
          const main = document.getElementById('main');
          main.classList.add('visible');
        }, 1200);
      }
    }
  }

  function drawParticle(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.hue},${Math.max(0, p.a)})`;
    ctx.fill();
    // tiny glow
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.hue},${Math.max(0, p.a * 0.15)})`;
    ctx.fill();
  }

  loop();
})();

/* ══════════════════════════════════════
   3. SCROLL REVEAL
══════════════════════════════════════ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => {
        e.target.classList.add('in');
        // Animate skill bars
        e.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
          bar.style.width = bar.dataset.w + '%';
        });
      }, i * 100);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ══════════════════════════════════════
   4. PROJECT FILTERS
══════════════════════════════════════ */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.f;
    document.querySelectorAll('.proj-card').forEach(card => {
      const match = f === 'all' || card.dataset.tags.includes(f);
      card.style.opacity = match ? '1' : '0.2';
      card.style.transform = match ? '' : 'scale(0.97)';
      card.style.pointerEvents = match ? '' : 'none';
    });
  });
});

/* ══════════════════════════════════════
   5. FORM
══════════════════════════════════════ */
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');

    // Remove old message if exists
    let oldMsg = form.querySelector('.form-msg');
    if (oldMsg) oldMsg.remove();

    btn.textContent = 'Sending...';

    fetch(form.action, {
      method: form.method,
      body: new FormData(form),
      headers: {
        'Accept': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        form.reset();
        btn.textContent = 'Send Message';
        
        let msgDiv = document.createElement('div');
        msgDiv.className = 'form-msg';
        msgDiv.style.color = '#34d399'; // green color
        msgDiv.style.marginTop = '15px';
        msgDiv.style.fontWeight = '500';
        msgDiv.textContent = 'message envoyer';
        form.appendChild(msgDiv);
        
        setTimeout(() => {
          msgDiv.remove();
        }, 5000);
      } else {
        btn.textContent = 'Send Message';
        let msgDiv = document.createElement('div');
        msgDiv.className = 'form-msg';
        msgDiv.style.color = '#ef4444'; // red color
        msgDiv.style.marginTop = '15px';
        msgDiv.textContent = 'Oops! There was a problem submitting your form';
        form.appendChild(msgDiv);
      }
    }).catch(error => {
      btn.textContent = 'Send Message';
      let msgDiv = document.createElement('div');
      msgDiv.className = 'form-msg';
      msgDiv.style.color = '#ef4444'; 
      msgDiv.style.marginTop = '15px';
      msgDiv.textContent = 'Oops! There was a problem submitting your form';
      form.appendChild(msgDiv);
    });
  });
}

/* ══════════════════════════════════════
   6. NAV SCROLL SHADOW
══════════════════════════════════════ */
window.addEventListener('scroll', () => {
  document.querySelector('nav').style.background =
    window.scrollY > 50 ? 'rgba(4,3,10,0.9)' : 'rgba(4,3,10,0.6)';
});
