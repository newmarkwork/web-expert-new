const openers = document.querySelectorAll('.nested-list-opener');

if (openers.length) {
  openers.forEach((opener) => {
    opener.addEventListener('click', (evt) => {
      const target = evt.currentTarget;
      target.parentNode.classList.toggle('expanded');
    });
  });
}
