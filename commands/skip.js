module.exports = {
  name : 'skip',
  command : {
    usage: '?<int>',
    description: 'skips the current song if one is playing and plays the next song in queue if it exists',
    process: function(bot, client, message, query) {
      let nombreSkip = 1;
      if(query) {
          nombreSkip = parseInt(query, 10);
          if(isNaN(nombreSkip)) {
              message.reply(bot.language.SKIP_ERROR_NAN);
              return ;
          }
          
          if(nombreSkip < 1){
                message.reply(bot.language.SKIP_ERROR_INF_1.format({number : nombreSkip}));
                return ;
          }
      }
      if (bot.songQueue.length > 0) {
        if(nombreSkip > bot.songQueue.length) {
          message.channel.send(bot.language.SKIP_ALL);
          nombreSkip = bot.songQueue.length;
        }
        let messageString = bot.language.SKIP_SUCESS.format({artist : bot.songQueue[0].artist, title : bot.songQueue[0].title});
        for(let i = 0; i < nombreSkip - 1; i++){
          bot.songQueue.shift();
          messageString += bot.language.SKIP_SUCESS.format({artist : bot.songQueue[0].artist, title : bot.songQueue[0].title});
        }
        message.channel.send(messageString);
        bot.stop();
      } else {
        message.reply(bot.language.SKIP_FAIL);
      }
    }
  }
};