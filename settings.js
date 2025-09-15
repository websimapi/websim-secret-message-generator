import { populateSelect } from './utils.js';
import { generateNoise } from './noise.js';

export const controls = {
    scrambledColor: document.getElementById('scrambled-color'),
    scrambledBlendMode: document.getElementById('scrambled-blend-mode'),
    hiddenColor: document.getElementById('hidden-color'),
    hiddenBlendMode: document.getElementById('hidden-blend-mode'),
    hiddenOffsetX: document.getElementById('hidden-offset-x'),
    hiddenOffsetY: document.getElementById('hidden-offset-y'),
    fontSize: document.getElementById('font-size'),
    fontWeight: document.getElementById('font-weight'),
    letterSpacing: document.getElementById('letter-spacing'),
    lineHeight: document.getElementById('line-height'),
    bgColor: document.getElementById('bg-color'),
    noiseOpacity: document.getElementById('noise-opacity'),
    noiseType: document.getElementById('noise-type'),
    noiseScale: document.getElementById('noise-scale'),
    gifFps: document.getElementById('gif-fps'),
};

const valueDisplays = {
    hiddenOffsetX: document.getElementById('hidden-offset-x-value'),
    hiddenOffsetY: document.getElementById('hidden-offset-y-value'),
    fontSize: document.getElementById('font-size-value'),
    fontWeight: document.getElementById('font-weight-value'),
    letterSpacing: document.getElementById('letter-spacing-value'),
    lineHeight: document.getElementById('line-height-value'),
    noiseOpacity: document.getElementById('noise-opacity-value'),
    noiseScale: document.getElementById('noise-scale-value'),
    gifFps: document.getElementById('gif-fps-value'),
};

const blendModes = [
    'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 
    'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference',
    'exclusion', 'hue', 'saturation', 'color', 'luminosity'
];

const scrambledOutput = document.getElementById('output-scrambled');
const hiddenOutput = document.getElementById('output-hidden');
const outputContainer = document.getElementById('output-container');
const noiseCanvas = document.getElementById('noise-canvas');

export function updateStyles() {
    // Scrambled Text
    scrambledOutput.style.color = controls.scrambledColor.value;
    scrambledOutput.style.mixBlendMode = controls.scrambledBlendMode.value;

    // Hidden Text
    const offsetX = controls.hiddenOffsetX.value;
    const offsetY = controls.hiddenOffsetY.value;
    hiddenOutput.style.color = controls.hiddenColor.value;
    hiddenOutput.style.mixBlendMode = controls.hiddenBlendMode.value;
    hiddenOutput.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    
    // General Text
    const fontSize = controls.fontSize.value;
    const fontWeight = controls.fontWeight.value;
    const letterSpacing = controls.letterSpacing.value;
    const lineHeight = controls.lineHeight.value;
    
    const sharedTextStyle = `
        font-size: ${fontSize}px;
        font-weight: ${fontWeight};
        letter-spacing: ${letterSpacing}px;
        line-height: ${lineHeight};
    `;
    scrambledOutput.style.cssText += sharedTextStyle;
    hiddenOutput.style.cssText += sharedTextStyle;

    // Background
    const noiseOpacity = controls.noiseOpacity.value;
    outputContainer.style.backgroundColor = controls.bgColor.value;
    noiseCanvas.style.opacity = noiseOpacity;

    // Update value displays
    for (const key in valueDisplays) {
        if (valueDisplays[key] && controls[key]) {
            valueDisplays[key].textContent = controls[key].value;
        }
    }
    
    // Regenerate noise if noise-related settings changed
    generateNoise();
}

export function setupSettings() {
    // Populate dropdowns
    populateSelect(controls.scrambledBlendMode, blendModes, 'lighten');
    populateSelect(controls.hiddenBlendMode, blendModes, 'darken');

    // Add event listeners
    for (const key in controls) {
        controls[key].addEventListener('input', async () => {
             // Stop and reset animation if settings change
            const { stopAnimation, animationState } = await import('./animation.js');
            if (animationState.isPlaying) {
                stopAnimation();
            }
            updateStyles();
        });
    }
}