import { Client, EmbedField, Message, MessageEmbed } from "discord.js";
import { Bot, trackToSong } from "../app/bot";

module.exports = {
  name : 'pause',
  command : {
    usage: '',
    description: 'pauses current song if one is playing',
    process: function(bot: Bot, client: Client, message: Message) {
      if (bot.isPlaying) {
        bot.audioPlayer.pause(true); // pause song
        bot.isPaused = true;
        bot.audioPlayer.on('debug',  (info) => {
          console.log(`audioPlayer : ${info}`);
        });
        bot.audioPlayer.on('error',  (err) => {
          console.error(`audioPlayer : ${err}`);
        });
        let embedObj = new MessageEmbed({
            color: 16424969,
            description: bot.language.PAUSE_INFO
        });
        message.channel.send({content: bot.language.PAUSE_SUCCES, embeds: [embedObj]});
      }
      else {
        message.reply(bot.language.PAUSE_FAIL);
      }
    }
  }
};