const wheel = document.getElementById("wheel");
const sliceCount = 60;

for (let i = 0; i < sliceCount; i++) {
  const angle = (360 / sliceCount) * i;
  const hue = Math.floor((360 / sliceCount) * i);
  
  const slice = document.createElement("div");
  slice.classList.add("slice");
  slice.style.transform = `rotate(${angle}deg)`;
  slice.style.setProperty('--hue', hue);
  
  wheel.appendChild(slice);
}