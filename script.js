const scrambledInput = document.getElementById('scrambled-input');
const hiddenInput = document.getElementById('hidden-input');
const scrambledOutput = document.getElementById('output-scrambled');
const hiddenOutput = document.getElementById('output-hidden');
const decoder = document.getElementById('decoder');

function updateOutput() {
    scrambledOutput.textContent = scrambledInput.value;
    hiddenOutput.textContent = hiddenInput.value;
}

scrambledInput.addEventListener('input', updateOutput);
hiddenInput.addEventListener('input', updateOutput);

// --- Draggable Decoder Logic ---
let isDragging = false;
let offsetX, offsetY;

const decoderLens = decoder.querySelector('.decoder-lens');

decoderLens.addEventListener('mousedown', (e) => {
    isDragging = true;
    
    // Calculate offset from the top-left of the decoder element itself
    const rect = decoder.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    decoder.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none'; // Prevent text selection while dragging
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        // We position based on clientX/Y so it works regardless of scroll
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        
        decoder.style.left = `${x}px`;
        decoder.style.top = `${y}px`;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    decoder.style.cursor = 'move';
    document.body.style.userSelect = '';
});


// Initialize with default text
updateOutput();

