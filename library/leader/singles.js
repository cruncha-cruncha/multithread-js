import {
    sendMessage,
    waitForResponse,
} from "./listener";
import {
    validateThreadKey,
    validateMessageData,
    newThreadKey,
} from "../messaging";

const BASE_THREAD_URL = "http://localhost:8000"; // TODO

export const newFragmentKey = () => newThreadKey();

export const spawnTab = ({ fragment: threadKey }) => {
    if (!validateThreadKey(threadKey)) {
        return { success: false, hint: "bad fragment" };
    }

    const url = `${BASE_THREAD_URL}#${threadKey}`;

    try {
        window.open(url);
        return { success: true };
    } catch (e) {
        return { success: false, hint: `caught: ${e.toString()}` };
    }
}

export const checkLive = async ({ fragment: threadKey }) => {
    if (!validateThreadKey(threadKey)) {
        return false;
    }

    const { success, nonce = "" } = sendMessage({
        threadKey,
        intention: 'is-alive'
    });

    if (!success) {
        return false;
    }

    const response = await waitForResponse({ nonce, retry: 2 });

    return response.success;
}

export const poll = async ({ fragment: threadKey}) => {
    if (!validateThreadKey(threadKey)) {
        return { success: false, hint: "bad fragment" };
    }

    const { success: goodSend, hint: hint28 = "", nonce = "" } = sendMessage({
        threadKey,
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

    return { success: true, result: data.result };
}

export const clearAllFns = async ({ fragment: threadKey }) => {
    if (!validateThreadKey(threadKey)) {
        return;
    }

    sendMessage({
        threadKey,
        intention: 'clear-all-fns'
    });
}

// does sFn have to be a string? Or can we just pass a function??
export const setFn = async ({ fnName, sFn, fragment: threadKey }) => {
    if (!validateThreadKey(threadKey)) {
        return { success: false, hint: "bad fragment" };
    }

    if (!fnName || typeof fnName !== "string") {
        return { success: false, hint: "bad fnName" };
    }

    if (!sFn || typeof sFn !== "string") {
        return { success: false, hint: "bad fn" };
    }

    const { success: goodSend, hint: hint67 = "", nonce = "" } = sendMessage({
        threadKey,
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

export const execute = ({ args, fnName, fragment: threadKey }) => {
    if (!validateThreadKey(threadKey)) {
        return { success: false, hint: "bad fragment" };
    }

    if (!args || !Array.isArray(args)) {
        return { success: false, hint: "bad args" };
    }

    if (!fnName || typeof fnName !== "string") {
        return { success: false, hint: "bad fnName" };
    }

    const { success: goodSend, hint: hint49 = "", nonce = "" } = sendMessage({
        threadKey,
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
