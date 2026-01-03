function myfunction() {
  const body = document.body;
  const isDark = body.dataset.theme === 'dark';
  if (isDark) {
    body.style.backgroundColor = '';
    body.style.color = '';
    body.dataset.theme = 'light';
  } else {
    body.style.backgroundColor = '#121212';
    body.style.color = '#ffffff';
    body.dataset.theme = 'dark';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  let headerHeight = header ? header.offsetHeight : 0;
  const setHeaderPadding = () => {
    headerHeight = header ? header.offsetHeight : 0;
    document.documentElement.style.setProperty('--header-h', headerHeight + 'px');
  };
  setHeaderPadding();
  window.addEventListener('resize', setHeaderPadding);
  const navLinks = Array.from(document.querySelectorAll('.dp a'));
  const sections = ['home', 'about', 'skill', 'Project', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  navLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('#')) {
      const targetId = href.slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const top = targetEl.getBoundingClientRect().top + window.scrollY - (headerHeight + 8);
          window.scrollTo({ top, behavior: 'smooth' });
        });
      }
    }
  });

  const linkBySectionId = new Map();
  navLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('#')) linkBySectionId.set(href.slice(1), link);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = linkBySectionId.get(id);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, {
    root: null,
    threshold: 0.5,
    rootMargin: `-${headerHeight}px 0px -40% 0px`
  });

  sections.forEach(sec => observer.observe(sec));

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
        if (statusEl) { statusEl.textContent = 'Sending…'; }
        window.emailjs.sendForm('service_gtvxs1k', 'template_boofov7', form)
          .then(() => {
            if (statusEl) { statusEl.textContent = 'Message sent successfully.'; }
            form.reset();
          })
          .catch(() => {
            if (statusEl) { statusEl.textContent = 'Failed to send. Please try again.'; }
          })
          .finally(() => {
            if (submitBtn) submitBtn.disabled = false;
          });
      });
    }
  }
});