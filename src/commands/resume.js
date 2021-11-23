module.exports = {
  name : 'resume',
  command : {
    usage: '',
    description: 'resume after pause.',
    process: function(bot, client, message) {
      if(bot.isPaused) {
        bot.dispatcher.resume();
        var embedObj = {
          embed: {
            color: 4251856,
            description: bot.language.RESUME_INFO,
          }
        };
        message.channel.send(bot.language.RESUME_SUCCES, embedObj);
      }
      else {
        message.reply(bot.language.RESUME_FAIL);
      }
    }
  }
};