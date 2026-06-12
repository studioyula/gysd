const revealItems = document.querySelectorAll(".reveal, .hero-section-reveal, .quote-text-reveal, .section-body-reveal");
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
const imageFive = document.querySelector(".image-five-rise");
const imageFiveSection = document.querySelector(".image-five-section");
const imageFour = document.querySelector(".image-four-rise");
const imageFourSection = document.querySelector(".image-four-section");
const insightTransitionStage = document.querySelector(".insight-transition-stage");
const insightTransitionTitle = document.querySelector(".insight-transition-sticky .insight-title-section .quote-heading");
const argumentCurlStage = document.querySelector(".argument-curl-stage");
const argumentCurlFront = document.querySelector(".argument-curl-front");
const argumentCurlBack = document.querySelector(".argument-curl-back");
const argumentCurlCanvas = document.querySelector("#argumentCurlCanvas");

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
  const delay = item.classList.contains("section-body-reveal")
    ? null
    : item.classList.contains("hero-section-reveal")
    ? 280
    : Math.min(index % 3, 2) * 90;

  if (delay !== null) item.style.transitionDelay = `${delay}ms`;

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
  const titleProgress = clamp((progress - .05) / .28);
  const contentEnterProgress = clamp((progress - .32) / .16);
  const contentExitProgress = clamp((progress - .92) / .20);
  const contentOpacity = contentEnterProgress * (1 - contentExitProgress);
  const titleOpacity = 1 - titleProgress;

  templateTransitionTitle.style.opacity = titleOpacity.toFixed(3);
  templateTransitionTitle.style.transform = "translate3d(0, 0, 0)";
  templateTransitionContent.style.opacity = contentOpacity.toFixed(3);
  templateTransitionContent.style.transform = "translate3d(0, 0, 0)";
};

const mix = (start, end, progress) => start + (end - start) * progress;

const updateTemplateToSystemTransition = () => {
  if (!templateToSystemStage || !templateToSystemSticky || !templateReadTitle || !templateFrameExit || !templateSystemEnter) return;

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const stageRect = templateToSystemStage.getBoundingClientRect();
  const scrollDistance = Math.max(templateToSystemStage.offsetHeight - viewportHeight, 1);
  const progress = clamp((0 - stageRect.top) / scrollDistance);
  const readEnterProgress = clamp((progress - .00) / .06);
  const readExitProgress = clamp((progress - .34) / .16);
  const frameEnterProgress = clamp((progress - .48) / .18);
  const frameExitProgress = clamp((progress - .84) / .08);
  const bgProgress = clamp((progress - .88) / .06);
  const enterProgress = clamp((progress - .94) / .04);
  const bgValue = Math.round(mix(255, 17, bgProgress));

  templateReadTitle.style.opacity = (readEnterProgress * (1 - readExitProgress)).toFixed(3);
  templateReadTitle.style.transform = "translate3d(0, 0, 0)";
  templateFrameExit.style.opacity = (frameEnterProgress * (1 - frameExitProgress)).toFixed(3);
  templateFrameExit.style.transform = "translate3d(0, 0, 0)";
  templateToSystemSticky.style.backgroundColor = `rgb(${bgValue}, ${bgValue}, ${bgValue})`;
  templateSystemEnter.style.opacity = enterProgress.toFixed(3);
  templateSystemEnter.style.transform = "translate3d(0, 0, 0)";
};

const updateImageCoverUp = (image, section) => {
  if (!section) return;

  const rect = section.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const start = viewportHeight * 2.5;
  const end = viewportHeight * .15;
  const progress = clamp((start - rect.top) / (start - end));
  const translateY = (1 - progress) * viewportHeight;

  section.style.transform = `translate3d(0, ${translateY}px, 0)`;
  if (image) image.style.transform = "translate3d(0, 0, 0)";
};

const updateImageCoverUps = () => {
  updateImageCoverUp(imageFive, imageFiveSection);
  updateImageCoverUp(imageFour, imageFourSection);
};

const updateInsightTransition = () => {
  if (!insightTransitionStage || !insightTransitionTitle || !insightSection) return;

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const stageRect = insightTransitionStage.getBoundingClientRect();
  const scrollDistance = Math.max(insightTransitionStage.offsetHeight - viewportHeight, 1);
  const progress = clamp((0 - stageRect.top) / scrollDistance);
  const titleExitProgress = clamp((progress - .18) / .22);
  const contentEnterProgress = clamp((progress - .48) / .24);

  insightTransitionTitle.style.opacity = (1 - titleExitProgress).toFixed(3);
  insightTransitionTitle.style.transform = "translate3d(0, 0, 0)";
  insightSection.style.opacity = contentEnterProgress.toFixed(3);
  insightSection.style.transform = "translate3d(0, 0, 0)";
};

let argumentCurlRenderer = null;
let argumentCurlReady = false;
const argumentCurlEnabled = false;

const updateArgumentCurl = () => {
  if (!argumentCurlStage || !argumentCurlFront || !argumentCurlBack) return;

  if (!argumentCurlEnabled) {
    argumentCurlFront.style.opacity = "1";
    argumentCurlFront.style.transform = "none";
    argumentCurlBack.style.opacity = "1";
    argumentCurlBack.style.transform = "none";
    if (argumentCurlCanvas) argumentCurlCanvas.style.opacity = "0";
    return;
  }

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const rect = argumentCurlStage.getBoundingClientRect();
  const travel = Math.max(argumentCurlStage.offsetHeight - viewportHeight, 1);
  const progress = clamp((0 - rect.top) / travel);
  const firstCurlProgress = clamp((progress - .18) / .30);
  const secondCurlProgress = clamp((progress - .62) / .30);
  const isSecondCurling = secondCurlProgress > 0 && secondCurlProgress < 1;
  const fallbackProgress = clamp((firstCurlProgress - .15) / .35);

  argumentCurlFront.style.opacity = (1 - fallbackProgress).toFixed(3);
  argumentCurlFront.style.transform = "translate3d(0, 0, 0)";
  argumentCurlBack.style.opacity = secondCurlProgress <= 0 ? fallbackProgress.toFixed(3) : "0";

  if (argumentCurlCanvas) argumentCurlCanvas.style.opacity = "0";

  if (argumentCurlRenderer) {
    argumentCurlRenderer.setMode(isSecondCurling ? "carToInsight" : "argumentToCar");
    argumentCurlRenderer.setProgress(isSecondCurling ? secondCurlProgress : firstCurlProgress);
  }
};

const updateLayout = () => {
  syncPairedImageHeights();
  updateTemplateTransition();
  updateTemplateToSystemTransition();
  updateImageCoverUps();
  updateInsightTransition();
  updateArgumentCurl();
};

const initTypingEffect = () => {
  const typingTitle = document.querySelector(".typing-title");

  if (!typingTitle) return;

  const items = Array.from(typingTitle.querySelectorAll(".typing-item"));
  const words = items.map((item) => item.querySelector(".typing-word"));
  const dot = typingTitle.querySelector(".typing-dot");
  const shatterStage = typingTitle.querySelector(".shatter-stage");
  const baseSlotDuration = 2200;
  const firstExitPause = 120;
  const firstHideSlowdown = 480;
  const slotDurations = [baseSlotDuration + firstExitPause + firstHideSlowdown, baseSlotDuration, baseSlotDuration];
  const revealDuration = 560;
  const holdDuration = 700;
  const hideDuration = baseSlotDuration - revealDuration - holdDuration;
  const totalDuration = slotDurations.reduce((sum, duration) => sum + duration, 0);
  const typingSection = typingTitle.closest(".typing-section");
  const shatterText = "버리고";
  const shatterPlan = [
    { clip: "polygon(-4% -6%, 15% -6%, 13% 31%, -4% 27%)", x: -24, y: 18, r: -6, d: 0.02 },
    { clip: "polygon(12% -6%, 29% -6%, 26% 36%, 13% 31%)", x: -10, y: -26, r: -4, d: 0 },
    { clip: "polygon(26% -6%, 44% -6%, 42% 30%, 26% 36%)", x: 4, y: -22, r: 5, d: 0.03 },
    { clip: "polygon(41% -6%, 59% -6%, 56% 33%, 42% 30%)", x: 18, y: -18, r: -3, d: 0.04 },
    { clip: "polygon(56% -6%, 76% -6%, 73% 34%, 56% 33%)", x: 34, y: -12, r: 4, d: 0.05 },
    { clip: "polygon(73% -6%, 104% -6%, 104% 32%, 73% 34%)", x: 54, y: -20, r: 6, d: 0.07 },
    { clip: "polygon(-4% 25%, 14% 31%, 18% 58%, -4% 52%)", x: -34, y: 42, r: 5, d: 0.08 },
    { clip: "polygon(13% 31%, 27% 36%, 29% 61%, 18% 58%)", x: -18, y: 50, r: -5, d: 0.05 },
    { clip: "polygon(26% 36%, 43% 30%, 45% 59%, 29% 61%)", x: -2, y: 44, r: 4, d: 0.06 },
    { clip: "polygon(42% 30%, 57% 33%, 58% 61%, 45% 59%)", x: 15, y: 38, r: -4, d: 0.09 },
    { clip: "polygon(56% 33%, 74% 34%, 73% 62%, 58% 61%)", x: 31, y: 46, r: 5, d: 0.07 },
    { clip: "polygon(73% 34%, 104% 32%, 104% 60%, 73% 62%)", x: 62, y: 36, r: -3, d: 0.1 },
    { clip: "polygon(-4% 52%, 18% 58%, 20% 106%, -4% 106%)", x: -44, y: 68, r: -4, d: 0.12 },
    { clip: "polygon(18% 58%, 35% 58%, 38% 106%, 20% 106%)", x: -18, y: 76, r: 4, d: 0.09 },
    { clip: "polygon(35% 58%, 54% 60%, 55% 106%, 38% 106%)", x: 7, y: 82, r: -5, d: 0.11 },
    { clip: "polygon(54% 60%, 74% 62%, 75% 106%, 55% 106%)", x: 30, y: 74, r: 4, d: 0.1 },
    { clip: "polygon(74% 62%, 104% 60%, 104% 106%, 75% 106%)", x: 64, y: 58, r: -5, d: 0.08 },
    { text: ".", x: 82, y: 46, r: 0, d: 0.08, dot: true },
  ];
  let hasStarted = false;
  let startTime = 0;

  if (!items.length || !dot || !shatterStage) return;

  const ease = (value) => {
    return value < 0.5
      ? 4 * value * value * value
      : 1 - Math.pow(-2 * value + 2, 3) / 2;
  };

  const easeOut = (value) => 1 - Math.pow(1 - value, 3);

  const buildShatterPieces = () => {
    shatterStage.innerHTML = "";

    shatterPlan.forEach((piece) => {
      const node = document.createElement("span");
      node.className = "shatter-piece";
      node.textContent = piece.text || shatterText;
      if (piece.clip) node.style.clipPath = piece.clip;
      shatterStage.appendChild(node);
      piece.node = node;
    });
  };

  const setWordWidths = () => {
    items.forEach((item) => {
      const word = item.querySelector(".typing-word");
      item.dataset.wordWidth = word.offsetWidth;
    });
  };

  const getCyclePosition = (cycleTime) => {
    let elapsed = 0;

    for (let index = 0; index < slotDurations.length; index += 1) {
      const duration = slotDurations[index];

      if (cycleTime < elapsed + duration) {
        return {
          activeIndex: index,
          localTime: cycleTime - elapsed,
        };
      }

      elapsed += duration;
    }

    return {
      activeIndex: slotDurations.length - 1,
      localTime: slotDurations[slotDurations.length - 1],
    };
  };

  const drawShatter = (progress, wordWidth) => {
    if (progress <= 0) {
      shatterStage.style.opacity = 0;
      return;
    }

    const stageProgress = clamp((progress - 0.02) / 0.98);
    shatterStage.style.opacity = 1;
    shatterStage.style.width = `${wordWidth}px`;

    shatterPlan.forEach((piece) => {
      const pieceProgress = clamp((stageProgress - piece.d) / (1 - piece.d));
      const moveProgress = clamp(pieceProgress / 0.52);
      const easedProgress = easeOut(moveProgress);
      const settle = Math.sin(moveProgress * Math.PI) * 4;
      const opacity = clamp(1 - Math.pow(clamp((pieceProgress - 0.82) / 0.18), 1.35));
      const baseX = piece.dot ? wordWidth : 0;

      piece.node.style.opacity = opacity;
      piece.node.style.transform = [
        `translate3d(${baseX + piece.x * easedProgress}px, ${(piece.y * easedProgress) + settle}px, 0)`,
        `rotate(${piece.r * easedProgress}deg)`,
        `scale(${1 - 0.025 * easedProgress})`,
      ].join(" ");
    });
  };

  const startTyping = () => {
    if (hasStarted) return;
    hasStarted = true;
    startTime = performance.now();
  };

  if (typingSection) {
    const typingObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startTyping();
          typingObserver.disconnect();
        }
      });
    }, {
      threshold: 0.35,
    });

    typingObserver.observe(typingSection);
  } else {
    startTyping();
  }

  const drawFrame = (time) => {
    if (!hasStarted) {
      requestAnimationFrame(drawFrame);
      return;
    }

    const cycleTime = (time - startTime) % totalDuration;
    const { activeIndex, localTime } = getCyclePosition(cycleTime);
    const activeItem = items[activeIndex];
    const activeWord = words[activeIndex];
    const wordWidth = Number(activeItem.dataset.wordWidth) || activeWord.offsetWidth;
    let dotX = wordWidth;
    let dotOpacity = 1;
    let shatterProgress = 0;

    words.forEach((word) => {
      word.style.opacity = 1;
      word.style.clipPath = "inset(-50% 100% -50% 0%)";
    });

    if (localTime < revealDuration) {
      const revealProgress = ease(localTime / revealDuration);
      dotX = wordWidth * revealProgress;
      activeWord.style.clipPath = `inset(-50% ${100 - revealProgress * 100}% -50% 0%)`;
    } else if (localTime < revealDuration + holdDuration) {
      activeWord.style.clipPath = "inset(-50% 0% -50% 0%)";
    } else {
      const currentHideDuration = activeIndex === 0 ? hideDuration + firstHideSlowdown : hideDuration;
      const hideProgress = ease(clamp((localTime - revealDuration - holdDuration) / currentHideDuration));

      if (activeIndex === 0) {
        activeWord.style.opacity = 0;
        activeWord.style.clipPath = "inset(-50% 0% -50% 0%)";
        dotOpacity = 0;
        shatterProgress = hideProgress;
      } else {
        dotOpacity = 1 - hideProgress;
        activeWord.style.clipPath = `inset(-50% 0% -50% ${hideProgress * 100}%)`;
      }
    }

    drawShatter(shatterProgress, wordWidth);
    dot.style.opacity = dotOpacity;
    dot.style.transform = `translate3d(${dotX}px, 0, 0)`;

    requestAnimationFrame(drawFrame);
  };

  if (document.fonts) {
    document.fonts.ready.then(setWordWidths);
  }

  buildShatterPieces();
  setWordWidths();
  window.addEventListener("resize", setWordWidths);
  requestAnimationFrame(drawFrame);
};

const initArgumentCurlEffect = () => {
  if (!argumentCurlEnabled) return;
  if (!argumentCurlCanvas || !argumentCurlStage) return;

  const gl = argumentCurlCanvas.getContext("webgl", { antialias: true, alpha: true });
  if (!gl) return;

  const vertexSource = `
    attribute vec2 position;
    varying vec2 texCoord;
    void main() {
      texCoord = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    precision mediump float;
    varying vec2 texCoord;
    uniform sampler2D sourceTex;
    uniform sampler2D targetTex;
    uniform float time;
    const float MIN_AMOUNT = -0.16;
    const float MAX_AMOUNT = 1.3;
    const float PI = 3.141592653589793;
    const float scale = 420.0;
    const float sharpness = 1.65;
    const float cylinderRadius = 1.0 / PI / 2.0;
    vec3 hitPoint(float hitAngle, float yc, vec3 point, mat3 rrotation) {
      float hitPoint = hitAngle / (2.0 * PI);
      point.y = hitPoint;
      return rrotation * point;
    }
    vec4 antiAlias(vec4 color1, vec4 color2, float distance) {
      distance *= scale;
      if (distance < 0.0) return color2;
      if (distance > 2.0) return color1;
      float dd = pow(1.0 - distance / 2.0, sharpness);
      return ((color2 - color1) * dd) + color1;
    }
    float distanceToEdge(vec3 point) {
      float dx = abs(point.x > 0.5 ? 1.0 - point.x : point.x);
      float dy = abs(point.y > 0.5 ? 1.0 - point.y : point.y);
      if (point.x < 0.0) dx = -point.x;
      if (point.x > 1.0) dx = point.x - 1.0;
      if (point.y < 0.0) dy = -point.y;
      if (point.y > 1.0) dy = point.y - 1.0;
      if ((point.x < 0.0 || point.x > 1.0) && (point.y < 0.0 || point.y > 1.0)) return sqrt(dx * dx + dy * dy);
      return min(dx, dy);
    }
    vec4 seeThrough(float yc, vec2 p, mat3 rotation, mat3 rrotation, float amount, float cylinderAngle) {
      float hitAngle = PI - (acos(yc / cylinderRadius) - cylinderAngle);
      vec3 point = hitPoint(hitAngle, yc, rotation * vec3(p, 1.0), rrotation);
      if (yc <= 0.0 && (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0)) return texture2D(targetTex, texCoord);
      if (yc > 0.0) return texture2D(sourceTex, p);
      vec4 color = texture2D(sourceTex, point.xy);
      vec4 tcolor = texture2D(targetTex, texCoord);
      return antiAlias(color, tcolor, distanceToEdge(point));
    }
    vec4 seeThroughWithShadow(float yc, vec2 p, vec3 point, mat3 rotation, mat3 rrotation, float amount, float cylinderAngle) {
      float shadow = distanceToEdge(point) * 30.0;
      shadow = (1.0 - shadow) / 12.0;
      if (shadow < 0.0) shadow = 0.0;
      else shadow *= amount * 0.28;
      vec4 shadowColor = seeThrough(yc, p, rotation, rrotation, amount, cylinderAngle);
      shadowColor.rgb -= vec3(shadow * 0.82, shadow * 0.78, shadow * 0.68);
      return shadowColor;
    }
    vec4 backside(float yc, vec3 point) {
      float curveLight = pow(1.0 - abs(yc / cylinderRadius), 0.32);
      float sideShade = smoothstep(0.0, 1.0, point.x) * 0.035;
      vec3 paperBack = vec3(0.982, 0.975, 0.952);
      paperBack += vec3(curveLight * 0.115);
      paperBack -= vec3(sideShade * 0.55);
      return vec4(paperBack, 1.0);
    }
    vec4 behindSurface(float yc, vec3 point, mat3 rrotation, float amount, float cylinderAngle) {
      float shado = (1.0 - ((-cylinderRadius - yc) / amount * 8.5)) / 18.0;
      shado *= pow(max(0.0, 1.0 - abs(point.x - 0.5) * 1.65), 1.7);
      yc = (-cylinderRadius - cylinderRadius - yc);
      float hitAngle = (acos(yc / cylinderRadius) + cylinderAngle) - PI;
      point = hitPoint(hitAngle, yc, point, rrotation);
      if (yc < 0.0 && point.x >= 0.0 && point.y >= 0.0 && point.x <= 1.0 && point.y <= 1.0 && (hitAngle < PI || amount > 0.5)) {
        shado = 1.0 - (sqrt(pow(point.x - 0.5, 2.0) + pow(point.y - 0.5, 2.0)) / 0.71);
        shado *= pow(-yc / cylinderRadius, 3.0) * 0.095;
      } else {
        shado = 0.0;
      }
      vec3 base = texture2D(targetTex, texCoord).rgb;
      return vec4(base - vec3(shado * 0.72, shado * 0.64, shado * 0.54), 1.0);
    }
    void main() {
      float amount = time * (MAX_AMOUNT - MIN_AMOUNT) + MIN_AMOUNT;
      float cylinderCenter = amount;
      float cylinderAngle = 2.0 * PI * amount;
      const float angle = 30.0 * PI / 180.0;
      float c = cos(-angle);
      float s = sin(-angle);
      mat3 rotation = mat3(c, s, 0.0, -s, c, 0.0, 0.12, 0.258, 1.0);
      c = cos(angle);
      s = sin(angle);
      mat3 rrotation = mat3(c, s, 0.0, -s, c, 0.0, 0.15, -0.5, 1.0);
      vec3 point = rotation * vec3(texCoord, 1.0);
      float yc = point.y - cylinderCenter;
      if (yc < -cylinderRadius) {
        gl_FragColor = behindSurface(yc, point, rrotation, amount, cylinderAngle);
        return;
      }
      if (yc > cylinderRadius) {
        gl_FragColor = texture2D(sourceTex, texCoord);
        return;
      }
      float hitAngle = (acos(yc / cylinderRadius) + cylinderAngle) - PI;
      float hitAngleMod = mod(hitAngle, 2.0 * PI);
      if ((hitAngleMod > PI && amount < 0.5) || (hitAngleMod > PI / 2.0 && amount < 0.0)) {
        gl_FragColor = seeThrough(yc, texCoord, rotation, rrotation, amount, cylinderAngle);
        return;
      }
      point = hitPoint(hitAngle, yc, point, rrotation);
      if (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0) {
        gl_FragColor = seeThroughWithShadow(yc, texCoord, point, rotation, rrotation, amount, cylinderAngle);
        return;
      }
      vec4 color = backside(yc, point);
      vec4 otherColor;
      if (yc < 0.0) {
        float shado = 1.0 - (sqrt(pow(point.x - 0.5, 2.0) + pow(point.y - 0.5, 2.0)) / 0.71);
        shado *= pow(-yc / cylinderRadius, 3.0);
        shado *= 0.18;
        otherColor = vec4(0.58, 0.55, 0.48, shado * 0.16);
      } else {
        otherColor = texture2D(sourceTex, texCoord);
      }
      color = antiAlias(color, otherColor, cylinderRadius - abs(yc));
      vec4 cl = seeThroughWithShadow(yc, texCoord, point, rotation, rrotation, amount, cylinderAngle);
      gl_FragColor = antiAlias(color, cl, distanceToEdge(point));
    }
  `;

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  };

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  const positionLocation = gl.getAttribLocation(program, "position");
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.uniform1i(gl.getUniformLocation(program, "sourceTex"), 0);
  gl.uniform1i(gl.getUniformLocation(program, "targetTex"), 1);
  const timeLocation = gl.getUniformLocation(program, "time");
  const carImage = new Image();
  carImage.src = "6.png?v=20260605-1317";

  let progress = 0;
  let sourceTexture = null;
  let targetTexture = null;

  const drawText = (ctx, lines, x, y, lineHeight) => {
    lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  };

  const drawTexture = (kind, width, height) => {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    const ctx = c.getContext("2d");

    if (kind === "front") {
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, width, height);
      const subtleLight = ctx.createRadialGradient(width * .52, height * .34, 0, width * .52, height * .34, width * .62);
      subtleLight.addColorStop(0, "rgba(255,255,255,.055)");
      subtleLight.addColorStop(.48, "rgba(255,255,255,.018)");
      subtleLight.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = subtleLight;
      ctx.fillRect(0, 0, width, height);
      ctx.textAlign = "center";
      ctx.fillStyle = "#85E5AC";
      ctx.font = `700 ${Math.round(width * .045)}px Georgia, Times New Roman, serif`;
      ctx.fillText("“", width * .5, height * .28);
      ctx.fillStyle = "#fff";
      ctx.font = `800 ${Math.round(width * .038)}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
      ctx.fillText("그래서 돈을 더 준대도 100점짜리 맞춤 제작은 안 합니다.", width * .5, height * .34);
      ctx.font = `600 ${Math.round(width * .019)}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
      drawText(ctx, [
        "제가 매일 기계처럼 채워 넣던 ‘그 양식’을 보시고",
        "\"돈을 두 배로 낼 테니, 완벽한 시스템을 짜주세요\"라고 찾아오시는 대표님들이 계십니다.",
        "하지만 저는 타협하지 않고 오히려 기능을 덜어내라고 말씀드립니다.",
      ], width * .5, height * .49, height * .04);
      drawText(ctx, [
        "맞춤은 생각보다 가치가 없습니다. 나에게 딱 맞는 자동차를 원하는 사람한테",
        "'네가 타고 싶은 차를 직접 그려봐'라고 하면, 결국 손도 못 대고 차를 포기할 거거든요.",
      ], width * .5, height * .68, height * .045);
    } else {
      ctx.fillStyle = kind === "insight" ? "#fff" : "#f5f0e8";
      ctx.fillRect(0, 0, width, height);
      if (carImage.complete && carImage.naturalWidth) {
        const scale = Math.max(width / carImage.naturalWidth, height / carImage.naturalHeight);
        const drawW = carImage.naturalWidth * scale;
        const drawH = carImage.naturalHeight * scale;
        ctx.drawImage(carImage, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
      } else if (kind === "back") {
        const fallback = ctx.createLinearGradient(0, 0, width, height);
        fallback.addColorStop(0, "#d8c2ad");
        fallback.addColorStop(.48, "#e7ded2");
        fallback.addColorStop(1, "#9e7d60");
        ctx.fillStyle = fallback;
        ctx.fillRect(0, 0, width, height);
      }
      if (kind === "back") {
        const grad = ctx.createRadialGradient(width * .83, height * .18, 0, width * .78, height * .1, width * .68);
        grad.addColorStop(0, "rgba(0,0,0,.75)");
        grad.addColorStop(.52, "rgba(0,0,0,.42)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        ctx.textAlign = "left";
        ctx.fillStyle = "#fff";
        ctx.font = `700 ${Math.round(width * .017)}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
        const x = width - 80 - width * .4;
        const y = height * .15;
        ctx.fillRect(x - 24, y - 8, 2, height * .12);
        drawText(ctx, [
          "만약 나에게 딱 맞는 자동차를 원하는 사람한테",
          "'네가 타고 싶은 차를 직접 그려봐'라고 하면, 제대로 그릴 수 있을까요?",
        ], x, y, height * .04);
      } else {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, width, height);
        ctx.textAlign = "center";
        ctx.fillStyle = "#85E5AC";
        ctx.font = `700 ${Math.round(width * .045)}px Georgia, Times New Roman, serif`;
        ctx.fillText("“", width * .5, height * .37);
        ctx.fillStyle = "#1b0f0f";
        ctx.font = `800 ${Math.round(width * .035)}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
        drawText(ctx, [
          "사람들이 제 양식을 원했던 건",
          "대단한 기술이 있어서가 아닙니다.",
        ], width * .5, height * .46, height * .065);
      }
    }

    return c;
  };

  const textureFrom = (image, unit) => {
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return texture;
  };

  let textureMode = "argumentToCar";

  const refreshTextures = () => {
    const width = Math.max(900, argumentCurlCanvas.width);
    const height = Math.max(600, argumentCurlCanvas.height);
    sourceTexture = textureFrom(drawTexture(textureMode === "argumentToCar" ? "front" : "back", width, height), 0);
    targetTexture = textureFrom(drawTexture(textureMode === "argumentToCar" ? "back" : "insight", width, height), 1);
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = argumentCurlCanvas.getBoundingClientRect();
    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);
    if (argumentCurlCanvas.width !== width || argumentCurlCanvas.height !== height) {
      argumentCurlCanvas.width = width;
      argumentCurlCanvas.height = height;
      if (argumentCurlReady) refreshTextures();
    }
    gl.viewport(0, 0, argumentCurlCanvas.width, argumentCurlCanvas.height);
  };

  const render = () => {
    resize();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (sourceTexture && targetTexture) {
      gl.uniform1f(timeLocation, progress);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    requestAnimationFrame(render);
  };

  argumentCurlRenderer = {
    setMode(mode) {
      if (mode === textureMode) return;
      textureMode = mode;
      if (argumentCurlReady) refreshTextures();
    },
    setProgress(value) {
      progress = value < .5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
    },
  };

  const markReady = () => {
    resize();
    refreshTextures();
    argumentCurlReady = true;
    updateArgumentCurl();
  };

  if (carImage.complete && carImage.naturalWidth) {
    markReady();
  } else {
    carImage.addEventListener("load", markReady, { once: true });
  }
  render();
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
  updateImageCoverUps();
  updateInsightTransition();
  updateArgumentCurl();
}, { passive: true });
syncPairedImageHeights();
updateTemplateTransition();
updateTemplateToSystemTransition();
updateImageCoverUps();
updateInsightTransition();
initTypingEffect();
initArgumentCurlEffect();
updateArgumentCurl();
