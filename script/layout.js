const mobileMenu = document.querySelector(".mobile-menu");
const navLinks = document.querySelector(".nav-links");
const dropdownItems = document.querySelectorAll(".nav-links .dropdown");
const header = document.querySelector("header");
const navCta = document.querySelector(".nav-cta .btn");
// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    // Skip if it's a dropdown toggle on mobile
    if (
      window.innerWidth <= 768 &&
      this.parentElement.classList.contains("dropdown") &&
      !this.parentElement.classList.contains("active")
    ) {
      return;
    }

    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      mobileMenu.classList.remove("active");
      navLinks.classList.remove("active");

      window.scrollTo({
        top: target.offsetTop - 60,
        behavior: "smooth",
      });
    }
  });
});

// Header behavior on scroll
function handleScroll() {
  if (!header) return;

  const scrollPosition = window.scrollY;
  const isMobile = window.innerWidth <= 768;

  if (navCta) {
    if (isMobile) {
      navCta.classList.add('get-in-touch');
    }

    if (scrollPosition > 300) {
      header.classList.add('scrolled');
      if (!isMobile) {
        navCta.style.display = 'block';
      }
    } else {
      header.classList.remove('scrolled');
      if (!isMobile) {
        navCta.style.display = 'none';
      }
    }
  } else if (scrollPosition > 300) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

window.addEventListener("scroll", handleScroll);
window.addEventListener("load", handleScroll);

// Animate elements on scroll
function animateOnScroll() {
  const elements = document.querySelectorAll(
    ".service-card, .industry-item, .about-image, .about-text, .contact-form, .contact-info"
  );

  elements.forEach((element) => {
    const elementPosition = element.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (elementPosition < windowHeight - 100) {
      element.style.opacity = 1;
      element.style.transform = "translateY(0)";
    }
  });
}

// Set initial state for animations
document
  .querySelectorAll(
    ".service-card, .about-image, .about-text, .contact-form, .contact-info"
  )
  .forEach((element) => {
    element.style.opacity = 0;
    element.style.transform = "translateY(30px)";
    element.style.transition = "all 0.6s ease";
  });

// Run on scroll and on page load
window.addEventListener("scroll", animateOnScroll);
window.addEventListener("load", animateOnScroll);
