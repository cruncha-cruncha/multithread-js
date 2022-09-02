
// stores (key, value) pairs
// each key must be unique
// holds at most <limit> pairs
// when no more room, overwites oldest pair

export class Buffer {
    #nextInsert = 0;
    #buffer = [];

    constructor(limit) {
        this.#buffer = new Array(limit).fill(null);
    }

    insert({ key, val }) {
        if (this.#buffer.filter(obj => obj.key === key).length > 0) {
            return false;
        }

        this.#buffer[this.#nextInsert] = { key, val };
        this.#nextInsert = (this.#nextInsert + 1) % this.#buffer.length;
        return true;
    }

    take({ key }) {
        let index = -1;
        for (let i = 0; i < this.#buffer.length; i++) {
            if (this.#buffer[i].key === key) {
                index = i;
                break;
            }
        }

        if (index < 0 || index >= this.#buffer.length) {
            return { found: false };
        }

        const val = this.#buffer[index].val;

        this.#buffer[index] = null;

        let r = index - 1;
        while (true) {
            if (r < 0) {
                r = this.#buffer.length - 1;
            }

            current = this.#buffer[r];
            if (current !== null) {
                this.#buffer[(r+1) % this.#buffer.length] = current;
                this.#buffer[r] = null;
            }

            if (r === nextInsert) {
                break;
            }

            r--;
        }

        return { found: true, val };
    }
}