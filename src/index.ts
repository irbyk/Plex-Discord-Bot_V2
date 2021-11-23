import {Client, Intents} from 'discord.js';
import { Bot } from './app/bot';

// packages --------------------------------------------------------------------
//const Discord = require('discord.js');
//const Bot = require('./app/bot.js');
// my keys ---------------------------------------------------------------------
var keys = require('../config/keys.json');

// discord client --------------------------------------------------------------
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_TYPING,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_VOICE_STATES
	] });
const bot = new Bot(client);
// bot functions ---------------------------------------------------------------
require('./app/music.js')(client, bot);

client.login(keys.botToken);

async function quitter(){
	try {
		console.log('Bot shutdown');
	} catch (e: any){
		console.error(e.toString());
	} finally {
		client.destroy();
		process.exit(0);
	}
}



process.on('SIGTERM', quitter);

process.on('SIGINT', quitter);