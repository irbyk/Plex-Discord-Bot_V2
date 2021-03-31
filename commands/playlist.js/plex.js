const fs = require('fs');

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
};

module.exports = {
  name : 'plex',
  command : {
    usage : '<playlist on plex> -r\nThe \'-r\' option is to play the playlist randomly.',
    description : 'play one playlist that you can find on plex.',
    process : async function(bot, client, message, args) {
      
      let random = false;
      if (args.length >= 2){
        if (args[args.length - 1] == '-r'){
          random = true;
        }
      }
      let playlistName = args[0];
        args.slice(2).forEach(function(iter){
            playlistName = playlistName +' ' + iter;
        });
      bot.findPlaylist(playlistName, message, random);
  }
}
};