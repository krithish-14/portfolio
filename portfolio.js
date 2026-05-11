/* ═══════════════════════════════════════════════
   RDR2 DEAD EYE — PORTFOLIO LOGIC
   Particle system, slow-mo animations, nav tracking
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════════════
     1. DEAD EYE PARTICLE SYSTEM
     Floating dust, embers, and light motes that
     drift slowly — like time has slowed down.
     ══════════════════════════════════════════════ */
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: -9999, y: -9999 };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Track mouse for subtle interaction
  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      // Very slow drift — dead eye slow-motion
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -Math.random() * 0.15 - 0.05; // gentle upward float
      this.size = Math.random() * 2.5 + 0.5;
      this.opacity = Math.random() * 0.3 + 0.05;
      this.maxOpacity = this.opacity;

      // Color: mix of warm dust, embers, and cool motes
      const type = Math.random();
      if (type < 0.4) {
        // Gold dust
        this.r = 200; this.g = 168; this.b = 92;
      } else if (type < 0.65) {
        // Ember (reddish)
        this.r = 180; this.g = 80; this.b = 40;
        this.opacity *= 0.7;
      } else if (type < 0.85) {
        // Cool grey mote
        this.r = 180; this.g = 175; this.b = 170;
        this.opacity *= 0.5;
      } else {
        // Bright spark
        this.r = 255; this.g = 220; this.b = 150;
        this.size = Math.random() * 1.2 + 0.3;
        this.opacity = Math.random() * 0.15 + 0.1;
        this.pulse = true;
      }

      this.life = 0;
      this.maxLife = 800 + Math.random() * 1200;
      this.pulse = this.pulse || false;
      this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update() {
      this.life++;

      // Slow drift
      this.x += this.vx;
      this.y += this.vy;

      // Subtle mouse repulsion (like disturbing dust)
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120 * 0.08;
        this.x += (dx / dist) * force;
        this.y += (dy / dist) * force;
      }

      // Slight random wander
      this.vx += (Math.random() - 0.5) * 0.01;
      this.vy += (Math.random() - 0.5) * 0.01;

      // Fade in/out based on life
      const lifeRatio = this.life / this.maxLife;
      if (lifeRatio < 0.1) {
        this.opacity = this.maxOpacity * (lifeRatio / 0.1);
      } else if (lifeRatio > 0.8) {
        this.opacity = this.maxOpacity * (1 - (lifeRatio - 0.8) / 0.2);
      }

      // Pulse effect for sparks
      if (this.pulse) {
        this.opacity *= 0.6 + Math.sin(this.life * 0.02 + this.pulsePhase) * 0.4;
      }

      // Reset when off screen or dead
      if (this.life >= this.maxLife ||
          this.x < -20 || this.x > canvas.width + 20 ||
          this.y < -20 || this.y > canvas.height + 20) {
        this.reset();
        // Re-enter from edges for continuous feel
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) { this.x = -5; this.y = Math.random() * canvas.height; }
        else if (edge === 1) { this.x = canvas.width + 5; this.y = Math.random() * canvas.height; }
        else if (edge === 2) { this.y = canvas.height + 5; this.x = Math.random() * canvas.width; }
        else { this.y = -5; this.x = Math.random() * canvas.width; }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.opacity})`;
      ctx.fill();

      // Glow effect for larger particles
      if (this.size > 1.5) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.opacity * 0.15})`;
        ctx.fill();
      }
    }
  }

  // Create particles — enough for atmosphere, not overwhelming
  const particleCount = Math.min(120, Math.floor(window.innerWidth * 0.08));
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();


  /* ══════════════════════════════════════════════
     2. SCROLL REVEAL ANIMATION
     Elements fade in slowly like emerging from
     the Dead Eye haze
     ══════════════════════════════════════════════ */
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger the reveals for a cinematic cascade
        const delay = index * 120;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  });
  revealElements.forEach(el => revealObserver.observe(el));


  /* ══════════════════════════════════════════════
     3. HEADER & NAVIGATION
     Active section tracking + scroll effects
     ══════════════════════════════════════════════ */
  const header = document.getElementById('header');
  let headerHeight = header ? header.offsetHeight : 72;

  const setHeaderPadding = () => {
    headerHeight = header ? header.offsetHeight : 72;
    document.documentElement.style.setProperty('--header-h', headerHeight + 'px');
  };
  setHeaderPadding();
  window.addEventListener('resize', setHeaderPadding);

  const navLinks = Array.from(document.querySelectorAll('.dp a'));
  const sectionIds = ['home', 'about', 'skill', 'Project', 'contact'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  // Map section IDs to nav links
  const linkBySectionId = new Map();
  navLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('#')) linkBySectionId.set(href.slice(1), link);
  });

  // Smooth scroll on click
  navLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (!href.startsWith('#')) return;
    const targetEl = document.getElementById(href.slice(1));
    if (!targetEl) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      const top = targetEl.getBoundingClientRect().top + window.scrollY - (headerHeight + 8);
      window.scrollTo({ top, behavior: 'smooth' });
      setActiveLink(link);
      history.replaceState(null, '', href);
    });
  });

  // Active link management
  let currentActiveLink = null;
  function setActiveLink(link) {
    if (link === currentActiveLink) return;
    if (currentActiveLink) currentActiveLink.classList.remove('active');
    link.classList.add('active');
    currentActiveLink = link;
  }

  // Scroll-based section detection
  let rafPending = false;
  function updateActiveSection() {
    rafPending = false;
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const triggerLine = headerHeight + viewportHeight * 0.25;

    // Bottom of page → last section
    if (scrollY + viewportHeight >= docHeight - 2) {
      const lastSection = sections[sections.length - 1];
      if (lastSection) {
        const link = linkBySectionId.get(lastSection.id);
        if (link) setActiveLink(link);
      }
      return;
    }

    // Find which section the trigger line is inside
    let activeSection = null;
    for (let i = sections.length - 1; i >= 0; i--) {
      const rect = sections[i].getBoundingClientRect();
      if (rect.top <= triggerLine) {
        activeSection = sections[i];
        break;
      }
    }

    if (!activeSection && sections.length) activeSection = sections[0];
    if (activeSection) {
      const link = linkBySectionId.get(activeSection.id);
      if (link) setActiveLink(link);
    }
  }

  window.addEventListener('scroll', () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(updateActiveSection);
    }
  }, { passive: true });

  // Initial highlight
  updateActiveSection();

  // Header shadow on scroll
  window.addEventListener('scroll', () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });


  /* ══════════════════════════════════════════════
     5. DYNAMIC SKILL SET
     Tabbed interface with rating bars
     ══════════════════════════════════════════════ */
  /* ══════════════════════════════════════════════
     5. DYNAMIC SKILL SET (RADAR CHART)
     Using Chart.js for cinematic visualization
     ══════════════════════════════════════════════ */
  const skillData = {
    web: [
      { name: 'HTML', level: 5 },
      { name: 'CSS', level: 5 },
      { name: 'JavaScript', level: 3 },
      { name: 'Python', level: 4 }
    ],
    framework: [
      { name: 'Bootstrap', level: 4 },
      { name: 'Django', level: 5 }
    ],
    tools: [
      { name: 'Git', level: 5 },
      { name: 'Docker', level: 3 }
    ],
    database: [
      { name: 'MS SQL', level: 5 },
      { name: 'MY SQL', level: 3 }
    ],
    editors: [
      { name: 'VS Studio', level: 5 },
      { name: 'Antigravity', level: 5 }
    ]
  };

  let skillsChart = null;

  function renderRadarChart(category) {
    const ctx = document.getElementById('skillsRadarChart');
    if (!ctx) return;
    
    const dataSet = skillData[category];
    let labels = dataSet.map(s => s.name);
    let values = dataSet.map(s => s.level);

    // FIX: If only 2 elements, add a dummy 3rd point to force a radar triangle 
    // instead of a single straight line.
    if (labels.length === 2) {
      labels.push(""); 
      values.push(0);
    }

    if (skillsChart) {
      skillsChart.data.labels = labels;
      skillsChart.data.datasets[0].data = values;
      skillsChart.update({
        duration: 800,
        easing: 'easeOutQuart'
      });
    } else {
      // Configuration for the RDR2 Dead Eye aesthetic
      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event, elements, chart) => {
          const area = chart.chartArea;
          const x = event.x;
          const y = event.y;
          
          // Find which label was clicked
          const scale = chart.scales.r;
          const labelCount = chart.data.labels.length;
          for (let i = 0; i < labelCount; i++) {
            const angle = scale.getIndexAngle(i) - Math.PI / 2;
            const dist = scale.drawingArea + 10;
            const labelX = scale.xCenter + Math.cos(angle) * dist;
            const labelY = scale.yCenter + Math.sin(angle) * dist;
            
            // Check if click is near the label
            if (Math.abs(x - labelX) < 40 && Math.abs(y - labelY) < 20) {
              const skill = chart.data.labels[i];
              const skillUrls = {
                'Django': 'https://www.w3schools.com/django/',
                'Python': 'https://www.w3schools.com/python/',
                'HTML': 'https://www.w3schools.com/html/',
                'CSS': 'https://www.w3schools.com/css/',
                'JavaScript': 'https://www.w3schools.com/js/',
                'Bootstrap': 'https://www.w3schools.com/bootstrap/bootstrap_ver.asp',
                'MS SQL': 'https://www.w3schools.com/sql/',
                'MY SQL': 'https://www.w3schools.com/mysql/default.asp',
                'Git': 'https://www.w3schools.com/git/',
                'Docker': 'https://docs.docker.com/'
              };
              if (skill && skillUrls[skill]) {
                window.open(skillUrls[skill], '_blank');
              } else if (skill) {
                window.open(`https://www.google.com/search?q=w3schools+${encodeURIComponent(skill)}`, '_blank');
              }
              break;
            }
          }
        },
        onHover: (event, elements, chart) => {
          // Change cursor to pointer when hovering over a label area
          const x = event.x;
          const y = event.y;
          const scale = chart.scales.r;
          let hoveringLabel = false;
          for (let i = 0; i < chart.data.labels.length; i++) {
            const angle = scale.getIndexAngle(i) - Math.PI / 2;
            const dist = scale.drawingArea + 10;
            const labelX = scale.xCenter + Math.cos(angle) * dist;
            const labelY = scale.yCenter + Math.sin(angle) * dist;
            if (Math.abs(x - labelX) < 40 && Math.abs(y - labelY) < 20) {
              hoveringLabel = true;
              break;
            }
          }
          event.native.target.style.cursor = hoveringLabel ? 'pointer' : 'default';
        },
        scales: {
          r: {
            min: 0,
            max: 5,
            ticks: {
              display: false,
              stepSize: 1
            },
            grid: {
              color: 'rgba(200, 168, 92, 0.15)', // Gold dim
              lineWidth: 1
            },
            angleLines: {
              color: 'rgba(200, 168, 92, 0.2)'
            },
            pointLabels: {
              color: '#d4a76a', // Sepia
              font: {
                family: 'Cinzel',
                size: 14,
                weight: '600'
              }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(10, 10, 10, 0.9)',
            titleFont: { family: 'Cinzel' },
            bodyFont: { family: 'EB Garamond' },
            borderColor: '#c8a85c',
            borderWidth: 1
          }
        }
      };

      skillsChart = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: 'rgba(255, 42, 0, 0.15)', // Dead Eye Red faint
            borderColor: '#ff2a00',
            borderWidth: 2,
            pointBackgroundColor: '#c8a85c',
            pointBorderColor: '#0a0a0a',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#ff2a00',
            pointRadius: 4,
            tension: 0.1
          }]
        },
        options: chartOptions
      });
    }
  }

  const skillTabs = document.querySelectorAll('.skill-tab');
  skillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      skillTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderRadarChart(tab.dataset.category);
    });
  });

  // Initial load
  if (typeof Chart !== 'undefined') {
    renderRadarChart('web');
  } else {
    window.addEventListener('load', () => renderRadarChart('web'));
  }

  /* ══════════════════════════════════════════════
     6. EMAILJS CONTACT FORM
     ══════════════════════════════════════════════ */
  if (window.emailjs && typeof window.emailjs.init === 'function') {
    window.emailjs.init('eSd0_KRYBtgcERP-t');
    const form = document.querySelector('.contact-form');
    const statusEl = document.querySelector('.form-status');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = form.querySelector('#contact-email');
        const hiddenFromEmail = form.querySelector('#contact-from-email');
        if (emailInput && hiddenFromEmail) hiddenFromEmail.value = emailInput.value;
        if (submitBtn) submitBtn.disabled = true;
        if (statusEl) statusEl.textContent = 'Sending…';

        window.emailjs.sendForm('service_gtvxs1k', 'template_boofov7', form)
          .then(() => {
            if (statusEl) statusEl.textContent = 'Message sent successfully.';
            form.reset();
          })
          .catch(() => {
            if (statusEl) statusEl.textContent = 'Failed to send. Please try again.';
          })
          .finally(() => {
            if (submitBtn) submitBtn.disabled = false;
          });
      });
    }
  }

  /* ══════════════════════════════════════════════
     7. PROJECT MODAL
     Opens a detail card on "View" click, populates
     it with data-* attributes from the project card,
     and lets the "Run Application" button open the
     project URL in a new tab.
     ══════════════════════════════════════════════ */
  const modalOverlay  = document.getElementById('project-modal');
  const modalTitle    = document.getElementById('modal-title');
  const modalDesc     = document.getElementById('modal-desc');
  const modalStack    = document.getElementById('modal-stack');
  const modalStatus   = document.getElementById('modal-status');
  const modalRunBtn   = document.getElementById('modal-run-btn');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  let currentProjectUrl = '#';

  // Status label → CSS class map
  const statusClassMap = {
    'live'          : 'status-live',
    'production'    : 'status-production',
    'in development': 'status-development'
  };

  function openModal(card) {
    const title  = card.dataset.title  || 'Project';
    const desc   = card.dataset.desc   || '';
    const stack  = card.dataset.stack  || '';
    const status = card.dataset.status || 'Live';
    const url    = card.dataset.url    || '#';

    // Populate fields
    modalTitle.textContent = title;
    modalDesc.textContent  = desc;
    currentProjectUrl      = url;

    // Badge
    modalStatus.textContent = status;
    modalStatus.className   = 'modal-badge'; // reset
    const key = status.toLowerCase();
    if (statusClassMap[key]) modalStatus.classList.add(statusClassMap[key]);

    // Tech-stack pills — split on " · "
    modalStack.innerHTML = '';
    const skillUrls = {
      'Django': 'https://www.w3schools.com/django/',
      'Python': 'https://www.w3schools.com/python/',
      'HTML': 'https://www.w3schools.com/html/',
      'CSS': 'https://www.w3schools.com/css/',
      'JavaScript': 'https://www.w3schools.com/js/',
      'Bootstrap': 'https://www.w3schools.com/bootstrap/bootstrap_ver.asp',
      'MS SQL': 'https://www.w3schools.com/sql/',
      'MY SQL': 'https://www.w3schools.com/mysql/default.asp',
      'Git': 'https://www.w3schools.com/git/',
      'Docker': 'https://docs.docker.com/' // W3Schools doesn't have Docker, using official docs
    };

    stack.split(' · ').filter(Boolean).forEach(tech => {
      const cleanTech = tech.trim();
      const pill = document.createElement('a');
      pill.className = 'stack-pill';
      pill.textContent = cleanTech;
      pill.target = '_blank';
      pill.style.textDecoration = 'none';
      
      // Use mapped URL or a general search on W3Schools
      if (skillUrls[cleanTech]) {
        pill.href = skillUrls[cleanTech];
      } else {
        pill.href = `https://www.google.com/search?q=w3schools+${encodeURIComponent(cleanTech)}`;
      }
      
      modalStack.appendChild(pill);
    });

    // Show modal
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus the close button for accessibility
    setTimeout(() => modalCloseBtn && modalCloseBtn.focus(), 50);
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Attach to every View button
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.project-card');
      if (card) openModal(card);
    });
  });

  // Close via X button
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  // Close by clicking the backdrop (outside the card)
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Close with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  // Run Application — opens project URL in new tab
  if (modalRunBtn) {
    modalRunBtn.addEventListener('click', () => {
      if (currentProjectUrl && currentProjectUrl !== '#') {
        window.open(currentProjectUrl, '_blank', 'noopener,noreferrer');
      } else {
        // For the portfolio itself, just scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        closeModal();
      }
    });
  }

});