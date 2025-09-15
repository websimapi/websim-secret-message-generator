import { getFramesData } from './ui.js';
import { controls } from './settings.js';
import { animationState, stopAnimation, startAnimation } from './animation.js';

const generateGifBtn = document.getElementById('generate-gif-btn');
const playPauseBtn = document.getElementById('play-pause-animation');
const gifStatusEl = document.getElementById('gif-status');
const outputContainer = document.getElementById('output-container');
const noiseCanvas = document.getElementById('noise-canvas');

export async function generateGif() {
    generateGifBtn.disabled = true;
    playPauseBtn.disabled = true;
    gifStatusEl.textContent = 'Initializing...';
    
    const frames = getFramesData();
    if (frames.length === 0) {
        gifStatusEl.textContent = 'Add at least one frame.';
        generateGifBtn.disabled = false;
        playPauseBtn.disabled = false;
        return;
    }
    
    // Temporarily stop live animation
    const wasPlaying = animationState.isPlaying;
    if (wasPlaying) stopAnimation();

    const { width, height } = outputContainer.getBoundingClientRect();
    const fps = parseInt(controls.gifFps.value, 10);
    const delay = 1000 / fps;

    const gif = new GIF({
        workers: 2,
        quality: 10,
        width: width,
        height: height
    });

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    const ctx = offscreenCanvas.getContext('2d');

    function drawFrame(frameData) {
        return new Promise(resolve => {
            // This timeout allows the DOM to potentially catch up, but main logic is canvas-based
            setTimeout(() => {
                // 1. Background color
                ctx.fillStyle = controls.bgColor.value;
                ctx.fillRect(0, 0, width, height);

                // 2. Noise
                ctx.globalAlpha = parseFloat(controls.noiseOpacity.value);
                ctx.drawImage(noiseCanvas, 0, 0);
                ctx.globalAlpha = 1.0;

                // 3. Text rendering
                const scrambledOutput = document.getElementById('output-scrambled');
                const baseStyles = window.getComputedStyle(scrambledOutput);
                const x = parseFloat(baseStyles.left);
                const y = parseFloat(baseStyles.top);
                ctx.textBaseline = 'top';

                // Get shared styles
                const fontSize = controls.fontSize.value;
                const fontWeight = controls.fontWeight.value;
                const letterSpacing = controls.letterSpacing.value; // Not easily doable on canvas
                const font = `${fontWeight} ${fontSize}px 'Courier New', Courier, monospace`;
                ctx.font = font;

                // Function to draw multiline text
                const drawText = (text, startX, startY, lineHeight) => {
                    const lines = text.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        ctx.fillText(lines[i], startX, startY + (i * lineHeight * fontSize));
                    }
                };
                
                const lineHeight = parseFloat(controls.lineHeight.value);

                // Draw Scrambled Text
                ctx.globalCompositeOperation = controls.scrambledBlendMode.value;
                ctx.fillStyle = controls.scrambledColor.value;
                drawText(frameData.scrambled, x, y, lineHeight);

                // Draw Hidden Text
                ctx.globalCompositeOperation = controls.hiddenBlendMode.value;
                ctx.fillStyle = controls.hiddenColor.value;
                const offsetX = parseInt(controls.hiddenOffsetX.value, 10);
                const offsetY = parseInt(controls.hiddenOffsetY.value, 10);
                drawText(frameData.hidden, x + offsetX, y + offsetY, lineHeight);

                resolve(ctx);
            }, 50); // Small delay to help rendering pipeline
        });
    }

    for (let i = 0; i < frames.length; i++) {
        gifStatusEl.textContent = `Rendering frame ${i + 1}/${frames.length}...`;
        const frameCtx = await drawFrame(frames[i]);
        gif.addFrame(frameCtx, { delay: delay, copy: true });
    }

    gif.on('finished', function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'secret-message.gif';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        gifStatusEl.textContent = 'Done!';
        generateGifBtn.disabled = false;
        playPauseBtn.disabled = false;
        if (wasPlaying) startAnimation();
    });
    
    gif.on('progress', function(p) {
        gifStatusEl.textContent = `Building GIF... ${Math.round(p * 100)}%`;
    });

    gif.render();
}

export function setupGifGeneration() {
    generateGifBtn.addEventListener('click', generateGif);
}