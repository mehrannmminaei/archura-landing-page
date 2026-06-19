const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');
const header = document.querySelector('header');
const desktopDropdowns = document.querySelectorAll('.dropdown.desktop');
const legacyMobileDropdowns = document.querySelectorAll('.dropdown.mobile');

mobileMenu?.addEventListener('click', () => {
  mobileMenu.classList.toggle('active');
  navLinks?.classList.toggle('active');
  header?.classList.toggle('header-background');
});

function closeDesktopDropdowns() {
  desktopDropdowns.forEach((item) => item.classList.remove('active'));
}

desktopDropdowns.forEach((item) => {
  const trigger = item.querySelector(':scope > a');
  if (!trigger) return;

  trigger.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) return;

    e.preventDefault();
    e.stopPropagation();

    const willOpen = !item.classList.contains('active');
    closeDesktopDropdowns();
    if (willOpen) {
      item.classList.add('active');
    }
  });
});

document.addEventListener('click', (e) => {
  if (window.innerWidth <= 768) return;
  if (!e.target.closest('.dropdown.desktop')) {
    closeDesktopDropdowns();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDesktopDropdowns();
  }
});

// Legacy mobile dropdown items (if present outside nnav accordion)
legacyMobileDropdowns.forEach((item) => {
  item.addEventListener('click', function (e) {
    if (window.innerWidth > 768) return;

    const trigger = this.querySelector(':scope > a');
    if (!trigger || !trigger.contains(e.target)) return;

    e.preventDefault();
    e.stopPropagation();

    legacyMobileDropdowns.forEach((other) => {
      if (other !== this) {
        other.classList.remove('active');
      }
    });

    this.classList.toggle('active');
  });
});
