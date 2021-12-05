import { Client, Message } from "discord.js";
import { Bot } from "../app/bot";

module.exports = {
  name : 'album',
  command : {
    usage: '<album>',
    description: 'Load and play an album.',
    process: async function(bot: Bot, client: Client, message: Message, query: string) {
      // if song request exists
      if (query.length > 0) {
        bot.findAlbum(query, message).catch(err => message.reply(bot.language.ALBUM_NOT_FOUND.format({albumName: query})));
      }
      else {
        message.reply(bot.language.PLAY_FAIL);
      }
    }
  }
};