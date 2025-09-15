import { setupUI, createFrameInput } from './ui.js';
import { setupSettings } from './settings.js';
import { setupAnimation } from './animation.js';
import { setupGifGeneration } from './gif-generator.js';
import { initNoise } from './noise.js';
import { updateOutput } from './output.js';

function setup() {
    setupSettings();
    setupUI();
    setupAnimation();
    setupGifGeneration();
    initNoise();
    
    // Initial frame
    createFrameInput(
        'THISE ISW AJUMBLEF OF LETTERS ANDX WORDS TOD HIDES A MESSAGE.',
        'THIS IS A HIDDEN MESSAGE. YOU FOUND IT! GREAT JOB DETECTIVE!'
    );
    updateOutput();
}

setup();