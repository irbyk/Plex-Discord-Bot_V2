import { Client, EmbedField, Message, MessageEmbed } from "discord.js";
import { Bot, trackToSong } from "../app/bot";

module.exports = {
  name : 'random',
  command : {
    usage: '',
    description: 'bot will join voice channel and play a random song.',
    process: async function(bot: Bot, client: Client, message: Message, query: string) {
      if (query.length == 0) {
        try {
          await bot.findRandomTracksOnPlex(message);
        } catch (err){
          console.log(err);
        }
      } else {
        message.reply('random don\'t take argument.');
      }
    }
  }
};