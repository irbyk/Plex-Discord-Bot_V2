module.exports = {
  name : 'restart',
  command : {
    usage: '',
    description: 'restart the plex bot.',
    process: function(bot, client, message) {
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