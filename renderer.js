import { elements } from './ui.js';
import * as state from './state.js';
import { animationState } from './animation.js';

const noiseCtx = elements.noiseCanvas.getContext('2d');

function generateNoise() {
    const scale = parseInt(elements.controls.noiseScale.value, 10);
    const type = elements.controls.noiseType.value;
    const w = elements.noiseCanvas.width;
    const h = elements.noiseCanvas.height;

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

function updateStyles() {
    // Scrambled Text
    elements.scrambledOutput.style.color = elements.controls.scrambledColor.value;
    elements.scrambledOutput.style.mixBlendMode = elements.controls.scrambledBlendMode.value;

    // Hidden Text
    const offsetX = elements.controls.hiddenOffsetX.value;
    const offsetY = elements.controls.hiddenOffsetY.value;
    elements.hiddenOutput.style.color = elements.controls.hiddenColor.value;
    elements.hiddenOutput.style.mixBlendMode = elements.controls.hiddenBlendMode.value;
    elements.hiddenOutput.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    
    // General Text
    const fontSize = elements.controls.fontSize.value;
    const fontWeight = elements.controls.fontWeight.value;
    const letterSpacing = elements.controls.letterSpacing.value;
    const lineHeight = elements.controls.lineHeight.value;
    
    const sharedTextStyle = `
        font-size: ${fontSize}px;
        font-weight: ${fontWeight};
        letter-spacing: ${letterSpacing}px;
        line-height: ${lineHeight};
    `;
    elements.scrambledOutput.style.cssText += sharedTextStyle;
    elements.hiddenOutput.style.cssText += sharedTextStyle;

    // Background
    elements.outputContainer.style.backgroundColor = elements.controls.bgColor.value;
    elements.noiseCanvas.style.opacity = elements.controls.noiseOpacity.value;

    // Update value displays
    for (const key in elements.valueDisplays) {
        if (elements.valueDisplays[key] && elements.controls[key]) {
            elements.valueDisplays[key].textContent = elements.controls[key].value;
        }
    }
    
    generateNoise();
}

export function update() {
    const frames = state.getFrames();
    if (frames.length > 0) {
        const frameIndex = animationState.currentFrame % frames.length;
        const currentFrameData = frames[frameIndex];
        
        elements.scrambledOutput.textContent = currentFrameData.scrambled;
        elements.hiddenOutput.textContent = currentFrameData.hidden;

        document.querySelectorAll('.frame-item').forEach((item, index) => {
            item.style.borderColor = (animationState.isPlaying && index === frameIndex) ? '#007bff' : '#ddd';
        });
    } else {
        elements.scrambledOutput.textContent = '';
        elements.hiddenOutput.textContent = '';
        document.querySelectorAll('.frame-item').forEach(item => {
            item.style.borderColor = '#ddd';
        });
    }
    updateStyles();
}

export function drawFrameToCanvas(ctx, frameData) {
    const { width, height } = ctx.canvas;

    // 1. Background color
    ctx.fillStyle = elements.controls.bgColor.value;
    ctx.fillRect(0, 0, width, height);

    // 2. Noise
    ctx.globalAlpha = parseFloat(elements.controls.noiseOpacity.value);
    ctx.drawImage(elements.noiseCanvas, 0, 0);
    ctx.globalAlpha = 1.0;

    // 3. Text rendering
    const baseStyles = window.getComputedStyle(elements.scrambledOutput);
    const x = parseFloat(baseStyles.left);
    const y = parseFloat(baseStyles.top);
    ctx.textBaseline = 'top';

    const fontSize = elements.controls.fontSize.value;
    const fontWeight = elements.controls.fontWeight.value;
    const font = `${fontWeight} ${fontSize}px 'Courier New', Courier, monospace`;
    ctx.font = font;
    
    const lineHeight = parseFloat(elements.controls.lineHeight.value);

    const drawText = (text, startX, startY) => {
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], startX, startY + (i * lineHeight * fontSize));
        }
    };
    
    // Draw Scrambled Text
    ctx.globalCompositeOperation = elements.controls.scrambledBlendMode.value;
    ctx.fillStyle = elements.controls.scrambledColor.value;
    drawText(frameData.scrambled, x, y);

    // Draw Hidden Text
    ctx.globalCompositeOperation = elements.controls.hiddenBlendMode.value;
    ctx.fillStyle = elements.controls.hiddenColor.value;
    const offsetX = parseInt(elements.controls.hiddenOffsetX.value, 10);
    const offsetY = parseInt(elements.controls.hiddenOffsetY.value, 10);
    drawText(frameData.hidden, x + offsetX, y + offsetY);
}