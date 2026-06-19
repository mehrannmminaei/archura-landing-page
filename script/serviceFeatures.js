// JavaScript to handle the services slider functionality NOT USE
document.addEventListener("DOMContentLoaded", function () {
  // Services slider functionality
  const slider = document.querySelector(".features-slider");
  const slides = document.querySelectorAll(".feature-slide");
  const prevButton = document.querySelector(".slider-prev");
  const nextButton = document.querySelector(".slider-next");
  const dotsContainer = document.querySelector(".slider-dots");

  if (!slider || !slides.length) return;

  let currentSlide = 0;
  const slideCount = slides.length;

  // Set initial position
  updateSlider();

  // Enable swipe functionality for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  slider.addEventListener(
    "touchend",
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

  function updateSlider() {
    // Update slider position
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Update dots
    document.querySelectorAll(".slider-dot").forEach((dot, index) => {
      dot.classList.toggle("active", index === currentSlide);
    });
  }
});
