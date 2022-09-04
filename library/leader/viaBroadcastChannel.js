import { enqueueResponse, waitForResponse } from "./responseBuffer.js";
import {
    newNonce,
    validateThreadKey,
    validateIntention,
    newThreadKey,
} from "../messages.js";
import {
    getCheckLive,
    getSetFn,
    getPoll,
    getClearFns,
    getExecute,
    receiveMessage,
} from "./singles.js";

export const CHANNEL_NAME = "MULTITHREAD-JS-B2-C2" // guaranteed to be random lol

export class Handler {
    #channel = null;

    constructor() {
        this.#channel = new BroadcastChannel(CHANNEL_NAME)
        this.#channel.onmessage = (event) => {
            enqueueResponse(event.data);
        }
    }

    cancel() {
        if (!!this.#channel) {
            this.#channel.close();
        }
    }

    static newFragment = () => {
        return newThreadKey();
    }

    async findNeighbours() {
        const sendMessage = getSendAllMessage({ channel: this.#channel });

        const { success: sent, hint: hint41, nonce } = sendMessage({
            intention: 'is-alive',
        });

        if (!sent) {
            return { keys: [], all: [] };
        }

        const possibles = [];
        const failures = [];
        let consecutiveFailures = 0;
        while (consecutiveFailures < 2) {
            const { success: reception, hint: hint39, intention, data } = await receiveMessage({ nonce, retry: 2, pause: 50 });

            if (!reception) {
                consecutiveFailures += 1;
                failures.push({ success: false, hint: hint39 });
                continue;
            }

            if (intention !== "am-alive") {
                consecutiveFailures += 1;
                failures.push({ success: false, hint: "ill-intentioned response message" });
                continue;
            }

            consecutiveFailures = 0;
            possibles.push({ success: true, possibleThreadKey: data.possibleThreadKey });
        }

        return {
            keys: possibles
                .filter(({ possibleThreadKey }) => validateThreadKey(possibleThreadKey))
                .map(({ possibleThreadKey }) => possibleThreadKey),
            all: [ ...possibles, ...failures ],
        };
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
    return ({ intention, data = null }) => {
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

const getSendAllMessage = ({ channel }) => {
    return ({ intention, data }) => {
        if (!validateChannel(channel)) {
            return { success: false, hint: "bad channel" };
        }

        if (!validateIntention(intention)) {
            return { success: false, hint: "bad intention" };
        }

        const nonce = newNonce();

        try {
            channel.postMessage({
                nonce,
                threadKey: "*",
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
