import * as state from './state.js';
import * as ui from './ui.js';
import * as renderer from './renderer.js';
import * as animation from './animation.js';
import * as gif from './gif.js';

function onFrameDataChange() {
    animation.stop();
    renderer.update();
}

function setupEventListeners() {
    ui.elements.addFrameBtn.addEventListener('click', () => {
        const newFrame = state.addFrame();
        ui.createFrameElement(newFrame.id);
        onFrameDataChange();
    });

    for (const key in ui.elements.controls) {
        ui.elements.controls[key].addEventListener('input', () => {
            animation.stop();
            renderer.update();
        });
    }

    ui.elements.playPauseBtn.addEventListener('click', animation.toggle);
    ui.elements.generateGifBtn.addEventListener('click', gif.generate);
}

function initialize() {
    ui.populateBlendModes();

    const initialFrame = state.addFrame(
        'THISE ISW AJUMBLEF OF LETTERS ANDX WORDS TOD HIDES A MESSAGE.',
        'THIS IS A HIDDEN MESSAGE. YOU FOUND IT! GREAT JOB DETECTIVE!',
        true
    );
    ui.createFrameElement(initialFrame.id);
    
    // Initial render
    const initialRect = ui.elements.outputContainer.getBoundingClientRect();
    ui.elements.noiseCanvas.width = initialRect.width;
    ui.elements.noiseCanvas.height = initialRect.height;
    renderer.update();

    setupEventListeners();

    // Handle container resizing
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const { width, height } = entry.contentRect;
            ui.elements.noiseCanvas.width = width;
            ui.elements.noiseCanvas.height = height;
            renderer.update(); // Re-render on resize
        }
    });
    resizeObserver.observe(ui.elements.outputContainer);
}

// Global event delegation for dynamic elements
ui.elements.framesList.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-frame-btn')) {
        const frameEl = e.target.closest('.frame-item');
        if (frameEl) {
            const frameId = parseInt(frameEl.dataset.id, 10);
            state.removeFrame(frameId);
            frameEl.remove();
            ui.updateFrameNumbers();
            onFrameDataChange();
        }
    }
});

ui.elements.framesList.addEventListener('input', (e) => {
    const frameEl = e.target.closest('.frame-item');
    if (!frameEl) return;

    const frameId = parseInt(frameEl.dataset.id, 10);
    const frame = state.getFrameById(frameId);
    if (!frame) return;

    const isHiddenInput = e.target.classList.contains('hidden-input');
    const isScrambledInput = e.target.classList.contains('scrambled-input');
    const isToggle = e.target.classList.contains('auto-scramble-toggle-cb');

    if (isHiddenInput) {
        frame.hidden = e.target.value;
        if (frame.autoScramble) {
            frame.scrambled = ui.generateScrambledText(frame.hidden);
            // Visually update the scrambled textarea in the UI
            const scrambledTextarea = frameEl.querySelector('.scrambled-input');
            if (scrambledTextarea) scrambledTextarea.value = frame.scrambled;
        }
    } else if (isScrambledInput) {
        frame.scrambled = e.target.value;
        // Manual edit disables auto-scramble
        if (frame.autoScramble) {
            frame.autoScramble = false;
            // Visually update the checkbox in the UI
            const toggle = frameEl.querySelector('.auto-scramble-toggle-cb');
            if (toggle) toggle.checked = false;
        }
    } else if (isToggle) {
        frame.autoScramble = e.target.checked;
        if (frame.autoScramble) {
             frame.scrambled = ui.generateScrambledText(frame.hidden);
             const scrambledTextarea = frameEl.querySelector('.scrambled-input');
             if (scrambledTextarea) scrambledTextarea.value = frame.scrambled;
        }
    }

    onFrameDataChange();
});

initialize();