const scrambledInput = document.getElementById('scrambled-input');
const hiddenMessagesList = document.getElementById('hidden-messages-list');
const addHiddenMessageBtn = document.getElementById('add-hidden-message');
const framesList = document.getElementById('frames-list');
const addFrameBtn = document.getElementById('add-frame-btn');
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
    gifFps: document.getElementById('gif-fps'),
};

// --- Animation & GIF Elements ---
const playPauseBtn = document.getElementById('play-pause-animation');
const generateGifBtn = document.getElementById('generate-gif-btn');
const gifStatusEl = document.getElementById('gif-status');

let animationState = {
    isPlaying: false,
    intervalId: null,
    currentFrame: 0
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
    gifFps: document.getElementById('gif-fps-value'),
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

function getFramesData() {
    return Array.from(framesList.querySelectorAll('.frame-item')).map(item => {
        const scrambledInput = item.querySelector('.scrambled-input');
        const hiddenInput = item.querySelector('.hidden-input');
        return {
            scrambled: scrambledInput ? scrambledInput.value : '',
            hidden: hiddenInput ? hiddenInput.value : ''
        };
    });
}

function updateFrameNumbers() {
    const frameItems = framesList.querySelectorAll('.frame-item');
    frameItems.forEach((item, index) => {
        const header = item.querySelector('h4');
        if (header) {
            header.textContent = `Frame ${index + 1}`;
        }
    });
}

function updateOutput() {
    const frames = getFramesData();
    if (frames.length > 0) {
        const frameIndex = animationState.currentFrame % frames.length;
        const currentFrameData = frames[frameIndex];
        
        // Highlight the current frame in the UI
        document.querySelectorAll('.frame-item').forEach((item, index) => {
            if (animationState.isPlaying) {
                item.style.borderColor = index === frameIndex ? '#007bff' : '#ddd';
            } else {
                item.style.borderColor = '#ddd';
            }
        });

        scrambledOutput.textContent = currentFrameData.scrambled;
        hiddenOutput.textContent = currentFrameData.hidden || '';
    } else {
        scrambledOutput.textContent = '';
        hiddenOutput.textContent = '';
        document.querySelectorAll('.frame-item').forEach(item => {
            item.style.borderColor = '#ddd';
        });
    }
}

function generateScrambledText(sourceText) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < sourceText.length; i++) {
        const char = sourceText[i];
        if (/[a-zA-Z]/.test(char)) {
            const randomChar = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            // Preserve case
            result += (char === char.toUpperCase()) ? randomChar : randomChar.toLowerCase();
        } else {
            result += char; // Keep spaces, punctuation, numbers etc.
        }
    }
    return result;
}

function createFrameInput(scrambled = '', hidden = '') {
    const item = document.createElement('div');
    item.className = 'frame-item';

    const header = document.createElement('div');
    header.className = 'frame-item-header';

    const title = document.createElement('h4');
    // Title will be set by updateFrameNumbers

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-frame-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
        item.remove();
        stopAnimation();
        updateOutput();
        updateFrameNumbers();
    });
    
    header.appendChild(title);
    header.appendChild(removeBtn);

    const inputsDiv = document.createElement('div');
    inputsDiv.className = 'frame-inputs';

    const scrambledGroup = document.createElement('div');
    scrambledGroup.className = 'input-group';
    const scrambledLabel = document.createElement('label');
    scrambledLabel.className = 'has-toggle';
    scrambledLabel.innerHTML = '<span>Scrambled Text (Red)</span>';

    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'auto-scramble-toggle';
    toggleContainer.title = 'Automatically generate scrambled text based on the hidden message.';
    const toggleLabel = document.createElement('span');
    toggleLabel.textContent = 'Auto-scramble';
    const toggleCheckbox = document.createElement('input');
    toggleCheckbox.type = 'checkbox';
    toggleCheckbox.checked = true;
    
    toggleContainer.appendChild(toggleLabel);
    toggleContainer.appendChild(toggleCheckbox);
    scrambledLabel.appendChild(toggleContainer);

    const scrambledTextarea = document.createElement('textarea');
    scrambledTextarea.className = 'scrambled-input';
    scrambledTextarea.rows = 4;
    scrambledTextarea.value = scrambled;
    scrambledTextarea.addEventListener('input', () => {
        toggleCheckbox.checked = false; // Disable auto-scramble on manual edit
        updateOutput();
    });
    scrambledGroup.appendChild(scrambledLabel);
    scrambledGroup.appendChild(scrambledTextarea);

    const hiddenGroup = document.createElement('div');
    hiddenGroup.className = 'input-group';
    const hiddenLabel = document.createElement('label');
    hiddenLabel.textContent = 'Hidden Message (Cyan)';
    const hiddenTextarea = document.createElement('textarea');
    hiddenTextarea.className = 'hidden-input';
    hiddenTextarea.rows = 4;
    hiddenTextarea.value = hidden;
    hiddenTextarea.addEventListener('input', () => {
        if (toggleCheckbox.checked) {
            scrambledTextarea.value = generateScrambledText(hiddenTextarea.value);
        }
        updateOutput();
    });
    hiddenGroup.appendChild(hiddenLabel);
    hiddenGroup.appendChild(hiddenTextarea);

    toggleCheckbox.addEventListener('change', () => {
        if (toggleCheckbox.checked) {
            // Re-enable and generate
            scrambledTextarea.value = generateScrambledText(hiddenTextarea.value);
            updateOutput();
        }
    });

    // Initial generation if needed
    if (toggleCheckbox.checked && hidden.length > 0) {
        scrambledTextarea.value = generateScrambledText(hidden);
    }

    inputsDiv.appendChild(scrambledGroup);
    inputsDiv.appendChild(hiddenGroup);

    item.appendChild(header);
    item.appendChild(inputsDiv);
    
    framesList.appendChild(item);
    updateFrameNumbers();
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
        if (valueDisplays[key] && controls[key]) {
            valueDisplays[key].textContent = controls[key].value;
        }
    }
    
    // Regenerate noise if noise-related settings changed
    generateNoise();
}

function toggleAnimation() {
    if (animationState.isPlaying) {
        stopAnimation();
    } else {
        startAnimation();
    }
}

function startAnimation() {
    const frames = getFramesData();
    if (frames.length <= 1) return;

    animationState.isPlaying = true;
    playPauseBtn.textContent = 'Pause';

    const fps = parseInt(controls.gifFps.value, 10);
    const delay = 1000 / fps;

    // Initial update to highlight first frame
    updateOutput(); 

    animationState.intervalId = setInterval(() => {
        animationState.currentFrame = (animationState.currentFrame + 1) % frames.length;
        updateOutput();
    }, delay);
}

function stopAnimation() {
    if (animationState.intervalId) {
        clearInterval(animationState.intervalId);
    }
    animationState.isPlaying = false;
    animationState.currentFrame = 0;
    updateOutput(); // Reset to first frame and remove highlight
    playPauseBtn.textContent = 'Play';
}

async function generateGif() {
    generateGifBtn.disabled = true;
    playPauseBtn.disabled = true;
    gifStatusEl.textContent = 'Initializing...';
    
    const frames = getFramesData();
    if (frames.length === 0) {
        gifStatusEl.textContent = 'Add at least one frame.';
        generateGifBtn.disabled = false;
        playPauseBtn.disabled = false;
        return;
    }
    
    // Temporarily stop live animation
    const wasPlaying = animationState.isPlaying;
    if (wasPlaying) stopAnimation();

    const { width, height } = outputContainer.getBoundingClientRect();
    const fps = parseInt(controls.gifFps.value, 10);
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

    function drawFrame(frameData) {
        return new Promise(resolve => {
            // This timeout allows the DOM to potentially catch up, but main logic is canvas-based
            setTimeout(() => {
                // 1. Background color
                ctx.fillStyle = controls.bgColor.value;
                ctx.fillRect(0, 0, width, height);

                // 2. Noise
                ctx.globalAlpha = parseFloat(controls.noiseOpacity.value);
                ctx.drawImage(noiseCanvas, 0, 0);
                ctx.globalAlpha = 1.0;

                // 3. Text rendering
                const baseStyles = window.getComputedStyle(scrambledOutput);
                const x = parseFloat(baseStyles.left);
                const y = parseFloat(baseStyles.top);
                ctx.textBaseline = 'top';

                // Get shared styles
                const fontSize = controls.fontSize.value;
                const fontWeight = controls.fontWeight.value;
                const letterSpacing = controls.letterSpacing.value; // Not easily doable on canvas
                const font = `${fontWeight} ${fontSize}px 'Courier New', Courier, monospace`;
                ctx.font = font;

                // Function to draw multiline text
                const drawText = (text, startX, startY, lineHeight) => {
                    const lines = text.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        ctx.fillText(lines[i], startX, startY + (i * lineHeight * fontSize));
                    }
                };
                
                const lineHeight = parseFloat(controls.lineHeight.value);

                // Draw Scrambled Text
                ctx.globalCompositeOperation = controls.scrambledBlendMode.value;
                ctx.fillStyle = controls.scrambledColor.value;
                drawText(frameData.scrambled, x, y, lineHeight);

                // Draw Hidden Text
                ctx.globalCompositeOperation = controls.hiddenBlendMode.value;
                ctx.fillStyle = controls.hiddenColor.value;
                const offsetX = parseInt(controls.hiddenOffsetX.value, 10);
                const offsetY = parseInt(controls.hiddenOffsetY.value, 10);
                drawText(frameData.hidden, x + offsetX, y + offsetY, lineHeight);

                resolve(ctx);
            }, 50); // Small delay to help rendering pipeline
        });
    }

    for (let i = 0; i < frames.length; i++) {
        gifStatusEl.textContent = `Rendering frame ${i + 1}/${frames.length}...`;
        const frameCtx = await drawFrame(frames[i]);
        gif.addFrame(frameCtx, { delay: delay, copy: true });
    }

    gif.on('finished', function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'secret-message.gif';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        gifStatusEl.textContent = 'Done!';
        generateGifBtn.disabled = false;
        playPauseBtn.disabled = false;
        if (wasPlaying) startAnimation();
    });
    
    gif.on('progress', function(p) {
        gifStatusEl.textContent = `Building GIF... ${Math.round(p * 100)}%`;
    });

    gif.render();
}

function setup() {
    // Populate dropdowns
    populateSelect(controls.scrambledBlendMode, blendModes, 'lighten');
    populateSelect(controls.hiddenBlendMode, blendModes, 'darken');

    // Add event listeners
    addFrameBtn.addEventListener('click', () => createFrameInput());

    for (const key in controls) {
        controls[key].addEventListener('input', () => {
             // Stop and reset animation if settings change
            if (animationState.isPlaying) {
                stopAnimation();
            }
            updateStyles();
        });
    }
    
    playPauseBtn.addEventListener('click', toggleAnimation);
    generateGifBtn.addEventListener('click', generateGif);

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
    
    // Initial setup
    createFrameInput(
        'THISE ISW AJUMBLEF OF LETTERS ANDX WORDS TOD HIDES A MESSAGE.',
        'THIS IS A HIDDEN MESSAGE. YOU FOUND IT! GREAT JOB DETECTIVE!'
    );
    updateOutput();
    // Initial size setup
    const initialRect = outputContainer.getBoundingClientRect();
    noiseCanvas.width = initialRect.width;
    noiseCanvas.height = initialRect.height;
    updateStyles();
}

setup();