const scrambledInput = document.getElementById('scrambled-input');
const hiddenInput = document.getElementById('hidden-input');
const scrambledOutput = document.getElementById('output-scrambled');
const hiddenOutput = document.getElementById('output-hidden');

function updateOutput() {
    scrambledOutput.textContent = scrambledInput.value;
    hiddenOutput.textContent = hiddenInput.value;
}

scrambledInput.addEventListener('input', updateOutput);
hiddenInput.addEventListener('input', updateOutput);

// Initialize with default text
updateOutput();