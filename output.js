import { getFramesData } from './ui.js';
import { animationState } from './animation.js';

const scrambledOutput = document.getElementById('output-scrambled');
const hiddenOutput = document.getElementById('output-hidden');

export function updateOutput() {
    const frames = getFramesData();
    if (frames.length > 0) {
        const frameIndex = animationState.currentFrame % frames.length;
        const currentFrameData = frames[frameIndex];
        
        // Highlight the current frame in the UI
        document.querySelectorAll('.frame-item').forEach((item, index) => {
            if (animationState.isPlaying) {
                item.style.borderColor = index === frameIndex ? '#007bff' : '#ddd';
            } else {
                item.style.borderColor = '#ddd';
            }
        });

        scrambledOutput.textContent = currentFrameData.scrambled;
        hiddenOutput.textContent = currentFrameData.hidden || '';
    } else {
        scrambledOutput.textContent = '';
        hiddenOutput.textContent = '';
        document.querySelectorAll('.frame-item').forEach(item => {
            item.style.borderColor = '#ddd';
        });
    }
}