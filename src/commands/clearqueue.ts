import { Client, Message } from "discord.js";
import { Bot } from "../app/bot";

module.exports = {
  name : 'clearqueue',
  command : {
    usage: '',
    description: 'clears all songs in queue',
    process: function(bot: Bot, client: Client, message: Message) {
      if (bot.songQueue.length > 0) {
        let newQueue = [];
        if (bot.isPlaying) {
          newQueue[0] = bot.songQueue[0];
        }
        
        bot.songQueue = newQueue;
        
        message.reply(bot.language.CLEARQUEUE_SUCCES);
      }
      else {
        message.reply(bot.language.CLEARQUEUE_FAIL);
      }
    }
  }
};
