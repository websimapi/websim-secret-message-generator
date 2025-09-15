import { controls, updateStyles } from './script.js';

const noiseCanvas = document.getElementById('noise-canvas');
const noiseCtx = noiseCanvas.getContext('2d');
const outputContainer = document.getElementById('output-container');

export function generateNoise() {
    const scale = parseInt(controls.noiseScale.value, 10);
    const type = controls.noiseType.value;
    const w = noiseCanvas.width;
    const h = noiseCanvas.height;

    noiseCtx.clearRect(0, 0, w, h);

    for (let y = 0; y < h; y += scale) {
        for (let x = 0; x < w; x += scale) {
            let r, g, b;
            if (type === 'color') {
                r = Math.floor(Math.random() * 256);
                g = Math.floor(Math.random() * 256);
                b = Math.floor(Math.random() * 256);
            } else { // grayscale
                const val = Math.floor(Math.random() * 256);
                r = g = b = val;
            }
            noiseCtx.fillStyle = `rgb(${r},${g},${b})`;
            noiseCtx.fillRect(x, y, scale, scale);
        }
    }
}

export function initNoise() {
    // Resize observer for the output container
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const { width, height } = entry.contentRect;
            noiseCanvas.width = width;
            noiseCanvas.height = height;
            updateStyles(); // Regenerate noise and update everything
        }
    });

    resizeObserver.observe(outputContainer);
    
    // Initial size setup
    const initialRect = outputContainer.getBoundingClientRect();
    noiseCanvas.width = initialRect.width;
    noiseCanvas.height = initialRect.height;
}