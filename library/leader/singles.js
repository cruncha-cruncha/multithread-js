import { validateMessageData } from "../messages.js";
import { waitForResponse } from "./responseBuffer.js";

export const receiveMessage = async ({ nonce, retry = 50, pause = 100 }) => {
    const { success: goodResponse, hint: hint93, message } = await waitForResponse({
        nonce,
        retry,
        pause,
    });

    if (!goodResponse) {
        return { success: false, hint: hint93 };
    }

    const { success: validData, hint: hint22, data } = validateMessageData({
        intention: message.intention,
        data: message.data,
    });

    if (!validData) {
        return { success: false, hint: hint22 }
    }

    return { success: true, ...message, data };
}

export const getCheckLive = ({ sendMessage }) => {
    return async () => {
        const { success: sent, hint: hint28, nonce } = sendMessage({
            intention: 'is-alive',
        });

        if (!sent) {
            return { success: false, hint: hint28 };
        }

        const { success: reception, hint: hint53, intention, data } = await receiveMessage({ nonce, retry: 2 });

        if (!reception) {
            return { success: false, hint: hint53 };
        }

        if (intention !== "am-alive") {
            return { success: false, hint: "ill-intentioned response message" };
        }

        return { success: true, data: data };
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

        const { success: sent, hint: hint67, nonce } = sendMessage({
            intention: 'set-fn',
            data: { fnName, sFn },
        });

        if (!sent) {
            return { success: false, hint: hint67 };
        }

        const { success: reception, hint: hint33, intention, data } = await receiveMessage({ nonce, retry: 10 });

        if (!reception) {
            return { success: false, hint: hint33 };
        }

        if (intention === "set-fn-bad") {
            return { success: false, hint: `why does it feel so good to be bad? ${data.hint}` };
        } else if (intention !== "set-fn-good") {
            return { success: false, hint: "ill-intentioned response message" };
        }

        return { success: true };
    }
}

export const getPoll = ({ sendMessage }) => {
    return async () => {
        const { success: sent, hint: hint28, nonce } = sendMessage({
            intention: 'poll',
        });

        if (!sent) {
            return { success: false, hint: hint28 };
        }

        const { success: reception, hint: hint80, intention, data } = await receiveMessage({ nonce, retry: 10 });

        if (!reception) {
            return { success: false, hint: hint80 };
        }

        if (intention !== "meta") {
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

        const { success: sent, hint: hint49, nonce } = sendMessage({
            intention: 'run',
            data: { args, fnName },
        });

        if (!sent) {
            return { success: false, hint: hint49 };
        }

        const { success: reception, hint: hint50, intention, data } = await receiveMessage({ nonce, retry: 10 });

        if (!reception) {
            return { success: false, hint: hint50 };
        }

        if (intention === "run-bad") {
            return { success: false, hint: `bad run: ${data.hint}` };
        } else if (intention !== "run-good") {
            return { success: false, hint: "ill-intentioned response message" };
        }

        return { success: true, result: data.result };
    }
}
