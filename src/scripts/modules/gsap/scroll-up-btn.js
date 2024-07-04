import { gsap } from 'gsap';

window.addEventListener('load', () => {
  const btn = document.createElement('button');
  btn.classList.add('scroll-up-btn');
  btn.innerHTML =
    '<svg width="16" height="16"><use xlink:href="../assets/svg-sprite.svg#icon-up"></use></svg>';

  const svg = btn.querySelector('svg');
  gsap.set(svg, { fill: 'var(--white)' });
  gsap.set(btn, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed',
    bottom: '40px',
    right: '40px',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'var(--primary)',
    zIndex: 89,
    mixBlendMode: 'multiply',
    padding: '5px',
    border: 'none',
    transform: 'translateY(150px)',
  });

  document.body.append(btn);

  let isActive = false;
  window.addEventListener('scroll', () => {
    const fullHeight = document.documentElement.clientHeight;
    const pageHeight = document.documentElement.clientHeight;

    if (window.scrollY > pageHeight * 1.3) {
      if (!isActive) {
        isActive = true;
        gsap.fromTo(
          btn,
          {
            y: '150px',
          },
          {
            y: '0',
            duration: 0.7,
            ease: 'back',
          }
        );
      }
    } else {
      if (isActive) {
        isActive = false;
        gsap.fromTo(
          btn,
          {
            y: '0',
          },
          {
            y: '150px',
            duration: 0.5,
            ease: 'linear',
          }
        );
      }
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
