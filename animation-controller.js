export class AnimationController {
    constructor(frameManager, outputUpdater, playPauseBtn, fpsControl, dialogueFpsControl) {
        this.frameManager = frameManager;
        this.outputUpdater = outputUpdater; // This is a function that takes a state object
        this.playPauseBtn = playPauseBtn;
        this.fpsControl = fpsControl;
        this.dialogueFpsControl = dialogueFpsControl;
        
        this.state = {
            isPlaying: false,
            intervalId: null,
            renderQueue: [],
            playhead: 0,
        };

        this.playPauseBtn.addEventListener('click', () => this.toggle());
        this.fpsControl.addEventListener('input', () => this.handleSettingsChange());
        this.dialogueFpsControl.addEventListener('input', () => this.handleSettingsChange());
    }

    handleSettingsChange() {
        if (this.state.isPlaying) {
            this.stop();
            this.start();
        }
    }

    buildRenderQueue() {
        const frames = this.frameManager.getFramesData();
        const queue = [];
        const dialogueFps = parseInt(this.dialogueFpsControl.value, 10);
        const dialogueDelay = 1000 / dialogueFps;

        frames.forEach((frame, index) => {
            if (frame.dialogueMode) {
                const maxLen = Math.max(frame.scrambled.length, frame.hidden.length);
                if (maxLen === 0) {
                     queue.push({
                        type: 'dialogue',
                        frameData: { scrambled: '', hidden: '' },
                        originalFrameIndex: index,
                        charCount: 0,
                        delay: dialogueDelay
                    });
                } else {
                    for (let i = 1; i <= maxLen; i++) {
                        queue.push({
                            type: 'dialogue',
                            frameData: {
                                scrambled: frame.scrambled.substring(0, i),
                                hidden: frame.hidden.substring(0, i)
                            },
                            originalFrameIndex: index,
                            charCount: i,
                            delay: dialogueDelay
                        });
                    }
                }
            } else {
                 queue.push({
                    type: 'full',
                    frameData: frame,
                    originalFrameIndex: index,
                    delay: 1000 / parseInt(this.fpsControl.value, 10)
                });
            }
        });
        this.state.renderQueue = queue;
    }

    toggle() {
        if (this.state.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    }

    start() {
        this.buildRenderQueue();
        const frames = this.state.renderQueue;
        if (frames.length === 0) return;

        this.state.isPlaying = true;
        this.playPauseBtn.textContent = 'Pause';
        this.state.playhead = 0;

        const advanceFrame = () => {
            if (!this.state.isPlaying) return;

            const currentRenderItem = frames[this.state.playhead];
            this.outputUpdater(currentRenderItem);

            this.state.playhead = (this.state.playhead + 1) % frames.length;
            
            // Schedule the next frame
            const nextRenderItem = frames[this.state.playhead];
            this.state.intervalId = setTimeout(advanceFrame, nextRenderItem.delay);
        };
        
        // Initial call
        const firstFrame = frames[0];
        this.outputUpdater(firstFrame);
        this.state.intervalId = setTimeout(advanceFrame, firstFrame.delay);
    }

    stop() {
        if (this.state.intervalId) {
            clearTimeout(this.state.intervalId);
            this.state.intervalId = null;
        }
        this.state.isPlaying = false;
        this.state.playhead = 0;
        this.outputUpdater({ type: 'reset' }); // Special state to reset view
        this.playPauseBtn.textContent = 'Play';
    }

    getCurrentFrame() {
        if (this.state.renderQueue.length > 0) {
            return this.state.renderQueue[this.state.playhead]?.originalFrameIndex || 0;
        }
        return 0;
    }

    isPlaying() {
        return this.state.isPlaying;
    }
}