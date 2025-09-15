import { generateScrambledText } from './text-scrambler.js';

export class FrameManager {
    constructor(framesList, onFrameChange) {
        this.framesList = framesList;
        this.onFrameChange = onFrameChange;
        this.gifFrameCache = new Map(); // Cache for GIF frames
    }

    getFramesData() {
        return Array.from(this.framesList.querySelectorAll('.frame-item')).map(item => {
            const scrambledInput = item.querySelector('.scrambled-input');
            const hiddenInput = item.querySelector('.hidden-input');
            const scrambledImageData = item.querySelector('.scrambled-image-input').files[0];
            const hiddenImageData = item.querySelector('.hidden-image-input').files[0];
            
            return {
                scrambled: scrambledInput ? scrambledInput.value : '',
                hidden: hiddenInput ? hiddenInput.value : '',
                scrambledImage: scrambledImageData,
                hiddenImage: hiddenImageData,
                scrambledImageFrames: item.scrambledImageFrames || null,
                hiddenImageFrames: item.hiddenImageFrames || null,
                processedScrambledImage: item.processedScrambledImage || null,
                processedHiddenImage: item.processedHiddenImage || null
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

    async setupMediaInput(inputElement, uploadBtn, clearBtn, preview, frameItem, isScrambled) {
        uploadBtn.addEventListener('click', () => {
            inputElement.click();
        });

        inputElement.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.type === 'image/gif') {
                // Handle GIF
                const frames = await this.extractGifFrames(file);
                const processedFrames = frames.map(frame => this.process2BitColor(frame.canvas, isScrambled));
                
                if (isScrambled) {
                    frameItem.scrambledImageFrames = processedFrames.map((canvas, i) => ({ canvas, delay: frames[i].delay }));
                } else {
                    frameItem.hiddenImageFrames = processedFrames.map((canvas, i) => ({ canvas, delay: frames[i].delay }));
                }
                
                // Show first frame as preview
                if (processedFrames.length > 0) {
                    preview.innerHTML = `<img src="${processedFrames[0].toDataURL()}" alt="GIF preview">`;
                    preview.style.display = 'block';
                }
            } else {
                // Handle static image
                const img = new Image();
                img.onload = () => {
                    const processedCanvas = this.process2BitColor(img, isScrambled);
                    const processedImg = document.createElement('img');
                    processedImg.src = processedCanvas.toDataURL();
                    preview.innerHTML = '';
                    preview.appendChild(processedImg);
                    preview.style.display = 'block';
                    
                    if (isScrambled) {
                        frameItem.scrambledImageFrames = null;
                        frameItem.processedScrambledImage = processedCanvas;
                    } else {
                        frameItem.hiddenImageFrames = null;
                        frameItem.processedHiddenImage = processedCanvas;
                    }
                };
                img.src = URL.createObjectURL(file);
            }

            clearBtn.style.display = 'inline-block';
            this.onFrameChange('update');
        });

        clearBtn.addEventListener('click', () => {
            inputElement.value = '';
            preview.style.display = 'none';
            clearBtn.style.display = 'none';
            
            if (isScrambled) {
                frameItem.scrambledImageFrames = null;
                frameItem.processedScrambledImage = null;
            } else {
                frameItem.hiddenImageFrames = null;
                frameItem.processedHiddenImage = null;
            }
            
            this.onFrameChange('update');
        });
    }

    process2BitColor(sourceImage, isScrambled) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size based on source
        if (sourceImage instanceof HTMLCanvasElement) {
            canvas.width = sourceImage.width;
            canvas.height = sourceImage.height;
            ctx.drawImage(sourceImage, 0, 0);
        } else {
            canvas.width = sourceImage.width;
            canvas.height = sourceImage.height;
            ctx.drawImage(sourceImage, 0, 0);
        }
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const alpha = data[i + 3];
            
            // Convert to grayscale for intensity
            const gray = (r * 0.299 + g * 0.587 + b * 0.114);
            
            if (isScrambled) {
                // Red channel for scrambled content
                data[i] = gray;     // Red
                data[i + 1] = 0;    // Green
                data[i + 2] = 0;    // Blue
                data[i + 3] = alpha; // Alpha
            } else {
                // Cyan channel for hidden content
                data[i] = 0;        // Red
                data[i + 1] = gray; // Green
                data[i + 2] = gray; // Blue
                data[i + 3] = alpha; // Alpha
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    async extractGifFrames(file) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                
                // For now, we'll extract the first frame
                // A full GIF parser would be needed for proper frame extraction
                ctx.drawImage(img, 0, 0);
                
                resolve([{
                    canvas: canvas,
                    delay: 100 // Default delay
                }]);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    createFrameInput(scrambled = '', hidden = '') {
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
            this.onFrameChange('remove');
            this.updateFrameNumbers();
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
            this.onFrameChange('update');
        });

        // Scrambled media input
        const scrambledMediaGroup = document.createElement('div');
        scrambledMediaGroup.className = 'media-input-group';
        const scrambledImageInput = document.createElement('input');
        scrambledImageInput.type = 'file';
        scrambledImageInput.className = 'scrambled-image-input';
        scrambledImageInput.accept = 'image/*,.gif';
        scrambledImageInput.style.display = 'none';
        const scrambledUploadBtn = document.createElement('button');
        scrambledUploadBtn.type = 'button';
        scrambledUploadBtn.className = 'upload-btn scrambled-upload-btn';
        scrambledUploadBtn.textContent = 'Upload Image/GIF';
        const scrambledClearBtn = document.createElement('button');
        scrambledClearBtn.type = 'button';
        scrambledClearBtn.className = 'clear-media-btn scrambled-clear-btn';
        scrambledClearBtn.textContent = 'Clear Media';
        scrambledClearBtn.style.display = 'none';
        const scrambledPreview = document.createElement('div');
        scrambledPreview.className = 'media-preview scrambled-preview';
        scrambledPreview.style.display = 'none';

        scrambledMediaGroup.appendChild(scrambledImageInput);
        scrambledMediaGroup.appendChild(scrambledUploadBtn);
        scrambledMediaGroup.appendChild(scrambledClearBtn);
        scrambledMediaGroup.appendChild(scrambledPreview);

        scrambledGroup.appendChild(scrambledLabel);
        scrambledGroup.appendChild(scrambledTextarea);
        scrambledGroup.appendChild(scrambledMediaGroup);

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
            this.onFrameChange('update');
        });

        // Hidden media input
        const hiddenMediaGroup = document.createElement('div');
        hiddenMediaGroup.className = 'media-input-group';
        const hiddenImageInput = document.createElement('input');
        hiddenImageInput.type = 'file';
        hiddenImageInput.className = 'hidden-image-input';
        hiddenImageInput.accept = 'image/*,.gif';
        hiddenImageInput.style.display = 'none';
        const hiddenUploadBtn = document.createElement('button');
        hiddenUploadBtn.type = 'button';
        hiddenUploadBtn.className = 'upload-btn hidden-upload-btn';
        hiddenUploadBtn.textContent = 'Upload Image/GIF';
        const hiddenClearBtn = document.createElement('button');
        hiddenClearBtn.type = 'button';
        hiddenClearBtn.className = 'clear-media-btn hidden-clear-btn';
        hiddenClearBtn.textContent = 'Clear Media';
        hiddenClearBtn.style.display = 'none';
        const hiddenPreview = document.createElement('div');
        hiddenPreview.className = 'media-preview hidden-preview';
        hiddenPreview.style.display = 'none';

        hiddenMediaGroup.appendChild(hiddenImageInput);
        hiddenMediaGroup.appendChild(hiddenUploadBtn);
        hiddenMediaGroup.appendChild(hiddenClearBtn);
        hiddenMediaGroup.appendChild(hiddenPreview);

        hiddenGroup.appendChild(hiddenLabel);
        hiddenGroup.appendChild(hiddenTextarea);
        hiddenGroup.appendChild(hiddenMediaGroup);

        toggleCheckbox.addEventListener('change', () => {
            if (toggleCheckbox.checked) {
                // Re-enable and generate
                scrambledTextarea.value = generateScrambledText(hiddenTextarea.value);
                this.onFrameChange('update');
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
        
        // Setup media inputs
        this.setupMediaInput(scrambledImageInput, scrambledUploadBtn, scrambledClearBtn, scrambledPreview, item, true);
        this.setupMediaInput(hiddenImageInput, hiddenUploadBtn, hiddenClearBtn, hiddenPreview, item, false);
        
        this.framesList.appendChild(item);
        this.updateFrameNumbers();
        this.onFrameChange('add');
    }
}