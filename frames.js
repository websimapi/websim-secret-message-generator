
```
import { framesList, scrambledOutput, hiddenOutput, controls, playPauseBtn } from './elements.js';
import { generateScrambledText } from './utils.js';

export const animationState = { isPlaying: false, intervalId: null, currentFrame: 0 };

export function getFramesData() {
  return Array.from(framesList.querySelectorAll('.frame-item')).map(item => {
    const scrambledInput = item.querySelector('.scrambled-input');
    const hiddenInput = item.querySelector('.hidden-input');
    return { scrambled: scrambledInput?.value || '', hidden: hiddenInput?.value || '' };
  });
}

export function updateFrameNumbers() {
  framesList.querySelectorAll('.frame-item').forEach((item, idx) => {
    const header = item.querySelector('h4');
    if (header) header.textContent = `Frame ${idx + 1}`;
  });
}

export function updateOutput() {
  const frames = getFramesData();
  if (frames.length > 0) {
    const frameIndex = animationState.currentFrame % frames.length;
    const currentFrameData = frames[frameIndex];
    document.querySelectorAll('.frame-item').forEach((item, index) => {
      item.style.borderColor = (animationState.isPlaying && index === frameIndex) ? '#007bff' : '#ddd';
    });
    scrambledOutput.textContent = currentFrameData.scrambled;
    hiddenOutput.textContent = currentFrameData.hidden || '';
  } else {
    scrambledOutput.textContent = '';
    hiddenOutput.textContent = '';
    document.querySelectorAll('.frame-item').forEach(item => item.style.borderColor = '#ddd');
  }
}

export function createFrameInput(scrambled = '', hidden = '') {
  const item = document.createElement('div');
  item.className = 'frame-item';

  const header = document.createElement('div');
  header.className = 'frame-item-header';
  const title = document.createElement('h4');
  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-frame-btn';
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', () => { item.remove(); stopAnimation(); updateOutput(); updateFrameNumbers(); });
  header.appendChild(title); header.appendChild(removeBtn);

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
  const toggleLabel = document.createElement('span'); toggleLabel.textContent = 'Auto-scramble';
  const toggleCheckbox = document.createElement('input'); toggleCheckbox.type = 'checkbox'; toggleCheckbox.checked = true;
  toggleContainer.appendChild(toggleLabel); toggleContainer.appendChild(toggleCheckbox);
  scrambledLabel.appendChild(toggleContainer);
  const scrambledTextarea = document.createElement('textarea');
  scrambledTextarea.className = 'scrambled-input'; scrambledTextarea.rows = 4; scrambledTextarea.value = scrambled;
  scrambledTextarea.addEventListener('input', () => { toggleCheckbox.checked = false; updateOutput(); });
  scrambledGroup.appendChild(scrambledLabel); scrambledGroup.appendChild(scrambledTextarea);

  const hiddenGroup = document.createElement('div');
  hiddenGroup.className = 'input-group';
  const hiddenLabel = document.createElement('label'); hiddenLabel.textContent = 'Hidden Message (Cyan)';
  const hiddenTextarea = document.createElement('textarea');
  hiddenTextarea.className = 'hidden-input'; hiddenTextarea.rows = 4; hiddenTextarea.value = hidden;
  hiddenTextarea.addEventListener('input', () => {
    if (toggleCheckbox.checked) scrambledTextarea.value = generateScrambledText(hiddenTextarea.value);
    updateOutput();
  });
  hiddenGroup.appendChild(hiddenLabel); hiddenGroup.appendChild(hiddenTextarea);

  toggleCheckbox.addEventListener('change', () => {
    if (toggleCheckbox.checked) { scrambledTextarea.value = generateScrambledText(hiddenTextarea.value); updateOutput(); }
  });
  if (toggleCheckbox.checked && hidden.length > 0) scrambledTextarea.value = generateScrambledText(hidden);

  inputsDiv.appendChild(scrambledGroup); inputsDiv.appendChild(hiddenGroup);
  item.appendChild(header); item.appendChild(inputsDiv);
  framesList.appendChild(item);
  updateFrameNumbers();
}

export function startAnimation() {
  const frames = getFramesData();
  if (frames.length <= 1) return;
  animationState.isPlaying = true; playPauseBtn.textContent = 'Pause';
  const fps = parseInt(controls.gifFps.value, 10); const delay = 1000 / fps;
  updateOutput();
  animationState.intervalId = setInterval(() => {
    animationState.currentFrame = (animationState.currentFrame + 1) % frames.length;
    updateOutput();
  }, delay);
}

export function stopAnimation() {
  if (animationState.intervalId) clearInterval(animationState.intervalId);
  animationState.isPlaying = false; animationState.currentFrame = 0; updateOutput(); playPauseBtn.textContent = 'Play';
}

export function toggleAnimation() { animationState.isPlaying ? stopAnimation() : startAnimation(); }