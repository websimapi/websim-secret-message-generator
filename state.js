let frames = [];
let nextFrameId = 1;

function getFrames() {
    return frames;
}

function addFrame(scrambled = '', hidden = '', autoScramble = true) {
    const newFrame = {
        id: nextFrameId++,
        scrambled,
        hidden,
        autoScramble,
    };
    frames.push(newFrame);
    return newFrame;
}

function removeFrame(frameId) {
    frames = frames.filter(f => f.id !== frameId);
}

function getFrameById(frameId) {
    return frames.find(f => f.id === frameId);
}

export { getFrames, addFrame, removeFrame, getFrameById };

