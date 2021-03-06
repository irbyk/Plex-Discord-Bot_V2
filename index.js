// packages --------------------------------------------------------------------
const Discord = require('discord.js');
const Bot = require('./app/bot.js');
// my keys ---------------------------------------------------------------------
var keys = require('./config/keys.js');

// discord client --------------------------------------------------------------
const client = new Discord.Client();
const bot = new Bot(client);
// bot functions ---------------------------------------------------------------
require('./app/music.js')(client, bot);

client.login(keys.botToken);

async function quitter(){
	try {
		console.log('Bot shutdown');
	} catch (e){
		console.error(e.toString());
	} finally {
		client.destroy();
		process.exit(0);
	}
}



process.on('SIGTERM', quitter);

process.on('SIGINT', quitter);