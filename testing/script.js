import {
    spawnWindow,
    checkLive,
    poll,
} from "../library/leader/singles.js";

// python -m http.server 8000

// http://localhost:8000#1111111111111111
// http://localhost:8000#2222222222222222

let windowList = [];

const add = (a, b) => {
    return a + b;
}

export const testClear = () => {
    windowList = [];
}

export const newTab = () => {
    const { success, hint = "", window: newWindow = null } = spawnWindow();
    if (success) {
        windowList.push(newWindow);
    } else {
        console.error(hint);
    }
}

export const isAlive = async () => {
    windowList.forEach(async (targetWindow) => {
        const out = await checkLive({ targetWindow });
        console.log("checkLive", { out });
    });
}

export const testSetFn = () => {

}

export const testPoll = () => {
    windowList.forEach(async (targetWindow) => {
        const out = await poll({ targetWindow });
        console.log("poll", { out });
    });
}

export const clearAllFns = () => {

}

export const run = () => {

}