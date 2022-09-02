export const validIntentions = Object.freeze({
    "set-fn": ["set-fn-bad", "set-fn-good"],
    "clear-all-fns": [],
    "run": ["run-bad", "run-good"],
    "poll": ["meta"],
    "is-alive": ["am-alive"],
});

export const newNonce = () => {
    const characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ';
    let out = '';
    for (var i = 0; i < 4; i++) {
        out += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    out += "-";
    for (var i = 0; i < 15; i++) {
        out += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return out;
}

export const newThreadKey = () => {
    const characters = '123456789';
    let out = '';
    for (var i = 0; i < 8; i++) {
        out += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return out;
}

export const validateNonce = (nonce) => {
    if (!nonce || typeof nonce !== "string") {
        return false;
    }

    const matches = nonce.match(/^[ABCDEFGHIJKLMNPQRSTUVWXYZ]{4}\-[ABCDEFGHIJKLMNPQRSTUVWXYZ]{15}$/);
    if (!matches) {
        return false;
    }

    return true;
}

export const validateThreadKey = (key) => {
    if (!key || typeof key !== "string") {
        return false;
    }

    const matches = key.match(/^[1-9]{8}$/);
    if (!matches) {
        return false;
    }

    return true;
}

export const validateIntention = (intention) => {
    if (!intention || typeof intention !== "string") {
        return false;
    }

    const validList = [...Object.keys(validIntentions), ...Object.values(validIntentions).flat()];
    if (!validList.includes(intention)) {
        return false;
    }

    return true;
}

export const validateMessageShape = (message) => {
    if (!message) {
        return { success: false, hint: "missing message" };
    }

    if (!('nonce' in message) || !('threadKey' in message) || !('intention' in message) || !('data' in message)) {
        return { success: false, hint: "missing properties" };
    }

    if (!validateNonce(message.nonce)) {
        return { success: false, hint: "bad nonce" };
    }

    if (!validateThreadKey(message.threadKey)) {
        return { success: false, hint: "bad threadKey" };
    }

    if (!validateIntention(message.intention)) {
        return { success: false, hint: "bad intention" };
    }

    if (!!data && typeof data !== "string") {
        return { success: false, hint: "bad data" };
    }

    try {
        const data = JSON.parse(message.data);
        return {
            success: true,
            message: {
                nonce: message.nonce,
                threadKey: message.threadKey,
                intention: message.intention,
                data: data || null,
            },
        };
    } catch (e) {
        return { success: false, hint: `caught: ${e.toString()}` };
    }
}

export const validateMessageData = ({ intention, data }) => {
    if (!validateIntention(intention)) {
        return { success: false, hint: `bad intention` };
    }

    switch (intention) {
        case "set-fn": return attemptParse(parseSetFnData, data);
        case "clear-all-fns": return { success: true, data };
        case "run": return attemptParse(parseRunData, data);
        case "poll": return { success: true, data };
        case "is-alive": return { success: true, data };
        case "set-fn-bad": return attemptParse(parseSetFnBadData, data);
        case "set-fn-good": return { success: true, data };
        case "run-bad": return attemptParse(parseRunBadData, data);
        case "run-good": return attemptParse(parseRunGoodData, data);
        case "meta": return attemptParse(parseMetaData, data);
        case "am-alive": return { success: true, data };
        default: return { success: false, hint: "unknown intention" };
    }
}

const attemptParse = (parse, data) => {
    const { success, hint = "", data: goodData = null } = parse(data);
    if (success) {
        return { success, data: goodData };
    } else {
        return { success, hint: `${parse.name}: ${hint}` };
    }
}

const parseSetFnData = (data) => {
    if (!data) {
        return { success: false, hint: "missing data" };
    }

    if (!('fnName' in data) || !('sFn' in data)) {
        return { success: false, hint: "missing properties" };
    }

    if (typeof data.fnName !== "string") {
        return { success: false, hint: "bad fnName" };
    }

    if (typeof data.sFn !== "string") {
        return { success: false, hint: "bad sFn" };
    }

    try {
        const fn = eval(data.sFn);

        if (!fn || typeof fn !== "function") {
            return { success: false, hint: "bad sFn" };;
        }

        return {
            success: true,
            data: {
                fnName: data.fnName,
                fn,
            },
        };
    } catch (e) {
        return { success: false, hint: `caught: ${e.toString()}` };
    }
}

const parseRunData = (data) => {
    if (!data) {
        return { success: false, hint: "missing data" };
    }

    if (!('args' in data) || !('fnName' in data)) {
        return { success: false, hint: "missing properties" };
    }

    if (!Array.isArray(data.args) || typeof data.fnName !== "string") {
        return { success: false, hint: "bad types" };
    }

    return {
        success: true,
        data: {
            args: data.args,
            fnName: data.fnName,
        },
    };
}

const parseSetFnBadData = (data) => {
    if (!data) {
        return { success: false, hint: "missing data" };
    }

    if (!('hint' in data) || typeof data.hint !== "string") {
        return { success: false, hint: "bad hint" };
    }

    return {
        success: true,
        data: {
            hint: data.hint,
        },
    };
}

const parseRunBadData = (data) => {
    if (!data) {
        return { success: false, hint: "missing data" };
    }

    if (!('hint' in data) || typeof data.hint !== "string") {
        return { success: false, hint: "bad hint" };
    }

    return {
        success: true,
        data: {
            hint: data.hint,
        },
    };
}

const parseRunGoodData = (data) => {
    if (!data) {
        return { success: false, hint: "missing data" };
    }

    if (!('result' in data)) {
        return { success: false, hint: "missing 'result' property" };
    }

    return {
        success: true,
        data: {
            result: data.result,
        },
    };
}

const parseMetaData = (data) => {
    if (!data) {
        return { success: false, hint: "missing data" };
    }

    if (!('functions' in data) || !('isRunnings' in data)) {
        return { success: false, hint: "missing properties" };
    }

    if (!Array.isArray(data.functions) || data.function.filter(f => typeof f !== "string").length > 0) {
        return { success: false, hint: "bad functions" };
    }

    if (!Array.isArray(data.isRunning) || data.isRunning.filter(n => typeof n !== "string").length > 0) {
        return { success: false, hint: "bad isRunning" };
    }

    return {
        success: true,
        data: {
            functions: data.functions,
            isRunning: data.isRunning,
        },
    };
}