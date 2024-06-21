const sections = document.querySelectorAll(".grid-section");

if (sections) {
  const _LINES_COUNT = 4;

  const fillLines = (parentNode, offset, nodeWidth) => {
    const isExist = parentNode.querySelector(".grid-section-line");

    if (isExist === null) {
      for (let i = 0; i < _LINES_COUNT; i++) {
        const line = document.createElement("div");
        line.classList.add("grid-section-line");
        parentNode.append(line);
      }
    }

    calculateLinePos(parentNode, nodeWidth, offset);
  };

  const calculateLinePos = (parentNode, nodeWidth, offset) => {
    const lines = parentNode.querySelectorAll(".grid-section-line");

    lines.forEach((line, i) => {
      i === 0
        ? (line.style.left = offset)
        : i === 1
        ? (line.style.left = `${nodeWidth / (_LINES_COUNT - 1)}px`)
        : i === 2
        ? (line.style.right = `${nodeWidth / (_LINES_COUNT - 1)}px`)
        : i === 3
        ? (line.style.right = offset)
        : null;
    });
  };

  const calculateLineProps = () => {
    sections.forEach((section) => {
      const container = section.querySelector(".container");
      const nodeWidth = container.getBoundingClientRect().width;
      const offset = getComputedStyle(container).paddingLeft;

      fillLines(section, offset, nodeWidth);
    });
  };

  calculateLineProps();

  window.addEventListener("resize", calculateLineProps);
}
