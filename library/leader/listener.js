import {
    genNonce,
    validateNonce, 
    validateThreadKey,
    validateIntention,
    validateMessageShape,
} from "../messaging";
import { Buffer } from "../buffer";

const responseBuffer = new Buffer(100);

export const getResponseBuffer = () => {
    return responseBuffer;
}

window.addEventListener("message", async (event) => {
    const { success: validShape, message = null } = validateMessageShape(event.data);

    if (!validShape) {
        return;
    }

    const nonce = message.nonce;

    if (!responseBuffer.add({
        key: nonce,
        val: message,
    })) {
        console.error("RESPONSE COLLISION", { nonce });
    }
});

export const sleep = (ms) => {
    return new Promise(r => setTimeout(r, ms));
}

export const sendMessage = ({ threadKey, intention, data }) => {
    if (!validateThreadKey(threadKey)) {
        return { success: false, hint: "bad threadKey" };
    }

    if (!validateIntention(intention)) {
        return { success: false, hint: "bad intention" };
    }

    if (!!data && typeof data !== "string") {
        return { success: false, hint: "bad data" };
    }

    const nonce = genNonce();

    try {
        window.postMessage({
            nonce,
            threadKey,
            intention,
            data: data || null,
        }, "*");
        return { success: true, nonce };
    } catch (e) {
        console.error(e);
        return { success: false, hint: `caught: ${e.toString()}`, nonce };
    }

}

export const waitForResponse = async ({ nonce, retry = 50, pause = 100 }) => {
    if (!validateNonce(nonce)) {
        return { success: false, hint: "bad nonce" };
    }

    if (!retry || typeof retry !== "number" || retry < 0 || retry > 600) {
        return { success: false, hint: "bad retry" };
    }

    if (!pause || typeof pause !== "number" || pause < 0 || pause > 10000) {
        return { success: false, hint: "poor sleep" };
    }

    let i = 0;
    while (true) {
        if (i >= retry) return { success: false, hint: "retry limit" };
        i++;

        const { found, val = null } = responseBuffer.take({ key: nonce });
        if (found) return { success: true, response: val };

        await sleep(pause);
    }
}
