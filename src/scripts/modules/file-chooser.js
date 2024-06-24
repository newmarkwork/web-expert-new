const controls = document.querySelectorAll('input[type="file"]');

if (controls.length) {
  const onClickAddFile = (evt) => {
    const target = evt.currentTarget;
    const filename = target.files[0].name;
    const fakeControl = target.parentNode.querySelector(
      ".file-attach-fake-control span"
    );
    fakeControl.innerHTML = filename;
  };

  controls.forEach((ctrl) => {
    ctrl.addEventListener("change", onClickAddFile);
  });
}
