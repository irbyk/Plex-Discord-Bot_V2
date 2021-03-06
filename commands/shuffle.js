//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
};

module.exports = {
  name : 'shuffle',
  command : {
    usage: '',
    description: 'shuffle the queue (don\'t move the first song in the queue).',
    process: function(bot, client, message, query) {
        bot.beginWorking();
        for(let i = 1; i < bot.songQueue.length; i++) {
              let j = getRandomInt(bot.songQueue.length -1) +1;
              let inter = bot.songQueue[j];
              bot.songQueue[j] = bot.songQueue[i];
              bot.songQueue[i] = inter;
        }
        bot.endWorking();
        message.reply('shuffle done.');
    }
  }
};