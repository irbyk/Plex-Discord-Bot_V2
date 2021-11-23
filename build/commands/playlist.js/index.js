
var commandesPlaylist = {};

require('fs').readdirSync(__dirname + '/').forEach(function(file) {
  if (file.match(/\.js$/) && file !== 'index.js') {
    let command = require(__dirname + '/' +file.replace('.js', ''));
    commandesPlaylist[command.name] = command.command;
  }
});

module.exports = {
  name : 'playlist',
  command : {
    usage : '<command>',
    description : 'Manipulate playlists. Type "!playlist ?" to get the more help.',
    process : function(bot, client, message, query) {
        if(query == "?") {
            for (let command in commandesPlaylist){
                let embedObj = {
                        embed: {
                            color: 4251856,
                            fields:
                            [
                                {
                                    name: bot.language.COMMAND,
                                    value: bot.config.caracteres_commande + 'playlist ' + command + ' ' + commandesPlaylist[command].usage,
                                    inline: true
                                },
                                {
                                    name: bot.language.DESCRIPTION,
                                    value: commandesPlaylist[command].description,
                                    inline: true
                                }
                            ],
                            footer: {
                                text: ''
                            },
                        }
                };
                message.channel.send('\n**' + command + ' :**\n\n', embedObj);
            }
            return ;
        }
        args = query.split(/\s+/);
        let commande = commandesPlaylist[args[0]];
        if (commande) {
            commande.process(bot, client, message, args.slice(1));
        } else {
            message.reply(bot.language.PLAYLIST_UNKNOW_COMMAND.format({command : args[0], caracteres_commande : bot.config.caracteres_commande}));
        }
        
    }
  },
}