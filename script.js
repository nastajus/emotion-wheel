// === Emotion Wheel: Hierarchical Structure with Concentric Wedges ===

// Step 1: Generate hierarchical data with 3 levels
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
          `${childName}_A`,
          `${childName}_B`
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

const emotionTree = generateEmotionTree();

// Step 2: Convert HSL hue to pastel color
function pastelFromHue(hue) {
  return `hsl(${hue}, 60%, 85%)`; // pastel-ish tones
}

// Step 3: Calculate hue for middle/outer levels based on parent's hue and position
function deriveHue(baseHue, index, total, neighborLeft, neighborRight) {
  const blendRange = 20; // how far to blend
  const offset = ((index / (total - 1)) - 0.5) * 2; // from -1 to 1
  const neighborTarget = offset < 0 ? neighborLeft : neighborRight;
  const blendRatio = 0.3; // max 30% toward neighbor
  const targetHue = (1 - Math.abs(offset) * blendRatio) * baseHue + (Math.abs(offset) * blendRatio) * neighborTarget;
  return (targetHue + 360) % 360;
}

// Step 4: Flatten the structure into visual wedges with position and color
function generateVisualNodes(emotionTree) {
  const visualNodes = [];
  const totalParents = emotionTree.length;
  const fullCircle = 2 * Math.PI;
  let parentStartAngle = 0;

  for (let i = 0; i < totalParents; i++) {
    const parent = emotionTree[i];
    const nextParent = emotionTree[(i + 1) % totalParents];
    const prevParent = emotionTree[(i - 1 + totalParents) % totalParents];

    const parentSweep = fullCircle / totalParents;
    const parentHue = parent.baseHue;
    const parentColor = pastelFromHue(parentHue);

    visualNodes.push({
      label: parent.name,
      depth: 0,
      angle: parentStartAngle,
      sweep: parentSweep,
      color: parentColor
    });

    const middle = parent.children;
    let middleStartAngle = parentStartAngle;

    for (let j = 0; j < middle.length; j++) {
      const middleSweep = parentSweep / middle.length;
      const midHue = deriveHue(parentHue, j, middle.length, prevParent.baseHue, nextParent.baseHue);
      const midColor = pastelFromHue(midHue);

      visualNodes.push({
        label: middle[j].name,
        depth: 1,
        angle: middleStartAngle,
        sweep: middleSweep,
        color: midColor
      });

      const outer = middle[j].children;
      const outerSweep = middleSweep / outer.length;
      let outerStartAngle = middleStartAngle;

      for (let k = 0; k < outer.length; k++) {
        visualNodes.push({
          label: outer[k],
          depth: 2,
          angle: outerStartAngle,
          sweep: outerSweep,
          color: pastelFromHue(midHue)
        });
        outerStartAngle += outerSweep;
      }

      middleStartAngle += middleSweep;
    }

    parentStartAngle += parentSweep;
  }

  return visualNodes;
}

const visualNodes = generateVisualNodes(emotionTree);

// === SVG Rendering ===
const svg = document.getElementById("wheel");
const centerX = 200;
const centerY = 200;

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
