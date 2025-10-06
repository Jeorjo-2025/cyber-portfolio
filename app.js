// Resolve LinkedIn/Github placeholders if environment injection not used
document.querySelectorAll('a[href="%LINKEDIN%"]').forEach(a => a.href = (window.LINKEDIN_URL || a.href));
document.querySelectorAll('a[href="%GITHUB%"]').forEach(a => a.href = (window.GITHUB_URL || a.href));

// MENU: smooth scroll (native CSS handles smooth; keep this to support older browsers)
document.querySelectorAll('.navbar a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    // If contact menu, open modal instead of scrolling
    if (link.id === 'openContact') {
      e.preventDefault();
      document.getElementById('contactModal').style.display = 'flex';
      return;
    }
    // default scroll
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// COLLAPSIBLE sections logic
document.querySelectorAll('.collapsible-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const content = btn.nextElementSibling;
    const open = content.style.display === 'block';
    // close all other content blocks (optional)
    document.querySelectorAll('.collapsible-menu .content').forEach(c => c.style.display = 'none');
    content.style.display = open ? 'none' : 'block';
    // scroll content into view when opened
    if (!open) setTimeout(() => content.scrollIntoView({behavior:'smooth', block:'center'}), 150);
  });
});

// CONTACT MODAL open/close handlers
const contactModal = document.getElementById('contactModal');
const closeModal = document.getElementById('closeModal');
if (closeModal) closeModal.addEventListener('click', () => contactModal.style.display = 'none');
window.addEventListener('click', (e) => { if (e.target === contactModal) contactModal.style.display = 'none'; });

// CONTACT FORM submission to backend (/send)
const contactForm = document.getElementById('contactForm');
const statusEl = document.getElementById('status');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = 'Sending...';
    const formData = {
      name: contactForm.name.value.trim(),
      email: contactForm.email.value.trim(),
      message: contactForm.message.value.trim()
    };
    // basic validation
    if (!formData.name || !formData.email || !formData.message) {
      statusEl.textContent = 'Please complete all fields.';
      return;
    }

    try {
      const r = await fetch('/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await r.json();
      statusEl.textContent = data.message || (r.ok ? 'Message sent!' : 'Failed to send');
      if (data.status === 'success') contactForm.reset();
    } catch (err) {
      console.error('Contact error', err);
      statusEl.textContent = 'Network error — try again later.';
    }
  });
}
