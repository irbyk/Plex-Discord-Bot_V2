import { Client, EmbedField, Message, MessageEmbed } from "discord.js";
import { Bot, trackToSong } from "../app/bot";

module.exports = {
  name : 'viewqueue',
  command : {
    usage: '',
    description: 'displays current song queue',
    process: function(bot: Bot, client: Client, message: Message) {
      let messageLines = '';
      if (bot.songQueue.length > 0) {
        let descriptionLengthMax = 2048;
        let embedObj = new MessageEmbed({
            color: 2389639,
            description: messageLines
        });
        for (let t = 0; t < bot.songQueue.length; t++) {
          messageLines = bot.language.VIEWQUEUE_SONG_INFO.format({index : t+1, artist : bot.songQueue[t].artist,title : bot.songQueue[t].title})+'\n';
          if (embedObj.description!.length + messageLines.length > descriptionLengthMax) {
            message.channel.send({embeds: [new MessageEmbed(embedObj)]});
            embedObj.description = '';
          }
          embedObj.description += messageLines;
        }
        messageLines = bot.language.VIEWQUEUE_INFO.format({caracteres_commande : bot.config.caracteres_commande}) ;
        if (embedObj.description!.length + messageLines.length > descriptionLengthMax) {
            message.channel.send({embeds: [new MessageEmbed(embedObj)]});
            embedObj.description = '';
        }
        embedObj.description += messageLines;
        message.channel.send({content: bot.language.VIEWQUEUE_SUCCES, embeds: [embedObj]});
      }
      else {
        message.reply(bot.language.VIEWQUEUE_FAIL);
      }
    }
  }
};