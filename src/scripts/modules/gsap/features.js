import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const features = document.querySelector(".features");

if(features) {
  gsap.to(".features", {
    scrollTrigger: {
      trigger: ".hero",
      start: "center center",
      scrub: true,
      // markers: true,
    },

    y: 75,
  });
}
