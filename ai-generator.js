export class AIGenerator {
    constructor(frameManager, canvasRenderer, uiElements, animationController, controls) {
        this.frameManager = frameManager;
        this.canvasRenderer = canvasRenderer;
        this.ui = uiElements;
        this.animationController = animationController;
        this.controls = controls;

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
        
        const currentFrameIndex = this.animationController.isPlaying() ? this.animationController.getCurrentFrame() : 0;
        const currentFrameData = frames[currentFrameIndex];

        this.setLoadingState(true);
        this.ui.statusEl.textContent = 'Capturing current frame...';

        try {
            const imageDataUrl = await this.canvasRenderer.captureFrame(currentFrameData, true);
            
            this.ui.statusEl.textContent = 'Sending to AI for generation...';

            const settingsDescription = `
The provided image is an anaglyph containing a hidden message. It has two text layers:
1. Scrambled Text (intended for the red channel): "${currentFrameData.scrambled}"
   - Color: ${this.controls.scrambledColor.value}
   - Blend Mode: ${this.controls.scrambledBlendMode.value}
2. Hidden Message (intended for the cyan channel): "${currentFrameData.hidden}"
   - Color: ${this.controls.hiddenColor.value}
   - Blend Mode: ${this.controls.hiddenBlendMode.value}
   - Offset: X=${this.controls.hiddenOffsetX.value}px, Y=${this.controls.hiddenOffsetY.value}px

Shared Text Style:
- Font Size: ${this.controls.fontSize.value}px
- Font Weight: ${this.controls.fontWeight.value}
- Letter Spacing: ${this.controls.letterSpacing.value}px
`;

            const fullPrompt = `**Critical Task:** Transform the scene based on the user's prompt, but you MUST perfectly preserve and integrate the anaglyph text effect from the provided image.

**User's scene description:** "${prompt}"

**Analysis of Input Image:**
${settingsDescription}

**Instructions:**
Your primary goal is to generate a new scene while ensuring the anaglyph text remains clearly visible and functional. The text overlay from the input image is a requirement and must be included in the output. The visual properties of the text (colors, positions, blend modes) create a 3D effect to hide a message. This effect must be maintained. Integrate the text pattern seamlessly into your generated scene. Do not change the text itself.`;
            
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