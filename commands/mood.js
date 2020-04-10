module.exports = {
  name : 'mood',
  command : {
    usage: '<mood name>',
    description: 'bot will join voice channel and play a random song label mood as given if available. If more than one, bot will return a list to choose from',
    process: async function(bot, client, message, query) {
      // if song request exists
      if (query.length > 0) {
        try {
          await bot.playOneMood(query, message);
        } catch (err){
          ;
        }
      } else {
        message.reply(bot.language.PLAY_FAIL);
      }
    }
  }
};