import { Handler } from "../../../library/leader/viaBroadcastChannel.js";
import { BASE_URL } from "../script.js";

// python -m http.server 8000

let fragmentList = [];
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

if (!window.location.hash) {
    const thisFragment = Handler.newFragment();
    window.location.hash = thisFragment;
    fragmentList.push(thisFragment);
} else {
    const hash = window.location.hash;
    fragmentList.push(hash.slice(1));
}

export const newWorker = () => {
    const newFragment = Handler.newFragment();
    const url = `${BASE_URL}#${newFragment}`;
    window.open(url);
    fragmentList.push(newFragment);
}

export const newHandler = () => {
    const newFragment = Handler.newFragment();
    const url = `${BASE_URL}/withHandler#${newFragment}`;
    window.open(url);
    fragmentList.push(newFragment);
}

export const testClear = () => {
    fragmentList = [];
}

export const isAlive = async () => {
    fragmentList.forEach(async (fragment) => {
        const out = await handler.checkLive({ fragment });
        console.log("checkLive", { ...out });
    });
}

export const findNeighbours = async () => {
    const out = await handler.findNeighbours();
    console.log("findNeighbours", { ...out });
    fragmentList = out.keys;
}

export const testSetFn = () => {
    const fnArgs = getTestFn(); 
    fragmentList.forEach(async (fragment) => {
        const out = await handler.setFn({ ...fnArgs, fragment });
        console.log("setFn", { ...out });
    });
}

export const testPoll = () => {
    fragmentList.forEach(async (fragment) => {
        const out = await handler.poll({ fragment });
        console.log("poll", { ...out });
    });
}

export const clearFns = () => {
    fragmentList.forEach(async (fragment) => { 
        handler.clearFns({ fragment });
    });
}

export const testRun = () => {
    const runArgs = getTestRun(); 
    fragmentList.forEach(async (fragment) => { 
        const out = await handler.execute({ ...runArgs, fragment });
        console.log("run", { ...out });
    });
}