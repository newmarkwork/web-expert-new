const items = document.querySelectorAll(".service-stuff__list-item");

if (items) {
  const isOdd = items.length % 2 === 1 ? true : false;

  const setClass = (item, type = null) => {
    item.classList.add("service-stuff__list-item--related");

    if (type && type === "top") {
      item.classList.add("service-stuff__list-item--related-position-top");
    }

    if (type && type === "right") {
      item.classList.add("service-stuff__list-item--related-position-right");
    }
  };

  if (items.length === 2) {
    setClass(items[0], "right");
  } else {
    for (let i = 2; i < items.length - 1; i++) {
      if (i % 2 === 0) {
        setClass(items[i]);
      }
    }

    if (isOdd && items.length !== 1) {
      setClass(items[items.length - 1], "top");
    }
  }
}
