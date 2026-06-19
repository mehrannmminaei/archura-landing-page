document.addEventListener("DOMContentLoaded", function () {
  const navItems = document.querySelectorAll(".solution-nav-item");
  const contentPanels = document.querySelectorAll(".solution-content-panel");

  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remove active class from all nav items
      navItems.forEach((nav) => nav.classList.remove("active"));

      // Add active class to clicked nav item
      this.classList.add("active");

      // Get target panel
      const target = this.getAttribute("data-target");

      // Hide all content panels
      contentPanels.forEach((panel) => {
        panel.classList.remove("active");
      });

      // Show target panel
      document.getElementById(target).classList.add("active");
    });
  });
});
