import { Message } from 'discord.js';

export interface QueueObj {
    [key: string]: (msg: Message) => Promise<boolean>;
}
/**
 * This is discord Queue class for handle
 * an action from user which bot need waiting for it!!
 *
 * Just call addToQueue with authorID and function need to be done and
 * return true on function will tell this queue is done, return false
 * the queue will continue
 *
 * Author can call 'cancel' to abort the queue
 */
export class DiscordQueue {
    private queue: QueueObj;
    constructor() {
        this.queue = {};
    }

    /**
     * Checking and exec function if author is in queue
     * @param msg Mess from discord's author
     */
    public async checkMessFromQueue(msg: Message) {
        if (this.queue[msg.author.id]) {
            if (msg.content.toLowerCase().includes('cancel')) {
                this.queue[msg.author.id] = undefined;
                msg.reply('Queue aborted!');
                return true;
            }
            let status = await this.queue[msg.author.id](msg);
            if (!status) {
                msg.reply('Bot is waiting for you...');
            } else {
                this.queue[msg.author.id] = undefined;
            }
        } else {
            return false;
        }
    }

    /**
     * Add an user to queue
     * @param authorID Discord's author ID
     * @param funct An function that need to be done when author reply
     */
    public addToQueue(authorID: string, funct: (msg: Message) => Promise<boolean>) {
        this.queue[authorID] = funct;
        return true;
    }
}
