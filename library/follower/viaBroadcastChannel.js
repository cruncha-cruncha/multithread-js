import { getGenericHandler, threadKey } from "./handler.js";
import { validateChannel, CHANNEL_NAME } from "../leader/viaBroadcastChannel.js";
import {
    validateNonce,
    validateIntention,
} from "../messages.js";

export class Worker {
    #channel = null;

    constructor() {
        this.#channel = new BroadcastChannel(CHANNEL_NAME)
        const sendMessage = getSendMessage({ channel: this.#channel });
        const handle = getGenericHandler({ sendMessage, checkThreadKey: true });
        this.#channel.onmessage = (event) => {
            handle(event.data);
        }
    }

    cancel() {
        if (!!this.#channel) {
            this.#channel.close();
        }
    }
}

const getSendMessage = ({ channel }) => {
    return ({ nonce, intention, data = null }) => {
        if (!validateChannel(channel)) {
            return { success: false, hint: "bad channel" };
        }

        if (!validateNonce(nonce)) {
            return () => false;
        }

        if (!validateIntention(intention)) {
            return false;
        }

        try {
            channel.postMessage({
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