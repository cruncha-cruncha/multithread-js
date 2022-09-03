import { enqueueResponse, waitForResponse } from "./responseBuffer.js";
import { newNonce, validateThreadKey, validateIntention } from "../messaging.js";
import {
    getCheckLive,
    getSetFn,
    getPoll,
    getClearFns,
    getExecute,
} from "./singles.js";

// TODO: allow user to specify channel name?
export const CHANNEL_NAME = "MULTITHREAD-JS"

export class Handler {
    #channel = null;

    constructor() {
        this.#channel = new BroadcastChannel(CHANNEL_NAME)
        this.#channel.onmessage = (event) => enqueueResponse(event.data);
    }

    cancel() {
        if (!!this.#channel) {
            this.#channel.close();
        }
    }

    checkLive({ fragment }) {
        const sendMessage = getSendMessage({ channel: this.#channel, fragment });
        return getCheckLive({ sendMessage, waitForResponse })();
    }

    setFn({ fragment, fnName, sFn }) {
        const sendMessage = getSendMessage({ channel: this.#channel, fragment });
        return getSetFn({ sendMessage, waitForResponse })({ fnName, sFn });
    } 

    poll({ fragment }) {
        const sendMessage = getSendMessage({ channel: this.#channel, fragment });
        return getPoll({ sendMessage, waitForResponse })();
    }

    clearFns({ fragment }) {
        const sendMessage = getSendMessage({ channel: this.#channel, fragment });
        return getClearFns({ sendMessage, waitForResponse })();
    }

    execute({ fragment, args, fnName }) {
        const sendMessage = getSendMessage({ channel: this.#channel, fragment });
        return getExecute({ sendMessage, waitForResponse })({ args, fnName });
    }
}

export const validateChannel = (channel) => {
    if (!channel || typeof channel.postMessage !== "function") {
        return false;
    }

    return true;
}

const getSendMessage = ({ channel, fragment: threadKey }) => {
    return ({ intention, data=null }) => {
        if (!validateChannel(channel)) {
            return { success: false, hint: "bad channel" };
        }

        if (!validateThreadKey(threadKey)) {
            return { success: false, hint: "bad fragment" };
        }

        if (!validateIntention(intention)) {
            return { success: false, hint: "bad intention" };
        }

        const nonce = newNonce();

        try {
            channel.postMessage({
                nonce,
                threadKey,
                intention,
                data,
            }, "*");
            return { success: true, nonce };
        } catch (e) {
            console.error(e);
            return { success: false, hint: `caught: ${e.toString()}` };
        }
    }
}
