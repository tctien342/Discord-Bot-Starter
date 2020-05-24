import { Message } from 'discord.js';
import { SourcesLib, embedBuilder } from '../discord/services';
import { CommandConf } from '.';
import Storage from 'node-persist';

let lib: SourcesLib;

// Init storage for this plugin
export interface MentionsDict {
    [key: string]: string;
}
let mentionsDict: MentionsDict = {};
Storage.init().then(async () => {
    mentionsDict = await Storage.get('mentions');
    if (!mentionsDict) {
        mentionsDict = {};
        await Storage.set('mentions', {});
    }
});
/**
 * Get array of linked author from mess string
 * @param str String from mess content
 */
export function getMentionsFromString(str: string) {
    let keys = Object.keys(mentionsDict);
    let out = [];
    for (let key of keys) {
        if (str.includes(key)) {
            out.push(mentionsDict[key]);
        }
    }
    return out;
}

export const MENTIONS_CONF: CommandConf = {
    prefix: ['link'],
    note: 'String to mentions',
    setup: (slib: SourcesLib) => (lib = slib),
    commands: [
        {
            command: ['default', 'set'],
            note: 'Link an string to someone',
            usage: ['!robo link (string);(discord-user-id)'],
            message: async (input: string, msg: Message) => {
                let conf = input.split(';');
                if (conf.length === 2) {
                    mentionsDict[conf[0]] = conf[1];
                    await Storage.set('mentions', mentionsDict);
                    msg.reply(`Linked ***${conf[0]}*** with discordID ${conf[1]}`);
                    return true;
                } else {
                    return false;
                }
            },
        },
        {
            command: ['del'],
            note: 'Remove linked string',
            usage: ['!robo link del (string)'],
            message: async (input: string, msg: Message) => {
                if (input.length > 1) {
                    delete mentionsDict[input];
                    await Storage.set('mentions', mentionsDict);
                    msg.reply(`Deleted linked ***${input}***`);
                    return true;
                } else {
                    return false;
                }
            },
        },
        {
            command: ['list'],
            note: 'Danh sách các chuỗi đã liên kết',
            usage: ['!robo link list'],
            message: async (input: string, msg: Message) => {
                msg.reply(
                    embedBuilder({
                        title: 'Linked Services',
                        description: 'List of linked string',
                        fields: Object.keys(mentionsDict).map((val) => ({
                            name: `String: ${val}`,
                            value: `Linked to: ${mentionsDict[val]}`,
                        })),
                    }),
                );
                return true;
            },
        },
    ],
};
