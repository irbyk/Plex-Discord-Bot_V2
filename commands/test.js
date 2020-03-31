module.exports = {
  name : 'plextest',
  command : {
    usage: '',
    description: 'test plex at bot start up to make sure everything is working',
    process: function(bot, client, message) {
      bot.plex.query('/').then(function(result) {
        if(message) {
          message.reply('name: ' + result.MediaContainer.friendlyName +'\nv: ' + result.MediaContainer.version);
        }
        else {
          console.log('name: ' + result.MediaContainer.friendlyName);
          console.log('v: ' + result.MediaContainer.version);
        }
      }, function(err) {
        console.log('ya done fucked up');
      });
    }
  }
};