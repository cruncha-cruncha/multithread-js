import { Handler } from "../../library/leader/viaBroadcastChannel.js";
import { Worker } from "../../library/follower/viaBroadcastChannel.js";

const worker = new Worker();
export const BASE_URL = "http://localhost:8000/testing/viaBroadcastChannel";

if (!window.location.hash) {
    const thisFragment = Handler.newFragment();
    window.location.hash = thisFragment;
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