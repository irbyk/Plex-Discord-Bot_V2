import { Client, EmbedField, Message, MessageEmbed } from "discord.js";
import { Bot, trackToSong } from "../app/bot";

module.exports = {
  name : 'restart',
  command : {
    usage: '',
    description: 'restart the plex bot.',
    process: function(bot: Bot, client: Client, message: Message) {
        bot.destroy();
        client.destroy();
        console.log('bot restart\n');
        const Discord = require('discord.js');
        const Bot = require('../app/bot.js');
        
        var keys = require('../config/keys.js');

        
        client = new Discord.Client();
        bot = new Bot();
        require('../app/music.js')(client, bot);
        client.login(keys.botToken)
    }
  }
};