import { getGenericHandler, threadKey } from "./handler.js";
import { validateWindow } from "../leader/viaPostMessage.js";
import {
    validateNonce,
    validateIntention,
} from "../messages.js";

export class Worker {
    constructor() {
        window.addEventListener("message", listener);
    }
    
    cancel() {
        window.removeEventListener("message", listener);
    }
}

const listener = async (event) => {
    const sendMessage = getSendMessage({ targetWindow: event.source });
    const handle = getGenericHandler({ sendMessage, checkThreadKey: false });
    handle(event.data);
}

const getSendMessage = ({ targetWindow }) => {
    return ({ nonce, intention, data }) => {
        if (!validateWindow(targetWindow)) {
            return () => false;
        }

        if (!validateNonce(nonce)) {
            return () => false;
        }

        if (!validateIntention(intention)) {
            return false;
        }

        try {
            targetWindow.postMessage({
                nonce,
                threadKey,
                intention,
                data,
            }, "*");
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
}