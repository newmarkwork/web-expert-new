import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const section = document.querySelector('.faq');

if (section) {
  const topLine = document.createElement('span');
  const bottomLine = document.createElement('span');

  gsap.set(section, {
    position: 'relative',
    paddingTop: 'clamp(60px, 10vw, 160px)',
    paddingBottom: 'clamp(120px, 18vw, 160px)',
    overflow: 'hidden',
  });

  gsap.set(topLine, {
    position: 'absolute',
    top: 0,
    right: '-100vw',
    innerHTML: 'Вопрос',
    fontSize: 'clamp(100px, 36vw, 320px)',
    lineHeight: '1',
    fontWeight: '600',
    willChange: 'scroll-position',
    color: '#fafafa',
    zIndex: '-1',
  });

  gsap.set(bottomLine, {
    position: 'absolute',
    bottom: 0,
    left: '-100vw',
    innerHTML: 'Ответ',
    fontSize: 'clamp(100px, 36vw, 320px)',
    lineHeight: '1',
    fontWeight: '600',
    willChange: 'scroll-position',
    color: '#fafafa',
    zIndex: '-1',
  });

  section.append(topLine, bottomLine);

  gsap.to(topLine, {
    scrollTrigger: {
      trigger: '.faq',
      start: 'top center',
      scrub: true,
      end: '+=3000',
    },

    right: '100vw',
  });

  gsap.to(bottomLine, {
    scrollTrigger: {
      trigger: '.faq',
      start: 'center bottom',
      scrub: true,
      end: '+=3000',
      // markers: true,
    },

    left: '100vw', // x ????
  });
}
