export const elements = {
    framesList: document.getElementById('frames-list'),
    addFrameBtn: document.getElementById('add-frame-btn'),
    scrambledOutput: document.getElementById('output-scrambled'),
    hiddenOutput: document.getElementById('output-hidden'),
    outputContainer: document.getElementById('output-container'),
    noiseCanvas: document.getElementById('noise-canvas'),
    playPauseBtn: document.getElementById('play-pause-animation'),
    generateGifBtn: document.getElementById('generate-gif-btn'),
    gifStatusEl: document.getElementById('gif-status'),
    controls: {
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
    },
    valueDisplays: {
        hiddenOffsetX: document.getElementById('hidden-offset-x-value'),
        hiddenOffsetY: document.getElementById('hidden-offset-y-value'),
        fontSize: document.getElementById('font-size-value'),
        fontWeight: document.getElementById('font-weight-value'),
        letterSpacing: document.getElementById('letter-spacing-value'),
        lineHeight: document.getElementById('line-height-value'),
        noiseOpacity: document.getElementById('noise-opacity-value'),
        noiseScale: document.getElementById('noise-scale-value'),
        gifFps: document.getElementById('gif-fps-value'),
    }
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

export function populateBlendModes() {
    populateSelect(elements.controls.scrambledBlendMode, blendModes, 'lighten');
    populateSelect(elements.controls.hiddenBlendMode, blendModes, 'darken');
}

export function generateScrambledText(sourceText) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < sourceText.length; i++) {
        const char = sourceText[i];
        if (/[a-zA-Z]/.test(char)) {
            const randomChar = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            result += (char === char.toUpperCase()) ? randomChar : randomChar.toLowerCase();
        } else {
            result += char;
        }
    }
    return result;
}

export function updateFrameNumbers() {
    const frameItems = elements.framesList.querySelectorAll('.frame-item');
    frameItems.forEach((item, index) => {
        const header = item.querySelector('h4');
        if (header) {
            header.textContent = `Frame ${index + 1}`;
        }
    });
}

export function createFrameElement(frameData) {
    const item = document.createElement('div');
    item.className = 'frame-item';
    item.dataset.id = frameData.id;

    item.innerHTML = `
        <div class="frame-item-header">
            <h4></h4>
            <button class="remove-frame-btn">Remove</button>
        </div>
        <div class="frame-inputs">
            <div class="input-group">
                <label class="has-toggle">
                    <span>Scrambled Text (Red)</span>
                    <div class="auto-scramble-toggle" title="Automatically generate scrambled text based on the hidden message.">
                        <span>Auto-scramble</span>
                        <input type="checkbox" class="auto-scramble-toggle-cb">
                    </div>
                </label>
                <textarea class="scrambled-input" rows="4"></textarea>
            </div>
            <div class="input-group">
                <label>Hidden Message (Cyan)</label>
                <textarea class="hidden-input" rows="4"></textarea>
            </div>
        </div>
    `;

    // Populate the new element with frame data
    item.querySelector('.scrambled-input').value = frameData.scrambled;
    item.querySelector('.hidden-input').value = frameData.hidden;
    item.querySelector('.auto-scramble-toggle-cb').checked = frameData.autoScramble;

    elements.framesList.appendChild(item);
    updateFrameNumbers();
}