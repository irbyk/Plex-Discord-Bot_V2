import { Client, EmbedField, Message, MessageEmbed } from "discord.js";
import { Bot } from "../app/bot";

function newEmbedObjList(isEmpty = false): MessageEmbed {
    return new MessageEmbed({
      color: 2389639,
      description: 'List of existing libraries : ',
      fields: [
        {
          name: 'Name',
          value:isEmpty ? '*None*' : '',
          inline: true
        }, {
          name: 'Key',
          value: isEmpty ? '*None*' : '',
          inline: true
        }, {
            name: 'Moods',
            value: isEmpty ? '*None*' : '',
            inline: true
          }]
    });
}


function newEmbedObjListLoaded(isEmpty = false): MessageEmbed{
  return new MessageEmbed({
    color: 2389639,
    description: 'List of loaded libraries : ',
    fields: [
      {
        name: 'Name',
        value: isEmpty ? '*None*' : '',
        inline: true
      }, {
        name: 'Key',
        value: isEmpty ? '*None*' : '',
        inline: true
      }, {
        name: 'Moods',
        value: isEmpty ? '*None*' : '',
        inline: true
      }
    ]
  });
}

const LIMIT_CARACTER_EMBED_FIELD = 1024;

function addNewElement(
  message: Message,
  embedObj: MessageEmbed,
  elementToAdd: string[],
  functionNewEmbedObj: (isEmpty: boolean) => MessageEmbed
) {
  if (
    (embedObj.fields[0].value + elementToAdd[0]).length > LIMIT_CARACTER_EMBED_FIELD ||
    (embedObj.fields[1].value + elementToAdd[1]).length > LIMIT_CARACTER_EMBED_FIELD ||
    (embedObj.fields[2].value + elementToAdd[2]).length > LIMIT_CARACTER_EMBED_FIELD) {
    message.channel.send({embeds: [embedObj]});
    embedObj = functionNewEmbedObj(false);
  }
  embedObj.fields[0].value += elementToAdd[0];
  embedObj.fields[1].value += elementToAdd[1];
  embedObj.fields[2].value += elementToAdd[2];
  return embedObj;
}

function fileEmbedObj(
  message: Message,
  list: any,
  embedObj: MessageEmbed,
  functionNewEmbedObj: (isEmpty: boolean) => MessageEmbed
) {
  for (let i of list) {
    let newElement = ['','',''];
    newElement[0] = i.name + '\n';
    newElement[1] = i.key + '\n';
    if (i.mood) {
      for(let j in i.mood) {
        if((newElement[2] + i.mood[j].name + ' ').length > LIMIT_CARACTER_EMBED_FIELD - 1) {
            if(newElement[2].length <= LIMIT_CARACTER_EMBED_FIELD - 4) {
              newElement[2] += '...';
            }
            newElement[2] += '\n';
            break;
        } else {
            newElement[2] += i.mood[j].name + ' ';
        }
      }
    } else {
        newElement[2] += '*None*\n';
    }
    embedObj = addNewElement(message, embedObj, newElement, functionNewEmbedObj);
  }
  return embedObj;
}

module.exports = {
  name : 'library',
  command : {
    usage: '<list/add/del> <integer?>',
    description: 'Command to manage which libraries to use.',
    process: async function(bot: Bot, client: Client, message: Message, query: string) {
      let args = query.split(/\s+/);
      switch(args[0]) {
        case 'list': {
          let list = await bot.getLibrariesList();
          let embedObj = newEmbedObjList(list.length == 0);
          embedObj = fileEmbedObj(message, list, embedObj, newEmbedObjList)
          message.channel.send({embeds: [embedObj]});
          if(Object.keys(bot.cache_library).length > 0) {
            embedObj = newEmbedObjListLoaded(false);
            embedObj = fileEmbedObj(message, Object.values(bot.cache_library), embedObj, newEmbedObjListLoaded);
          } else {
            embedObj = new MessageEmbed({
              color: 0xff0000,
              description: 'No loaded library. Type `' + bot.config.caracteres_commande + 'library add` to add all the libraries.\n Type `'
                + bot.config.caracteres_commande + 'library add <key>` to only add the library with the given key.' ,
            });
          }
          message.channel.send({embeds: [embedObj]});
        }; break;
        case 'add': {
          let handler = ( (library:any) => {message.channel.send({embeds: [{color:0x0000ff, description:'The "' + library.name + '" library has been loaded.'}]})});
          let handlerError = ( (error:any) => {message.channel.send({embeds: [{color:0xff0000, description:'"' + error.key + '" is not a valide library\'s key.'}]})});
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
              bot.once('libraryRemoved', (library => {message.channel.send({embeds: [{color:0x0000ff, description:'The "' + library.name + '" library has been removed.'}]})}));
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