import { controls, outputContainer, noiseCanvas, generateGifBtn, playPauseBtn, gifStatusEl } from './elements.js';
import { getFramesData, animationState, startAnimation, stopAnimation } from './frames.js';

export async function generateGif() {
  generateGifBtn.disabled = true; playPauseBtn.disabled = true; gifStatusEl.textContent = 'Initializing...';
  const frames = getFramesData();
  if (!frames.length) { gifStatusEl.textContent = 'Add at least one frame.'; generateGifBtn.disabled = false; playPauseBtn.disabled = false; return; }

  const wasPlaying = animationState.isPlaying; if (wasPlaying) stopAnimation();
  const { width, height } = outputContainer.getBoundingClientRect();
  const fps = parseInt(controls.gifFps.value, 10); const delay = 1000 / fps;

  const gif = new GIF({ workers: 2, quality: 10, width, height });
  const offscreenCanvas = document.createElement('canvas'); offscreenCanvas.width = width; offscreenCanvas.height = height;
  const ctx = offscreenCanvas.getContext('2d');

  function drawFrame(frameData) {
    return new Promise(resolve => {
      setTimeout(() => {
        ctx.fillStyle = controls.bgColor.value; ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = parseFloat(controls.noiseOpacity.value); ctx.drawImage(noiseCanvas, 0, 0); ctx.globalAlpha = 1.0;

        const baseStyles = window.getComputedStyle(document.getElementById('output-scrambled'));
        const x = parseFloat(baseStyles.left); const y = parseFloat(baseStyles.top);
        ctx.textBaseline = 'top';
        const font = `${controls.fontWeight.value} ${controls.fontSize.value}px 'Courier New', Courier, monospace`;
        ctx.font = font;
        const lineHeight = parseFloat(controls.lineHeight.value);
        const drawText = (text, sx, sy) => text.split('\n').forEach((line, i) => ctx.fillText(line, sx, sy + (i * lineHeight * parseFloat(controls.fontSize.value))));

        ctx.globalCompositeOperation = controls.scrambledBlendMode.value; ctx.fillStyle = controls.scrambledColor.value;
        drawText(frameData.scrambled, x, y);
        ctx.globalCompositeOperation = controls.hiddenBlendMode.value; ctx.fillStyle = controls.hiddenColor.value;
        const ox = parseInt(controls.hiddenOffsetX.value, 10), oy = parseInt(controls.hiddenOffsetY.value, 10);
        drawText(frameData.hidden, x + ox, y + oy);
        resolve(ctx);
      }, 50);
    });
  }

  for (let i = 0; i < frames.length; i++) {
    gifStatusEl.textContent = `Rendering frame ${i + 1}/${frames.length}...`;
    const frameCtx = await drawFrame(frames[i]);
    gif.addFrame(frameCtx, { delay, copy: true });
  }

  gif.on('finished', blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'secret-message.gif';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    gifStatusEl.textContent = 'Done!'; generateGifBtn.disabled = false; playPauseBtn.disabled = false; if (wasPlaying) startAnimation();
  });
  gif.on('progress', p => { gifStatusEl.textContent = `Building GIF... ${Math.round(p * 100)}%`; });
  gif.render();
}

