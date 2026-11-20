// === Emotion Wheel: Hierarchical Structure with Concentric Wedges ===

// Step 1: Generate hierarchical data with 3 levels

// === Option 1: Literal Emotion Tree (future multilingual support) ===
//import { literalEmotionTree } from './emotionTreeDataTest.js';
import { literalEmotionTree } from './emotionTreeDataJunto.js';
import { languages, translateEmotion } from './translations.js';


// === Option 2: Generated Random Emotion Tree ===
function generateEmotionTree() {
  const topLevelHueSteps = [60, 120, 180, 240, 300, 0]; // pastel yellow, green, cyan, blue, magenta, red

  const tree = topLevelHueSteps.map((hue, i) => {
    const middleCount = Math.floor(Math.random() * 4) + 5; // 5–8
    const middleNodes = [];

    for (let j = 0; j < middleCount; j++) {
      const childName = `Middle_${i}_${j}`;
      middleNodes.push({
        name: childName,
        children: [
          { name: `${childName}_A` },
          { name: `${childName}_B` }
        ]
      });
    }

    return {
      name: `Parent_${i}`,
      baseHue: hue,
      children: middleNodes
    };
  });

  return tree;
}

// === Toggle between literal or generated data ===
const useLiteral = true; // ⬅️ Change this to false to use generated
const emotionTree = useLiteral ? literalEmotionTree : generateEmotionTree();


// Step 2: Convert HSL hue to pastel color
function pastelFromHue(hue, fadeLevel = 0) {
  if (typeof hue !== 'number' || isNaN(hue)) {
    console.warn('Invalid hue passed to pastelFromHue:', hue);
    return 'hsl(0, 0%, 80%)'; // fallback gray
  }

  const maxFade = 2;
  const fade = Math.min(fadeLevel, maxFade);

  const baseLightness = 85;     // pastel baseline
  const baseSaturation = 60;

  const lightness = baseLightness - fade * 10;   // 85 → 75 → 65
  const saturation = baseSaturation - fade * 5;  // 60 → 55 → 50

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Step 3: ~handle edge case for circular wrapping between 0° and 360°~
function blendHueCircular(baseHue, targetHue, blendRatio) {
  // Ensure both hues are in range [0, 360)
  baseHue = ((baseHue % 360) + 360) % 360;
  targetHue = ((targetHue % 360) + 360) % 360;

  let diff = targetHue - baseHue;

  // Adjust for shortest path around the circle
  if (Math.abs(diff) > 180) {
    diff -= Math.sign(diff) * 360;
  }

  const blendedHue = (baseHue + blendRatio * diff + 360) % 360;
  return blendedHue;
}

// Step 4: Calculate hue for middle/outer levels based on parent's hue and position
function deriveHue(baseHue, index, total, neighborLeft, neighborRight) {
  if (total <= 1) return baseHue; // No need to blend with neighbors

  const offset = ((index / (total - 1)) - 0.5) * 2;
  const neighborTarget = offset < 0 ? neighborLeft : neighborRight;
  const blendRatio = Math.abs(offset) * 0.3;

  return blendHueCircular(baseHue, neighborTarget, blendRatio);
}

// Step 5: Flatten the structure into visual wedges with position and color
function generateVisualNodes(emotionTree) {
  const visualNodes = [];
  const totalParents = emotionTree.length;
  const fullCircle = 2 * Math.PI;
  let parentStartAngle = rotationOffset;

  // Assign baseHues evenly spaced if not already defined
  const baseHueStep = 360 / totalParents;
  for (let i = 0; i < totalParents; i++) {
    if (typeof emotionTree[i].baseHue !== 'number') {
      emotionTree[i].baseHue = (i * baseHueStep) % 360;
    }
  }

  // Now continue with existing visual node logic...
  for (let i = 0; i < totalParents; i++) {
    const parent = emotionTree[i];
    const nextParent = emotionTree[(i + 1) % totalParents];
    const prevParent = emotionTree[(i - 1 + totalParents) % totalParents];

    const parentSweep = fullCircle / totalParents;
    const parentHue = parent.baseHue ?? 0;
    const parentColor = pastelFromHue(parentHue, 0);

    visualNodes.push({
      label: parent.name,
      depth: 0,
      angle: parentStartAngle,
      sweep: parentSweep,
      color: parentColor
    });

    const middle = parent.children ?? [];
    let middleStartAngle = parentStartAngle;

    for (let j = 0; j < middle.length; j++) {
      const middleSweep = parentSweep / middle.length;
      const midHue = deriveHue(
        parent.baseHue ?? 0,
        j,
        middle.length,
        prevParent.baseHue ?? 0,
        nextParent.baseHue ?? 0
      );

      if (typeof midHue !== 'number' || isNaN(midHue)) {
      console.warn('Invalid midHue', {
          parent: parent.name,
          middleIndex: j,
          totalMiddles: middle.length,
          baseHue: parent.baseHue,
          prevHue: prevParent.baseHue,
          nextHue: nextParent.baseHue
      });
      }

      const midColor = pastelFromHue(midHue, 1);

      visualNodes.push({
        label: middle[j].name,
        depth: 1,
        angle: middleStartAngle,
        sweep: middleSweep,
        color: midColor
      });

      const outer = middle[j].children ?? [];
      const outerSweep = middleSweep / outer.length;
      let outerStartAngle = middleStartAngle;

      for (let k = 0; k < outer.length; k++) {
        const childObj =
          typeof outer[k] === "string" ? { name: outer[k] } : outer[k];

        // Derive hue safely from child > middle > parent
        const outerHue = childObj.baseHue ?? midHue ?? parentHue ?? 0;
        const outerColor = pastelFromHue(outerHue, 2);

        visualNodes.push({
          label: childObj.name,
          depth: 2,
          angle: outerStartAngle,
          sweep: outerSweep,
          color: outerColor
        });

        outerStartAngle += outerSweep;
      }

      middleStartAngle += middleSweep;
    }

    parentStartAngle += parentSweep;
  }

  return visualNodes;
}

// === SVG Rendering ===
const svg = document.getElementById("wheel");
const languageSelect = document.getElementById("language-select");
const translationRoute = document.getElementById("translation-route");
const sidebar = document.getElementById("language-sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");
let selectedLanguage = "en";
const centerX = 200;
const centerY = 200;
const rotationDegrees = 0; // Rotate so the top becomes the starting point
const rotationOffset = degToRad(rotationDegrees);

const visualNodes = generateVisualNodes(emotionTree);

const ringWidths = {
  0: 60,  // inner radius
  1: 60,  // middle ring
  2: 70   // outer ring
};

const ringStartRadius = {
  0: 50,
  1: 110,
  2: 170
};

function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function drawArcWedge(centerX, centerY, innerR, outerR, startAngle, sweep, color, label) {
  const endAngle = startAngle + sweep;

  // Coordinates for the inner arc
  const x0 = centerX + innerR * Math.cos(startAngle);
  const y0 = centerY + innerR * Math.sin(startAngle);
  const x1 = centerX + innerR * Math.cos(endAngle);
  const y1 = centerY + innerR * Math.sin(endAngle);

  // Coordinates for the outer arc
  const x2 = centerX + outerR * Math.cos(endAngle);
  const y2 = centerY + outerR * Math.sin(endAngle);
  const x3 = centerX + outerR * Math.cos(startAngle);
  const y3 = centerY + outerR * Math.sin(startAngle);

  const largeArcFlag = sweep > Math.PI ? 1 : 0;

  const d = [
    `M ${x0},${y0}`,
    `A ${innerR},${innerR} 0 ${largeArcFlag} 1 ${x1},${y1}`,
    `L ${x2},${y2}`,
    `A ${outerR},${outerR} 0 ${largeArcFlag} 0 ${x3},${y3}`,
    "Z"
  ].join(" ");

  // Create and style the wedge
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  path.setAttribute("fill", color);
  path.dataset.englishLabel = label;
  path.addEventListener("click", () => showPopup(label, color));
  svg.appendChild(path);

  // === LABEL PLACEMENT ===
  const midAngle = startAngle + sweep / 2;
  const labelRadius = (innerR + outerR) / 2;
  const lx = centerX + labelRadius * Math.cos(midAngle);
  const ly = centerY + labelRadius * Math.sin(midAngle);

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", lx);
  text.setAttribute("y", ly);
  text.textContent = translateEmotion(label, selectedLanguage);
  text.dataset.englishLabel = label;
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "middle");

  // === TEXT ROTATION LOGIC ===
  // use central vertical dividing line as text flipping threshold
  let angleDeg = (midAngle * 180) / Math.PI;
  angleDeg = (angleDeg + 360) % 360;

  let rotation = angleDeg;
  if (rotation > 90 && rotation < 270) {
    rotation += 180;
  }

  text.setAttribute("transform", `rotate(${rotation}, ${lx}, ${ly})`);
  svg.appendChild(text);
  fitLabel(text, outerR - innerR - 7);

  text.addEventListener("click", () => {
    showPopup(label, color);
  });
}

function fitLabel(text, availableWidth) {
  let fontSize = 12;
  text.style.fontSize = `${fontSize}px`;

  while (fontSize > 4.5 && text.getComputedTextLength() > availableWidth) {
    fontSize -= 0.5;
    text.style.fontSize = `${fontSize}px`;
  }
}

function setupZoomListener(svg) {
  let zoomLevel = 1;
  const minZoom = 0.2;
  const maxZoom = 5;
  const zoomFactor = 0.1;

  svg.addEventListener("wheel", (e) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? -1 : 1;
    const newZoom = zoomLevel + direction * zoomFactor;

    zoomLevel = Math.min(Math.max(newZoom, minZoom), maxZoom);
    svg.style.transform = `scale(${zoomLevel})`;
  });
}

for (const node of visualNodes) {
  const innerR = ringStartRadius[node.depth];
  const outerR = innerR + ringWidths[node.depth];
  drawArcWedge(centerX, centerY, innerR, outerR, node.angle, node.sweep, node.color, node.label);
}

setupZoomListener(svg);



function showPopup(label, color) {
  const popup = document.getElementById("popup");
  const popupLabel = document.getElementById("popup-label");
  const popupEnglish = document.getElementById("popup-english");
  const language = languages.find(({ code }) => code === selectedLanguage);

  popup.dataset.englishLabel = label;
  popup.dataset.color = color;
  popupLabel.textContent = translateEmotion(label, selectedLanguage);
  popupLabel.dir = language?.direction ?? "ltr";
  popupEnglish.textContent = selectedLanguage === "en" ? "" : `English: ${label}`;
  popupEnglish.hidden = selectedLanguage === "en";
  popup.style.borderColor = color;
  popup.hidden = false;
}

function hidePopup() {
  document.getElementById("popup").hidden = true;
}

// Close when clicking the ✖
document.getElementById("popup-close").addEventListener("click", hidePopup);

function setLanguage(languageCode) {
  const language = languages.find(({ code }) => code === languageCode) ?? languages[0];
  selectedLanguage = language.code;
  document.documentElement.lang = language.code;
  translationRoute.textContent = language.code === "en"
    ? "English reference"
    : `English → ${language.name}`;

  svg.querySelectorAll("text[data-english-label]").forEach((text) => {
    text.textContent = translateEmotion(text.dataset.englishLabel, language.code);
    text.setAttribute("direction", language.direction);
    fitLabel(text, 53);
  });

  const popup = document.getElementById("popup");
  if (!popup.hidden && popup.dataset.englishLabel) {
    showPopup(popup.dataset.englishLabel, popup.dataset.color ?? "#222");
  }

  try {
    localStorage.setItem("emotion-wheel-language", language.code);
  } catch {
    // Language persistence is optional when storage is unavailable.
  }

  const url = new URL(window.location.href);
  if (language.code === "en") {
    url.searchParams.delete("lang");
  } else {
    url.searchParams.set("lang", language.code);
  }
  history.replaceState(null, "", url);
}

for (const language of languages) {
  const option = document.createElement("option");
  option.value = language.code;
  option.textContent = language.name;
  languageSelect.appendChild(option);
}

try {
  const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
  const savedLanguage = localStorage.getItem("emotion-wheel-language");
  if (languages.some(({ code }) => code === requestedLanguage)) {
    selectedLanguage = requestedLanguage;
  } else if (languages.some(({ code }) => code === savedLanguage)) {
    selectedLanguage = savedLanguage;
  }
} catch {
  // Default to English when storage is unavailable.
}

languageSelect.value = selectedLanguage;
setLanguage(selectedLanguage);
languageSelect.addEventListener("change", () => {
  setLanguage(languageSelect.value);
  sidebar.classList.remove("is-open");
  sidebarToggle.textContent = "Languages";
  sidebarToggle.setAttribute("aria-expanded", "false");
});

sidebarToggle.addEventListener("click", () => {
  const isOpen = sidebar.classList.toggle("is-open");
  sidebarToggle.textContent = isOpen ? "Close" : "Languages";
  sidebarToggle.setAttribute("aria-expanded", String(isOpen));
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  hidePopup();
  sidebar.classList.remove("is-open");
  sidebarToggle.textContent = "Languages";
  sidebarToggle.setAttribute("aria-expanded", "false");
});


// dynamically resize viewbox to fit full wheel
const lastRadius = ringStartRadius[Math.max(...Object.keys(ringStartRadius))];
const lastWidth = ringWidths[Math.max(...Object.keys(ringWidths))];
const outerR = lastRadius + lastWidth;

const padding = 20;
const viewBoxMinX = centerX - outerR - padding;
const viewBoxMinY = centerY - outerR - padding;
const viewBoxSize = outerR * 2 + padding * 2;

svg.setAttribute("viewBox", `${viewBoxMinX} ${viewBoxMinY} ${viewBoxSize} ${viewBoxSize}`);
