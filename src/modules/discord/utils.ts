import { Message } from 'discord.js';

/**
 * An class will notify to plugin that subscribed raw mess from author
 */
export class RawNotier {
    private subNotier: ((msg: Message) => Promise<void>)[];
    constructor() {
        this.subNotier = [];
    }

    /**
     * Alert mess to all subscriber
     * @param msg Message from discord's author
     */
    public alert(msg: Message) {
        this.subNotier.forEach((noti) => {
            noti(msg);
        });
    }

    /**
     * Subscribe incoming mess
     * @param funct An function will be called when new mess incoming
     */
    public sub(funct: (msg: Message) => Promise<void>) {
        this.subNotier.push(funct);
    }
}
