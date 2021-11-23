module.exports = {
  name : 'stop',
  command : {
    usage: '',
    description: 'stops song if one is playing',
    process: function(bot, client, message) {
      if (bot.isPlaying) {
        bot.songQueue = []; // removes all songs from queue
        bot.dispatcher.end(); // stop dispatcher from playing audio

        var embedObj = {
          embed: {
            color: 10813448,
            description: bot.language.STOP_INFO,
          }
        };
        message.channel.send(bot.language.STOP_SUCCES, embedObj);
      }
      else {
        message.reply(bot.language.STOP_FAIL);
      }
    }
  }
};