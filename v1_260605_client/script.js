const revealItems = document.querySelectorAll(".reveal:not(.image-four-rise):not(.dark-slide)");
const imageFour = document.querySelector(".image-four-rise");
const imageFourSection = document.querySelector(".system-image-section");
const templateSection = document.querySelector("#template");
const insightSection = document.querySelector("#insight");
const horizontalCoverSections = document.querySelectorAll(".horizontal-cover");

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

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const syncTemplateImageHeights = () => {
  const isSingleColumn = window.matchMedia("(max-width: 820px)").matches;

  if (!templateSection) return;

  const firstCopy = templateSection.querySelector(":scope > .copy:first-child");
  const firstImage = templateSection.querySelector(":scope > .image-card:nth-of-type(1)");
  const secondImage = templateSection.querySelector(":scope > .image-card:nth-of-type(2)");
  const secondCopy = templateSection.querySelector(":scope > .copy:last-child");

  if (!firstCopy || !firstImage || !secondImage || !secondCopy) return;

  if (isSingleColumn) {
    firstImage.style.height = "";
    secondImage.style.height = "";
    return;
  }

  firstImage.style.height = `${Math.ceil(firstCopy.getBoundingClientRect().height)}px`;
  secondImage.style.height = `${Math.ceil(secondCopy.getBoundingClientRect().height)}px`;
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

const updateImageFourRise = () => {
  if (!imageFour || !imageFourSection) return;

  const rect = imageFourSection.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const start = viewportHeight * 2.5;
  const end = viewportHeight * 0.15;
  const progress = clamp((start - rect.top) / (start - end), 0, 1);
  const translateY = (1 - progress) * viewportHeight;

  imageFour.style.transform = `translateY(${translateY}px)`;
};

const updateHorizontalCovers = () => {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const holdDistance = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--full-image-hold")) || 600;

  horizontalCoverSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const nextSection = section.nextElementSibling;
    const nextTop = nextSection ? nextSection.getBoundingClientRect().top : viewportHeight;
    const isDarkArgument = section.classList.contains("dark-argument-section");
    const coverStartOffset = isDarkArgument ? 1800 : holdDistance;
    const coverDistance = isDarkArgument ? 620 : holdDistance;
    const progress = rect.top > 0
      ? 0
      : clamp((viewportHeight + coverStartOffset - nextTop) / coverDistance, 0, 1);
    const translateX = (1 - progress) * 100;

    section.style.setProperty("--cover-x", `${translateX}vw`);

    if (isDarkArgument) {
      const coveredProgress = rect.top > 0
        ? 0
        : clamp((viewportHeight + coverStartOffset - coverDistance - nextTop) / viewportHeight, 0, 1);

      section.classList.toggle("is-title-visible", progress > 0.08);
      section.classList.toggle("is-body-one-visible", progress >= 1 && coveredProgress > 0.05);
      section.classList.toggle("is-body-two-visible", progress >= 1 && coveredProgress > 0.48);
    }
  });
};

let ticking = false;

const requestScrollUpdate = () => {
  if (ticking) return;

  ticking = true;
  requestAnimationFrame(() => {
    updateImageFourRise();
    updateHorizontalCovers();
    ticking = false;
  });
};

const updateLayout = () => {
  syncPairedImageHeights();
  requestScrollUpdate();
};

if (document.fonts) {
  document.fonts.ready.then(syncPairedImageHeights);
}

if ("ResizeObserver" in window) {
  const pairedImageResizeObserver = new ResizeObserver(syncPairedImageHeights);

  [templateSection, insightSection].forEach((section) => {
    if (!section) return;
    section.querySelectorAll(":scope > .copy").forEach((copy) => {
      pairedImageResizeObserver.observe(copy);
    });
  });
}

window.addEventListener("load", syncPairedImageHeights);
window.addEventListener("resize", updateLayout);
syncPairedImageHeights();
updateImageFourRise();
updateHorizontalCovers();
window.addEventListener("scroll", requestScrollUpdate, { passive: true });
