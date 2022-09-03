import { Handler } from "../../library/leader/viaPostMessage.js";

// python -m http.server 8000

let windowList = [];

const add = (a, b) => {
    return a + b;
}

const handler = new Handler();

export const testClear = () => {
    windowList = [];
}

export const newTab = () => {
    const { success, hint = "", window: newWindow = null } = Handler.spawnWindow();
    if (success) {
        windowList.push(newWindow);
    } else {
        console.error(hint);
    }
}

export const isAlive = async () => {
    windowList.forEach(async (targetWindow) => {
        const out = await handler.checkLive({ targetWindow });
        console.log("checkLive", { ...out });
    });
}

export const testSetFn = () => {

}

export const testPoll = () => {
    windowList.forEach(async (targetWindow) => {
        const out = await handler.poll({ targetWindow });
        console.log("poll", { ...out });
    });
}

export const clearAllFns = () => {

}

export const run = () => {

}