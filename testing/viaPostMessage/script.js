import { Handler } from "../../library/leader/viaPostMessage.js";

// python -m http.server 8000

let windowList = [];
const handler = new Handler();

const add = (a, b) => {
    return a + b;
}

const getTestRun = () => {
    return {
        fnName: "add",
        args: [1, 2],
    };
}

const getTestFn = () => {
    return {
        fnName: "add",
        sFn: add.toString(),
    };
}

export const testClear = () => {
    windowList = [];
}

export const newTab = () => {
    const { success, hint, window: newWindow } = Handler.spawnWindow();
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
    const fnArgs = getTestFn(); 
    windowList.forEach(async (targetWindow) => {
        const out = await handler.setFn({ ...fnArgs, targetWindow });
        console.log("setFn", { ...out });
    });
}

export const testPoll = () => {
    windowList.forEach(async (targetWindow) => {
        const out = await handler.poll({ targetWindow });
        console.log("poll", { ...out });
    });
}

export const clearFns = () => {
    windowList.forEach(async (targetWindow) => { 
        handler.clearFns({ targetWindow });
    });
}

export const testRun = () => {
    const runArgs = getTestRun(); 
    windowList.forEach(async (targetWindow) => { 
        const out = await handler.execute({ ...runArgs, targetWindow });
        console.log("run", { ...out });
    });
}