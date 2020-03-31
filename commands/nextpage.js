module.exports = {
  name : 'nextpage',
  command : {
    usage: '',
    description: 'get next page of songs if desired song not listed',
    process: function(bot, client, message, query) {
      bot.findSong(bot.plexQuery, bot.plexOffset, bot.plexPageSize, message);
    }
  }
};