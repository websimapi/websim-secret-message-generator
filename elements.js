
```javascript
export const framesList = document.getElementById('frames-list');
export const addFrameBtn = document.getElementById('add-frame-btn');
export const scrambledOutput = document.getElementById('output-scrambled');
export const hiddenOutput = document.getElementById('output-hidden');
export const outputContainer = document.getElementById('output-container');
export const noiseCanvas = document.getElementById('noise-canvas');
export const noiseCtx = noiseCanvas.getContext('2d');

export const playPauseBtn = document.getElementById('play-pause-animation');
export const generateGifBtn = document.getElementById('generate-gif-btn');
export const gifStatusEl = document.getElementById('gif-status');

export const controls = {
  scrambledColor: document.getElementById('scrambled-color'),
  scrambledBlendMode: document.getElementById('scrambled-blend-mode'),
  hiddenColor: document.getElementById('hidden-color'),
  hiddenBlendMode: document.getElementById('hidden-blend-mode'),
  hiddenOffsetX: document.getElementById('hidden-offset-x'),
  hiddenOffsetY: document.getElementById('hidden-offset-y'),
  fontSize: document.getElementById('font-size'),
  fontWeight: document.getElementById('font-weight'),
  letterSpacing: document.getElementById('letter-spacing'),
  lineHeight: document.getElementById('line-height'),
  bgColor: document.getElementById('bg-color'),
  noiseOpacity: document.getElementById('noise-opacity'),
  noiseType: document.getElementById('noise-type'),
  noiseScale: document.getElementById('noise-scale'),
  gifFps: document.getElementById('gif-fps'),
};

export const valueDisplays = {
  hiddenOffsetX: document.getElementById('hidden-offset-x-value'),
  hiddenOffsetY: document.getElementById('hidden-offset-y-value'),
  fontSize: document.getElementById('font-size-value'),
  fontWeight: document.getElementById('font-weight-value'),
  letterSpacing: document.getElementById('letter-spacing-value'),
  lineHeight: document.getElementById('line-height-value'),
  noiseOpacity: document.getElementById('noise-opacity-value'),
  noiseScale: document.getElementById('noise-scale-value'),
  gifFps: document.getElementById('gif-fps-value'),
};

export const blendModes = [
  'normal','multiply','screen','overlay','darken','lighten',
  'color-dodge','color-burn','hard-light','soft-light','difference',
  'exclusion','hue','saturation','color','luminosity'
];