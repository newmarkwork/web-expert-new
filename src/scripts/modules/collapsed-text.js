import { Modal } from '../classes/Modal';
import { limitStr } from '../helpers/utils/limitStr';

const collapsedItems = document.querySelectorAll('[data-collapsed-text]');

if (collapsedItems.length) {
  const reviewModal = document.querySelector('.review-modal');

  collapsedItems.forEach((item) => {
    item.innerHTML = limitStr(item.innerHTML, item.dataset.collapsedText);

    const length = item.innerHTML.length;

    if (length > item.dataset.collapsedText) {
      const showBtn = document.createElement('button');

      showBtn.innerHTML = item.dataset.collapsedBtnText;
      item.append(showBtn);

      showBtn.addEventListener('click', () => {
        reviewModal.querySelector('.modal-text').innerHTML =
          item.dataset.expandedText;
        new Modal(reviewModal).show();
      });
    }
  });
}
