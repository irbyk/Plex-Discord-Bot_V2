import { Client, EmbedField, Message, MessageEmbed } from "discord.js";
import { Bot, trackToSong } from "../app/bot";

module.exports = {
  name : 'nextpage',
  command : {
    usage: '',
    description: 'get next page of songs if desired song not listed',
    process: function(bot: Bot, client: Client, message: Message, query: string) {
      bot.findSong(bot.plexQuery, bot.plexOffset, bot.plexPageSize, message);
    }
  }
};