module.exports = function(client) {
  // plex commands -------------------------------------------------------------
  var plexCommands = require('../commands/plex');
  var config = require('../config/config');

  // when bot is ready
  client.on('ready', function() {
    console.log('bot ready');
    console.log('logged in as: ' + client.user.tag);

    plexCommands['plextest'].process();
  });

  // when message is sent to discord
  client.on('message', function(message){
    
      var msg = message.content.toLowerCase();
      if (msg.startsWith(config.caracteres_commande)){
        // à changer...
        if(true || !message.channel.name && message.channel.name == config.canal_ecoute) {
            var cmdTxt = msg.split(" ")[0].substring(config.caracteres_commande.length, msg.length);
            var query = msg.substring(cmdTxt.length+2);
            if(cmdTxt == "?") {
              if(query) {
                /*let cmdTxtAide = query.split(" ");
                let cmdAide = plexCommands[cmdTxtAide[0]];
                if(cmdAide) {
                  cmdAide.usage(message, cmdTxtAide.slice(1));
                } else{*/
                  message.reply('this command doesn\'t exist.\n\
                  Type \"' + config.caracteres_commande + '?\" to get some help :wink:.');
                //}
                return ;
              }
              for (let command in plexCommands){
                  let embedObj = {
                          embed: {
                              color: 4251856,
                              fields:
                              [
                                  {
                                      name: 'Commande',
                                      value: config.caracteres_commande + command + ' ' + plexCommands[command].usage,
                                      inline: true
                                  },
                                  {
                                      name: 'Description',
                                      value: plexCommands[command].description,
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
            
            var cmd = plexCommands[cmdTxt];
            
            if (cmd){
              try {
                cmd.process(client, message, query);
              }
              catch (e) {
                console.log(e);
              }
            }
            else {
              message.reply('**sorry \"' + cmdTxt + '\" is not a valid command :cry:.**');
            }
        }
      }
    
  });
};
