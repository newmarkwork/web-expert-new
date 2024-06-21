import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const items = gsap.utils.toArray(".service-content__list-item");

if (items.length) {
  ScrollTrigger.refresh();
  ScrollTrigger.batch(items, {
    onEnter: (elements) => {
      gsap.from(elements, {
        autoAlpha: 0,
        y: 100,
        stagger: 0.25,
      });
    },
  });
}
