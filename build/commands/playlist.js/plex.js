const fs = require('fs');

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
};

module.exports = {
  name : 'plex',
  command : {
    usage : '<playlist on plex> -r',
    description : 'play one playlist that you can find on plex.\nThe \'-r\' option is to play the playlist randomly.',
    process : async function(bot, client, message, args) {
      
      let random = false;
      let slice = args.slice(1);
      if (args.length >= 2){
        if (args[args.length - 1] == '-r'){
          random = true;
          slice = args.slice(1, args.length - 1);
        }
      }
      let playlistName = args[0];
      slice.forEach(function(iter){
        playlistName = playlistName + ' ' + iter;
      });
      bot.findPlaylist(playlistName, message, random);
    }
  }
};
