const fs = require('fs');

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
};

module.exports = {
  name : 'play',
  command : {
    usage : '<playlist> -r',
    description : 'play the given playlist.\nThe \'-r\' option is to play the playlist randomly.',
    process : async function(bot, client, message, args) {
      if(args.length < 1) {
        message.reply(bot.language.ERROR_NOT_ENOUGHT_ARG);
        return ;
      }
      if(args.length > 2) {
        message.reply(bot.language.ERROR_TOO_MANY_ARGS);
        return ;
      }
      let aleatoire = false;
      if(args.length == 2) {
        if(args[1] != '-r') {
          message.reply(bot.language.PLAYLIST_PLAY_R_ERROR);
          return ;
        }
        aleatoire = true;
      }
      let nomFichier = bot.config.dossier_playlists+args[0]+'.playlist';
      if(!fs.existsSync(nomFichier)) {
        message.reply(bot.language.PLAYLIST_UNKNOW);
      } else {
        fs.readFile(nomFichier, 'utf8', async function readFileCallback(err, data){
          if (err){
            await message.reply(bot.language.OPEN_PLAYLIST_ERROR);
            throw err;
          }
          let playlist = JSON.parse(data);
          if(aleatoire){
            for(let i = 0; i < playlist.musiques.length; i++) {
              let j = getRandomInt(playlist.musiques.length);
              let inter = playlist.musiques[j];
              playlist.musiques[j] = playlist.musiques[i];
              playlist.musiques[i] = inter;
              
            }
          }
          playlist.musiques.forEach(function (musique){
            let musiqueFormat = {'artist' : musique.artiste, 'title': musique.titre};
            if(musique.cle) {
              musiqueFormat.key = musique.cle;
            } else {
              musiqueFormat.url = musique.url;
            }
            bot.songQueue.push(musiqueFormat);
          });
          
          if(bot.isPlaying){
            await message.reply(bot.language.PLAYLIST_PLAY_SUCCES);
            if(aleatoire) {
              message.channel.send(bot.config.caracteres_commande + 'viewqueue');
            }
          } else {
            if(aleatoire) {
              await message.channel.send(bot.config.caracteres_commande + 'viewqueue');
            }
            bot.playSong(message);
          }
      });
    }
  }
}
};