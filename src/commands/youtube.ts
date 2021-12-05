import { Client, EmbedField, Message, MessageEmbed } from "discord.js";
import { Bot, trackToSong, youtubeURLToMusic } from "../app/bot";
import ytdl from 'ytdl-core';

module.exports = {
  name : 'youtube',
  command : {
    usage : '<url>',
    description : 'play the youtube url to the server(audio only).',
    process : async function(bot: Bot, client: Client, message: Message, query: string) {
      try {
        const song = await youtubeURLToMusic(query);
        bot.songQueue.push(song);
        if(bot.isPlaying){
          message.reply(bot.language.YOUTUBE_SUCCES.format({artist : song.artist, title : song.title, caracteres_commande : bot.config.caracteres_commande}));
        } else {
          bot.playSong(message);
        }
      } catch (error) {
        console.log(error);
      }
      
    }
  }
};
