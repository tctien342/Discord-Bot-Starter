import { DISCORD_CONF } from './config';
import * as Discord from 'discord.js';
import { DISCORD_BOT_TOKEN } from '../env';
import { PLUGINS, CommandType } from '../plugins';
import { DiscordQueue } from './queue';
import { Crawler } from '../tools/crawler';
import { RawNotier } from './utils';
const discordClient = new Discord.Client();
const discordQueue = new DiscordQueue();
const crawler = new Crawler();
const rawNoti = new RawNotier();

/**
 * Init sources library so other plugin can be access
 */
export interface SourcesLib {
    // Discord client
    client: Discord.Client;
    // Discord queue handle class
    queue: DiscordQueue;
    // Puppeteer crawler class
    crawler: Crawler;
    // Discord raw mess notifier
    noti: RawNotier;
}
const lib: SourcesLib = {
    queue: discordQueue,
    client: discordClient,
    crawler: crawler,
    noti: rawNoti,
};

/**
 * Init cache for faster generate string
 */
interface CacheStrings {
    // Plugin helper cache, no need to regenerate it
    pluginHelper: string | false | Discord.MessageEmbed;
}
const cacheStrings: CacheStrings = {
    pluginHelper: false,
};
// Discord event listener
discordClient.on('ready', () => {
    console.log(`<> Logged in as ${discordClient.user.tag}!`);
    // Prev build helper and send it to cache
    pluginsHelpsBuilder();
});
/**
 * On discord message incoming
 */
discordClient.on('message', async (msg) => {
    // Checking if an author is on queue and process it
    if (!(await lib.queue.checkMessFromQueue(msg))) {
        // Not in queue => detect bot calling
        await detectPlugins(detectBotCall(msg), msg);
        // Alert this mess to all subscriber
        rawNoti.alert(msg);
    }
    return;
});
// Login bot to discord server
discordClient.login(DISCORD_BOT_TOKEN);

// Build fast command for plugin block
let DISCORD_FAST_CALL_COMMANDS: string[] = [];
if (DISCORD_CONF.FAST_COMMAND) {
    PLUGINS.forEach((PLUG) => {
        DISCORD_FAST_CALL_COMMANDS = DISCORD_FAST_CALL_COMMANDS.merge(PLUG.prefix);
    });
}

/**
 * Detect if someone call the bot, will return the command part if bot is called
 * @param msg Message from discord
 */
export function detectBotCall(msg: Discord.Message) {
    let message = msg.content.split(' ');
    if (DISCORD_CONF.BOT_PREFIX.includes(message[0].normal().toLowerCase())) {
        console.log(`> Called bot from ${msg.author.username}`);
        // Remove called part -> command part left
        message.shift();
        return message.join(' ');
    } else if (DISCORD_FAST_CALL_COMMANDS.includes(message[0].normal().toLowerCase().replace('!', ''))) {
        console.log(`> Fast called bot function from ${msg.author.username}`);
        return message.join(' ').replace('!', '');
    }
    return false;
}

/**
 * Detect which plugin is called in discord
 * @param input Command part from discord message
 * @param msg Message from discord
 */
export async function detectPlugins(input: string | false, msg: Discord.Message) {
    if (input === false) {
        return;
    }
    if (input.length > 0) {
        for (let plugin of PLUGINS) {
            let commands: string[] = input.split(' ');
            // Checking prefix of plugin
            if (plugin.prefix.includes(commands[0].normal().toLowerCase())) {
                // Plugin detected => remove prefix part
                commands.shift();
                // Build help for response when failed on process
                let supportCommands: EmbedField[] = [];
                // Init default command of plugin
                let commandDefault: CommandType | false = false;
                // Finding command that is using
                for (let command of plugin.commands) {
                    // Build help
                    supportCommands.push({ name: `Command ${command.command.join(', ')}`, value: command.note });
                    if (command.command.includes(commands[0])) {
                        // Remove command part => value part left
                        commands.shift();
                        if (commands.includes('help') || (await command.message(commands.join(' '), msg)) === false) {
                            // Running command failed or user need help => reply command help
                            msg.reply(
                                embedBuilder({
                                    title: `Plugin: ${plugin.prefix.join(', ')}`,
                                    description: plugin.note,
                                    fields: [
                                        { name: `Command ${command.command.join(', ')}`, value: command.note },
                                        { name: 'Usage', value: command.usage.join('\n') },
                                    ],
                                }),
                            );
                        }
                        return;
                    }
                    // Bind default command to response on dont know what command used
                    if (command.command.includes('default')) {
                        commandDefault = command;
                    }
                }
                // User need help => response plugin help for user
                if (commands.includes('help')) {
                    msg.reply(
                        embedBuilder({
                            title: `Plugin: ${plugin.prefix.join(', ')}`,
                            description: plugin.note,
                            fields: supportCommands,
                        }),
                    );
                    return;
                }
                if (commandDefault) {
                    if ((await commandDefault.message(commands.join(' '), msg)) === false) {
                        msg.reply(
                            embedBuilder({
                                title: `Command ${commandDefault.command.join(', ')}`,
                                description: commandDefault.note,
                                fields: [{ name: `Usage`, value: (commandDefault.usage || []).join('\n') }],
                            }),
                        );
                    }
                    return;
                }
                // Dont find any commands and dont have default command => response plugin help
                msg.reply(
                    embedBuilder({
                        title: `Plugin: ${plugin.prefix.join(', ')}`,
                        description: plugin.note,
                        fields: supportCommands,
                    }),
                );
                return;
            }
        }
    }
    msg.reply(pluginsHelpsBuilder());
    return;
}

/**
 * Build discord's bot intro
 */
export function pluginsHelpsBuilder() {
    // Check if it cached
    if (cacheStrings.pluginHelper) {
        return cacheStrings.pluginHelper;
    }
    let supportCommands: { name: string; value: string }[] = [];
    for (let plugin of PLUGINS) {
        supportCommands.push({
            name: plugin.prefix.join(', '),
            value: plugin.note,
        });
        // Bind lib to plugin when build help
        plugin.setup(lib);
    }
    cacheStrings.pluginHelper = embedBuilder({ description: 'Bot hỗ trợ các lệnh sau, sử dung !<lệnh> để gọi', fields: supportCommands });
    return cacheStrings.pluginHelper;
}

export interface EmbedField {
    name: string;
    value: string;
}
export interface IEmbedContent {
    title?: string;
    url?: string;
    description: string;
    author?: string;
    authorImg?: string;
    authorLink?: string;
    attachFiles?: string[];
    fields: EmbedField[];
}

/**
 * Create an embed discord content
 * @param content Embed content that need to be create
 */
export function embedBuilder(content: IEmbedContent) {
    let embed = new Discord.MessageEmbed()
        .setTitle(content.title || 'How to use?')
        .setDescription(content.description)
        .setAuthor(content.author || DISCORD_CONF.NAME, content.authorImg || '', content.authorLink)
        .attachFiles(content.attachFiles || [])
        .addFields(content.fields);
    if (content.url) {
        embed.setURL(content.url);
    }
    return embed;
}
