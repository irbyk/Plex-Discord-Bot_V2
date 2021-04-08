const fs = require('fs');

module.exports = {
  name : 'print',
  command : {
    usage : '<playlist>',
    description : 'print the content of the playlist.',
    process : async function(bot, client, message, args) {
        if(args.length < 1) {
            message.reply(bot.language.ERROR_NOT_ENOUGHT_ARG);
            return ;
        }
        if (args.length > 1) {
            message.reply(bot.language.ERROR_TOO_MANY_ARGS);
            return ;
        }
        var nomFichier = bot.config.dossier_playlists+args[0]+'.playlist';
        if(!fs.existsSync(nomFichier)) {
            message.reply(bot.language.PLAYLIST_UNKNOW);
        } else {
          let embedObj = {
              embed: {
                  color: 4251856,
                  fields: [
                      {
                          name: bot.language.MUSIC,
                          value: '',
                          inline: true
                      },
                  ],
                  footer: {
                      text: ''
                  },
              }
          };
          fs.readFile(nomFichier, 'utf8', async function readFileCallback(err, data){
                  if (err){
                      await message.reply(bot.language.OPEN_PLAYLIST_ERROR);
                      throw err;
                  }
                  let playlist = JSON.parse(data);
                  if(playlist.musiques.length > 1) {
                    embedObj.embed.fields[0].name += 's';
                  }
                  
                  let indice = 0;
                  premier = true;

                  if (playlist.musiques.length == 0){
                      message.channel.send(bot.language.PLAYLIST_EMPTY.format({ playlist_name : playlist.nom } + '\n'));
                      return;
                  }

                  playlist.musiques.forEach(function (musique){
                      indice++;
                      let ligne = bot.language.PLAYLIST_PRINT_INFO.format({index : indice, title : musique.titre, artist : musique.artiste}) + '\n';
                      if (embedObj.embed.fields[0].value.length + ligne.length > 1024) {
                        message.channel.send('\n**' + args[0] + (!premier ? '(' + bot.language.NEXT +')' : '') + ' :**\n\n', Object.assign({}, embedObj));
                        embedObj.embed.fields[0].value = '';
                        premier = false;
                      }
                      embedObj.embed.fields[0].value = embedObj.embed.fields[0].value + ligne;
                  });
                  embedObj.embed.footer.text = bot.language.PLAYLIST_PRINT_SUCCES.format({number : indice, plurial : (indice > 1 ? 's' : '')});
                  await message.channel.send('\n**' + args[0] + (!premier ? '(' + bot.language.NEXT +')' : '')+ ' :**\n\n', embedObj);
                  
          });
      }
    }
  }
};