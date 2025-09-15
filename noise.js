import { noiseCanvas, noiseCtx, controls, outputContainer } from './elements.js';

export function generateNoise() {
  const scale = parseInt(controls.noiseScale.value, 10);
  const type = controls.noiseType.value;
  const w = noiseCanvas.width; const h = noiseCanvas.height;
  noiseCtx.clearRect(0, 0, w, h);
  for (let y = 0; y < h; y += scale) {
    for (let x = 0; x < w; x += scale) {
      let r, g, b;
      if (type === 'color') { r = Math.random()*256|0; g = Math.random()*256|0; b = Math.random()*256|0; }
      else { const v = Math.random()*256|0; r = g = b = v; }
      noiseCtx.fillStyle = `rgb(${r},${g},${b})`;
      noiseCtx.fillRect(x, y, scale, scale);
    }
  }
}

export function initNoiseResizeObserver(onResize) {
  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      const { width, height } = entry.contentRect;
      noiseCanvas.width = width; noiseCanvas.height = height;
      onResize();
    }
  });
  resizeObserver.observe(outputContainer);
}

