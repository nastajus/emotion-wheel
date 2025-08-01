// === Emotion Wheel: Hierarchical Structure with Concentric Wedges ===

// Step 1: Generate hierarchical data with 3 levels

// === Option 1: Literal Emotion Tree (future multilingual support) ===
//import { literalEmotionTree } from './emotionTreeDataTest.js';
import { literalEmotionTree } from './emotionTreeDataJunto.js';


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
const centerX = 200;
const centerY = 200;
//const rotationOffset = -Math.PI / 2; // Rotate 90° counterclockwise, so the top is the new origin
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

  const x0 = centerX + innerR * Math.cos(startAngle);
  const y0 = centerY + innerR * Math.sin(startAngle);
  const x1 = centerX + innerR * Math.cos(endAngle);
  const y1 = centerY + innerR * Math.sin(endAngle);
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

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  path.setAttribute("fill", color);
  svg.appendChild(path);

  const midAngle = startAngle + sweep / 2;
  const labelRadius = (innerR + outerR) / 2;
  const lx = centerX + labelRadius * Math.cos(midAngle);
  const ly = centerY + labelRadius * Math.sin(midAngle);

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", lx);
  text.setAttribute("y", ly);
  text.textContent = label;
  text.setAttribute("font-size", "6px");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "middle");

  let rotation = (midAngle * 180) / Math.PI;
  if (rotation > 90 && rotation < 270) {
    rotation += 180;
  }

  text.setAttribute("transform", `rotate(${rotation}, ${lx}, ${ly})`);
  svg.appendChild(text);
}

for (const node of visualNodes) {
  const innerR = ringStartRadius[node.depth];
  const outerR = innerR + ringWidths[node.depth];
  drawArcWedge(centerX, centerY, innerR, outerR, node.angle, node.sweep, node.color, node.label);
}
