const fs = require('fs');

module.exports = {
  name : 'list',
  command : {
    usage : '',
    description : 'print the name of all the playlists.',
    process : async function(bot, client, message, args) {
        if(args.length > 0) {
            message.reply(bot.language.ERROR_TOO_MANY_ARGS);
            return ;
        }
        
        fs.readdir(bot.config.dossier_playlists, function (err, files) {
            if (err) {
                message.reply(bot.language.PLAYLIST_ERROR_FOLDER);
                throw err
            }
            let embedObj = {
                    color: 4251856,
                    fields: [
                        {
                            name: bot.language.NAME,
                            value: '',
                            inline: true
                        },
                    ],
                    footer: {
                        text: ''
                    },
            };

            if (files.length == 0){
                message.channel.send('\n**' + bot.language.PLAYLIST_NONE_FOUND + '**\n');
                return;
            }

            files.forEach(function (file) {
                embedObj.fields[0].value = embedObj.embed.fields[0].value + file.slice(0, -'.playlist'.length) + '\n';
            });
            message.channel.send({ content: '\n**' + bot.language.PLAYLIST + ' :**\n\n', embeds: [embedObj] });
        });
    }
  }
};