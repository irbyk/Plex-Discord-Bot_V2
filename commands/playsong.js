module.exports = {
  name : 'playsong',
  command : {
    usage: '<song number>',
    description: 'play a song from the generated song list',
    process: function(bot, client, message, query) {
      var songNumber = query;
      songNumber = parseInt(songNumber);
      songNumber = songNumber - 1;

      bot.addToQueue(songNumber, bot.tracks, message);
    }
  }
};