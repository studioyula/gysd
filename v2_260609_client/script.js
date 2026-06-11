const revealItems = document.querySelectorAll(".reveal, .hero-section-reveal, .quote-text-reveal");
const templateSection = document.querySelector("#template");
const insightSection = document.querySelector("#insight");
const templateTransitionStage = document.querySelector(".template-transition-stage");
const templateTransitionTitle = document.querySelector(".template-transition-title .quote-heading");
const templateTransitionContent = document.querySelector(".template-transition-content .template-row");
const templateToSystemStage = document.querySelector(".template-to-system-stage");
const templateToSystemSticky = document.querySelector(".template-to-system-sticky");
const templateReadTitle = document.querySelector(".template-read-title");
const templateFrameExit = document.querySelector(".template-frame-exit");
const templateSystemEnter = document.querySelector(".template-system-enter");
const imageFour = document.querySelector(".image-four-rise");
const imageFourSection = document.querySelector(".image-four-section");

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
  const delay = item.classList.contains("hero-section-reveal")
    ? 280
    : Math.min(index % 3, 2) * 90;

  item.style.transitionDelay = `${delay}ms`;

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

  const image = insightSection.querySelector(":scope > .image-card");

  if (image) image.style.height = "";
};

const syncPairedImageHeights = () => {
  syncTemplateImageHeights();
  syncInsightImageHeight();
};

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

const updateTemplateTransition = () => {
  if (!templateTransitionStage || !templateTransitionTitle || !templateTransitionContent) return;

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const stageRect = templateTransitionStage.getBoundingClientRect();
  const scrollDistance = Math.max(templateTransitionStage.offsetHeight - viewportHeight, 1);
  const progress = clamp((0 - stageRect.top) / scrollDistance);
  const titleProgress = clamp((progress - .06) / .32);
  const contentProgress = clamp((progress - .5) / .46);
  const titleOpacity = 1 - titleProgress;

  templateTransitionTitle.style.opacity = titleOpacity.toFixed(3);
  templateTransitionTitle.style.transform = `translate3d(0, ${(-18 * titleProgress).toFixed(2)}px, 0)`;
  templateTransitionContent.style.opacity = contentProgress.toFixed(3);
  templateTransitionContent.style.transform = "translate3d(0, 0, 0)";
};

const mix = (start, end, progress) => start + (end - start) * progress;

const updateTemplateToSystemTransition = () => {
  if (!templateToSystemStage || !templateToSystemSticky || !templateReadTitle || !templateFrameExit || !templateSystemEnter) return;

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const stageRect = templateToSystemStage.getBoundingClientRect();
  const scrollDistance = Math.max(templateToSystemStage.offsetHeight - viewportHeight, 1);
  const progress = clamp((0 - stageRect.top) / scrollDistance);
  const readEnterProgress = clamp((progress - .06) / .14);
  const readExitProgress = clamp((progress - .36) / .14);
  const frameEnterProgress = clamp((progress - .56) / .14);
  const frameExitProgress = clamp((progress - .8) / .12);
  const bgProgress = clamp((progress - .9) / .06);
  const enterProgress = clamp((progress - .955) / .045);
  const bgValue = Math.round(mix(255, 17, bgProgress));

  templateReadTitle.style.opacity = (readEnterProgress * (1 - readExitProgress)).toFixed(3);
  templateReadTitle.style.transform = "translate3d(0, 0, 0)";
  templateFrameExit.style.opacity = (frameEnterProgress * (1 - frameExitProgress)).toFixed(3);
  templateFrameExit.style.transform = "translate3d(0, 0, 0)";
  templateToSystemSticky.style.backgroundColor = `rgb(${bgValue}, ${bgValue}, ${bgValue})`;
  templateSystemEnter.style.opacity = enterProgress.toFixed(3);
  templateSystemEnter.style.transform = "translate3d(0, 0, 0)";
};

const updateImageFourRise = () => {
  if (!imageFour || !imageFourSection) return;

  const rect = imageFourSection.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const start = viewportHeight * 2.5;
  const end = viewportHeight * .15;
  const progress = clamp((start - rect.top) / (start - end));
  const translateY = (1 - progress) * viewportHeight;

  imageFour.style.transform = `translate3d(0, ${translateY}px, 0)`;
};

const updateLayout = () => {
  syncPairedImageHeights();
  updateTemplateTransition();
  updateTemplateToSystemTransition();
  updateImageFourRise();
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
window.addEventListener("scroll", () => {
  updateTemplateTransition();
  updateTemplateToSystemTransition();
  updateImageFourRise();
}, { passive: true });
syncPairedImageHeights();
updateTemplateTransition();
updateTemplateToSystemTransition();
updateImageFourRise();
initTypingEffect();
