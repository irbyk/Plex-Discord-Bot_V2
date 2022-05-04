import { Client, Message, MessageEmbed } from "discord.js";
import { Bot } from "../../app/bot";

interface CommandStruct {
    usage: string;
    description: string;
    process: (bot: Bot, client: Client, message: Message, query: string[]) => void;
}

interface Command {
    name: string;
    command: CommandStruct;
}


var commandesPlaylist : {[id: string]: CommandStruct}= {};

require('fs').readdirSync(__dirname + '/').forEach(function(file: string) {
  if (file.match(/\.js$/) && file !== 'index.js') {
    let command = require(__dirname + '/' +file.replace('.js', ''));
    commandesPlaylist[command.name] = command.command;
  }
});

module.exports = {
  name : 'playlist',
  command : {
    usage : '<command>',
    description : 'Manipulate playlists. Type "!playlist ?" to get the more help.',
    process : function(bot: Bot, client: Client, message: Message, query: string) {
        if(query == "?") {
            for (let command in commandesPlaylist){
                let embedObj = {
                    color: 4251856,
                    fields:
                    [
                        {
                            name: bot.language.COMMAND,
                            value: bot.config.caracteres_commande + 'playlist ' + command + ' ' + commandesPlaylist[command].usage,
                            inline: true
                        },
                        {
                            name: bot.language.DESCRIPTION,
                            value: commandesPlaylist[command].description,
                            inline: true
                        }
                    ],
                    footer: {
                        text: ''
                    },
                };
                message.channel.send({content: '\n**' + command + ' :**\n\n', embeds: [new MessageEmbed(embedObj)]});
            }
            return ;
        }
        let args = query.split(/\s+/);
        let commande = commandesPlaylist[args[0]];
        if (commande) {
            commande.process(bot, client, message, args.slice(1));
        } else {
            message.reply(bot.language.PLAYLIST_UNKNOW_COMMAND.format({command : args[0], caracteres_commande : bot.config.caracteres_commande}));
        }
    }
  },
}