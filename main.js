import { NoiseGenerator } from './noise-generator.js';
import { FrameManager } from './frame-manager.js';
import { AnimationController } from './animation-controller.js';
import { GifGenerator } from './gif-generator.js';
import { UIController } from './ui-controller.js';

class App {
    constructor() {
        this.initElements();
        this.initComponents();
        this.setupEventListeners();
        this.initialSetup();
    }

    initElements() {
        this.framesList = document.getElementById('frames-list');
        this.addFrameBtn = document.getElementById('add-frame-btn');
        this.scrambledOutput = document.getElementById('output-scrambled');
        this.hiddenOutput = document.getElementById('output-hidden');
        this.outputContainer = document.getElementById('output-container');
        this.noiseCanvas = document.getElementById('noise-canvas');
        this.playPauseBtn = document.getElementById('play-pause-animation');
        this.generateGifBtn = document.getElementById('generate-gif-btn');
        this.gifStatusEl = document.getElementById('gif-status');

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

    initComponents() {
        this.noiseGenerator = new NoiseGenerator(this.noiseCanvas);
        
        this.frameManager = new FrameManager(this.framesList, (action) => {
            if (action === 'remove') {
                this.animationController.stop();
            }
            this.updateOutput();
        });

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
            this.gifStatusEl
        );

        this.uiController = new UIController(this.controls, this.valueDisplays, this.noiseGenerator);
        this.uiController.setOnSettingsChange(() => {
            if (this.animationController.isPlaying()) {
                this.animationController.stop();
            }
        });
    }

    setupEventListeners() {
        this.addFrameBtn.addEventListener('click', () => {
            this.frameManager.createFrameInput();
        });

        this.generateGifBtn.addEventListener('click', async () => {
            this.generateGifBtn.disabled = true;
            this.playPauseBtn.disabled = true;
            this.gifStatusEl.textContent = 'Initializing...';
            
            try {
                await this.gifGenerator.generate(this.animationController);
            } catch (error) {
                console.error('GIF generation failed:', error);
                this.gifStatusEl.textContent = 'Generation failed.';
            } finally {
                this.generateGifBtn.disabled = false;
                this.playPauseBtn.disabled = false;
            }
        });

        // Resize observer for the output container
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                this.noiseCanvas.width = width;
                this.noiseCanvas.height = height;
                this.uiController.updateStyles();
            }
        });

        resizeObserver.observe(this.outputContainer);
    }

    updateOutput(frameIndex = null) {
        const frames = this.frameManager.getFramesData();
        if (frames.length > 0) {
            const currentFrameIndex = frameIndex !== null ? frameIndex : this.animationController.getCurrentFrame();
            const actualFrameIndex = currentFrameIndex % frames.length;
            const currentFrameData = frames[actualFrameIndex];
            
            // Highlight the current frame in the UI
            document.querySelectorAll('.frame-item').forEach((item, index) => {
                if (this.animationController.isPlaying()) {
                    item.style.borderColor = index === actualFrameIndex ? '#007bff' : '#ddd';
                } else {
                    item.style.borderColor = '#ddd';
                }
            });

            // Update text content
            this.scrambledOutput.textContent = currentFrameData.scrambled;
            this.hiddenOutput.textContent = currentFrameData.hidden || '';
            
            // Handle image display in the output
            this.updateImageDisplay(currentFrameData);
        } else {
            this.scrambledOutput.textContent = '';
            this.hiddenOutput.textContent = '';
            document.querySelectorAll('.frame-item').forEach(item => {
                item.style.borderColor = '#ddd';
            });
        }
    }

    updateImageDisplay(frameData) {
        // Remove existing image elements
        const existingImages = this.outputContainer.querySelectorAll('.output-image');
        existingImages.forEach(img => img.remove());

        // Add scrambled image - handle both single images and GIF frames
        if (frameData.scrambledImageFrames && frameData.scrambledImageFrames.length > 0) {
            // For GIF frames, show the first frame (could be enhanced to cycle through frames)
            const currentGifFrame = frameData.scrambledImageFrames[0];
            this.displayProcessedImage(currentGifFrame.canvas, 'scrambled');
        } else if (frameData.scrambledImage && frameData.processedScrambledImage) {
            this.displayProcessedImage(frameData.processedScrambledImage, 'scrambled');
        }

        // Add hidden image - handle both single images and GIF frames
        if (frameData.hiddenImageFrames && frameData.hiddenImageFrames.length > 0) {
            // For GIF frames, show the first frame (could be enhanced to cycle through frames)
            const currentGifFrame = frameData.hiddenImageFrames[0];
            this.displayProcessedImage(currentGifFrame.canvas, 'hidden');
        } else if (frameData.hiddenImage && frameData.processedHiddenImage) {
            this.displayProcessedImage(frameData.processedHiddenImage, 'hidden');
        }
    }

    displayProcessedImage(processedCanvas, type) {
        const img = document.createElement('img');
        img.className = `output-image output-image-${type}`;
        img.style.position = 'absolute';
        img.style.top = '20px';
        img.style.left = '20px';
        img.style.maxWidth = 'calc(100% - 40px)';
        img.style.maxHeight = 'calc(100% - 40px)';
        img.style.objectFit = 'contain';
        img.style.pointerEvents = 'none';
        
        if (type === 'scrambled') {
            img.style.mixBlendMode = this.controls.scrambledBlendMode.value;
        } else {
            const offsetX = parseInt(this.controls.hiddenOffsetX.value, 10);
            const offsetY = parseInt(this.controls.hiddenOffsetY.value, 10);
            img.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            img.style.mixBlendMode = this.controls.hiddenBlendMode.value;
        }
        
        img.src = processedCanvas.toDataURL();
        this.outputContainer.appendChild(img);
    }

    displayImage(imageFile, type) {
        // Legacy method - keeping for backward compatibility
        const img = document.createElement('img');
        img.className = `output-image output-image-${type}`;
        img.style.position = 'absolute';
        img.style.top = '20px';
        img.style.left = '20px';
        img.style.maxWidth = 'calc(100% - 40px)';
        img.style.maxHeight = 'calc(100% - 40px)';
        img.style.objectFit = 'contain';
        img.style.pointerEvents = 'none';
        
        if (type === 'scrambled') {
            img.style.filter = `hue-rotate(0deg) saturate(0%) brightness(50%) sepia(100%) hue-rotate(0deg) saturate(600%) brightness(100%)`;
            img.style.mixBlendMode = this.controls.scrambledBlendMode.value;
        } else {
            const offsetX = parseInt(this.controls.hiddenOffsetX.value, 10);
            const offsetY = parseInt(this.controls.hiddenOffsetY.value, 10);
            img.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            img.style.filter = `hue-rotate(180deg) saturate(100%) brightness(70%)`;
            img.style.mixBlendMode = this.controls.hiddenBlendMode.value;
        }
        
        img.src = URL.createObjectURL(imageFile);
        this.outputContainer.appendChild(img);
    }

    initialSetup() {
        // Create initial frame
        this.frameManager.createFrameInput(
            'THISE ISW AJUMBLEF OF LETTERS ANDX WORDS TOD HIDES A MESSAGE.',
            'THIS IS A HIDDEN MESSAGE. YOU FOUND IT! GREAT JOB DETECTIVE!'
        );
        
        // Initial size setup
        const initialRect = this.outputContainer.getBoundingClientRect();
        this.noiseCanvas.width = initialRect.width;
        this.noiseCanvas.height = initialRect.height;
        
        this.uiController.updateStyles();
        this.updateOutput();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});