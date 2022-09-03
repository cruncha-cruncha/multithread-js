import { Buffer } from "../buffer.js";
import { validateNonce, validateMessageShape } from "../messages.js";

const responseBuffer = new Buffer(16);

export const sleep = (ms) => {
    return new Promise(r => setTimeout(r, ms));
}

export const enqueueResponse = (resp) => {
    const { success: validShape, message = null } = validateMessageShape(resp);

    if (!validShape) {
        return false;
    }

    const nonce = message.nonce;

    return responseBuffer.insert({
        key: nonce,
        val: message,
    });
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
        if (found) return { success: true, message: val };

        await sleep(pause);
    }
}
