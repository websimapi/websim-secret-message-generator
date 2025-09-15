export class FrameManager {
    constructor() {
        this.framesList = document.getElementById('frames-list');
        this.addFrameBtn = document.getElementById('add-frame-btn');
        this.onFramesChange = null;
    }

    init() {
        this.addFrameBtn.addEventListener('click', () => this.createFrame());
    }

    getFramesData() {
        return Array.from(this.framesList.querySelectorAll('.frame-item')).map(item => {
            const scrambledInput = item.querySelector('.scrambled-input');
            const hiddenInput = item.querySelector('.hidden-input');
            return {
                scrambled: scrambledInput ? scrambledInput.value : '',
                hidden: hiddenInput ? hiddenInput.value : ''
            };
        });
    }

    updateFrameNumbers() {
        const frameItems = this.framesList.querySelectorAll('.frame-item');
        frameItems.forEach((item, index) => {
            const header = item.querySelector('h4');
            if (header) {
                header.textContent = `Frame ${index + 1}`;
            }
        });
    }

    highlightFrame(frameIndex) {
        document.querySelectorAll('.frame-item').forEach((item, index) => {
            item.style.borderColor = index === frameIndex ? '#007bff' : '#ddd';
        });
    }

    clearHighlight() {
        document.querySelectorAll('.frame-item').forEach(item => {
            item.style.borderColor = '#ddd';
        });
    }

    generateScrambledText(sourceText) {
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

    createFrame(scrambled = '', hidden = '') {
        const item = document.createElement('div');
        item.className = 'frame-item';

        const header = document.createElement('div');
        header.className = 'frame-item-header';

        const title = document.createElement('h4');
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-frame-btn';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
            item.remove();
            if (this.onFramesChange) this.onFramesChange();
            this.updateFrameNumbers();
        });
        
        header.appendChild(title);
        header.appendChild(removeBtn);

        const inputsDiv = document.createElement('div');
        inputsDiv.className = 'frame-inputs';

        const scrambledGroup = this.createScrambledInputGroup(scrambled);
        const hiddenGroup = this.createHiddenInputGroup(hidden);

        inputsDiv.appendChild(scrambledGroup);
        inputsDiv.appendChild(hiddenGroup);

        item.appendChild(header);
        item.appendChild(inputsDiv);
        
        this.framesList.appendChild(item);
        this.updateFrameNumbers();

        // Setup auto-scramble functionality
        this.setupAutoScramble(scrambledGroup, hiddenGroup);
    }

    createScrambledInputGroup(scrambled) {
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
            toggleCheckbox.checked = false;
            if (this.onFramesChange) this.onFramesChange();
        });

        scrambledGroup.appendChild(scrambledLabel);
        scrambledGroup.appendChild(scrambledTextarea);
        
        return scrambledGroup;
    }

    createHiddenInputGroup(hidden) {
        const hiddenGroup = document.createElement('div');
        hiddenGroup.className = 'input-group';
        
        const hiddenLabel = document.createElement('label');
        hiddenLabel.textContent = 'Hidden Message (Cyan)';
        
        const hiddenTextarea = document.createElement('textarea');
        hiddenTextarea.className = 'hidden-input';
        hiddenTextarea.rows = 4;
        hiddenTextarea.value = hidden;

        hiddenGroup.appendChild(hiddenLabel);
        hiddenGroup.appendChild(hiddenTextarea);
        
        return hiddenGroup;
    }

    setupAutoScramble(scrambledGroup, hiddenGroup) {
        const toggleCheckbox = scrambledGroup.querySelector('input[type="checkbox"]');
        const scrambledTextarea = scrambledGroup.querySelector('textarea');
        const hiddenTextarea = hiddenGroup.querySelector('textarea');

        hiddenTextarea.addEventListener('input', () => {
            if (toggleCheckbox.checked) {
                scrambledTextarea.value = this.generateScrambledText(hiddenTextarea.value);
            }
            if (this.onFramesChange) this.onFramesChange();
        });

        toggleCheckbox.addEventListener('change', () => {
            if (toggleCheckbox.checked) {
                scrambledTextarea.value = this.generateScrambledText(hiddenTextarea.value);
                if (this.onFramesChange) this.onFramesChange();
            }
        });

        // Initial generation if needed
        if (toggleCheckbox.checked && hiddenTextarea.value.length > 0) {
            scrambledTextarea.value = this.generateScrambledText(hiddenTextarea.value);
        }
    }
}