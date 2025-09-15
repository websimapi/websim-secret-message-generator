
```
import { controls, valueDisplays, outputContainer, noiseCanvas, scrambledOutput, hiddenOutput } from './elements.js';
import { generateNoise } from './noise.js';

export function updateStyles() {
  // Layer colors/modes
  scrambledOutput.style.color = controls.scrambledColor.value;
  scrambledOutput.style.mixBlendMode = controls.scrambledBlendMode.value;
  const offsetX = controls.hiddenOffsetX.value;
  const offsetY = controls.hiddenOffsetY.value;
  hiddenOutput.style.color = controls.hiddenColor.value;
  hiddenOutput.style.mixBlendMode = controls.hiddenBlendMode.value;
  hiddenOutput.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

  // Shared text
  const fontSize = controls.fontSize.value;
  const fontWeight = controls.fontWeight.value;
  const letterSpacing = controls.letterSpacing.value;
  const lineHeight = controls.lineHeight.value;
  const shared = `font-size:${fontSize}px;font-weight:${fontWeight};letter-spacing:${letterSpacing}px;line-height:${lineHeight};`;
  scrambledOutput.style.cssText += shared;
  hiddenOutput.style.cssText += shared;

  // Background
  outputContainer.style.backgroundColor = controls.bgColor.value;
  noiseCanvas.style.opacity = controls.noiseOpacity.value;

  // Value displays
  for (const key in valueDisplays) {
    if (valueDisplays[key] && controls[key]) valueDisplays[key].textContent = controls[key].value;
  }

  generateNoise();
}