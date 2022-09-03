import { validateMessageData } from "../messages.js";
import { waitForResponse } from "./responseBuffer.js";

export const getCheckLive = ({ sendMessage }) => {
    return async () => {
        const { success: goodSend, nonce = "", hint: hint28 = "" } = sendMessage({
            intention: 'is-alive',
        });
        if (!goodSend) {
            return { success: false, hint: hint28 };
        }

        const { success: goodResponse, message = null, hint: hint93 = "" } = await waitForResponse({
            nonce,
            retry: 2,
        });
        if (!goodResponse) {
            return { success: false, hint: hint93 };
        }

        const { success: validData, hint: hint22 = "", data = null } = validateMessageData({
            intention: message.intention,
            data: message.data
        });
        if (!validData) {
            return { success: false, hint: `validateMessageData failed: ${hint22}` }
        }

        if (message.intention !== "am-alive") {
            return { success: false, hint: "ill-intentioned response message" };
        }

        return { success: true, data: message.data };
    }
}

export const getSetFn = ({ sendMessage }) => {
    // does sFn have to be a string? Or can we just pass a function??
    return async ({ fnName, sFn }) => {
        if (!fnName || typeof fnName !== "string") {
            return { success: false, hint: "bad fnName" };
        }

        if (!sFn || typeof sFn !== "string") {
            return { success: false, hint: "bad fn" };
        }

        const { success: goodSend, hint: hint67 = "", nonce = "" } = sendMessage({
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
}

export const getPoll = ({ sendMessage }) => {
    return async () => {
        const { success: goodSend, hint: hint28 = "", nonce = "" } = sendMessage({
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
            data: message.data,
        });
        if (!validData) {
            return { success: false, hint: `validateMessageData failed: ${hint51}` };
        }

        if (message.intention !== "meta") {
            return { success: false, hint: "ill-intentioned response message" };
        }

        return { success: true, meta: data };
    }
}

export const getClearFns = ({ sendMessage }) => {
    return () => {
        sendMessage({
            intention: 'clear-fns',
        });
    }
}

export const getExecute = ({ sendMessage }) => {
    return async ({ args, fnName }) => {
        if (!args || !Array.isArray(args)) {
            return { success: false, hint: "bad args" };
        }

        if (!fnName || typeof fnName !== "string") {
            return { success: false, hint: "bad fnName" };
        }

        const { success: goodSend, hint: hint49 = "", nonce = "" } = sendMessage({
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
}
