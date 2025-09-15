import { UIController } from './ui-controller.js';
import { NoiseGenerator } from './noise-generator.js';
import { FrameManager } from './frame-manager.js';
import { AnimationController } from './animation-controller.js';
import { GifGenerator } from './gif-generator.js';

class App {
    constructor() {
        this.initializeDOMElements();
        
        this.noiseGenerator = new NoiseGenerator(this.noiseCanvas);
        this.uiController = new UIController(this.controls, this.valueDisplays, this.noiseGenerator);

        this.frameManager = new FrameManager(this.framesList, (type) => this.onFrameChange(type));
        
        this.animationController = new AnimationController(
            this.frameManager,
            (frameIndex) => this.updateOutput(frameIndex),
            this.playPauseBtn,
            this.controls.gifFps
        );

        this.gifGenerator = new GifGenerator(
            this.frameManager,
            this.outputContainer,
            this.noiseCanvas,
            this.controls,
            this.gifStatus
        );

        this.addFrameBtn.addEventListener('click', () => this.frameManager.createFrameInput('', ''));
        this.generateGifBtn.addEventListener('click', () => this.gifGenerator.generate(this.animationController));

        // Initial setup
        this.frameManager.createFrameInput('SCRAMBLED', 'SECRET');
        this.uiController.updateStyles(); // Update styles after everything is initialized
    }

    initializeDOMElements() {
        // Main containers
        this.framesList = document.getElementById('frames-list');
        this.outputContainer = document.getElementById('output-container');
        this.noiseCanvas = document.getElementById('noise-canvas');
        this.scrambledOutput = document.getElementById('output-scrambled');
        this.hiddenOutput = document.getElementById('output-hidden');

        // Buttons and Status
        this.addFrameBtn = document.getElementById('add-frame-btn');
        this.playPauseBtn = document.getElementById('play-pause-animation');
        this.generateGifBtn = document.getElementById('generate-gif-btn');
        this.gifStatus = document.getElementById('gif-status');

        // All settings controls
        this.controls = {
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

        // All display elements for range sliders
        this.valueDisplays = {
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
    }

    onFrameChange(type) {
        if (this.animationController.isPlaying()) {
            this.animationController.stop();
        }
        this.updateOutput(0);
    }
    
    updateOutput(frameIndex = 0) {
        const framesData = this.frameManager.getFramesData();
        const activeFrame = framesData[frameIndex] || framesData[0];
        
        if (activeFrame) {
            this.scrambledOutput.textContent = activeFrame.scrambled || '';
            this.hiddenOutput.textContent = activeFrame.hidden || '';

            this.updateMediaDisplay(this.scrambledOutput, activeFrame.scrambledImageFrames, activeFrame.processedScrambledImage);
            this.updateMediaDisplay(this.hiddenOutput, activeFrame.hiddenImageFrames, activeFrame.processedHiddenImage);
        } else {
             this.scrambledOutput.textContent = '';
             this.hiddenOutput.textContent = '';
             this.updateMediaDisplay(this.scrambledOutput, null, null);
             this.updateMediaDisplay(this.hiddenOutput, null, null);
        }

        // Highlight the active frame in the UI
        const frameItems = this.framesList.querySelectorAll('.frame-item');
        frameItems.forEach((item, index) => {
            if (this.animationController.isPlaying() && index === frameIndex) {
                item.style.borderColor = '#007bff';
                item.style.boxShadow = '0 0 5px rgba(0,123,255,0.5)';
            } else {
                item.style.borderColor = '#ddd';
                item.style.boxShadow = 'none';
            }
        });
    }

    updateMediaDisplay(outputElement, gifFrames, processedImage) {
        const existingImg = outputElement.querySelector('img.media-display');
        if (existingImg) {
            existingImg.remove();
        }

        let imageToShow = null;
        if (gifFrames && gifFrames.length > 0) {
            // If animation is playing, cycle through frames. Otherwise, show first frame.
            const frameIndex = this.animationController.isPlaying() ? this.animationController.getCurrentFrame() % gifFrames.length : 0;
            imageToShow = gifFrames[frameIndex].canvas;
        } else if (processedImage) {
            imageToShow = processedImage;
        }

        if (imageToShow) {
            const img = document.createElement('img');
            img.src = imageToShow.toDataURL();
            img.className = 'media-display';
            img.style.maxWidth = '100%';
            img.style.maxHeight = 'calc(100% - 2em)';
            outputElement.appendChild(img);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});