export function populateSelect(selectElement, options, selectedValue) {
  options.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option.charAt(0).toUpperCase() + option.slice(1);
    if (option === selectedValue) opt.selected = true;
    selectElement.appendChild(opt);
  });
}

export function generateScrambledText(sourceText) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < sourceText.length; i++) {
    const char = sourceText[i];
    if (/[a-zA-Z]/.test(char)) {
      const r = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      result += (char === char.toUpperCase()) ? r : r.toLowerCase();
    } else {
      result += char;
    }
  }
  return result;
}

