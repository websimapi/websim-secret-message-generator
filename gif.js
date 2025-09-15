import * as state from './state.js';
import { elements } from './ui.js';
import * as animation from './animation.js';
import { drawFrameToCanvas } from './renderer.js';

export async function generate() {
    elements.generateGifBtn.disabled = true;
    elements.playPauseBtn.disabled = true;
    elements.gifStatusEl.textContent = 'Initializing...';
    
    const frames = state.getFrames();
    if (frames.length === 0) {
        elements.gifStatusEl.textContent = 'Add at least one frame.';
        elements.generateGifBtn.disabled = false;
        elements.playPauseBtn.disabled = false;
        return;
    }
    
    const wasPlaying = animation.animationState.isPlaying;
    if (wasPlaying) animation.stop();

    const { width, height } = elements.outputContainer.getBoundingClientRect();
    const fps = parseInt(elements.controls.gifFps.value, 10);
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

    for (let i = 0; i < frames.length; i++) {
        elements.gifStatusEl.textContent = `Rendering frame ${i + 1}/${frames.length}...`;
        // Use a small delay to allow the event loop to breathe
        await new Promise(resolve => setTimeout(resolve, 10));
        drawFrameToCanvas(ctx, frames[i]);
        gif.addFrame(ctx, { delay: delay, copy: true });
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
        
        elements.gifStatusEl.textContent = 'Done!';
        elements.generateGifBtn.disabled = false;
        elements.playPauseBtn.disabled = false;
        // Do not restart animation automatically
    });
    
    gif.on('progress', function(p) {
        elements.gifStatusEl.textContent = `Building GIF... ${Math.round(p * 100)}%`;
    });

    gif.render();
}