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

        const drawFrame = async (frameData) => {
            return new Promise(async (resolve) => {
                setTimeout(async () => {
                    // 1. Background color
                    ctx.fillStyle = this.controls.bgColor.value;
                    ctx.fillRect(0, 0, width, height);

                    // 2. Noise
                    ctx.globalAlpha = parseFloat(this.controls.noiseOpacity.value);
                    ctx.drawImage(this.noiseCanvas, 0, 0);
                    ctx.globalAlpha = 1.0;

                    // 3. Get shared styles for text
                    const scrambledOutput = document.getElementById('output-scrambled');
                    const baseStyles = window.getComputedStyle(scrambledOutput);
                    const x = parseFloat(baseStyles.left);
                    const y = parseFloat(baseStyles.top);
                    ctx.textBaseline = 'top';

                    const fontSize = this.controls.fontSize.value;
                    const fontWeight = this.controls.fontWeight.value;
                    const font = `${fontWeight} ${fontSize}px 'Courier New', Courier, monospace`;
                    ctx.font = font;

                    const drawText = (text, startX, startY, lineHeight) => {
                        const lines = text.split('\n');
                        for (let i = 0; i < lines.length; i++) {
                            ctx.fillText(lines[i], startX, startY + (i * lineHeight * fontSize));
                        }
                    };
                    
                    const lineHeight = parseFloat(this.controls.lineHeight.value);

                    // 4. Draw Scrambled Content (Text + Image)
                    ctx.globalCompositeOperation = this.controls.scrambledBlendMode.value;
                    
                    // Draw scrambled text
                    if (frameData.scrambled) {
                        ctx.fillStyle = this.controls.scrambledColor.value;
                        drawText(frameData.scrambled, x, y, lineHeight);
                    }
                    
                    // Draw scrambled image with red filter
                    if (frameData.scrambledImageFrames && frameData.scrambledImageFrames.length > 0) {
                        await this.drawImageWithColorFilter(ctx, null, this.controls.scrambledColor.value, x, y, null, frameData.scrambledImageFrames);
                    } else if (frameData.scrambledImage) {
                        await this.drawImageWithColorFilter(ctx, frameData.scrambledImage, this.controls.scrambledColor.value, x, y, frameData.processedScrambledImage);
                    }

                    // 5. Draw Hidden Content (Text + Image)
                    ctx.globalCompositeOperation = this.controls.hiddenBlendMode.value;
                    const offsetX = parseInt(this.controls.hiddenOffsetX.value, 10);
                    const offsetY = parseInt(this.controls.hiddenOffsetY.value, 10);
                    
                    // Draw hidden text
                    if (frameData.hidden) {
                        ctx.fillStyle = this.controls.hiddenColor.value;
                        drawText(frameData.hidden, x + offsetX, y + offsetY, lineHeight);
                    }
                    
                    // Draw hidden image with cyan filter
                    if (frameData.hiddenImageFrames && frameData.hiddenImageFrames.length > 0) {
                        await this.drawImageWithColorFilter(ctx, null, this.controls.hiddenColor.value, x + offsetX, y + offsetY, null, frameData.hiddenImageFrames);
                    } else if (frameData.hiddenImage) {
                        await this.drawImageWithColorFilter(ctx, frameData.hiddenImage, this.controls.hiddenColor.value, x + offsetX, y + offsetY, frameData.processedHiddenImage);
                    }

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

    async drawImageWithColorFilter(ctx, imageFile, color, x, y, processedCanvas = null, gifFrames = null) {
        return new Promise((resolve) => {
            if (gifFrames && gifFrames.length > 0) {
                // Use the first frame of the GIF frames
                const frame = gifFrames[0];
                const maxWidth = ctx.canvas.width - x;
                const maxHeight = ctx.canvas.height - y;
                const scale = Math.min(maxWidth / frame.canvas.width, maxHeight / frame.canvas.height, 1);
                const scaledWidth = frame.canvas.width * scale;
                const scaledHeight = frame.canvas.height * scale;
                
                ctx.drawImage(frame.canvas, x, y, scaledWidth, scaledHeight);
                resolve();
            } else if (processedCanvas) {
                // Use the pre-processed 2-bit color canvas
                const maxWidth = ctx.canvas.width - x;
                const maxHeight = ctx.canvas.height - y;
                const scale = Math.min(maxWidth / processedCanvas.width, maxHeight / processedCanvas.height, 1);
                const scaledWidth = processedCanvas.width * scale;
                const scaledHeight = processedCanvas.height * scale;
                
                ctx.drawImage(processedCanvas, x, y, scaledWidth, scaledHeight);
                resolve();
            } else {
                // Fallback to original method for regular files
                const img = new Image();
                img.onload = () => {
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCanvas.width = img.width;
                    tempCanvas.height = img.height;
                    
                    // Draw original image
                    tempCtx.drawImage(img, 0, 0);
                    
                    // Apply color filter
                    tempCtx.globalCompositeOperation = 'multiply';
                    tempCtx.fillStyle = color;
                    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                    
                    // Scale to fit container
                    const maxWidth = ctx.canvas.width - x;
                    const maxHeight = ctx.canvas.height - y;
                    const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
                    const scaledWidth = img.width * scale;
                    const scaledHeight = img.height * scale;
                    
                    ctx.drawImage(tempCanvas, x, y, scaledWidth, scaledHeight);
                    resolve();
                };
                img.src = URL.createObjectURL(imageFile);
            }
        });
    }
}