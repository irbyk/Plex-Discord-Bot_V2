// packages --------------------------------------------------------------------
const Discord = require('discord.js');
const Bot = require('./app/bot.js');
// my keys ---------------------------------------------------------------------
var keys = require('./config/keys.js');

// discord client --------------------------------------------------------------
const client = new Discord.Client();
const bot = new Bot();
// bot functions ---------------------------------------------------------------
require('./app/music.js')(client, bot);

client.login(keys.botToken);
