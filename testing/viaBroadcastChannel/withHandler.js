import { Handler } from "../../library/leader/viaBroadcastChannel.js";
import { Worker } from "../../library/follower/viaBroadcastChannel.js";
import { BASE_URL } from "./script.js";

// python -m http.server 8000

let fragmentList = [];

const add = (a, b) => {
    return a + b;
}

const getTestFn = () => {
    return {
        fnName: "add",
        sFn: add.toString(),
    };
}

const worker = new Worker();
const handler = new Handler();

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
}

export const newHandler = () => {
    const newFragment = Handler.newFragment();
    const url = `${BASE_URL}/withHandler.html#${newFragment}`;
    window.open(url);
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

export const testSetFn = () => {

}

export const testPoll = () => {
    fragmentList.forEach(async (fragment) => {
        const out = await handler.poll({ fragment });
        console.log("poll", { ...out });
    });
}

export const clearAllFns = () => {

}

export const run = () => {

}