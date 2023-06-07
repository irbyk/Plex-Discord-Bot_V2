const fs = require('fs');

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
};

module.exports = {
  name : 'plex-list',
  command : {
    usage : '',
    description : 'print the name of all the playlists on Plex.',
    process : async function(bot, client, message, args) {

      try {
        const plexPlaylists = await bot.listPlaylist(message);
        let embedObj = {
			color: 4251856,
			fields: [
				{
					name: bot.language.NAME,
					value: '',
					inline: true
				},
                {
                    name: bot.language.SONGS,
                    value: '',
                    inline: true
                }
			],
			footer: {
				text: ''
			},
		};

		plexPlaylists.forEach(function (entry) {
			embedObj.fields[0].value = embedObj.fields[0].value + entry.title + '\n';
            embedObj.fields[1].value = embedObj.fields[1].value + entry.leafCount + '\n';
		});
		message.channel.send({ content: '\n**' + bot.language.PLAYLIST + ' :**\n\n', embeds: [embedObj] });
      } catch (err){
        console.error(err);
        message.reply(`No playlist exist on Plex.`);
      }
    }
  }
};
