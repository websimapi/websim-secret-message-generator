
```javascript
import { controls, blendModes, addFrameBtn, playPauseBtn, generateGifBtn, outputContainer, noiseCanvas } from './elements.js';
import { populateSelect } from './utils.js';
import { createFrameInput, updateOutput, toggleAnimation } from './frames.js';
import { updateStyles } from './styles.js';
import { initNoiseResizeObserver } from './noise.js';
import { generateGif } from './gifBuilder.js';

export function setup() {
  populateSelect(controls.scrambledBlendMode, blendModes, 'lighten');
  populateSelect(controls.hiddenBlendMode, blendModes, 'darken');

  addFrameBtn.addEventListener('click', () => createFrameInput());
  for (const key in controls) {
    controls[key].addEventListener('input', () => { updateStyles(); });
  }
  playPauseBtn.addEventListener('click', toggleAnimation);
  generateGifBtn.addEventListener('click', generateGif);

  initNoiseResizeObserver(() => updateStyles());

  createFrameInput(
    'THISE ISW AJUMBLEF OF LETTERS ANDX WORDS TOD HIDES A MESSAGE.',
    'THIS IS A HIDDEN MESSAGE. YOU FOUND IT! GREAT JOB DETECTIVE!'
  );
  updateOutput();

  const rect = outputContainer.getBoundingClientRect();
  noiseCanvas.width = rect.width; noiseCanvas.height = rect.height;
  updateStyles();
}