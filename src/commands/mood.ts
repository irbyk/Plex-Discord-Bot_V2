import { Client, EmbedField, Message, MessageEmbed } from "discord.js";
import { Bot, trackToSong } from "../app/bot";

module.exports = {
  name : 'mood',
  command : {
    usage: '<mood name>',
    description: 'bot will join voice channel and play a random song label mood as given if available. If more than one, bot will return a list to choose from',
    process: async function(bot: Bot, client: Client, message: Message, query: string) {
      // if song request exists
      if (query.length > 0) {
        try {
          await bot.playOneMood(query, message);
        } catch (err){
          console.log(err);
        }
      } else {
        message.reply(bot.language.PLAY_FAIL);
      }
    }
  }
};