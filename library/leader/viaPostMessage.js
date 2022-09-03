import { enqueueResponse } from "./responseBuffer.js";
import { newThreadKey, newNonce, validateIntention } from "../messages.js";
import {
    getCheckLive,
    getSetFn,
    getPoll,
    getClearFns,
    getExecute,
} from "./singles.js";

// TODO: make configurable
const BASE_THREAD_URL = "http://localhost:8000";

export class Handler {
    static spawnWindow() {
        const threadKey = newThreadKey();
    
        const url = `${BASE_THREAD_URL}#${threadKey}`;
    
        try {
            const newWindow = window.open(url);
            if (!newWindow) {
                return { success: false, hint: "no new window" };
            } else {
                return { success: true, window: newWindow };
            }
        } catch (e) {
            return { success: false, hint: `caught: ${e.toString()}` };
        }
    }

    #listener(event) {
        enqueueResponse(event.data);
    }

    constructor() {
        window.addEventListener("message", this.#listener);
    }

    cancel() {
        window.removeEventListener("message", this.#listener);
    }

    checkLive({ targetWindow }) {
        const sendMessage = getSendMessage({ targetWindow });
        return getCheckLive({ sendMessage })();
    }

    setFn({ targetWindow, fnName, sFn }) {
        const sendMessage = getSendMessage({ targetWindow });
        return getSetFn({ sendMessage })({ fnName, sFn });
    } 

    poll({ targetWindow }) {
        const sendMessage = getSendMessage({ targetWindow });
        return getPoll({ sendMessage })();
    }

    clearFns({ targetWindow }) {
        const sendMessage = getSendMessage({ targetWindow });
        return getClearFns({ sendMessage })();
    }

    execute({ targetWindow, args, fnName }) {
        const sendMessage = getSendMessage({ targetWindow });
        return getExecute({ sendMessage })({ args, fnName });
    }
}

export const validateWindow = (targetWindow) => {
    if (!targetWindow || typeof targetWindow.postMessage !== "function") {
        return false;
    }

    return true;
}

const getSendMessage = ({ targetWindow }) => {
    return ({ intention, data=null }) => {
        if (!validateWindow(targetWindow)) {
            return { success: false, hint: "bad targetWindow" };
        }

        if (!validateIntention(intention)) {
            return { success: false, hint: "bad intention" };
        }

        const nonce = newNonce();

        try {
            targetWindow.postMessage({
                nonce,
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
