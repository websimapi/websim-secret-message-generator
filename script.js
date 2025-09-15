// Main application controller
import { FrameManager } from './js/frame-manager.js';
import { AnimationController } from './js/animation-controller.js';
import { SettingsController } from './js/settings-controller.js';
import { NoiseGenerator } from './js/noise-generator.js';
import { GifGenerator } from './js/gif-generator.js';

class SecretMessageApp {
    constructor() {
        this.frameManager = new FrameManager();
        this.animationController = new AnimationController();
        this.settingsController = new SettingsController();
        this.noiseGenerator = new NoiseGenerator();
        this.gifGenerator = new GifGenerator();
        
        this.init();
    }

    init() {
        this.frameManager.init();
        this.animationController.init();
        this.settingsController.init();
        this.noiseGenerator.init();
        this.gifGenerator.init();
        
        this.setupEventHandlers();
        this.setupInitialFrame();
    }

    setupEventHandlers() {
        // Connect components
        this.frameManager.onFramesChange = () => {
            this.animationController.updateOutput();
        };
        
        this.settingsController.onSettingsChange = () => {
            this.animationController.stopAnimation();
            this.updateStyles();
        };
        
        this.animationController.onFrameChange = (frameIndex) => {
            this.frameManager.highlightFrame(frameIndex);
        };
    }

    updateStyles() {
        this.settingsController.applyStyles();
        this.noiseGenerator.regenerate();
    }

    setupInitialFrame() {
        this.frameManager.createFrame(
            'THISE ISW AJUMBLEF OF LETTERS ANDX WORDS TOD HIDES A MESSAGE.',
            'THIS IS A HIDDEN MESSAGE. YOU FOUND IT! GREAT JOB DETECTIVE!'
        );
        this.animationController.updateOutput();
        this.updateStyles();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SecretMessageApp();
});