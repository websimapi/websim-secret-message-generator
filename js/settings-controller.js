export class SettingsController {
    constructor() {
        this.outputContainer = document.getElementById('output-container');
        this.scrambledOutput = document.getElementById('output-scrambled');
        this.hiddenOutput = document.getElementById('output-hidden');
        
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

        this.blendModes = [
            'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 
            'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference',
            'exclusion', 'hue', 'saturation', 'color', 'luminosity'
        ];

        this.onSettingsChange = null;
    }

    init() {
        this.populateBlendModes();
        this.setupEventListeners();
    }

    populateBlendModes() {
        this.populateSelect(this.controls.scrambledBlendMode, this.blendModes, 'lighten');
        this.populateSelect(this.controls.hiddenBlendMode, this.blendModes, 'darken');
    }

    populateSelect(selectElement, options, selectedValue) {
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option.charAt(0).toUpperCase() + option.slice(1);
            if (option === selectedValue) {
                optionElement.selected = true;
            }
            selectElement.appendChild(optionElement);
        });
    }

    setupEventListeners() {
        for (const key in this.controls) {
            this.controls[key].addEventListener('input', () => {
                if (this.onSettingsChange) this.onSettingsChange();
            });
        }
    }

    applyStyles() {
        // Scrambled Text
        this.scrambledOutput.style.color = this.controls.scrambledColor.value;
        this.scrambledOutput.style.mixBlendMode = this.controls.scrambledBlendMode.value;

        // Hidden Text
        const offsetX = this.controls.hiddenOffsetX.value;
        const offsetY = this.controls.hiddenOffsetY.value;
        this.hiddenOutput.style.color = this.controls.hiddenColor.value;
        this.hiddenOutput.style.mixBlendMode = this.controls.hiddenBlendMode.value;
        this.hiddenOutput.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        
        // General Text
        const fontSize = this.controls.fontSize.value;
        const fontWeight = this.controls.fontWeight.value;
        const letterSpacing = this.controls.letterSpacing.value;
        const lineHeight = this.controls.lineHeight.value;
        
        const sharedTextStyle = `
            font-size: ${fontSize}px;
            font-weight: ${fontWeight};
            letter-spacing: ${letterSpacing}px;
            line-height: ${lineHeight};
        `;
        this.scrambledOutput.style.cssText += sharedTextStyle;
        this.hiddenOutput.style.cssText += sharedTextStyle;

        // Background
        const noiseOpacity = this.controls.noiseOpacity.value;
        this.outputContainer.style.backgroundColor = this.controls.bgColor.value;
        
        const noiseCanvas = document.getElementById('noise-canvas');
        if (noiseCanvas) {
            noiseCanvas.style.opacity = noiseOpacity;
        }

        this.updateValueDisplays();
    }

    updateValueDisplays() {
        for (const key in this.valueDisplays) {
            if (this.valueDisplays[key] && this.controls[key]) {
                this.valueDisplays[key].textContent = this.controls[key].value;
            }
        }
    }

    getFps() {
        return parseInt(this.controls.gifFps.value, 10);
    }

    getNoiseSettings() {
        return {
            scale: parseInt(this.controls.noiseScale.value, 10),
            type: this.controls.noiseType.value,
            opacity: parseFloat(this.controls.noiseOpacity.value)
        };
    }

    getAllSettings() {
        const settings = {};
        for (const key in this.controls) {
            settings[key] = this.controls[key].value;
        }
        return settings;
    }
}