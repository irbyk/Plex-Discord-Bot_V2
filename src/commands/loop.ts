import { Client, EmbedField, Message, MessageEmbed } from "discord.js";
import { Bot, trackToSong } from "../app/bot";

module.exports = {
  name : 'loop',
  command : {
    usage: '',
    description: 'active or desactive the looping of the first queue\' song',
    process: function(bot: Bot, client: Client, message: Message, query: string) {
      if(bot.songQueue.length > 0) {
        if(bot.songQueue[0].replay) {
          bot.songQueue[0].replay = false;
          message.reply('loop desactived.');
        } else {
          bot.songQueue[0].replay = true;
          message.reply('loop actived.');
        }
      } else {
        message.reply('No music in queue :cry:.');
      }
    }
  }
};