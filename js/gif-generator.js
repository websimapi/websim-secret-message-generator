export class GifGenerator {
    constructor() {
        this.generateGifBtn = document.getElementById('generate-gif-btn');
        this.playPauseBtn = document.getElementById('play-pause-animation');
        this.gifStatusEl = document.getElementById('gif-status');
        this.outputContainer = document.getElementById('output-container');
        this.noiseCanvas = document.getElementById('noise-canvas');
    }

    init() {
        this.generateGifBtn.addEventListener('click', () => this.generateGif());
    }

    async generateGif() {
        this.generateGifBtn.disabled = true;
        this.playPauseBtn.disabled = true;
        this.gifStatusEl.textContent = 'Initializing...';
        
        const frameManager = window.app?.frameManager;
        const animationController = window.app?.animationController;
        const settingsController = window.app?.settingsController;
        
        if (!frameManager || !animationController || !settingsController) {
            this.gifStatusEl.textContent = 'Error: Missing required components';
            this.generateGifBtn.disabled = false;
            this.playPauseBtn.disabled = false;
            return;
        }
        
        const frames = frameManager.getFramesData();
        if (frames.length === 0) {
            this.gifStatusEl.textContent = 'Add at least one frame.';
            this.generateGifBtn.disabled = false;
            this.playPauseBtn.disabled = false;
            return;
        }
        
        // Temporarily stop live animation
        const wasPlaying = animationController.animationState.isPlaying;
        if (wasPlaying) animationController.stopAnimation();

        const { width, height } = this.outputContainer.getBoundingClientRect();
        const fps = settingsController.getFps();
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
            this.gifStatusEl.textContent = `Rendering frame ${i + 1}/${frames.length}...`;
            await this.drawFrame(ctx, frames[i], settingsController, width, height);
            gif.addFrame(ctx, { delay: delay, copy: true });
        }

        gif.on('finished', (blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'secret-message.gif';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.gifStatusEl.textContent = 'Done!';
            this.generateGifBtn.disabled = false;
            this.playPauseBtn.disabled = false;
            if (wasPlaying) animationController.startAnimation();
        });
        
        gif.on('progress', (p) => {
            this.gifStatusEl.textContent = `Building GIF... ${Math.round(p * 100)}%`;
        });

        gif.render();
    }

    async drawFrame(ctx, frameData, settingsController, width, height) {
        return new Promise(resolve => {
            setTimeout(() => {
                const settings = settingsController.getAllSettings();
                
                // 1. Background color
                ctx.fillStyle = settings.bgColor;
                ctx.fillRect(0, 0, width, height);

                // 2. Noise
                ctx.globalAlpha = parseFloat(settings.noiseOpacity);
                ctx.drawImage(this.noiseCanvas, 0, 0);
                ctx.globalAlpha = 1.0;

                // 3. Text rendering
                const scrambledOutput = document.getElementById('output-scrambled');
                const baseStyles = window.getComputedStyle(scrambledOutput);
                const x = parseFloat(baseStyles.left);
                const y = parseFloat(baseStyles.top);
                ctx.textBaseline = 'top';

                // Get shared styles
                const font = `${settings.fontWeight} ${settings.fontSize}px 'Courier New', Courier, monospace`;
                ctx.font = font;

                const drawText = (text, startX, startY, lineHeight) => {
                    const lines = text.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        ctx.fillText(lines[i], startX, startY + (i * lineHeight * parseFloat(settings.fontSize)));
                    }
                };
                
                const lineHeight = parseFloat(settings.lineHeight);

                // Draw Scrambled Text
                ctx.globalCompositeOperation = settings.scrambledBlendMode;
                ctx.fillStyle = settings.scrambledColor;
                drawText(frameData.scrambled, x, y, lineHeight);

                // Draw Hidden Text
                ctx.globalCompositeOperation = settings.hiddenBlendMode;
                ctx.fillStyle = settings.hiddenColor;
                const offsetX = parseInt(settings.hiddenOffsetX, 10);
                const offsetY = parseInt(settings.hiddenOffsetY, 10);
                drawText(frameData.hidden, x + offsetX, y + offsetY, lineHeight);

                resolve(ctx);
            }, 50);
        });
    }
}