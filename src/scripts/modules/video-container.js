document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.hero');

  if (hero) {
    const video = document.createElement('video');
    const container = document.querySelector('#video-container');

    video.setAttribute('preload', 'auto');
    video.setAttribute('muted', 'muted');
    video.setAttribute('loop', 'loop');
    video.setAttribute('playsinline', 'playsinline');
    video.setAttribute('autoplay', 'autoplay');
    video.setAttribute('src', container.dataset.src);

    container.append(video);
  }
});
