const svg = document.getElementById("wheel");
const centerX = 200;
const centerY = 200;
const radius = 190;
const sliceCount = 40;
const emotions = Array.from({ length: sliceCount }, (_, i) => `E${i + 1}`); // Replace with actual emotions

for (let i = 0; i < sliceCount; i++) {
  const startAngle = (2 * Math.PI / sliceCount) * i;
  const endAngle = (2 * Math.PI / sliceCount) * (i + 1);
  const midAngle = (startAngle + endAngle) / 2;

  // Calculate arc points
  const x1 = centerX + radius * Math.cos(startAngle);
  const y1 = centerY + radius * Math.sin(startAngle);
  const x2 = centerX + radius * Math.cos(endAngle);
  const y2 = centerY + radius * Math.sin(endAngle);

  // --- Draw slice ---
  const hue = Math.floor((360 / sliceCount) * i);
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const d = `M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 0,1 ${x2},${y2} Z`;
  path.setAttribute("d", d);
  path.setAttribute("fill", `hsl(${hue}, 100%, 50%)`);
  svg.appendChild(path);

  // --- Draw separator line ---
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", centerX);
  line.setAttribute("y1", centerY);
  line.setAttribute("x2", x1);
  line.setAttribute("y2", y1);
  line.setAttribute("stroke", "black");
  line.setAttribute("stroke-width", 0.7); // adjust as needed
  svg.appendChild(line);

  // --- Add text label ---
  const labelRadius = radius * 0.6;
  const lx = centerX + labelRadius * Math.cos(midAngle);
  const ly = centerY + labelRadius * Math.sin(midAngle);

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", lx);
  text.setAttribute("y", ly);

  let rotation = (midAngle * 180) / Math.PI;
  if (rotation > 90 && rotation < 270) {
    rotation += 180; // Flip text on left side
  }

  text.setAttribute("transform", `rotate(${rotation}, ${lx}, ${ly})`);
  text.textContent = emotions[i];
  svg.appendChild(text);
}