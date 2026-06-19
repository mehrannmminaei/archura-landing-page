// Form Submission
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    grecaptcha.ready(function () {
      grecaptcha
        .execute('6LetfScrAAAAAC2pwmu-SOPuJyH0JABL7EgSrJtu', {
          action: 'submit',
        })
        .then(function (token) {
          // Create Page Name
          const currentUrl = window.location.href;
          const url = new URL(currentUrl);
          const pathname = url.pathname;
          const pageName = pathname.split('/').pop().split('.')[0];
          const formattedPageName =
            pageName.charAt(0).toUpperCase() + pageName.slice(1);

          const data = {
            'g-recaptcha-response': token,
            pageName: formattedPageName === '' ? 'index' : formattedPageName,
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            company: document.getElementById('message').value,
            message: document.getElementById('message').value,
          };

          fetch('https://lpapi.archuramedia.com/contact', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })
            .then((response) => {
              response.json();
              contactForm.innerHTML = `
                    <div style="text-align: center; padding: 30px 0;">
                        <div style="font-size: 40px; margin-bottom: 20px;">✅</div>
                        <h3 style="margin-bottom: 15px; color: #fff;">Message Sent Successfully!</h3>
                        <p style="color: #aaa;">Thank you for contacting Archura Media. We'll get back to you shortly.</p>
                    </div>
                `;
            })
            .then((data) => console.log(data))
            .catch((error) => console.error('Error:', error));

          // Show success message
        });
    });
    // In a real implementation, you would send the form data to a server
    // This is just a simulation
  });
}

function scrollToElement() {
  let offset = -430;
  if (window.innerWidth <= 1200) {
    offset = -430;
  } else {
    offset = 0;
  }
  const element = document.getElementById('contact');

  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth', // Smooth scrolling
  });
}

window.addEventListener('load', function() {
  const badge = document.querySelector('.grecaptcha-badge');
  if (badge) badge.style.display = 'none';
});