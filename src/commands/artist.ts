import { Client, Message } from "discord.js";
import { Bot } from "../app/bot";

module.exports = {
  name : 'artist',
  command : {
    usage: '<song artist>',
    description: 'bot will join voice channel and play song if one song available.  if more than one, bot will return a list to choose from',
    process: async function(bot: Bot, client: Client, message: Message, query: string) {
      // if song request exists
      if (query.length > 0) {
        bot.findArtist(query, message);
      }
      else {
        message.reply(bot.language.PLAY_FAIL);
      }
    }
  }
};