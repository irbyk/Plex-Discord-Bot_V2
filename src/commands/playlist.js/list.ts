import { Client, Message, MessageEmbed } from "discord.js";
import { Bot } from "../../app/bot";
import fs from "fs/promises"

module.exports = {
  name : 'list',
  command : {
    usage : '',
    description : 'print the name of all the playlists.',
    process : async function(bot: Bot, client: Client, message: Message, args: string[]) {
        if(args.length > 0) {
            message.reply(bot.language.ERROR_TOO_MANY_ARGS);
            return ;
        }
        try {
            const files = await fs.readdir(bot.config.dossier_playlists);
            if (files.length == 0){
                message.channel.send('\n**' + bot.language.PLAYLIST_NONE_FOUND + '**\n');
                return;
            }
            let embedObj = {
                color: 4251856,
                fields: [
                    {
                        name: bot.language.NAME,
                        value: '',
                        inline: true
                    },
                ],
                footer: {
                    text: ''
                }
            };
            files.forEach(function (file) {
                embedObj.fields[0].value = embedObj.fields[0].value + file.slice(0, -'.playlist'.length) + '\n';
            });
            message.channel.send({content: '\n**' + bot.language.PLAYLIST + ' :**\n\n', embeds: [new MessageEmbed(embedObj)]});
        } catch (err) {
            message.reply(bot.language.PLAYLIST_ERROR_FOLDER);
            throw err
        }
    }
  }
};