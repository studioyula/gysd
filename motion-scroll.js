const SVG_NS = "http://www.w3.org/2000/svg";

const canvas = document.querySelector(".motion-canvas");
const layers = {
  circles: document.querySelector(".circle-layer"),
  nonCircles: document.querySelector(".non-circle-layer"),
  morph: document.querySelector(".morph-layer"),
  disc: document.querySelector(".disc-layer"),
  pieces: document.querySelector(".grid-piece-layer"),
  fills: document.querySelector(".grid-fill-layer"),
  lines: document.querySelector(".grid-line-layer"),
};

const copyLines = Array.from(document.querySelectorAll(".motion-copy-line"));

const COLOR = {
  green: "#85E5AC",
  black: "#111111",
  gray: "#b9b9b9",
};

const hexToRgb = (hex) => {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
};

const mixColor = (from, to, t) => {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const channel = (start, end) => Math.round(lerp(start, end, clamp(t)));
  return `rgb(${channel(a.r, b.r)}, ${channel(a.g, b.g)}, ${channel(a.b, b.b)})`;
};

const CENTER = { x: 472, y: 354 };
const GRID = { x: 328, y: 210, cell: 96, size: 288 };
const DISC_RADIUS = 118;
const GRID_TIMING = {
  lineStart: 0.280,
  lineStep: 0.014,
  lineDuration: 0.013,
  fillStart: 0.450,
  fillStep: 0.004,
  fillDuration: 0.300,
};
const gridFillEnd = () => GRID_TIMING.fillStart + 8 * GRID_TIMING.fillStep + GRID_TIMING.fillDuration;
const gridLineEnd = () => GRID_TIMING.lineStart + 4 * GRID_TIMING.lineStep + GRID_TIMING.lineDuration * 4;
const GOO = {
  blur: 9,
  alphaBoost: 34,
  alphaCutoff: -18,
  bridgeCount: 3,
};
const MORPH_TIMING = {
  gooStart: 0.188,
  gooEnd: 0.188,
  assetStart: 0.455,
  assetEnd: 0.520,
  discStart: 0.188,
  discEnd: 0.425,
};
const TIMING = {
  grayStart: 0.007,
  grayEnd: 0.025,
  greenStart: 0.030,
  greenEnd: 0.055,
  nonVanishStart: 0.060,
  nonVanishEnd: 0.090,
  ringStart: 0.095,
  ringEnd: 0.175,
  spinStart: 0.105,
  spinEnd: 0.190,
  spinTurns: 0.5,
  morphMoveStart: 0.188,
  morphMoveEnd: 0.275,
  bridgeStart: 0.205,
  bridgeEnd: 0.315,
  circleFadeStart: 0.475,
  circleFadeEnd: 0.525,
  gooToDiscStart: 0.188,
  gooToDiscEnd: 0.315,
  morphToDiscStart: 0.290,
};
const MORPH_FRAME = {
  x: 280,
  y: 146,
  scale: 2.08,
  radius: 17.5,
  topBlob:
    "M122.92 42.9021C131.692 40.5053 140.466 45.508 143.642 53.5221C146.848 61.6121 143.665 70.8461 136.243 75.2767C128.779 79.7325 118.789 78.2846 113.391 71.1586L108.576 63.4221C103.683 55.5624 94.4233 52.4004 85.7961 55.7117L77.082 59.0544C68.6034 61.4627 59.7374 56.632 56.481 48.8436C53.0969 40.7518 56.1205 31.475 63.372 26.8689C70.8034 22.1494 81.0199 23.5865 86.4953 30.7015C88.4782 33.276 89.7683 36.074 91.5239 38.7146C96.54 46.268 105.411 49.3081 113.966 46.3409C116.927 45.3131 119.62 43.8033 122.923 42.9005L122.92 42.9021Z",
  bottomBlob:
    "M76.4558 126.182C79.1747 117.504 88.1232 112.82 96.5834 114.474C105.124 116.144 111.177 123.808 110.899 132.448C110.62 141.136 104.007 148.763 95.0946 149.459L85.9827 149.335C76.7253 149.209 69.0642 155.296 67.1932 164.345L65.3018 173.485C62.7509 181.922 53.8978 186.776 45.584 185.312C36.946 183.791 30.7701 176.237 30.8085 167.647C30.8485 158.843 37.5744 151.02 46.5196 150.253C49.7572 149.974 52.8088 150.399 55.9793 150.347C65.0455 150.203 72.3942 144.378 74.5157 135.575C75.2492 132.528 75.4324 129.446 76.4561 126.178L76.4558 126.182Z",
};

const SCENES = [
  { id: "scatter", at: 0.00 },
  { id: "gray", at: 0.035 },
  { id: "green", at: 0.087 },
  { id: "only-circles", at: 0.135 },
  { id: "wide-ring", at: 0.250 },
  { id: "spin-ring", at: 0.315 },
  { id: "morph", at: 0.440 },
  { id: "disc", at: 0.600 },
  { id: "grid", at: 0.785 },
  { id: "fill", at: 0.902 },
];

const SCATTER_COMPACT = {
  position: 0.76,
  size: 0.78,
};
const compactCoord = (value, origin) => origin + (value - origin) * SCATTER_COMPACT.position;
const compactPoint = (point) => ({
  x: compactCoord(point.x, CENTER.x),
  y: compactCoord(point.y, CENTER.y),
});
const compactRectShape = (shape) => {
  const center = compactPoint({
    x: shape.x + shape.width / 2,
    y: shape.y + shape.height / 2,
  });
  const width = shape.width * SCATTER_COMPACT.size;
  const height = shape.height * SCATTER_COMPACT.size;
  return {
    ...shape,
    x: center.x - width / 2,
    y: center.y - height / 2,
    width,
    height,
    rx: (shape.rx || 0) * SCATTER_COMPACT.size,
  };
};
const compactPathFromPoints = (points) => points
  .map((point, index) => {
    const compacted = compactPoint(point);
    return `${index === 0 ? "M" : "L"} ${compacted.x} ${compacted.y}`;
  })
  .join(" ")
  + " Z";

const initialCircles = [
  { x: 279, y: 266, r: 28 },
  { x: 471, y: 200, r: 38 },
  { x: 621, y: 367, r: 35 },
  { x: 788, y: 132, r: 24 },
  { x: 430, y: 400, r: 31 },
  { x: 343, y: 555, r: 24 },
].map((circle) => ({
  ...compactPoint(circle),
  r: circle.r * SCATTER_COMPACT.size,
}));

const ringWide = [
  { x: 472, y: 192 },
  { x: 612, y: 273 },
  { x: 612, y: 435 },
  { x: 472, y: 516 },
  { x: 332, y: 435 },
  { x: 332, y: 273 },
];

const morphTargets = [
  { x: 73, y: 43 },
  { x: 127, y: 59 },
  { x: 167.5, y: 129.499 },
  { x: 93, y: 132 },
  { x: 49, y: 168 },
  { x: 24.7486, y: 90.7481 },
].map((point) => ({
  x: MORPH_FRAME.x + point.x * MORPH_FRAME.scale,
  y: MORPH_FRAME.y + point.y * MORPH_FRAME.scale,
}));

const discBlobTargets = [
  { x: CENTER.x, y: CENTER.y - 68, r: 70 },
  { x: CENTER.x + 58, y: CENTER.y - 34, r: 70 },
  { x: CENTER.x + 58, y: CENTER.y + 38, r: 70 },
  { x: CENTER.x, y: CENTER.y + 68, r: 68 },
  { x: CENTER.x - 58, y: CENTER.y + 38, r: 70 },
  { x: CENTER.x - 58, y: CENTER.y - 34, r: 70 },
];

const morphRadius = MORPH_FRAME.radius * MORPH_FRAME.scale;
const liquidPairs = [
  [0, 1],
  [3, 4],
];

const morphAssetShapes = [
  { type: "circle", cx: 167.5, cy: 129.499, r: 17.5 },
  { type: "circle", cx: 24.7486, cy: 90.7481, r: 17.5 },
  { type: "path", d: MORPH_FRAME.topBlob },
  { type: "path", d: MORPH_FRAME.bottomBlob },
];

const nonCircleShapes = [
  { type: "rect", x: 177, y: 156, width: 57, height: 18, rx: 9, rotate: 0 },
  { type: "rect", x: 735, y: 403, width: 57, height: 29, rx: 0, rotate: 0 },
  { type: "rect", x: 594, y: 525, width: 28, height: 66, rx: 14, rotate: 0 },
  { type: "rect", x: 209, y: 391, width: 49, height: 49, rx: 0, rotate: 0 },
  { type: "rect", x: 87, y: 445, width: 16, height: 70, rx: 0, rotate: -45 },
].map(compactRectShape).concat([
  {
    type: "path",
    d: compactPathFromPoints([
      { x: 675, y: 211 },
      { x: 635, y: 234 },
      { x: 635, y: 188 },
    ]),
  },
]);

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const mix = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
const rotateAround = (point, center, angle) => {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
};
const smooth = (t) => t * t * (3 - 2 * t);
const easeInOutSine = (t) => -(Math.cos(Math.PI * clamp(t)) - 1) / 2;
const range = (p, start, end) => {
  const safeEnd = Math.max(end, start + 0.001);
  return smooth(clamp((p - start) / (safeEnd - start)));
};
const rangeWith = (p, start, end, ease) => {
  const safeEnd = Math.max(end, start + 0.001);
  return ease(clamp((p - start) / (safeEnd - start)));
};
const backOut = (t) => {
  const c1 = 1.34;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const easeInOutCubic = (t) => {
  const n = clamp(t);
  return n < 0.5 ? 4 * n * n * n : 1 - Math.pow(-2 * n + 2, 3) / 2;
};
const copyVisibility = (value, start, end) => {
  const fade = 0.018;
  const inT = start <= 0 ? 1 : value < start ? 0 : rangeWith(value, start, start + fade, easeInOutSine);
  const outT = Number.isFinite(end) && value >= end ? 1 - rangeWith(value, end, end + fade, easeInOutSine) : 1;
  return clamp(Math.min(inT, outT));
};

const make = (tag, attrs = {}) => {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
};

const setCircle = (node, state) => {
  node.setAttribute("cx", state.x);
  node.setAttribute("cy", state.y);
  node.setAttribute("r", Math.max(state.r, 0.01));
  node.setAttribute("fill", state.fill);
  node.setAttribute("opacity", state.opacity);
};

const setRect = (node, shape, fill, opacity) => {
  const cx = shape.x + shape.width / 2;
  const cy = shape.y + shape.height / 2;
  node.setAttribute("x", shape.x);
  node.setAttribute("y", shape.y);
  node.setAttribute("width", shape.width);
  node.setAttribute("height", shape.height);
  node.setAttribute("rx", shape.rx || 0);
  node.setAttribute("fill", fill);
  node.setAttribute("opacity", opacity);
  node.setAttribute("transform", `rotate(${shape.rotate || 0} ${cx} ${cy})`);
};

const liquidBridgePath = (a, b, strength, pairIndex) => {
  const s = clamp((strength - 0.08) / 0.92);
  if (s <= 0) return "";

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy) || 1;
  const ux = dx / distance;
  const uy = dy / distance;
  const nx = -uy;
  const ny = ux;
  const direction = pairIndex === 0 ? -1 : 1;
  const eased = easeInOutSine(s);
  const bow = 5 * eased * direction;
  const neck = Math.min(a.r, b.r) * lerp(0.24, 0.64, eased);
  const aInset = a.r * lerp(0.24, 0.16, eased);
  const bInset = b.r * lerp(0.24, 0.16, eased);
  const handle = distance * lerp(0.20, 0.32, eased);

  const aTop = { x: a.x + ux * aInset + nx * neck, y: a.y + uy * aInset + ny * neck };
  const aBottom = { x: a.x + ux * aInset - nx * neck, y: a.y + uy * aInset - ny * neck };
  const bTop = { x: b.x - ux * bInset + nx * neck, y: b.y - uy * bInset + ny * neck };
  const bBottom = { x: b.x - ux * bInset - nx * neck, y: b.y - uy * bInset - ny * neck };
  const c1 = { x: aTop.x + ux * handle + nx * bow, y: aTop.y + uy * handle + ny * bow };
  const c2 = { x: bTop.x - ux * handle + nx * bow, y: bTop.y - uy * handle + ny * bow };
  const c3 = { x: bBottom.x - ux * handle - nx * bow, y: bBottom.y - uy * handle - ny * bow };
  const c4 = { x: aBottom.x + ux * handle - nx * bow, y: aBottom.y + uy * handle - ny * bow };

  return [
    `M ${aTop.x} ${aTop.y}`,
    `C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${bTop.x} ${bTop.y}`,
    `L ${bBottom.x} ${bBottom.y}`,
    `C ${c3.x} ${c3.y} ${c4.x} ${c4.y} ${aBottom.x} ${aBottom.y}`,
    "Z",
  ].join(" ");
};

const liquidContactStrength = (a, b, timelineStrength) => {
  const distance = Math.hypot(b.x - a.x, b.y - a.y);
  const edgeGap = distance - (a.r + b.r);
  const overlap = easeInOutSine(clamp((-edgeGap) / 18));
  return timelineStrength * overlap;
};

const smoothClosedPath = (points) => {
  const tension = 0.36;
  const path = [`M ${points[0].x} ${points[0].y}`];

  points.forEach((point, index) => {
    const prev = points[(index - 1 + points.length) % points.length];
    const current = point;
    const next = points[(index + 1) % points.length];
    const nextNext = points[(index + 2) % points.length];
    const c1 = {
      x: current.x + (next.x - prev.x) * tension / 6,
      y: current.y + (next.y - prev.y) * tension / 6,
    };
    const c2 = {
      x: next.x - (nextNext.x - current.x) * tension / 6,
      y: next.y - (nextNext.y - current.y) * tension / 6,
    };
    path.push(`C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${next.x} ${next.y}`);
  });

  path.push("Z");
  return path.join(" ");
};

const organicDiscPath = (t) => {
  const settle = easeInOutCubic(t);
  const points = 18;
  const phase = -Math.PI / 2;
  const startProfile = [
    0.94, 1.07, 1.15, 1.02, 1.12, 1.06,
    0.96, 1.10, 1.05, 0.92, 1.08, 1.12,
    0.98, 1.05, 1.14, 1.02, 1.10, 1.00,
  ];

  return smoothClosedPath(
    Array.from({ length: points }, (_, index) => {
      const angle = phase + index / points * Math.PI * 2;
      const softWave = Math.sin(angle * 3.1 + 0.7) * 0.020 * (1 - settle);
      const startRadius = DISC_RADIUS * (startProfile[index] + softWave);
      const radius = lerp(startRadius, DISC_RADIUS, settle);
      const centerEase = easeInOutSine(settle);
      const cx = lerp(CENTER.x - 9, CENTER.x, centerEase);
      const cy = lerp(CENTER.y + 2, CENTER.y, centerEase);

      return {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      };
    }),
  );
};

const circlePath = (x, y, r) => {
  const k = 0.5522847498;
  const c = r * k;
  return [
    `M ${x} ${y - r}`,
    `C ${x + c} ${y - r} ${x + r} ${y - c} ${x + r} ${y}`,
    `C ${x + r} ${y + c} ${x + c} ${y + r} ${x} ${y + r}`,
    `C ${x - c} ${y + r} ${x - r} ${y + c} ${x - r} ${y}`,
    `C ${x - r} ${y - c} ${x - c} ${y - r} ${x} ${y - r}`,
    "Z",
  ].join(" ");
};

const finalRingPosition = (index) => rotateAround(
  ringWide[index],
  CENTER,
  Math.PI * 2 * TIMING.spinTurns,
);

const unionRadiusAtAngle = (angle, circles) => {
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  let farthest = 0;

  circles.forEach((circle) => {
    const dx = circle.x - CENTER.x;
    const dy = circle.y - CENTER.y;
    const along = dx * ux + dy * uy;
    const distanceSq = dx * dx + dy * dy;
    const sideSq = distanceSq - along * along;
    const radiusSq = circle.r * circle.r;
    if (sideSq > radiusSq) return;

    const hit = along + Math.sqrt(Math.max(radiusSq - sideSq, 0));
    farthest = Math.max(farthest, hit);
  });

  return farthest || DISC_RADIUS;
};

const liquidDiscPath = (t) => {
  const merge = rangeWith(t, 0.02, 0.30, easeInOutCubic);
  const resolve = rangeWith(t, 0.30, 0.72, easeInOutCubic);
  return ringWide.map((_, index) => {
    const start = finalRingPosition(index);
    const dx = start.x - CENTER.x;
    const dy = start.y - CENTER.y;
    const distance = Math.hypot(dx, dy) || 1;
    const mergeTarget = {
      x: CENTER.x + dx / distance * 12,
      y: CENTER.y + dy / distance * 12,
    };
    const merged = {
      x: lerp(start.x, mergeTarget.x, merge),
      y: lerp(start.y, mergeTarget.y, merge),
      r: lerp(28, 106, merge),
    };

    return circlePath(
      lerp(merged.x, CENTER.x, resolve),
      lerp(merged.y, CENTER.y, resolve),
      lerp(merged.r, DISC_RADIUS, resolve),
    );
  }).join(" ");
};

const discPieceBounds = (index) => {
  const col = index % 3;
  const row = Math.floor(index / 3);
  const pad = 4;
  const x0 = GRID.x + col * GRID.cell + pad;
  const y0 = GRID.y + row * GRID.cell + pad;
  const x1 = GRID.x + (col + 1) * GRID.cell - pad;
  const y1 = GRID.y + (row + 1) * GRID.cell - pad;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const samples = 18;

  for (let yi = 0; yi <= samples; yi += 1) {
    const y = lerp(y0, y1, yi / samples);
    for (let xi = 0; xi <= samples; xi += 1) {
      const x = lerp(x0, x1, xi / samples);
      if (Math.hypot(x - CENTER.x, y - CENTER.y) <= DISC_RADIUS) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (!Number.isFinite(minX)) {
    const cx = clamp(CENTER.x, x0, x1);
    const cy = clamp(CENTER.y, y0, y1);
    return { x0: cx - 1, y0: cy - 1, x1: cx + 1, y1: cy + 1 };
  }

  return { x0: minX, y0: minY, x1: maxX, y1: maxY };
};

const rectPath = ({ x0, y0, x1, y1 }) => `M ${x0} ${y0} L ${x1} ${y0} L ${x1} ${y1} L ${x0} ${y1} Z`;
const eightPointRectPath = ({ x0, y0, x1, y1 }, curve = 0) => {
  const insetX = Math.min((x1 - x0) * clamp(curve), (x1 - x0) / 2);
  const insetY = Math.min((y1 - y0) * clamp(curve), (y1 - y0) / 2);
  return [
    `M ${x0 + insetX} ${y0}`,
    `L ${x1 - insetX} ${y0}`,
    `L ${x1} ${y0 + insetY}`,
    `L ${x1} ${y1 - insetY}`,
    `L ${x1 - insetX} ${y1}`,
    `L ${x0 + insetX} ${y1}`,
    `L ${x0} ${y1 - insetY}`,
    `L ${x0} ${y0 + insetY}`,
    "Z",
  ].join(" ");
};

const clipPolygonToRect = (points, rect) => {
  const clip = (input, inside, intersect) => {
    const output = [];
    input.forEach((current, index) => {
      const previous = input[(index - 1 + input.length) % input.length];
      const currentInside = inside(current);
      const previousInside = inside(previous);
      if (currentInside) {
        if (!previousInside) output.push(intersect(previous, current));
        output.push(current);
      } else if (previousInside) {
        output.push(intersect(previous, current));
      }
    });
    return output;
  };
  const ix = (a, b, x) => {
    const d = (x - a.x) / (b.x - a.x || 0.0001);
    return { x, y: lerp(a.y, b.y, d) };
  };
  const iy = (a, b, y) => {
    const d = (y - a.y) / (b.y - a.y || 0.0001);
    return { x: lerp(a.x, b.x, d), y };
  };

  return [
    [(p) => p.x >= rect.x0, (a, b) => ix(a, b, rect.x0)],
    [(p) => p.x <= rect.x1, (a, b) => ix(a, b, rect.x1)],
    [(p) => p.y >= rect.y0, (a, b) => iy(a, b, rect.y0)],
    [(p) => p.y <= rect.y1, (a, b) => iy(a, b, rect.y1)],
  ].reduce((pointsToClip, [inside, intersect]) => {
    if (pointsToClip.length === 0) return pointsToClip;
    return clip(pointsToClip, inside, intersect);
  }, points);
};

const discSlicePath = (rect, radius = DISC_RADIUS) => {
  const points = Array.from({ length: 168 }, (_, index) => {
    const angle = -Math.PI / 2 + index / 168 * Math.PI * 2;
    return {
      x: CENTER.x + Math.cos(angle) * radius,
      y: CENTER.y + Math.sin(angle) * radius,
    };
  });
  const clipped = clipPolygonToRect(points, rect);
  if (clipped.length < 3) return rectPath(rect);
  return `${clipped.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")} Z`;
};

const pointToRectEdge = (point, origin, rect) => {
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  const hits = [];
  if (Math.abs(dx) > 0.0001) {
    hits.push((rect.x0 - origin.x) / dx);
    hits.push((rect.x1 - origin.x) / dx);
  }
  if (Math.abs(dy) > 0.0001) {
    hits.push((rect.y0 - origin.y) / dy);
    hits.push((rect.y1 - origin.y) / dy);
  }
  const scale = hits
    .filter((value) => value >= 1)
    .sort((a, b) => a - b)[0] || 1;
  return {
    x: clamp(origin.x + dx * scale, rect.x0, rect.x1),
    y: clamp(origin.y + dy * scale, rect.y0, rect.y1),
  };
};

const spreadDiscSlicePath = (rect, t, col, row) => {
  const spread = rangeWith(t, 0.18, 1, easeInOutSine);
  const radius = lerp(DISC_RADIUS, GRID.size * 2.2, spread);
  const sliceIn = rangeWith(t, 0.02, 0.18, easeInOutSine);
  const sliceOut = rangeWith(t, 0.30, 0.82, easeInOutSine);
  const sliceGap = lerp(0, 6, sliceIn) * (1 - sliceOut);
  const sliceRect = {
    x0: rect.x0 + (col > 0 ? sliceGap : 0),
    y0: rect.y0 + (row > 0 ? sliceGap : 0),
    x1: rect.x1 - (col < 2 ? sliceGap : 0),
    y1: rect.y1 - (row < 2 ? sliceGap : 0),
  };
  const circlePoints = Array.from({ length: 216 }, (_, index) => {
    const angle = -Math.PI / 2 + index / 216 * Math.PI * 2;
    return {
      x: CENTER.x + Math.cos(angle) * radius,
      y: CENTER.y + Math.sin(angle) * radius,
    };
  });
  const clipped = clipPolygonToRect(circlePoints, sliceRect);
  if (clipped.length < 3) return rectPath(rect);
  if (spread >= 0.985) return rectPath(rect);
  return `${clipped.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")} Z`;
};

const organicCellPath = (index, t) => {
  const col = index % 3;
  const row = Math.floor(index / 3);
  const pad = 0;
  const full = {
    x0: GRID.x + col * GRID.cell + pad,
    y0: GRID.y + row * GRID.cell + pad,
    x1: GRID.x + (col + 1) * GRID.cell - pad,
    y1: GRID.y + (row + 1) * GRID.cell - pad,
  };
  return spreadDiscSlicePath(full, t, col, row);
};

const borderDrawPath = (t) => {
  const x = GRID.x;
  const y = GRID.y;
  const size = GRID.size;
  const total = size * 4;
  const drawn = clamp(t) * total;
  const points = [{ x, y }];
  let remaining = drawn;
  const segments = [
    { x: x + size, y },
    { x: x + size, y: y + size },
    { x, y: y + size },
    { x, y },
  ];
  let current = { x, y };

  segments.forEach((target) => {
    if (remaining <= 0) return;
    const length = Math.hypot(target.x - current.x, target.y - current.y);
    const local = clamp(remaining / length);
    points.push({
      x: lerp(current.x, target.x, local),
      y: lerp(current.y, target.y, local),
    });
    remaining -= length;
    current = target;
  });

  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
};

const circleStateAt = (index, p) => {
  const start = initialCircles[index];
  const ring = ringWide[index];
  const toRing = range(p, TIMING.ringStart, TIMING.ringEnd);
  const spin = rangeWith(p, TIMING.spinStart, TIMING.spinEnd, easeInOutSine);
  let pos = mix(start, ring, toRing);
  pos = rotateAround(pos, CENTER, Math.PI * 2 * TIMING.spinTurns * spin);
  const r = lerp(start.r, 28, toRing);
  const greenIn = range(p, TIMING.greenStart, TIMING.greenEnd);
  const vanishForDisc = 1 - range(p, MORPH_TIMING.discStart, MORPH_TIMING.discEnd);

  return {
    x: pos.x,
    y: pos.y,
    r,
    fill: mixColor(COLOR.black, COLOR.green, greenIn),
    opacity: vanishForDisc,
  };
};

const buildScene = () => {
  const defs = make("defs");
  const clip = make("clipPath", { id: "grid-disc-mask" });
  clip.appendChild(make("circle", { cx: CENTER.x, cy: CENTER.y, r: DISC_RADIUS }));
  defs.appendChild(clip);

  const transferMask = make("mask", {
    id: "disc-transfer-mask",
    x: 0,
    y: 0,
    width: 944,
    height: 708,
    maskUnits: "userSpaceOnUse",
  });
  transferMask.appendChild(make("rect", {
    x: 0,
    y: 0,
    width: 944,
    height: 708,
    fill: "white",
  }));
  const gridMaskCuts = [];
  for (let i = 0; i < 9; i += 1) {
    const cut = make("path", { fill: "black", opacity: 0 });
    transferMask.appendChild(cut);
    gridMaskCuts.push(cut);
  }
  defs.appendChild(transferMask);

  const gooFilter = make("filter", {
    id: "gooey-merge",
    x: -260,
    y: -240,
    width: 1464,
    height: 1188,
    filterUnits: "userSpaceOnUse",
    "color-interpolation-filters": "sRGB",
  });
  gooFilter.appendChild(make("feGaussianBlur", {
    in: "SourceGraphic",
    stdDeviation: GOO.blur,
    result: "blur",
  }));
  gooFilter.appendChild(make("feColorMatrix", {
    in: "blur",
    mode: "matrix",
    values: `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${GOO.alphaBoost} ${GOO.alphaCutoff}`,
    result: "goo",
  }));
  gooFilter.appendChild(make("feFlood", {
    "flood-color": COLOR.green,
    result: "green",
  }));
  gooFilter.appendChild(make("feComposite", {
    in: "green",
    in2: "goo",
    operator: "in",
  }));
  defs.appendChild(gooFilter);
  canvas.insertBefore(defs, canvas.firstChild);

  const circleNodes = initialCircles.map(() => {
    const node = make("circle", { class: "shape-node" });
    layers.circles.appendChild(node);
    return node;
  });

  const nonCircleNodes = nonCircleShapes.map((shape) => {
    const node = make(shape.type === "path" ? "path" : "rect", { class: "shape-node" });
    layers.nonCircles.appendChild(node);
    return node;
  });

  const gooGroup = make("g", { class: "goo-merge", opacity: 0, filter: "url(#gooey-merge)" });
  const gooCircleNodes = initialCircles.map(() => {
    const node = make("circle", { class: "goo-node", fill: COLOR.green });
    gooGroup.appendChild(node);
    return node;
  });
  const gooBridgeNodes = liquidPairs.map(() => {
    const node = make("path", { class: "goo-node goo-bridge", fill: COLOR.green, opacity: 0 });
    gooGroup.insertBefore(node, gooGroup.firstChild);
    return node;
  });
  layers.morph.appendChild(gooGroup);

  const morphAsset = make("g", {
    class: "morph-asset",
    opacity: 0,
    transform: `translate(${MORPH_FRAME.x} ${MORPH_FRAME.y}) scale(${MORPH_FRAME.scale})`,
  });
  morphAssetShapes.forEach((shape) => {
    const node = make(shape.type, { fill: COLOR.green });
    if (shape.type === "circle") {
      node.setAttribute("cx", shape.cx);
      node.setAttribute("cy", shape.cy);
      node.setAttribute("r", shape.r);
    } else {
      node.setAttribute("d", shape.d);
    }
    morphAsset.appendChild(node);
  });
  layers.morph.appendChild(morphAsset);

  const disc = make("path", { class: "disc-node", opacity: 0, mask: "url(#disc-transfer-mask)" });
  layers.disc.appendChild(disc);

  const gridPieces = [];
  const gridFills = [];
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const x = GRID.x + col * GRID.cell;
      const y = GRID.y + row * GRID.cell;
      const piece = make("rect", {
        class: "grid-piece",
        x,
        y,
        width: GRID.cell,
        height: GRID.cell,
        opacity: 0,
        "clip-path": "url(#grid-disc-mask)",
      });
      const fill = make("path", { class: "grid-cell", opacity: 0 });
      layers.pieces.appendChild(piece);
      layers.fills.appendChild(fill);
      gridPieces.push(piece);
      gridFills.push(fill);
    }
  }

  const gridLines = [];
  const addGridStroke = (node, length, order, coords, durationMultiplier = 1) => {
    layers.lines.appendChild(node);
    gridLines.push({ node, length, order, coords, durationMultiplier });
  };
  const addGridLine = (x1, y1, x2, y2, order, durationMultiplier = 1) => {
    const node = make("line", { class: "grid-line", x1, y1, x2, y2, opacity: 0 });
    addGridStroke(node, Math.hypot(x2 - x1, y2 - y1), order, { type: "line", x1, y1, x2, y2 }, durationMultiplier);
  };
  const addGridBorder = (order, durationMultiplier = 4) => {
    const node = make("path", { class: "grid-line", d: borderDrawPath(0), opacity: 0 });
    addGridStroke(node, GRID.size * 4, order, { type: "border" }, durationMultiplier);
  };

  const gx = GRID.x;
  const gy = GRID.y;
  const c = GRID.cell;
  const gs = GRID.size;
  addGridLine(gx + c, gy, gx + c, gy + gs, 0);
  addGridLine(gx + c * 2, gy, gx + c * 2, gy + gs, 1);
  addGridLine(gx, gy + c, gx + gs, gy + c, 2);
  addGridLine(gx, gy + c * 2, gx + gs, gy + c * 2, 3);
  addGridBorder(4);

  return { circleNodes, nonCircleNodes, gooGroup, gooCircleNodes, gooBridgeNodes, morphAsset, disc, gridPieces, gridFills, gridMaskCuts, gridLines };
};

const render = (scene, progress) => {
  const p = clamp(progress);
  const circleStates = initialCircles.map((_, index) => circleStateAt(index, p));
  const nonGray = range(p, TIMING.grayStart, TIMING.grayEnd);
  const nonVanish = range(p, TIMING.nonVanishStart, TIMING.nonVanishEnd);
  const splitStart = GRID_TIMING.fillStart;
  const splitEnd = gridFillEnd() + 0.012;
  const discToPieces = rangeWith(p, splitStart, splitEnd, easeInOutSine);
  const gooIn = p >= MORPH_TIMING.gooStart ? 1 : 0;
  const gooLayerIn = rangeWith(p, MORPH_TIMING.gooStart, MORPH_TIMING.gooStart + 0.025, easeInOutSine);
  const gooToDisc = rangeWith(p, TIMING.gooToDiscStart, TIMING.gooToDiscEnd, easeInOutSine);
  const discBuild = rangeWith(p, MORPH_TIMING.discStart, MORPH_TIMING.discEnd, easeInOutSine);
  const discIn = p >= MORPH_TIMING.discStart ? 1 : 0;

  scene.nonCircleNodes.forEach((node, index) => {
    const shape = nonCircleShapes[index];
    const fill = mixColor(COLOR.black, COLOR.gray, nonGray);
    const opacity = 1 - nonVanish;
    if (shape.type === "path") {
      node.setAttribute("d", shape.d);
      node.setAttribute("fill", fill);
      node.setAttribute("opacity", opacity);
    } else {
      setRect(node, shape, fill, opacity);
    }
  });

  const sourceCircleFade = p < MORPH_TIMING.discStart ? 1 : 0;
  scene.circleNodes.forEach((node, index) => {
    setCircle(node, {
      ...circleStates[index],
      opacity: circleStates[index].opacity * sourceCircleFade,
    });
  });

  const bridgeStrength = rangeWith(p, TIMING.bridgeStart, TIMING.bridgeEnd, easeInOutSine);
  const gooStates = circleStates.map((state, index) => {
    const discTarget = discBlobTargets[index];
    return {
      x: lerp(state.x, discTarget.x, gooToDisc),
      y: lerp(state.y, discTarget.y, gooToDisc),
      r: lerp(state.r, discTarget.r, gooToDisc),
    };
  });
  scene.gooGroup.setAttribute("opacity", 0);
  scene.gooCircleNodes.forEach((node, index) => {
    const state = gooStates[index];
    setCircle(node, {
      x: state.x,
      y: state.y,
      r: state.r,
      fill: COLOR.green,
      opacity: 1,
    });
  });
  scene.gooBridgeNodes.forEach((node, pairIndex) => {
    const [aIndex, bIndex] = liquidPairs[pairIndex];
    const a = gooStates[aIndex];
    const b = gooStates[bIndex];
    const contactStrength = liquidContactStrength(a, b, bridgeStrength);
    node.setAttribute("d", liquidBridgePath(a, b, contactStrength, pairIndex));
    node.setAttribute("opacity", 0);
  });

  const morphToDisc = range(p, TIMING.morphToDiscStart, MORPH_TIMING.discEnd);
  const morphScale = lerp(MORPH_FRAME.scale, 1.28, morphToDisc);
  const morphX = lerp(MORPH_FRAME.x, CENTER.x - 92.5 * morphScale, morphToDisc);
  const morphY = lerp(MORPH_FRAME.y, CENTER.y - 96 * morphScale, morphToDisc);
  scene.morphAsset.setAttribute("transform", `translate(${morphX} ${morphY}) scale(${morphScale})`);
  scene.morphAsset.setAttribute("opacity", 0);

  scene.disc.setAttribute("d", liquidDiscPath(discBuild));
  const sliceHandoff = p >= GRID_TIMING.fillStart ? 1 : 0;
  scene.disc.setAttribute("opacity", discIn * (1 - sliceHandoff));

  scene.gridPieces.forEach((piece, index) => {
    piece.setAttribute("opacity", 0);
  });

  scene.gridFills.forEach((cell, index) => {
    const local = rangeWith(p, GRID_TIMING.fillStart, GRID_TIMING.fillStart + GRID_TIMING.fillDuration, easeInOutSine);
    const d = organicCellPath(index, local);
    cell.setAttribute("d", d);
    cell.setAttribute("opacity", p >= GRID_TIMING.fillStart ? 1 : 0);
    scene.gridMaskCuts[index].setAttribute("d", d);
    scene.gridMaskCuts[index].setAttribute("opacity", p >= GRID_TIMING.fillStart ? 1 : 0);
  });

  scene.gridLines.forEach((line) => {
    const start = GRID_TIMING.lineStart + line.order * GRID_TIMING.lineStep;
    const duration = GRID_TIMING.lineDuration * (line.durationMultiplier || 1);
    const local = p >= GRID_TIMING.fillStart - 0.012
      ? 1
      : rangeWith(p, start, start + duration, easeInOutSine);
    line.node.setAttribute("opacity", local > 0 ? 1 : 0);
    if (line.coords.type === "border") {
      line.node.setAttribute("d", borderDrawPath(local));
    } else {
      const { x1, y1, x2, y2 } = line.coords;
      line.node.setAttribute("x1", x1);
      line.node.setAttribute("y1", y1);
      line.node.setAttribute("x2", lerp(x1, x2, local));
      line.node.setAttribute("y2", lerp(y1, y2, local));
    }
    line.node.removeAttribute("stroke-dasharray");
    line.node.removeAttribute("stroke-dashoffset");
  });
  const copyStates = [
    copyVisibility(p, 0, 0.200),
    copyVisibility(p, 0.200, 0.400),
    copyVisibility(p, 0.400, Infinity),
  ];
  copyLines.forEach((line, index) => {
    const opacity = copyStates[index] || 0;
    line.style.opacity = opacity;
    line.style.transform = "none";
  });
};

const scene = buildScene();
const scrollSection = document.querySelector(".motion-scroll-section");
let progress = -1;
let ticking = false;

const getScrollProgress = () => {
  if (!scrollSection) return 0;
  const rect = scrollSection.getBoundingClientRect();
  const distance = rect.height - window.innerHeight;
  if (distance <= 0) return rect.top <= 0 ? 1 : 0;
  return clamp(-rect.top / distance);
};

const updateFromScroll = () => {
  ticking = false;
  const next = getScrollProgress();
  if (Math.abs(next - progress) < 0.0005) return;
  progress = next;
  render(scene, progress);
};

const requestScrollRender = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(updateFromScroll);
};

window.addEventListener("scroll", requestScrollRender, { passive: true });
window.addEventListener("resize", requestScrollRender);

window.motionScrollEngine = {
  scenes: SCENES,
  settings: {
    timing: TIMING,
    morphTiming: MORPH_TIMING,
    gridTiming: GRID_TIMING,
  },
  setProgress(value) {
    progress = clamp(value);
    render(scene, progress);
  },
  update: requestScrollRender,
};

render(scene, 0);
requestScrollRender();
