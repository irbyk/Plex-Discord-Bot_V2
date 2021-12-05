import { Client, EmbedField, Message, MessageEmbed } from "discord.js";
import { Bot, trackToSong } from "../app/bot";

module.exports = {
  name : 'playsong',
  command : {
    usage: '<song number>',
    description: 'play a song from the generated song list',
    process: function(bot: Bot, client: Client, message: Message, query: string) {
      let songNumber = parseInt(query);
      songNumber = songNumber - 1;

      bot.addToQueue(songNumber, bot.tracks, message);
    }
  }
};