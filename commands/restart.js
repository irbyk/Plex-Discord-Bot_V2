module.exports = {
  name : 'restart',
  command : {
    usage: '',
    description: 'restart the plex bot.',
    process: function(bot, client, message) {
        const { start, stop } = require('../app/utils.js');
        stop(bot, client);
        console.log("Bot restart.")
        start();
    }
  }
};