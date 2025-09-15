const scrambledInput = document.getElementById('scrambled-input');
const hiddenInput = document.getElementById('hidden-input');
const scrambledOutput = document.getElementById('output-scrambled');
const hiddenOutput = document.getElementById('output-hidden');
const outputContainer = document.getElementById('output-container');

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
};

const valueDisplays = {
    hiddenOffsetX: document.getElementById('hidden-offset-x-value'),
    hiddenOffsetY: document.getElementById('hidden-offset-y-value'),
    fontSize: document.getElementById('font-size-value'),
    fontWeight: document.getElementById('font-weight-value'),
    letterSpacing: document.getElementById('letter-spacing-value'),
    lineHeight: document.getElementById('line-height-value'),
    noiseOpacity: document.getElementById('noise-opacity-value'),
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
    outputContainer.style.backgroundImage = `linear-gradient(rgba(255,255,255, ${1-noiseOpacity}), rgba(255,255,255, ${1-noiseOpacity})), url('noise-texture.png')`;

    // Update value displays
    for (const key in valueDisplays) {
        if (valueDisplays[key]) {
            valueDisplays[key].textContent = controls[key].value;
        }
    }
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
    
    // Initial render
    updateOutput();
    updateStyles();
}

setup();