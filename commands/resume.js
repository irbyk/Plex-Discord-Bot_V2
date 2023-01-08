module.exports = {
  name : 'resume',
  command : {
    usage: '',
    description: 'resume after pause.',
    process: function(bot, client, message) {
      if(bot.isPaused) {
        bot.dispatcher.unpause();
        var embedObj = {
            color: 4251856,
            description: bot.language.RESUME_INFO,
        };
        message.channel.send({ content: bot.language.RESUME_SUCCES, embeds: [embedObj] });
      }
      else {
        message.reply(bot.language.RESUME_FAIL);
      }
    }
  }
};