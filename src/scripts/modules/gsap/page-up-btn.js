import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const btn = document.querySelector(".page-up-btn");

if (btn) {
  btn.addEventListener("click", () => {
    gsap.to(window, { duration: 2, scrollTo: 0 });
  });

  let media = gsap.matchMedia();

  media.add("(min-width: 1639px)", () => {
    gsap.to(btn, {
      scrollTrigger: {
        // trigger: ".page-head-section",
        // start: "top top",
        // start: () => `+=${window.innerHeight / 3} +=${window.innerHeight / 3}`,
        // end: "bottom bottom",
        scrub: true,
        // markers: true,
      },

      width: "285px",
      rotate: 0,
    });
  });
}

gsap.to(btn, {
  scrollTrigger: {
    // trigger: ".page-head-section",
    // start: "top top",
    // start: () => `+=${window.innerHeight / 3} +=${window.innerHeight / 3}`,
    // end: "bottom bottom",
    scrub: true,
    // markers: true,
  },

  opacity: 1,
  visibility: "visible",
});
