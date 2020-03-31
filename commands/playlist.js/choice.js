module.exports = {
  name : 'choice',
  command : {
    usage: '<song number>',
    description: 'add a song to the playlist. Note : this will add to the playlist you given with the "add" command.',
    process: function(bot, client, message, query) {
      if(!bot.botPlaylist){
        message.reply(bot.language.PLAYLIST_CHOICE_ERROR);
        return ;
      }
      let songNumber = query;
      songNumber = parseInt(songNumber);
      songNumber = songNumber - 1;
      
      let key = bot.tracks[songNumber].Media[0].Part[0].key;
      let artist = '';
      let title = bot.tracks[songNumber].title;
      if('originalTitle' in bot.tracks[songNumber]) {
        artist = bot.tracks[songNumber].originalTitle;
      }
      else {
        artist = bot.tracks[songNumber].grandparentTitle;
      }
      let musique = {
        query : bot.plexQuery,
        artiste : artist,
        titre : title,
        cle : key
      };
      bot.ajoutPlaylist(bot.botPlaylist, musique, message);
    }
  }
};