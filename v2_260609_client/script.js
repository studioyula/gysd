const revealItems = document.querySelectorAll(".reveal");
const templateSection = document.querySelector("#template");
const insightSection = document.querySelector("#insight");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px",
  }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 3, 2) * 90}ms`;

  revealObserver.observe(item);
});

const syncTemplateImageHeights = () => {
  if (!templateSection) return;

  templateSection.querySelectorAll(".template-row .image-card").forEach((image) => {
    image.style.height = "";
  });
};

const syncInsightImageHeight = () => {
  if (!insightSection) return;

  const isSingleColumn = window.matchMedia("(max-width: 820px)").matches;
  const copy = insightSection.querySelector(":scope > .copy:first-child");
  const image = insightSection.querySelector(":scope > .image-card");

  if (!copy || !image) return;

  if (isSingleColumn) {
    image.style.height = "";
    return;
  }

  image.style.height = `${Math.ceil(copy.getBoundingClientRect().height)}px`;
};

const syncPairedImageHeights = () => {
  syncTemplateImageHeights();
  syncInsightImageHeight();
};

const updateLayout = () => {
  syncPairedImageHeights();
};

const initTypingEffect = () => {
  const typingTitle = document.querySelector(".typing-title");

  if (!typingTitle) return;

  const items = Array.from(typingTitle.querySelectorAll(".typing-item"));
  const words = items.map((item) => item.querySelector(".typing-word"));
  const dot = typingTitle.querySelector(".typing-dot");
  const slotDuration = 2200;
  const revealDuration = 560;
  const holdDuration = 700;
  const totalDuration = slotDuration * items.length;

  if (!items.length || !dot) return;

  const ease = (value) => {
    return value < 0.5
      ? 4 * value * value * value
      : 1 - Math.pow(-2 * value + 2, 3) / 2;
  };

  const setWordWidths = () => {
    items.forEach((item) => {
      const word = item.querySelector(".typing-word");
      item.dataset.wordWidth = word.offsetWidth;
    });
  };

  const drawFrame = (time) => {
    const cycleTime = time % totalDuration;
    const activeIndex = Math.floor(cycleTime / slotDuration);
    const localTime = cycleTime - activeIndex * slotDuration;
    const activeItem = items[activeIndex];
    const activeWord = words[activeIndex];
    const wordWidth = Number(activeItem.dataset.wordWidth) || activeWord.offsetWidth;
    let dotX = wordWidth;
    let dotOpacity = 1;

    words.forEach((word) => {
      word.style.clipPath = "inset(-50% 100% -50% 0%)";
    });

    if (localTime < revealDuration) {
      const revealProgress = ease(localTime / revealDuration);
      dotX = wordWidth * revealProgress;
      activeWord.style.clipPath = `inset(-50% ${100 - revealProgress * 100}% -50% 0%)`;
    } else if (localTime < revealDuration + holdDuration) {
      activeWord.style.clipPath = "inset(-50% 0% -50% 0%)";
    } else {
      const hideProgress = ease((localTime - revealDuration - holdDuration) / (slotDuration - revealDuration - holdDuration));
      dotOpacity = 1 - hideProgress;
      activeWord.style.clipPath = `inset(-50% 0% -50% ${hideProgress * 100}%)`;
    }

    dot.style.opacity = dotOpacity;
    dot.style.transform = `translate3d(${dotX}px, 0, 0)`;

    requestAnimationFrame(drawFrame);
  };

  if (document.fonts) {
    document.fonts.ready.then(setWordWidths);
  }

  setWordWidths();
  window.addEventListener("resize", setWordWidths);
  requestAnimationFrame(drawFrame);
};

if (document.fonts) {
  document.fonts.ready.then(syncPairedImageHeights);
}

if ("ResizeObserver" in window) {
  const pairedImageResizeObserver = new ResizeObserver(syncPairedImageHeights);

  [templateSection, insightSection].forEach((section) => {
    if (!section) return;
    section.querySelectorAll(".copy").forEach((copy) => {
      pairedImageResizeObserver.observe(copy);
    });
  });
}

window.addEventListener("load", syncPairedImageHeights);
window.addEventListener("resize", updateLayout);
syncPairedImageHeights();
initTypingEffect();
