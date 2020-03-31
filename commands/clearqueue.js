module.exports = {
  name : 'clearqueue',
  command : {
    usage: '',
    description: 'clears all songs in queue',
    process: function(bot, client, message) {
      if (bot.songQueue.length > 0) {
        bot.songQueue = []; // remove all songs from queue

        message.reply(bot.language.CLEARQUEUE_SUCCES);
      }
      else {
        message.reply(bot.language.CLEARQUEUE_FAIL);
      }
    }
  }
};