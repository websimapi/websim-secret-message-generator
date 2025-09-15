export class AnimationController {
    constructor() {
        this.scrambledOutput = document.getElementById('output-scrambled');
        this.hiddenOutput = document.getElementById('output-hidden');
        this.playPauseBtn = document.getElementById('play-pause-animation');
        
        this.animationState = {
            isPlaying: false,
            intervalId: null,
            currentFrame: 0
        };
        
        this.onFrameChange = null;
    }

    init() {
        this.playPauseBtn.addEventListener('click', () => this.toggleAnimation());
    }

    updateOutput() {
        const frameManager = window.app?.frameManager;
        if (!frameManager) return;
        
        const frames = frameManager.getFramesData();
        if (frames.length > 0) {
            const frameIndex = this.animationState.currentFrame % frames.length;
            const currentFrameData = frames[frameIndex];
            
            if (this.onFrameChange && this.animationState.isPlaying) {
                this.onFrameChange(frameIndex);
            } else {
                frameManager.clearHighlight();
            }

            this.scrambledOutput.textContent = currentFrameData.scrambled;
            this.hiddenOutput.textContent = currentFrameData.hidden || '';
        } else {
            this.scrambledOutput.textContent = '';
            this.hiddenOutput.textContent = '';
            frameManager.clearHighlight();
        }
    }

    toggleAnimation() {
        if (this.animationState.isPlaying) {
            this.stopAnimation();
        } else {
            this.startAnimation();
        }
    }

    startAnimation() {
        const frameManager = window.app?.frameManager;
        if (!frameManager) return;
        
        const frames = frameManager.getFramesData();
        if (frames.length <= 1) return;

        this.animationState.isPlaying = true;
        this.playPauseBtn.textContent = 'Pause';

        const settingsController = window.app?.settingsController;
        const fps = settingsController ? settingsController.getFps() : 5;
        const delay = 1000 / fps;

        this.updateOutput();

        this.animationState.intervalId = setInterval(() => {
            this.animationState.currentFrame = (this.animationState.currentFrame + 1) % frames.length;
            this.updateOutput();
        }, delay);
    }

    stopAnimation() {
        if (this.animationState.intervalId) {
            clearInterval(this.animationState.intervalId);
        }
        this.animationState.isPlaying = false;
        this.animationState.currentFrame = 0;
        this.updateOutput();
        this.playPauseBtn.textContent = 'Play';
    }
}