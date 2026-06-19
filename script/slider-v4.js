// Set initial state for animations
document
  .querySelectorAll(
    '.service-card, .about-image, .about-text, .contact-form, .contact-info'
  )
  .forEach((element) => {
    element.style.opacity = 0;
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'all 0.6s ease';
  });

// Run on scroll and on page load
window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// JavaScript to handle the services slider functionality
document.addEventListener('DOMContentLoaded', function () {
  // Services slider functionality
  const slider = document.querySelector('.services-slider');
  const slides = document.querySelectorAll('.service-slide');
  const prevButton = document.querySelector('.slider-prev');
  const nextButton = document.querySelector('.slider-next');
  const dotsContainer = document.querySelector('.slider-dots');

  if (!slider || !slides.length) return;

  let currentSlide = 0;
  const slideCount = slides.length;

  // Create dots based on number of slides
  for (let i = 0; i < slideCount; i++) {
    const dot = document.createElement('div');
    dot.classList.add('slider-dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    // dotsContainer.appendChild(dot);
  }

  // Set initial position
  updateSlider();

  // Add event listeners for controls
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + slideCount) % slideCount;
      updateSlider();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % slideCount;
      updateSlider();
    });
  }

  // Enable swipe functionality for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  slider.addEventListener(
    'touchend',
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    },
    { passive: true }
  );

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchStartX - touchEndX > swipeThreshold) {
      // Swipe left - next slide
      currentSlide = (currentSlide + 1) % slideCount;
      updateSlider();
    } else if (touchEndX - touchStartX > swipeThreshold) {
      // Swipe right - previous slide
      currentSlide = (currentSlide - 1 + slideCount) % slideCount;
      updateSlider();
    }
  }

  function goToSlide(index) {
    currentSlide = index;
    updateSlider();
  }

  function updateSlider() {
    // Update slider position
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Update dots
    document.querySelectorAll('.slider-dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });
  }

  // Auto-advance slides every 5 seconds
  let autoSlideInterval = setInterval(() => {
    currentSlide = (currentSlide + 1) % slideCount;
    updateSlider();
  }, 5000);

  // Pause auto-advance when user interacts with slider
  slider.addEventListener('mouseover', () => {
    clearInterval(autoSlideInterval);
  });

  slider.addEventListener('mouseout', () => {
    autoSlideInterval = setInterval(() => {
      currentSlide = (currentSlide + 1) % slideCount;
      updateSlider();
    }, 5000);
  });
});

var flag = 0;

window.onload = function () {
  const carts = document.querySelectorAll('.service-card');
  let maxHeight = 0;
  // Find the tallest cart
  carts.forEach((cart) => {
    const cartHeight = cart.offsetHeight;
    if (cartHeight > maxHeight) {
      maxHeight = cartHeight;
    }
  });

  // Set all carts to the tallest height
  carts.forEach((cart) => {
    cart.style.minHeight = parseInt(maxHeight) + 'px';
  });
};

function setEqualHeight() {
  const carts = document.querySelectorAll('.service-card');
  let maxHeight = 0;

  carts.forEach((cart) => {
    cart.style.height = 'auto';
    cart.style.minHeight = '0px';
  });

  carts.forEach((cart) => {
    const cartHeight = cart.getBoundingClientRect().height;

    if (cartHeight > maxHeight) {
      maxHeight = cartHeight;
    }
  });

  // Set all carts to the tallest height
  carts.forEach((cart) => {
    cart.style.height = maxHeight + 'px';
  });
}

window.onresize = function () {
  requestAnimationFrame(setEqualHeight);
};
