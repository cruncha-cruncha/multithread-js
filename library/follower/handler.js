import {
    validateMessageShape,
    validateMessageData,
} from "../messages.js";

export const threadKey = (() => {
    const fragment = window.location.hash;
    if (!fragment) {
        return null;
    } else {
        return fragment.slice(1);
    }
})();

const Operator = (() => {
    let functions = {};
    let isRunning = {};

    const startRun = (runKey) => {
        if (runKey in isRunning) {
            return false;
        } else {
            isRunning[runKey] = true;
            return true;
        }
    };

    const stopRun = (runKey) => {
        delete isRunning[runKey];
    };

    return {

        clearFunctions: () => {
            functions = {};
        },

        setFn: ({ fnName, fn }) => {
            if (!fnName || typeof fnName !== "string") {
                return { success: false, hint: "bad fnName" };
            }

            if (fnName in functions) {
                return { success: false, hint: "fnName already registered" };
            }

            if (!fn || typeof fn !== "function") {
                return { success: false, hint: "bad fn" };
            }

            functions[fnName] = fn;
            return { success: true };
        },

        run: async ({ args, fnName, runKey }) => {
            if (!runKey || typeof runKey !== "string") {
                return { success: false, hint: "bad runKey??" };
            }

            if (!startRun(runKey)) {
                return { success: false, hint: "failed to start run??" };
            }

            if (!fnName || !(fnName in functions)) {
                stopRun(runKey);
                return { success: false, hint: "bad fnName" };
            }

            fnToRun = functions[fnName];

            if (!Array.isArray(args)) {
                stopRun(runKey);
                return { success: false, hint: "bad args" };
            }

            try {
                const result = await fnToRun(...args);
                return { success: true, result };
            } catch (err) {
                return { success: true, result: err };
            } finally {
                stopRun(runKey);
            }
        },

        getMeta: () => ({
            functions: Object.keys(functions),
            isRunning: Object.keys(isRunning),
        }),

    }
})();

export const getGenericHandler = ({ sendMessage, checkThreadKey }) => {
    return async (packet) => {
        const { success: validShape, hint: hint51 = "", message = null } = validateMessageShape(packet);

        if (!validShape || (checkThreadKey && message.threadKey !== threadKey)) {
            return;
        }

        const { success: validData, hint: hint46 = "", data = null } = validateMessageData({ intention: message.intention, data: message.data });

        if (!validData) {
            return;
        }

        const nonce = message.nonce;

        switch (message.intention) {
            case 'set-fn': {
                const { success, hint = "" } = Operator.setFn({ ...data });
                if (success) {
                    sendMessage({ nonce, intention: "set-fn-good" });
                } else {
                    sendMessage({ nonce, intention: "set-fn-bad", data: { hint } });
                }
                break;
            }
            case 'clear-fns':
                Operator.clearFunctions();
                break;
            case 'run': {
                const { success, hint = "", result = null } = await Operator.run({ ...data, runKey: nonce });
                if (success) {
                    sendMessage({ nonce, intention: "run-good", data: { result } });
                } else {
                    sendMessage({ nonce, intention: "run-bad", data: { hint } });
                }
                break;
            }
            case 'poll':
                const meta = Operator.getMeta();
                sendMessage({ nonce, intention: "meta", data: { ...meta } });
                break;
            case 'is-alive':
                const huh = sendMessage({ nonce, intention: "am-alive" });
                break;
        }
    }
}

