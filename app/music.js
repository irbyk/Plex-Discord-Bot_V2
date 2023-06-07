module.exports = function(client, bot) {
  // plex commands -------------------------------------------------------------
  const plexCommands = require('../commands');
  // when bot is ready
  client.once('ready', function() {
    console.log('bot ready');
    console.log('logged in as: ' + client.user.tag);

    plexCommands['plextest'].process(bot);
  });

  // when message is sent to discord
  client.on('messageCreate', function(message){
    
      var msg = message.content;//.toLowerCase();

      if (msg.startsWith(bot.config.caracteres_commande)){
        if(bot.config.canal_ecoute == '' || message.channel.name == bot.config.canal_ecoute) {
            var cmdTxt = msg.split(/\s+/)[0].substring(bot.config.caracteres_commande.length, msg.length).toLowerCase();
            var query = msg.substring(cmdTxt.length+2);
            if(cmdTxt === "?") {
              if(query) {
                /*let cmdTxtAide = query.split(" ");
                let cmdAide = plexCommands[cmdTxtAide[0]];
                if(cmdAide) {
                  cmdAide.usage(message, cmdTxtAide.slice(1));
                } else{*/
                  message.reply(bot.language.MUSIC_HELP_1.format({caracteres_commande : bot.config.caracteres_commande}),{tts: true});
                //}
                return ;
              }
              for (let command in plexCommands){
                  let embedObj = {
                           
                              color: 4251856,
                              fields:
                              [
                                  {
                                      name: bot.language.COMMAND,
                                      value: bot.config.caracteres_commande + command + ' ' + plexCommands[command].usage,
                                      inline: true
                                  },
                                  {
                                      name: bot.language.DESCRIPTION,
                                      value: plexCommands[command].description,
                                      inline: true
                                  }
                              ],
                              footer: {
                                  text: ''
                              },
                          
                  };
                  message.channel.send({ content: '\n**' + command + ' :**\n\n', embeds: [embedObj] });
              }
              return ;
            }
            
            var cmd = plexCommands[cmdTxt];
            
            if (cmd){
              try {
                cmd.process(bot, client, message, query);
                if (process.catch !== undefined) {
                  process.catch(err => console.log(e));
                }
              }
              catch (e) {
                console.log(e);
              }
            }
            else {
              message.reply(bot.language.MUSIC_UNKNOW_COMMAND.format({cmdTxt : cmdTxt}));
            }
        }
      }
    
  });
};