var ulalaPlaying = false;

module.exports = {
  name : 'ulala',
  command : {
    usage : '',
    description : 'Ulala...',
    process : async function(bot, client, message) {
      
      if(!bot.isPlaying || ulalaPlaying){
        ulalaPlaying = !ulalaPlaying;
        let nom = "Ulala Voicemod";
        if(ulalaPlaying){
          bot.isPlaying = true;
          let musique = {"url" : "https://www.youtube.com/watch?v=ElzlUMlu4G0"};
          let ulala = async function() {
            if(ulalaPlaying) {
              try {
                bot.jouerUneMusique(musique, message.member.voice.channel, ulala);
              } catch (e){
                console.error(e);
                musique = {"url" : "https://www.youtube.com/watch?v=ElzlUMlu4G0"};
                ulala();
              }
            }
          };
          ulala();
        } else {
          await bot.dispatcher.end();
          await bot.playbackCompletion(message);
          if(bot.songQueue.length > 0 ) {
            bot.playSong(message);
          }
        }
      }
    }
  }
};