export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!DISCORD_BOT_TOKEN) {
    console.error('No DISCORD_BOT_TOKEN found in env');
    process.exit(1);
}

export const DEBUG = process.env.DEBUG || false;
