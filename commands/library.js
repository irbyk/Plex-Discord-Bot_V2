module.exports = {
  name : 'library',
  command : {
    usage: '<list/add/del> <integer?>',
    description: 'Command to manage which libraries to use.',
    process: async function(bot, client, message, query) {
      let args = query.split(/\s+/);
      switch(args[0]) {
        case 'list': {
          let list = await bot.getLibrariesList();
          let embedObj = {
            embed: {
              color: 2389639,
              description: 'List of existing libraries : ',
              fields: [
                {
                  name: 'Name',
                  value:list.length == 0 ? '*None*' : '',
                  inline: true
                }, {
                  name: 'Key',
                  value: list.length == 0 ? '*None*' : '',
                  inline: true
                }, {
                    name: 'Moods',
                    value: list.length == 0 ? '*None*' : '',
                    inline: true
                  }]
            }
          };
          for (let i of list) {
              embedObj.embed.fields[0].value += i.name + '\n';
              embedObj.embed.fields[1].value += i.key + '\n';
              if(i.mood) {
                for(let j in i.mood) {
                  embedObj.embed.fields[2].value += i.mood[j].name + ' ';
                }
              } else {
                  embedObj.embed.fields[2].value += '*None*';
              }
              embedObj.embed.fields[2].value += '\n';
          }
          message.channel.send(embedObj);
          if(Object.keys(bot.cache_library).length > 0) {
            embedObj = {
              embed: {
                color: 2389639,
                description: 'List of loaded libraries : ',
                fields: [
                  {
                    name: 'Name',
                    value: bot.cache_library.length == 0 ? '*None*' : '',
                    inline: true
                  }, {
                    name: 'Key',
                    value: bot.cache_library.length == 0 ? '*None*' : '',
                    inline: true
                  }, {
                    name: 'Moods',
                    value: bot.cache_library.length == 0 ? '*None*' : '',
                    inline: true
                  }]
              }
            };
            for (let i in bot.cache_library) {
              embedObj.embed.fields[0].value += bot.cache_library[i].name + '\n';
              embedObj.embed.fields[1].value += bot.cache_library[i].key + '\n';
              if(bot.cache_library[i].mood) {
                for(let j in bot.cache_library[i].mood) {
                  embedObj.embed.fields[2].value += bot.cache_library[i].mood[j].name + ' ';
                }
              } else {
                embedObj.embed.fields[2].value += '*None*';
              }
              embedObj.embed.fields[2].value += '\n';
            }
            
          } else {
            embedObj = {
              embed: {
                color: 0xff0000,
                description: 'No loaded library. Type `' + bot.config.caracteres_commande + 'library add` to add all the libraries.\n Type `'
                + bot.config.caracteres_commande + 'library add <key>` to only add the library with the given key.' ,
              }
            };
          }
          message.channel.send(embedObj);
        }; break;
        case 'add': {
          let handler = (library => {message.channel.send({embed: {color:0x0000ff, description:'The "' + library.name + '" library has been loaded.'}})});
          let handlerError = (error => {message.channel.send({embed: {color:0xff0000, description:'"' + error.key + '" is not a valide library\'s key.'}})});
          bot.on('libraryAdded', handler);
          bot.on('loadLibraryError', handlerError);
          
          if(args.length > 1){
            let id = parseInt(args[1]);
            if(isNaN(id)) {
              message.reply(args[1] + ' is not a valid library key.');
            } else {
              await bot.loadLibrary(id);
            }
          } else {
            await bot.loadLibrary();
          }
          bot.removeListener('libraryAdded', handler);
          bot.removeListener('loadLibraryError', handler);
        }; break;
        case 'del': {
            let id = parseInt(args[1]);
            if(isNaN(id)) {
              message.reply(args[1] + ' is not a valid library key.');
            } else {
              bot.once('libraryRemoved', (library => {message.channel.send({embed: {color:0x0000ff, description:'The "' + library.name + '" library has been removed.'}})}));
              bot.removeLibrary(id);
            }
        }; break;
        default: {
            message.reply('Flemme de faire l\'aide tout de suite.');
        }; break;
      }
    }
  }
};