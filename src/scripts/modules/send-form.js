import { Modal } from '../classes/Modal';
import { loader } from '../helpers/nodes';

const GOOGLE_CAPTHCA_V_3_SITE_KEY = '6Lf1HwgqAAAAABxriKXLHJLVus5dMHT7rZ3KAyLL';

export function sendForm(form) {
  const successModal = document.querySelector('.success-modal');
  const errorModal = document.querySelector('.error-modal');

  loader.classList.add('active');

  function hideLoader() {
    loader.classList.remove('active');
  }

  function success() {
    hideLoader();
    form.reset();

    const fileFields = document.querySelectorAll(
      '.file-attach-fake-control span'
    );

    if (fileFields.length) {
      fileFields.forEach((field) => {
        field.innerHTML = 'Прикрепить файл';
      });
    }

    const currentModal = form.closest('.modal');

    if (currentModal) {
      new Modal(currentModal).refresh();
    }

    setTimeout(() => {
      new Modal(successModal).show();
    }, 700);

    // if (dataLayer) {
    //   dataLayer.push({ event: "form-submit-event" });
    // }
  }

  function error() {
    hideLoader();
    new Modal(errorModal, {
      preventBodyLock: true,
    }).show();
  }

  // handle the form submission event

  grecaptcha.ready(function () {
    grecaptcha
      .execute(GOOGLE_CAPTHCA_V_3_SITE_KEY, { action: 'submit' })
      .then(function (token) {
        form.querySelector('.g-recaptcha-response').value = token;

        const data = new FormData(form);
        ajax(form.method, form.action, data, success, error);

        function ajax(method, url, data, success, error) {
          const xhr = new XMLHttpRequest();
          xhr.open(method, url);
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.onreadystatechange = function () {
            if (xhr.readyState !== XMLHttpRequest.DONE) return;
            if (xhr.status === 200) {
              success(xhr.response, xhr.responseType);
            } else {
              error(xhr.status, xhr.response, xhr.responseType);
            }
          };
          xhr.send(data);
        }
      });
  });
}
