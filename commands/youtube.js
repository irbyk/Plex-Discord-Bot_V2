const ytdl = require('ytdl-core');

module.exports = {
  name : 'youtube',
  command : {
    usage : '<url>',
    description : 'play the youtube url to the server(audio only).',
    process : async function(bot, client, message, query) {
      ytdl.getInfo(query).then(function(songInfo) {
        bot.songQueue.push({'artist' : songInfo.videoDetails.author.name , 'title': songInfo.videoDetails.title, 'url': songInfo.videoDetails.video_url});
        if(bot.isPlaying){
          message.reply(bot.language.YOUTUBE_SUCCES.format({artist : songInfo.videoDetails.author.name, title : songInfo.videoDetails.title, caracteres_commande : bot.config.caracteres_commande}));
        } else {
          bot.playSong(message);
        }
      });
    }
  }
};
