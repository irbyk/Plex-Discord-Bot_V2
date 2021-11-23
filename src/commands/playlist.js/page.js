module.exports = {
  name : 'page',
  command : {
    usage: '',
    description: 'pass to the next page while you search a music.',
    process: function(bot, client, message, query) {
        bot.findSong(bot.plexQuery, bot.plexOffset, bot.plexPageSize, message);
    }
  }
};