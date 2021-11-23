module.exports = {
  name : 'artist',
  command : {
    usage: '<song artist>',
    description: 'bot will join voice channel and play song if one song available.  if more than one, bot will return a list to choose from',
    process: function(bot, client, message, query) {
      // if song request exists
      if (query.length > 0) {
        bot.plexOffset = 0; // reset paging
        bot.plexQuery = null; // reset query for !nextpage

        bot.findArtist(query, message);
      }
      else {
        message.reply(bot.language.PLAY_FAIL);
      }
    }
  }
};