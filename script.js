const scrambledInput = document.getElementById('scrambled-input');
const hiddenInput = document.getElementById('hidden-input');
const scrambledOutput = document.getElementById('output-scrambled');
const hiddenOutput = document.getElementById('output-hidden');
const outputContainer = document.getElementById('output-container');
const noiseCanvas = document.getElementById('noise-canvas');
const noiseCtx = noiseCanvas.getContext('2d');

// --- Settings Elements ---
const controls = {
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
};

const valueDisplays = {
    hiddenOffsetX: document.getElementById('hidden-offset-x-value'),
    hiddenOffsetY: document.getElementById('hidden-offset-y-value'),
    fontSize: document.getElementById('font-size-value'),
    fontWeight: document.getElementById('font-weight-value'),
    letterSpacing: document.getElementById('letter-spacing-value'),
    lineHeight: document.getElementById('line-height-value'),
    noiseOpacity: document.getElementById('noise-opacity-value'),
    noiseScale: document.getElementById('noise-scale-value'),
};

const blendModes = [
    'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 
    'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference',
    'exclusion', 'hue', 'saturation', 'color', 'luminosity'
];

function populateSelect(selectElement, options, selectedValue) {
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

function updateOutput() {
    scrambledOutput.textContent = scrambledInput.value;
    hiddenOutput.textContent = hiddenInput.value;
}

function generateNoise() {
    const scale = parseInt(controls.noiseScale.value, 10);
    const type = controls.noiseType.value;
    const w = noiseCanvas.width;
    const h = noiseCanvas.height;

    noiseCtx.clearRect(0, 0, w, h);

    for (let y = 0; y < h; y += scale) {
        for (let x = 0; x < w; x += scale) {
            let r, g, b;
            if (type === 'color') {
                r = Math.floor(Math.random() * 256);
                g = Math.floor(Math.random() * 256);
                b = Math.floor(Math.random() * 256);
            } else { // grayscale
                const val = Math.floor(Math.random() * 256);
                r = g = b = val;
            }
            noiseCtx.fillStyle = `rgb(${r},${g},${b})`;
            noiseCtx.fillRect(x, y, scale, scale);
        }
    }
}

function updateStyles() {
    // Scrambled Text
    scrambledOutput.style.color = controls.scrambledColor.value;
    scrambledOutput.style.mixBlendMode = controls.scrambledBlendMode.value;

    // Hidden Text
    const offsetX = controls.hiddenOffsetX.value;
    const offsetY = controls.hiddenOffsetY.value;
    hiddenOutput.style.color = controls.hiddenColor.value;
    hiddenOutput.style.mixBlendMode = controls.hiddenBlendMode.value;
    hiddenOutput.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    
    // General Text
    const fontSize = controls.fontSize.value;
    const fontWeight = controls.fontWeight.value;
    const letterSpacing = controls.letterSpacing.value;
    const lineHeight = controls.lineHeight.value;
    
    const sharedTextStyle = `
        font-size: ${fontSize}px;
        font-weight: ${fontWeight};
        letter-spacing: ${letterSpacing}px;
        line-height: ${lineHeight};
    `;
    scrambledOutput.style.cssText += sharedTextStyle;
    hiddenOutput.style.cssText += sharedTextStyle;

    // Background
    const noiseOpacity = controls.noiseOpacity.value;
    outputContainer.style.backgroundColor = controls.bgColor.value;
    noiseCanvas.style.opacity = noiseOpacity;

    // Update value displays
    for (const key in valueDisplays) {
        if (valueDisplays[key]) {
            valueDisplays[key].textContent = controls[key].value;
        }
    }
    
    // Regenerate noise if noise-related settings changed
    generateNoise();
}

function setup() {
    // Populate dropdowns
    populateSelect(controls.scrambledBlendMode, blendModes, 'lighten');
    populateSelect(controls.hiddenBlendMode, blendModes, 'darken');

    // Add event listeners
    scrambledInput.addEventListener('input', updateOutput);
    hiddenInput.addEventListener('input', updateOutput);

    for (const key in controls) {
        controls[key].addEventListener('input', updateStyles);
    }
    
    // Resize observer for the output container
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const { width, height } = entry.contentRect;
            noiseCanvas.width = width;
            noiseCanvas.height = height;
            updateStyles(); // Regenerate noise and update everything
        }
    });

    resizeObserver.observe(outputContainer);
    
    // Initial render
    updateOutput();
    // Initial size setup
    const initialRect = outputContainer.getBoundingClientRect();
    noiseCanvas.width = initialRect.width;
    noiseCanvas.height = initialRect.height;
    updateStyles();
}

setup();