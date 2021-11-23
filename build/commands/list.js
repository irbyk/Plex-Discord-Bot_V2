const pageSize = 10;
var offset = 0;

module.exports = {
  name : 'list',
  command : {
    usage: '<search/reset> <name?>',
    description: 'Print list of song.',
    process: async function(bot, client, message, query) {
      if(Object.keys(bot.cache_library).length === 0) {
        await bot.loadLibrary();
      }
      const args = query.split(/\s+/);
      const embedObj = createEmbedObj();
      switch(args[0]) {
        case 'search': {
            const res = await bot.findTracksOnPlex(query.slice(args[0].length+1), 0, 20);
            for (let track of res.MediaContainer.Metadata) {
                const music = bot.trackToMusic(track);
                embedObj.embed.fields[0].value += music.title + '\n\n';
                embedObj.embed.fields[1].value += music.artist + '\n\n';
                embedObj.embed.fields[2].value += music.album + '\n\n';
            }
        };break;
        case 'reset': offset = 0;
        default:
          for (let key in bot.cache_library) {
            try {
              const res = await bot.plex.query('/library/sections/' + key + '/all?type=10&X-Plex-Container-Start=' + offset + '&X-Plex-Container-Size=' + pageSize);
              offset += res.MediaContainer.Metadata.length < pageSize ? 0: pageSize;
              for (let track of res.MediaContainer.Metadata) {
                  const music = bot.trackToMusic(track);
                  embedObj.embed.fields[0].value += music.title + '\n\n';
                  embedObj.embed.fields[1].value += music.artist + '\n\n';
                  embedObj.embed.fields[2].value += music.album + '\n\n';
              }
            } catch (err) {
                console.error(err);
            }
          }
      }
      sanitizeEmbedObj(embedObj);
      message.channel.send(embedObj);
    }
  }
};

function createEmbedObj() {
  return {
    embed: {
      color: 0x00ff00,
      description: 'List of song : ',
      fields: [
        {
          name: 'Title',
          value: '',
          inline: true
        }, {
          name: 'Artist',
          value: '',
          inline: true
        }, {
          name: 'Album',
          value: '',
          inline: true
        }],
      footer: {
        text: '\u2800'.repeat(100)+"|"
      }
    }
  };
}

function sanitizeEmbedObj(embedObj) {
  for(let i = 0; i < embedObj.embed.fields.length; i++ ) {
    if(embedObj.embed.fields[i].value == '') {
      embedObj.embed.fields[i].value = '*None*';
    }
  }
}