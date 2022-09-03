import {
    sendMessage,
    waitForResponse,
} from "./listener.js";
import {
    newThreadKey,
    validateWindow,
    validateMessageData,
} from "../messaging.js";

const BASE_THREAD_URL = "http://localhost:8000"; // TODO

export const spawnWindow = () => {
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

export const checkLive = async ({ targetWindow }) => {
    if (!validateWindow(targetWindow)) {
        return false;
    }

    const { success, nonce = "" } = sendMessage({
        targetWindow,
        intention: 'is-alive',
    });

    if (!success) {
        return false;
    }

    const { success: goodResponse, message = null } = await waitForResponse({
        nonce,
        retry: 2,
    });
    if (!goodResponse) {
        return false;
    }

    return message.intention === "am-alive";
}

export const poll = async ({ targetWindow }) => {
    if (!validateWindow(targetWindow)) {
        return { success: false, hint: "bad targetWindow" };
    }

    const { success: goodSend, hint: hint28 = "", nonce = "" } = sendMessage({
        targetWindow,
        intention: 'poll',
    });
    if (!goodSend) {
        return { success: false, hint: `sendMessage failed: ${hint28}` };
    }

    const { success: goodResponse, hint: hint80 = "", message = null } = await waitForResponse({
        nonce,
        retry: 10,
    });
    if (!goodResponse) {
        return { success: false, hint: `waitForResponse failed: ${hint80}` };
    }

    const { success: validData, hint: hint51 = "", data = null } = validateMessageData({
        intention: message.intention,
        data: message.data
    });
    if (!validData) {
        return { success: false, hint: `validateMessageData failed: ${hint51}` }
    }

    if (message.intention !== "meta") {
        return { success: false, hint: "ill-intentioned response message" };
    }

    return { success: true, meta: data };
}

export const clearAllFns = async ({ targetWindow }) => {
    if (!validateWindow(targetWindow)) {
        return;
    }

    sendMessage({
        targetWindow,
        intention: 'clear-all-fns'
    });
}

// does sFn have to be a string? Or can we just pass a function??
export const setFn = async ({ fnName, sFn, targetWindow }) => {
    if (!validateWindow(targetWindow)) {
        return { success: false, hint: "bad targetWindow" };
    }

    if (!fnName || typeof fnName !== "string") {
        return { success: false, hint: "bad fnName" };
    }

    if (!sFn || typeof sFn !== "string") {
        return { success: false, hint: "bad fn" };
    }

    const { success: goodSend, hint: hint67 = "", nonce = "" } = sendMessage({
        targetWindow,
        intention: 'set-fn',
        data: { fnName, sFn },
    });
    if (!goodSend) {
        return { success: false, hint: `sendMessage failed: ${hint67}` };
    }

    const { success: goodResponse, hint: hint33 = "", message = null } = await waitForResponse({
        nonce,
        retry: 10,
    });
    if (!goodResponse) {
        return { success: false, hint: `waitForResponse failed: ${hint33}` };
    }

    const { success: validData, hint: hint95 = "", data = null } = validateMessageData({
        intention: message.intention,
        data: message.data
    });
    if (!validData) {
        return { success: false, hint: `validateMessageData failed: ${hint95}` }
    }

    if (message.intention === "set-fn-bad") {
        return { success: false, hint: `why does it feel so good to be bad: ${data.hint}` };
    } else if (message.intention !== "set-fn-good") {
        return { success: false, hint: "ill-intentioned response message" };
    }

    return { success: true };
}

export const execute = async ({ args, fnName, targetWindow }) => {
    if (!validateTargetWindow(targetWindow)) {
        return { success: false, hint: "bad targetWindow" };
    }

    if (!args || !Array.isArray(args)) {
        return { success: false, hint: "bad args" };
    }

    if (!fnName || typeof fnName !== "string") {
        return { success: false, hint: "bad fnName" };
    }

    const { success: goodSend, hint: hint49 = "", nonce = "" } = sendMessage({
        targetWindow,
        intention: 'run',
        data: { args, fnName },
    });
    if (!goodSend) {
        return { success: false, hint: `sendMessage failed: ${hint49}` };
    }

    const { success: goodResponse, hint: hint50 = "", message = null } = await waitForResponse({ nonce, retry: 100 });
    if (!goodResponse) {
        return { success: false, hint: `waitForResponse failed: ${hint50}` };
    }

    const { success: validData, hint: hint12 = "", data = null } = validateMessageData({
        intention: message.intention,
        data: message.data
    });
    if (!validData) {
        return { success: false, hint: `validateMessageData failed: ${hint12}` }
    }

    if (message.intention === "run-bad") {
        return { success: false, hint: `bad run: ${data.hint}` };
    } else if (message.intention !== "run-good") {
        return { success: false, hint: "ill-intentioned response message" };
    }

    return { success: true, result: data.result };
}
