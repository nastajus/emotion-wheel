// === Emotion Wheel: Hierarchical Structure with Concentric Wedges ===

// Step 1: Generate hierarchical data with 3 levels

// === Option 1: Literal Emotion Tree (future multilingual support) ===
//import { literalEmotionTree } from './emotionTreeDataTest.js';
import { literalEmotionTree } from './emotionTreeDataJunto.js';
import { languages, translateEmotion } from './translations.js';
import { getDefinition } from './definitions.js';


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
const emotionContainer = document.getElementById("emotion-container");
const wheelStage = document.getElementById("wheel-stage");
const languageCurrent = document.getElementById("language-current");
const languageMenu = document.getElementById("language-menu");
const languageOptions = document.getElementById("language-options");
const languagesAll = document.getElementById("languages-all");
const languagesNone = document.getElementById("languages-none");
const translationRoute = document.getElementById("translation-route");
const sidebarToggle = document.getElementById("sidebar-toggle");
let selectedLanguage = "en";
let enabledLanguages = new Set(languages.map(({ code }) => code));
const centerX = 200;
const centerY = 200;
const rotationDegrees = 0; // Rotate so the top becomes the starting point
const rotationOffset = degToRad(rotationDegrees);

const visualNodes = generateVisualNodes(emotionTree);
visualNodes.forEach((node, index) => { node.id = String(index); });

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

function drawArcWedge(centerX, centerY, innerR, outerR, startAngle, sweep, color, label, nodeId, depth) {
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
  path.dataset.nodeId = nodeId;
  path.dataset.depth = depth;
  path.addEventListener("click", () => showPopup(label, color, nodeId));
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
  text.dataset.nodeId = nodeId;
  text.dataset.depth = depth;
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
    showPopup(label, color, nodeId);
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

function setupWheelNavigation(viewport, stage, wheel) {
  let zoomLevel = 1;
  let initialized = false;
  let resizeFrame = null;
  let dragState = null;
  let suppressNextClick = false;
  let metrics = null;
  let centerWheelPoint = { x: 0.5, y: 0.5 };
  const minZoom = 0.35;
  const maxZoom = 5;

  function captureAnchor(clientX, clientY) {
    const viewportRect = viewport.getBoundingClientRect();
    const wheelRect = wheel.getBoundingClientRect();

    if (!wheelRect.width || !wheelRect.height) return null;

    return {
      viewportX: clientX - viewportRect.left,
      viewportY: clientY - viewportRect.top,
      wheelX: (clientX - wheelRect.left) / wheelRect.width,
      wheelY: (clientY - wheelRect.top) / wheelRect.height
    };
  }

  function rememberViewportCenter() {
    if (!metrics) return;
    if (
      viewport.clientWidth !== metrics.viewportWidth ||
      viewport.clientHeight !== metrics.viewportHeight
    ) return;

    centerWheelPoint = {
      x: (viewport.scrollLeft + metrics.viewportWidth / 2 - metrics.wheelLeft) / metrics.wheelSize,
      y: (viewport.scrollTop + metrics.viewportHeight / 2 - metrics.wheelTop) / metrics.wheelSize
    };
  }

  function layoutWheel(anchor = null) {
    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;
    if (!viewportWidth || !viewportHeight) return;

    const fittedSize = Math.min(viewportWidth, viewportHeight);
    const wheelSize = fittedSize * zoomLevel;
    const stageWidth = Math.max(viewportWidth, wheelSize);
    const stageHeight = Math.max(viewportHeight, wheelSize);
    const wheelLeft = (stageWidth - wheelSize) / 2;
    const wheelTop = (stageHeight - wheelSize) / 2;

    stage.style.width = `${stageWidth}px`;
    stage.style.height = `${stageHeight}px`;
    wheel.style.width = `${wheelSize}px`;
    wheel.style.height = `${wheelSize}px`;
    wheel.style.left = `${wheelLeft}px`;
    wheel.style.top = `${wheelTop}px`;
    wheel.dataset.zoom = zoomLevel.toFixed(3);

    metrics = {
      viewportWidth,
      viewportHeight,
      wheelSize,
      wheelLeft,
      wheelTop
    };

    if (anchor) {
      viewport.scrollLeft = wheelLeft + anchor.wheelX * wheelSize - anchor.viewportX;
      viewport.scrollTop = wheelTop + anchor.wheelY * wheelSize - anchor.viewportY;
    } else if (!initialized) {
      viewport.scrollLeft = (stageWidth - viewportWidth) / 2;
      viewport.scrollTop = (stageHeight - viewportHeight) / 2;
    }

    initialized = true;
    rememberViewportCenter();
  }

  viewport.addEventListener("wheel", (event) => {
    event.preventDefault();
    const anchor = captureAnchor(event.clientX, event.clientY);
    const nextZoom = Math.min(
      maxZoom,
      Math.max(minZoom, zoomLevel * Math.exp(-event.deltaY * 0.0015))
    );

    if (nextZoom === zoomLevel) return;
    zoomLevel = nextZoom;
    layoutWheel(anchor);
  }, { passive: false });

  viewport.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
      moved: false
    };
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    if (!dragState.moved && Math.hypot(deltaX, deltaY) < 4) return;
    if (!dragState.moved) viewport.setPointerCapture(event.pointerId);
    dragState.moved = true;
    viewport.classList.add("is-panning");
    viewport.scrollLeft = dragState.scrollLeft - deltaX;
    viewport.scrollTop = dragState.scrollTop - deltaY;
  });

  function endDrag(event) {
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    if (dragState.moved) {
      suppressNextClick = true;
      setTimeout(() => { suppressNextClick = false; }, 50);
    }

    if (viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
    dragState = null;
    viewport.classList.remove("is-panning");
  }

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  viewport.addEventListener("scroll", rememberViewportCenter, { passive: true });
  viewport.addEventListener("click", (event) => {
    if (!suppressNextClick) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  const resizeObserver = new ResizeObserver(() => {
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = null;
      const anchor = initialized ? {
        viewportX: viewport.clientWidth / 2,
        viewportY: viewport.clientHeight / 2,
        wheelX: centerWheelPoint.x,
        wheelY: centerWheelPoint.y
      } : null;
      layoutWheel(anchor);
    });
  });
  resizeObserver.observe(viewport);
  layoutWheel();
}

for (const node of visualNodes) {
  const innerR = ringStartRadius[node.depth];
  const outerR = innerR + ringWidths[node.depth];
  drawArcWedge(
    centerX,
    centerY,
    innerR,
    outerR,
    node.angle,
    node.sweep,
    node.color,
    node.label,
    node.id,
    node.depth
  );
}

setupWheelNavigation(emotionContainer, wheelStage, svg);

const popup = document.getElementById("popup");
const popupLabel = document.getElementById("popup-label");
const popupEnglish = document.getElementById("popup-english");
const definitionEnglishToggle = document.getElementById("definition-english-toggle");
const definitionEnglishPanel = document.getElementById("definition-english-panel");
const definitionEnglishText = document.getElementById("definition-english-text");
const definitionTranslatedToggle = document.getElementById("definition-translated-toggle");
const definitionTranslatedPanel = document.getElementById("definition-translated-panel");
const definitionTranslatedText = document.getElementById("definition-translated-text");
const definitionTranslatedName = document.getElementById("definition-translated-name");
let selectedNodeId = null;
let lastPopupWheelStep = 0;

function highlightNode(nodeId) {
  svg.querySelectorAll(".is-active").forEach((element) => element.classList.remove("is-active"));
  svg.querySelectorAll(`[data-node-id="${nodeId}"]`)
    .forEach((element) => element.classList.add("is-active"));
}

function showPopup(label, color, nodeId = selectedNodeId) {
  const language = languages.find(({ code }) => code === selectedLanguage);

  selectedNodeId = String(nodeId);
  popup.dataset.englishLabel = label;
  popup.dataset.color = color;
  popup.dataset.nodeId = selectedNodeId;
  popupLabel.textContent = translateEmotion(label, selectedLanguage);
  popupLabel.dir = language?.direction ?? "ltr";
  popupEnglish.textContent = selectedLanguage === "en" ? "" : `English: ${label}`;
  popupEnglish.hidden = selectedLanguage === "en";
  popup.style.borderColor = color;
  popup.style.boxShadow = `0 12px 40px rgba(0, 0, 0, 0.35), 0 0 28px ${color}`;
  positionPopup();
  popup.hidden = false;
  definitionTranslatedName.textContent = `${language?.name ?? "Selected language"} definition`;
  definitionTranslatedToggle.disabled = selectedLanguage === "en";
  if (selectedLanguage === "en") {
    setDefinitionExpanded(definitionTranslatedToggle, definitionTranslatedPanel, false);
  }
  highlightNode(selectedNodeId);
  renderDefinitions();
}

function positionPopup() {
  const viewportRect = emotionContainer.getBoundingClientRect();
  popup.style.left = `${viewportRect.left + viewportRect.width / 2}px`;
}

new ResizeObserver(positionPopup).observe(emotionContainer);

function hidePopup() {
  popup.hidden = true;
  selectedNodeId = null;
  svg.querySelectorAll(".is-active").forEach((element) => element.classList.remove("is-active"));
}

// Close when clicking the ✖
document.getElementById("popup-close").addEventListener("click", hidePopup);

function cycleSelectedNode(direction) {
  const selectedNode = visualNodes.find(({ id }) => id === selectedNodeId);
  if (!selectedNode) return;

  const ringNodes = visualNodes.filter(({ depth }) => depth === selectedNode.depth);
  const currentIndex = ringNodes.findIndex(({ id }) => id === selectedNode.id);
  const nextIndex = (currentIndex + direction + ringNodes.length) % ringNodes.length;
  const nextNode = ringNodes[nextIndex];
  showPopup(nextNode.label, nextNode.color, nextNode.id);
}

popup.addEventListener("wheel", (event) => {
  event.preventDefault();
  event.stopPropagation();

  const now = performance.now();
  if (event.deltaY === 0 || now - lastPopupWheelStep < 140) return;

  lastPopupWheelStep = now;
  cycleSelectedNode(event.deltaY > 0 ? 1 : -1);
}, { passive: false });

function setDefinitionExpanded(toggle, panel, expanded) {
  toggle.setAttribute("aria-expanded", String(expanded));
  toggle.querySelector(".definition-symbol").textContent = expanded ? "−" : "＋";
  panel.hidden = !expanded;
}

definitionEnglishToggle.addEventListener("click", () => {
  setDefinitionExpanded(
    definitionEnglishToggle,
    definitionEnglishPanel,
    definitionEnglishToggle.getAttribute("aria-expanded") !== "true"
  );
});

definitionTranslatedToggle.addEventListener("click", () => {
  if (definitionTranslatedToggle.disabled) return;
  setDefinitionExpanded(
    definitionTranslatedToggle,
    definitionTranslatedPanel,
    definitionTranslatedToggle.getAttribute("aria-expanded") !== "true"
  );
});

function renderDefinitions() {
  const label = popup.dataset.englishLabel;
  if (!label) return;

  definitionEnglishText.textContent = getDefinition(label, "en");
  definitionEnglishText.dir = "ltr";
  definitionTranslatedText.textContent = getDefinition(label, selectedLanguage);
  definitionTranslatedText.dir = selectedLanguage === "fa" ? "rtl" : "ltr";
}

function setLanguage(languageCode) {
  const language = languages.find(({ code }) => code === languageCode) ?? languages[0];
  selectedLanguage = language.code;
  languageCurrent.textContent = language.name;
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

  languageOptions.querySelectorAll(".language-option").forEach((row) => {
    row.classList.toggle("is-selected", row.dataset.language === language.code);
    row.setAttribute("aria-selected", String(row.dataset.language === language.code));
  });
}

for (const language of languages) {
  const row = document.createElement("li");
  row.className = "language-option";
  row.dataset.language = language.code;
  row.setAttribute("role", "option");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = true;
  checkbox.setAttribute("aria-label", `Include ${language.name} when scrolling`);

  const nameButton = document.createElement("button");
  nameButton.type = "button";
  nameButton.className = "language-name";
  nameButton.textContent = language.name;

  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      enabledLanguages.add(language.code);
    } else {
      enabledLanguages.delete(language.code);
    }
    row.classList.toggle("is-disabled", !checkbox.checked);
    saveEnabledLanguages();
  });

  nameButton.addEventListener("click", () => {
    checkbox.checked = true;
    enabledLanguages.add(language.code);
    row.classList.remove("is-disabled");
    saveEnabledLanguages();
    setLanguage(language.code);
    closeLanguageMenu();
  });

  row.append(checkbox, nameButton);
  languageOptions.appendChild(row);
}

function saveEnabledLanguages() {
  try {
    localStorage.setItem("emotion-wheel-enabled-languages", JSON.stringify([...enabledLanguages]));
  } catch {
    // Language filter persistence is optional when storage is unavailable.
  }
}

function syncEnabledLanguageRows() {
  languageOptions.querySelectorAll(".language-option").forEach((row) => {
    const enabled = enabledLanguages.has(row.dataset.language);
    row.querySelector("input").checked = enabled;
    row.classList.toggle("is-disabled", !enabled);
  });
}

function closeLanguageMenu() {
  languageMenu.hidden = true;
  languageCurrent.setAttribute("aria-expanded", "false");
}

try {
  const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
  const savedLanguage = localStorage.getItem("emotion-wheel-language");
  const savedEnabledLanguages = JSON.parse(
    localStorage.getItem("emotion-wheel-enabled-languages") ?? "null"
  );
  if (Array.isArray(savedEnabledLanguages)) {
    enabledLanguages = new Set(
      savedEnabledLanguages.filter((code) => languages.some((language) => language.code === code))
    );
  }
  if (languages.some(({ code }) => code === requestedLanguage)) {
    selectedLanguage = requestedLanguage;
  } else if (languages.some(({ code }) => code === savedLanguage)) {
    selectedLanguage = savedLanguage;
  }
} catch {
  // Default to English when storage is unavailable.
}

syncEnabledLanguageRows();
setLanguage(selectedLanguage);

languageCurrent.addEventListener("click", () => {
  languageMenu.hidden = !languageMenu.hidden;
  languageCurrent.setAttribute("aria-expanded", String(!languageMenu.hidden));
});

function cycleLanguage(direction) {
  const availableLanguages = languages.filter(({ code }) => enabledLanguages.has(code));
  if (availableLanguages.length === 0) return;

  const currentIndex = availableLanguages.findIndex(({ code }) => code === selectedLanguage);
  const startIndex = currentIndex === -1 ? (direction > 0 ? -1 : 0) : currentIndex;
  const nextIndex = (startIndex + direction + availableLanguages.length) % availableLanguages.length;
  setLanguage(availableLanguages[nextIndex].code);
}

let lastLanguageWheelStep = 0;
languageCurrent.addEventListener("wheel", (event) => {
  event.preventDefault();
  event.stopPropagation();

  const now = performance.now();
  if (event.deltaY === 0 || now - lastLanguageWheelStep < 140) return;

  lastLanguageWheelStep = now;
  cycleLanguage(event.deltaY > 0 ? 1 : -1);
}, { passive: false });

languageCurrent.addEventListener("keydown", (event) => {
  if (event.altKey || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
  event.preventDefault();
  cycleLanguage(event.key === "ArrowDown" ? 1 : -1);
});

languagesAll.addEventListener("click", () => {
  enabledLanguages = new Set(languages.map(({ code }) => code));
  syncEnabledLanguageRows();
  saveEnabledLanguages();
});

languagesNone.addEventListener("click", () => {
  enabledLanguages.clear();
  syncEnabledLanguageRows();
  saveEnabledLanguages();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest("#language-picker")) closeLanguageMenu();
});

function setSidebarCollapsed(collapsed) {
  document.body.classList.toggle("sidebar-collapsed", collapsed);
  sidebarToggle.textContent = collapsed ? "›" : "‹";
  sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
  sidebarToggle.setAttribute(
    "aria-label",
    collapsed ? "Expand language sidebar" : "Collapse language sidebar"
  );
  try {
    localStorage.setItem("emotion-wheel-sidebar-collapsed", String(collapsed));
  } catch {
    // Sidebar persistence is optional when storage is unavailable.
  }
}

let sidebarCollapsed = window.matchMedia("(max-width: 760px)").matches;
try {
  const savedSidebarState = localStorage.getItem("emotion-wheel-sidebar-collapsed");
  if (savedSidebarState !== null) sidebarCollapsed = savedSidebarState === "true";
} catch {
  // Use the viewport-aware default when storage is unavailable.
}
setSidebarCollapsed(sidebarCollapsed);

sidebarToggle.addEventListener("click", () => {
  setSidebarCollapsed(!document.body.classList.contains("sidebar-collapsed"));
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  hidePopup();
  closeLanguageMenu();
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
