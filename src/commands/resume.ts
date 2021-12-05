import { Client, EmbedField, Message, MessageEmbed } from "discord.js";
import { Bot, trackToSong } from "../app/bot";

module.exports = {
  name : 'resume',
  command : {
    usage: '',
    description: 'resume after pause.',
    process: function(bot: Bot, client: Client, message: Message) {
      if(bot.isPaused) {
        bot.audioPlayer.unpause();
        let embedObj = new MessageEmbed({
          color: 4251856,
          description: bot.language.RESUME_INFO,
        });
        message.channel.send({content: bot.language.RESUME_SUCCES, embeds: [embedObj]});
      }
      else {
        message.reply(bot.language.RESUME_FAIL);
      }
    }
  }
};