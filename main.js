// ═══ MODAL ═══
document.addEventListener('click', function(e) {
  const btn = e.target.closest('[data-modal]');
  if (btn) {
    const id = btn.dataset.modal;
    document.getElementById('modal-' + id).classList.add('active');
    document.getElementById('modal-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    return;
  }
  if (e.target.id === 'modal-overlay' || e.target.closest('.modal-close')) {
    closeModal();
  }
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

function closeModal() {
  document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ═══ NAV ═══
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.getElementById('navLinks');

if (navToggle) {
  navToggle.addEventListener('click', function() {
    navLinks.classList.toggle('open');
  });
}

document.querySelectorAll('.nav-links a').forEach(function(link) {
  link.addEventListener('click', function() {
    navLinks.classList.remove('open');
  });
});

// ═══ SCROLL ═══
window.addEventListener('scroll', function() {
  const navbar = document.getElementById('navbar');
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
});
