const accordeons = document.querySelectorAll('.main-accordeon');

if (accordeons) {
  accordeons.forEach((accordeon) => {
    const headers = accordeon.querySelectorAll('.main-accordeon__item-header');

    const onClickHandler = (evt) => {
      const isOpened = !evt.currentTarget.classList.contains('collapsed');

      headers.forEach((header) => {
        !header.classList.contains('collapsed')
          ? header.classList.add('collapsed')
          : null;
      });

      isOpened
        ? evt.currentTarget.classList.add('collapsed')
        : evt.currentTarget.classList.remove('collapsed');
    };

    headers.forEach((header) => {
      header.addEventListener('click', onClickHandler);
    });
  });
}
