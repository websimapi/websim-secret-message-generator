export class NoiseGenerator {
    constructor() {
        this.noiseCanvas = document.getElementById('noise-canvas');
        this.noiseCtx = this.noiseCanvas.getContext('2d');
        this.outputContainer = document.getElementById('output-container');
    }

    init() {
        this.setupResizeObserver();
    }

    setupResizeObserver() {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                this.noiseCanvas.width = width;
                this.noiseCanvas.height = height;
                this.regenerate();
            }
        });

        resizeObserver.observe(this.outputContainer);
        
        // Initial size setup
        const initialRect = this.outputContainer.getBoundingClientRect();
        this.noiseCanvas.width = initialRect.width;
        this.noiseCanvas.height = initialRect.height;
    }

    regenerate() {
        const settingsController = window.app?.settingsController;
        if (!settingsController) return;
        
        const settings = settingsController.getNoiseSettings();
        this.generate(settings.scale, settings.type);
    }

    generate(scale = 1, type = 'color') {
        const w = this.noiseCanvas.width;
        const h = this.noiseCanvas.height;

        this.noiseCtx.clearRect(0, 0, w, h);

        for (let y = 0; y < h; y += scale) {
            for (let x = 0; x < w; x += scale) {
                let r, g, b;
                if (type === 'color') {
                    r = Math.floor(Math.random() * 256);
                    g = Math.floor(Math.random() * 256);
                    b = Math.floor(Math.random() * 256);
                } else { // grayscale
                    const val = Math.floor(Math.random() * 256);
                    r = g = b = val;
                }
                this.noiseCtx.fillStyle = `rgb(${r},${g},${b})`;
                this.noiseCtx.fillRect(x, y, scale, scale);
            }
        }
    }
}