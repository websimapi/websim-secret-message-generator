export class GifGenerator {
    constructor(frameManager, outputContainer, noiseCanvas, controls, statusEl) {
        this.frameManager = frameManager;
        this.outputContainer = outputContainer;
        this.noiseCanvas = noiseCanvas;
        this.controls = controls;
        this.statusEl = statusEl;
    }

    async generate(animationController) {
        const frames = this.frameManager.getFramesData();
        if (frames.length === 0) {
            this.statusEl.textContent = 'Add at least one frame.';
            return;
        }
        
        // Temporarily stop live animation
        const wasPlaying = animationController.isPlaying();
        if (wasPlaying) animationController.stop();

        const { width, height } = this.outputContainer.getBoundingClientRect();
        const fps = parseInt(this.controls.gifFps.value, 10);
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

        const drawFrame = (frameData) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    // 1. Background color
                    ctx.fillStyle = this.controls.bgColor.value;
                    ctx.fillRect(0, 0, width, height);

                    // 2. Noise
                    ctx.globalAlpha = parseFloat(this.controls.noiseOpacity.value);
                    ctx.drawImage(this.noiseCanvas, 0, 0);
                    ctx.globalAlpha = 1.0;

                    // 3. Text rendering
                    const scrambledOutput = document.getElementById('output-scrambled');
                    const baseStyles = window.getComputedStyle(scrambledOutput);
                    const x = parseFloat(baseStyles.left);
                    const y = parseFloat(baseStyles.top);
                    ctx.textBaseline = 'top';

                    // Get shared styles
                    const fontSize = this.controls.fontSize.value;
                    const fontWeight = this.controls.fontWeight.value;
                    const font = `${fontWeight} ${fontSize}px 'Courier New', Courier, monospace`;
                    ctx.font = font;

                    // Function to draw multiline text
                    const drawText = (text, startX, startY, lineHeight) => {
                        const lines = text.split('\n');
                        for (let i = 0; i < lines.length; i++) {
                            ctx.fillText(lines[i], startX, startY + (i * lineHeight * fontSize));
                        }
                    };
                    
                    const lineHeight = parseFloat(this.controls.lineHeight.value);

                    // Draw Scrambled Text
                    ctx.globalCompositeOperation = this.controls.scrambledBlendMode.value;
                    ctx.fillStyle = this.controls.scrambledColor.value;
                    drawText(frameData.scrambled, x, y, lineHeight);

                    // Draw Hidden Text
                    ctx.globalCompositeOperation = this.controls.hiddenBlendMode.value;
                    ctx.fillStyle = this.controls.hiddenColor.value;
                    const offsetX = parseInt(this.controls.hiddenOffsetX.value, 10);
                    const offsetY = parseInt(this.controls.hiddenOffsetY.value, 10);
                    drawText(frameData.hidden, x + offsetX, y + offsetY, lineHeight);

                    resolve(ctx);
                }, 50);
            });
        };

        for (let i = 0; i < frames.length; i++) {
            this.statusEl.textContent = `Rendering frame ${i + 1}/${frames.length}...`;
            const frameCtx = await drawFrame(frames[i]);
            gif.addFrame(frameCtx, { delay: delay, copy: true });
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
            
            this.statusEl.textContent = 'Done!';
            if (wasPlaying) animationController.start();
        });
        
        gif.on('progress', (p) => {
            this.statusEl.textContent = `Building GIF... ${Math.round(p * 100)}%`;
        });

        gif.render();
    }
}