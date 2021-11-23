"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const packageJson = require('../../package.json');
module.exports = {
    name: 'plextest',
    command: {
        usage: '',
        description: 'test plex at bot start up to make sure everything is working',
        process: function (bot, client, message) {
            bot.plex.query('/').then(function (result) {
                console.log(result);
                if (message) {
                    message.reply('name: ' + result.MediaContainer.friendlyName + '\nv: ' + result.MediaContainer.version + '\n' +
                        'Bot version : ' + packageJson.version);
                }
                else {
                    console.log('name: ' + result.MediaContainer.friendlyName);
                    console.log('v: ' + result.MediaContainer.version);
                    console.log('bot version: ' + packageJson.version);
                }
            }, function (err) {
                console.log('ya done fucked up');
            });
        }
    }
};
//# sourceMappingURL=test.js.map