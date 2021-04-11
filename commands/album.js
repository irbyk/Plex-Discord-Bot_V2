module.exports = {
  name : 'album',
  command : {
    usage: '<album>',
    description: 'Load and play an album.',
    process: async function(bot, client, message, query) {
      // if song request exists
      if (query.length > 0) {
        bot.plexOffset = 0; // reset paging
        bot.plexQuery = null; // reset query for !nextpage
        bot.findAlbum(query, message).catch(err => message.reply(bot.language.ALBUM_NOT_FOUND.format({albumName: query})));
      }
      else {
        message.reply(bot.language.PLAY_FAIL);
      }
    }
  }
};