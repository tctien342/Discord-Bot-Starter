import { MENTIONS_CONF } from './mentions';
import { Message } from 'discord.js';
import { SourcesLib } from '../discord/services';
export interface CommandType {
    command: string[];
    note: string;
    message: (input: string, msg: Message) => Promise<boolean>;
    usage?: string[];
}
export interface CommandConf {
    prefix: string[];
    note?: string;
    setup?: (lib: SourcesLib) => void;
    commands: CommandType[];
}
export const PLUGINS = [MENTIONS_CONF];
