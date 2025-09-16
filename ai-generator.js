
```
export class AIGenerator {
    constructor(frameManager, canvasRenderer, uiElements) {
        this.frameManager = frameManager;
        this.canvasRenderer = canvasRenderer;
        this.ui = uiElements;

        this.ui.generateBtn.addEventListener('click', () => this.generate());
        this.ui.applyBtn.addEventListener('click', () => this.applyBackground());
    }

    async generate() {
        const prompt = this.ui.promptTextarea.value.trim();
        if (!prompt) {
            this.ui.statusEl.textContent = 'Please enter a scene description.';
            return;
        }

        const frames = this.frameManager.getFramesData();
        if (frames.length === 0) {
            this.ui.statusEl.textContent = 'No frame to generate from.';
            return;
        }
        
        // Using the first frame for now. Could be adapted for current animation frame.
        const currentFrameData = frames[0];

        this.setLoadingState(true);
        this.ui.statusEl.textContent = 'Capturing current frame...';

        try {
            const imageDataUrl = await this.canvasRenderer.captureFrame(currentFrameData, true);
            
            this.ui.statusEl.textContent = 'Sending to AI for generation...';

            const fullPrompt = `${prompt}. Use the provided image as a strong stylistic and structural reference. The red and cyan text patterns are a secret message; integrate them seamlessly into the new scene while preserving their anaglyph effect and legibility when viewed with 3D glasses.`;
            
            const { width, height } = this.canvasRenderer.outputContainer.getBoundingClientRect();

            const result = await websim.imageGen({
                prompt: fullPrompt,
                width: Math.round(width),
                height: Math.round(height),
                image_inputs: [{ url: imageDataUrl }],
            });

            this.ui.resultImg.src = result.url;
            this.ui.resultContainer.style.display = 'flex';
            this.ui.statusEl.textContent = 'Generation complete!';

        } catch (error) {
            console.error('AI generation failed:', error);
            this.ui.statusEl.textContent = `Error: ${error.message}`;
        } finally {
            this.setLoadingState(false);
        }
    }
    
    applyBackground() {
        const imageUrl = this.ui.resultImg.src;
        if (!imageUrl) return;

        // Also update the UIController's reference to the output container
        const outputContainer = document.getElementById('output-container');
        outputContainer.style.backgroundImage = `url('${imageUrl}')`;
        // Turn off background color so image is visible
        outputContainer.style.backgroundColor = 'transparent';
    }

    setLoadingState(isLoading) {
        this.ui.generateBtn.disabled = isLoading;
        this.ui.promptTextarea.disabled = isLoading;
        if (isLoading) {
            this.ui.resultContainer.style.display = 'none';
        }
    }
}