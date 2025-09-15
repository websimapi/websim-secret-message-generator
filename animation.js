import * as state from './state.js';
import * as renderer from './renderer.js';
import { elements } from './ui.js';

export const animationState = {
    isPlaying: false,
    intervalId: null,
    currentFrame: 0
};

export function toggle() {
    if (animationState.isPlaying) {
        stop();
    } else {
        start();
    }
}

function start() {
    const frames = state.getFrames();
    if (frames.length <= 1) return;

    animationState.isPlaying = true;
    elements.playPauseBtn.textContent = 'Pause';

    const fps = parseInt(elements.controls.gifFps.value, 10);
    const delay = 1000 / fps;

    renderer.update(); // Initial update to highlight first frame

    animationState.intervalId = setInterval(() => {
        animationState.currentFrame = (animationState.currentFrame + 1) % frames.length;
        renderer.update();
    }, delay);
}

export function stop() {
    if (animationState.intervalId) {
        clearInterval(animationState.intervalId);
        animationState.intervalId = null;
    }
    animationState.isPlaying = false;
    animationState.currentFrame = 0;
    elements.playPauseBtn.textContent = 'Play';
    renderer.update(); // Reset to first frame and remove highlight
}