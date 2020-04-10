module.exports = {
  name : 'mood',
  command : {
    usage: '<mood name>',
    description: 'bot will join voice channel and play a random song label mood as given if available. If more than one, bot will return a list to choose from',
    process: function(bot, client, message, query) {
      // if song request exists
      if (query.length > 0) {
        bot.plexOffset = 0; // reset paging
        bot.plexQuery = null; // reset query for !nextpage

        bot.playOneMood(query, message);
      }
      else {
        message.reply(bot.language.PLAY_FAIL);
      }
    }
  }
};