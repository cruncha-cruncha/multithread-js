export class Conductor {

    #threadKeys = [];

    static init = () => {
        const handler = new Handler();
        return handler;
    }

}