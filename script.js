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

// Zoom and Pan logic
const container = document.querySelector('.svg-container');
let viewBox = { x: 0, y: 0, w: 400, h: 400 };
let isDragging = false;
let lastX = 0, lastY = 0;

function updateViewBox() {
  svg.setAttribute("viewBox", `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
}

svg.addEventListener("wheel", (e) => {
  e.preventDefault();
  const zoomFactor = 1.1;
  const zoom = e.deltaY > 0 ? zoomFactor : 1 / zoomFactor;

  const mx = e.offsetX / svg.clientWidth;
  const my = e.offsetY / svg.clientHeight;

  viewBox.x += viewBox.w * (mx - mx / zoom);
  viewBox.y += viewBox.h * (my - my / zoom);
  viewBox.w /= zoom;
  viewBox.h /= zoom;

  updateViewBox();
});

svg.addEventListener("mousedown", (e) => {
  isDragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  container.style.cursor = 'grabbing';
});

svg.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const dx = (e.clientX - lastX) * (viewBox.w / svg.clientWidth);
  const dy = (e.clientY - lastY) * (viewBox.h / svg.clientHeight);
  viewBox.x -= dx;
  viewBox.y -= dy;
  lastX = e.clientX;
  lastY = e.clientY;
  updateViewBox();
});

svg.addEventListener("mouseup", () => {
  isDragging = false;
  container.style.cursor = 'grab';
});

svg.addEventListener("mouseleave", () => {
  isDragging = false;
  container.style.cursor = 'grab';
});