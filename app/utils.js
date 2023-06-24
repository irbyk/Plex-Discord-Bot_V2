'use strict';

function stop(bot, client) {
	bot.destroy();
	client.destroy();
}



function start(){
	// packages --------------------------------------------------------------------
	const { Client, Intents } = require('discord.js');
	const Bot = require('./bot.js');
	// my keys ---------------------------------------------------------------------
	var keys = require('../config/keys.js');

	// discord client --------------------------------------------------------------

	const client = new Client({
		intents: [
			Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MESSAGES,
			Intents.FLAGS.GUILD_VOICE_STATES,
			Intents.FLAGS.MESSAGE_CONTENT,
		]
	});
	const bot = new Bot(client);
	// bot functions ---------------------------------------------------------------
	require('./music.js')(client, bot);

	client.login(keys.botToken);

	async function quitter(){
		try {
			console.log('Bot shutdown');
			stop(bot, client);
		} catch (e){
			console.error(e.toString());
		} finally {
			process.exit(0);
		}
	}



	process.on('SIGTERM', quitter);

	process.on('SIGINT', quitter);
}

exports.stop = stop;
exports.start = start;
