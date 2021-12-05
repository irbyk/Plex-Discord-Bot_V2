import { Client, EmbedField, Message, MessageEmbed } from "discord.js";
import { Bot, trackToSong } from "../app/bot";

module.exports = {
  name : 'removesong',
  command : {
    usage: '<song queue number>',
    description: 'removes song by index from the song queue',
    process: function(bot: Bot, client: Client, message: Message, query: string) {
      let songNumber = parseInt(query);
      songNumber = songNumber - 1;

      if (bot.songQueue.length > 0 ) {
        if (bot.isPlaying && songNumber == 0) {
          message.reply(bot.language.REMOVESONG_ERROR);
        }
        else if (songNumber > -1 && songNumber <= bot.songQueue.length) {
          let removedSong = bot.songQueue.splice(songNumber, 1);
          // message that it has been removed
          message.reply(bot.language.REMOVESONG_SUCCES.format({artist : removedSong[0].artist, title : removedSong[0].title}));
        }
        else {
          message.reply(bot.language.REMOVESONG_ERROR);
        }
      }
      else {
        message.reply(bot.language.REMOVESONG_FAIL);
      }
    }
  }
};
