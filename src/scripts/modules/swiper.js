import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

const sliders = document.querySelectorAll('.main-slider');

if (sliders.length) {
  sliders.forEach((slider) => {
    const pagination = slider.querySelector('.swiper-pagination');
    const prevEl = slider.parentNode.querySelector('.swiper-button-prev');
    const nextEl = slider.parentNode.querySelector('.swiper-button-next');

    new Swiper(slider, {
      modules: [Navigation, Pagination],
      slidesPerView: 'auto',
      spaceBetween: '30',

      navigation: {
        nextEl: nextEl ? nextEl : null,
        prevEl: prevEl ? prevEl : null,
      },

      pagination: {
        el: pagination ? pagination : null,
        dynamicBullets: true,
        clickable: true,
      },
    });
  });
}

const heroSlider = document.querySelector('.hero-slider');

if (heroSlider) {
  const pagination = heroSlider.querySelector('.hero-slider .pagination');

  new Swiper(heroSlider, {
    modules: [Pagination],
    slidesPerView: 1,
    // spaceBetween: 10,

    pagination: {
      el: pagination ? pagination : null,
      // dynamicBullets: true,
      clickable: true,
    },
  });
}
