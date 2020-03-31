module.exports = {
  name : 'volume',
  command : {
    usage: '<real or \'?\'>',
    description: 'Set the volume to the given real, who need to between 0 and 100 (1 stand for normal volume, 2 for the double, 0.5 for the half).\n Type \'?\' to get the current volume.',
    process: function(bot, client, message, query) {
      if(query == "?") {
        message.reply(bot.language.VOLUME_HELP.format({volume : bot.volume}));
      } else {
        volume_parse = Math.max(Math.min(parseFloat(query),100.),0.);
        bot.volume = isNaN(volume_parse) ? bot.volume : volume_parse;
        if(bot.isPlaying) {
          bot.dispatcher.setVolume(bot.volume);
        }
        message.reply(bot.language.VOLUME_SUCCES.format({volume : bot.volume}));
      }
    }
  }
};