import { Client, Message } from "discord.js";
import { Bot } from "../app/bot";

const packageJson = require('../../package.json');
module.exports = {
  name : 'plextest',
  command : {
    usage: '',
    description: 'test plex at bot start up to make sure everything is working',
    process: function(bot: Bot, client: Client, message: Message) {
      bot.plex.query('/').then(function(result: any) {
        console.log(result);
        if(message) {
          message.reply('name: ' + result.MediaContainer.friendlyName +'\nv: ' + result.MediaContainer.version + '\n'+
          'Bot version : ' + packageJson.version);
        }
        else {
          console.log('name: ' + result.MediaContainer.friendlyName);
          console.log('v: ' + result.MediaContainer.version);
          console.log('bot version: ' + packageJson.version);
        }
      }, function(err: any) {
        console.log('ya done fucked up');
      });
    }
  }
};