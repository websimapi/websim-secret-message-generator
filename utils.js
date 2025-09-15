export function generateScrambledText(sourceText) {
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

export function populateSelect(selectElement, options, selectedValue) {
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

