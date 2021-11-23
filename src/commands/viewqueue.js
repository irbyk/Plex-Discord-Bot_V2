module.exports = {
  name : 'viewqueue',
  command : {
    usage: '',
    description: 'displays current song queue',
    process: function(bot, client, message) {
      let messageLines = '';
      if (bot.songQueue.length > 0) {
        let descriptionLengthMax = 2048;
        let embedObj = {
          embed: {
            color: 2389639,
            description: messageLines,
          }
        };
        for (let t = 0; t < bot.songQueue.length; t++) {
          messageLines = bot.language.VIEWQUEUE_SONG_INFO.format({index : t+1, artist : bot.songQueue[t].artist,title : bot.songQueue[t].title})+'\n';
          if (embedObj.embed.description.length + messageLines.length > descriptionLengthMax) {
            message.channel.send('', Object.assign({}, embedObj));
            embedObj.embed.description = '';
          }
          embedObj.embed.description += messageLines;
        }
        messageLines = bot.language.VIEWQUEUE_INFO.format({caracteres_commande : bot.config.caracteres_commande}) ;
        if (embedObj.embed.description.length + messageLines.length > descriptionLengthMax) {
            message.channel.send('', Object.assign({}, embedObj));
            embedObj.embed.description = '';
        }
        embedObj.embed.description += messageLines;
        message.channel.send(bot.language.VIEWQUEUE_SUCCES, embedObj);
      }
      else {
        message.reply(bot.language.VIEWQUEUE_FAIL);
      }
    }
  }
};