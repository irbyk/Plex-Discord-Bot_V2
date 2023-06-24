module.exports = {
  name : 'play',
  command : {
    usage: '<song title or artist>',
    description: 'bot will join voice channel and play song if one song available.  if more than one, bot will return a list to choose from',
    process: function(bot, client, message, query) {
      // if song request exists
      if (query.length > 0) {
        bot.plexOffset = 0; // reset paging
        bot.plexQuery = null; // reset query for !nextpage

        bot.findSong(query, bot.plexOffset, bot.plexPageSize, message);
      }
      else if (bot.songQueue.length > 0 && !bot.isPlaying) {
        bot.playSong(message);
      }
      else {
        message.reply(bot.language.PLAY_FAIL);
      }
    }
  }
};
