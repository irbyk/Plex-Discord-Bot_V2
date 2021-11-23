"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const bot_1 = require("./app/bot");
// packages --------------------------------------------------------------------
//const Discord = require('discord.js');
//const Bot = require('./app/bot.js');
// my keys ---------------------------------------------------------------------
var keys = require('../config/keys.json');
// discord client --------------------------------------------------------------
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGE_TYPING,
        discord_js_1.Intents.FLAGS.GUILD_PRESENCES,
        discord_js_1.Intents.FLAGS.GUILD_VOICE_STATES
    ]
});
const bot = new bot_1.Bot(client);
// bot functions ---------------------------------------------------------------
require('./app/music.js')(client, bot);
client.login(keys.botToken);
async function quitter() {
    try {
        console.log('Bot shutdown');
    }
    catch (e) {
        console.error(e.toString());
    }
    finally {
        client.destroy();
        process.exit(0);
    }
}
process.on('SIGTERM', quitter);
process.on('SIGINT', quitter);
//# sourceMappingURL=index.js.map