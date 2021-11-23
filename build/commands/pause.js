module.exports = {
  name : 'pause',
  command : {
    usage: '',
    description: 'pauses current song if one is playing',
    process: function(bot, client, message) {
      if (bot.isPlaying) {
        bot.dispatcher.pause(true); // pause song
        bot.isPaused = true;
        bot.dispatcher.on('debug',  (info) => {
          console.log(`Dispatcher : ${info}`);
        });
        bot.dispatcher.on('error',  (err) => {
          console.error(`Dispatcher : ${err}`);
        });
        var embedObj = {
          embed: {
            color: 16424969,
            description: bot.language.PAUSE_INFO,
          }
        };
        message.channel.send(bot.language.PAUSE_SUCCES, embedObj);
      }
      else {
        message.reply(bot.language.PAUSE_FAIL);
      }
    }
  }
};