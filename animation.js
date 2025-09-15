import { getFramesData } from './ui.js';
import { updateOutput } from './output.js';
import { controls } from './settings.js';

export const animationState = {
    isPlaying: false,
    intervalId: null,
    currentFrame: 0
};

const playPauseBtn = document.getElementById('play-pause-animation');

export function toggleAnimation() {
    if (animationState.isPlaying) {
        stopAnimation();
    } else {
        startAnimation();
    }
}

export function startAnimation() {
    const frames = getFramesData();
    if (frames.length <= 1) return;

    animationState.isPlaying = true;
    playPauseBtn.textContent = 'Pause';

    const fps = parseInt(controls.gifFps.value, 10);
    const delay = 1000 / fps;

    // Initial update to highlight first frame
    updateOutput(); 

    animationState.intervalId = setInterval(() => {
        animationState.currentFrame = (animationState.currentFrame + 1) % frames.length;
        updateOutput();
    }, delay);
}

export function stopAnimation() {
    if (animationState.intervalId) {
        clearInterval(animationState.intervalId);
    }
    animationState.isPlaying = false;
    animationState.currentFrame = 0;
    updateOutput(); // Reset to first frame and remove highlight
    playPauseBtn.textContent = 'Play';
}

export function setupAnimation() {
    playPauseBtn.addEventListener('click', toggleAnimation);
}