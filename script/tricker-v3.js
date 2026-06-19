const width = window.innerWidth;

const css = `
  @keyframes ticker-move-right {
  0% {
    transform: translateX(0);
    -webkit-transform: translateX(0);
  }
  100% {
    transform: translateX(-${700}%);
  }
}

@keyframes ticker-move-left {
    0% {
        transform: translateX(-${700}%);
        -webkit-transform: translateX(-${700}%);
    }
    100% {
        transform: translateX(0);
        -webkit-transform: translateX(0);
    }
}

.ticker {
    display: inline-block;
    animation: ticker-move-left 250s linear infinite; /* Adjust duration as needed */
}
`;

function adjustTicker() {
  const style = document.createElement('style');
  style.type = 'text/css';
  const tickerTracks = document.querySelectorAll('.ticker-track');
  const iconSize = document.querySelectorAll('.ticker-icon-size');

  // Adjust animation duration and icon size
  if (width > 1920) {
    tickerTracks.forEach((tickerTrack) => {
      tickerTrack.style.animationDuration = '210s'; // Set the desired duration
    });
    iconSize.forEach((icon) => (icon.style.fontSize = '30px'));
  } else if (width > 1200) {
    tickerTracks.forEach((tickerTrack) => {
      tickerTrack.style.animationDuration = '140s'; // Set the desired duration
    });
    iconSize.forEach((icon) => (icon.style.fontSize = '28px'));
  } else if (width > 768) {
    tickerTracks.forEach((tickerTrack) => {
      tickerTrack.style.animationDuration = '90s'; // Set the desired duration
    });
    iconSize.forEach((icon) => (icon.style.fontSize = '24px'));
  } else {
    tickerTracks.forEach((tickerTrack) => {
      tickerTrack.style.animationDuration = '60s'; // Set the desired duration
    });
    iconSize.forEach((icon) => (icon.style.fontSize = '20px'));
  }

  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
}

// Initial adjustment
adjustTicker();

// Adjust on resize
window.addEventListener('resize', adjustTicker);
