// plex api module -----------------------------------------------------------
var PlexAPI = require('plex-api');

// plex config ---------------------------------------------------------------
var plexConfig = require('../config/plex.js');
var config = require('../config/config.js');

// plex commands -------------------------------------------------------------
var plexCommands = require('../commands/plex.js');
const fs = require('fs');
const readline = require('readline');
// plex client ---------------------------------------------------------------
var plex = new PlexAPI({
  hostname: plexConfig.hostname,
  port: plexConfig.port,
  username: plexConfig.username,
  password: plexConfig.password,
  token: plexConfig.token,
  options: {
    identifier: 'PlexBot',
    product: plexConfig.options.identifier,
    version: plexConfig.options.version,
    deviceName: plexConfig.options.deviceName,
    platform: plexConfig.options.platform,
    device: plexConfig.options.device
  }
});

// plex constants ------------------------------------------------------------
const PLEX_PLAY_START = 'http://' + plexConfig.hostname + ':' + plexConfig.port;
const PLEX_PLAY_END = '?X-Plex-Token=' + plexConfig.token;

// plex variables ------------------------------------------------------------
var tracks = null;
var plexQuery = null;
var plexOffset = 0; // default offset of 0
var plexPageSize = 10; // default result size of 10
var isPlaying = false;
var isPaused = false;
var songQueue = []; // will be used for queueing songs
var volume = 0.2
var botPlaylist = null;

// plex vars for playing audio -----------------------------------------------
var dispatcher = null;
var voiceChannel = null;
var conn = null;
var termine = false;

// plex functions ------------------------------------------------------------

// find song when provided with query string, offset, pagesize, and message
async function findTracksOnPlex(query, offset, pageSize) {
    
    return await plex.query('/search/?type=10&query=' + query + '&X-Plex-Container-Start=' + offset + '&X-Plex-Container-Size=' + pageSize);
}

async function findOneSongOnPlex(query) {
    var res = await findTracksOnPlex(query, 0, 1);
    var liste = res.MediaContainer.Metadata;
    var taille = res.MediaContainer.size;
    if (taille < 1) {
        throw "Music is missing.";
    }
    var key = liste[0].Media[0].Part[0].key;
    var artist = '';
    var title = liste[0].title;
    if ('originalTitle' in liste[0]) {
      artist = liste[0].originalTitle;
    }
    else {
      artist = liste[0].grandparentTitle;
    }
    return {'artist' : artist, 'title': title, 'key': key};
}

async function jouerUneMusique(musique, voiceChannel, callback) {
    var connection = await voiceChannel.join();
    conn = connection;
    var url = PLEX_PLAY_START + musique.key + PLEX_PLAY_END;

    isPlaying = true;
    connection.play(url, {volume: volume}).on('finish', () => callback());
}

function findSong(query, offset, pageSize, message) {
    findTracksOnPlex(query, offset, pageSize).then(function(res) {
    tracks = res.MediaContainer.Metadata;

    var resultSize = res.MediaContainer.size;
    plexQuery = query; // set query for !nextpage
    plexOffset = plexOffset + resultSize; // set paging

    var messageLines = '\n';
    var artist = '';
    if (resultSize == 1 && offset == 0) {
      songKey = 0;
      // add song to queue
      addToQueue(songKey, tracks, message);
    }
    else if (resultSize > 1) {
      for (var t = 0; t < tracks.length; t++) {
        if ('originalTitle' in tracks[t]) {
          artist = tracks[t].originalTitle;
        }
        else {
          artist = tracks[t].grandparentTitle;
        }
        messageLines += (t+1) + ' - ' + artist + ' - ' + tracks[t].title + '\n';
      }
      messageLines += '\n***!playsong (number)** to play your music.*';
      messageLines += '\n***!nextpage** if the music you want is not in this page.**';
      message.reply(messageLines);
    }
    else {
      message.reply('**I can\'t find any song with that title :cry:.**');
    }
  }, function (err) {
    console.log('narp');
  });
}

// not sure if ill need this
function addToQueue(songNumber, tracks, message) {
  if (songNumber > -1){
    var key = tracks[songNumber].Media[0].Part[0].key;
    var artist = '';
    var title = tracks[songNumber].title;
    if ('originalTitle' in tracks[songNumber]) {
      artist = tracks[songNumber].originalTitle;
    }
    else {
      artist = tracks[songNumber].grandparentTitle;
    }

    songQueue.push({'artist' : artist, 'title': title, 'key': key});
    if (songQueue.length > 1) {
      message.reply('you add **' + artist + ' - ' + title + '** to the queue.\n\n***!viewqueue** to view the queue.*');
    }

    if (!isPlaying) {
      playSong(message);
    }

  }
  else {
    message.reply('**KYAAAAAAAAAAAAAAAAAAAAAAA :face_vomiting:**');
  }
}

// play song when provided with index number, track, and message
function playSong(message) {
  voiceChannel = message.member.voice.channel;

  if (voiceChannel) {
    voiceChannel.join().then(function(connection) {
      conn = connection;
      var url = PLEX_PLAY_START + songQueue[0].key + PLEX_PLAY_END;

      isPlaying = true;
      dispatcher = connection.play(url, {volume : volume}).on('finish', () => {
        songQueue.shift();
        if (songQueue.length > 0) {
          playSong(message);
        }
        // no songs left in queue, continue with playback completetion events
        else {
            playbackCompletion(message);
        }
      });
    });

    // probbaly just change this to channel alert, not reply
    var embedObj = {
      embed: {
        color: 4251856,
        fields:
        [
          {
            name: 'Artiste',
            value: songQueue[0].artist,
            inline: true
          },
          {
            name: 'Titre',
            value: songQueue[0].title,
            inline: true
          }
        ],
        footer: {
          text: songQueue.length + ' musique' + (songQueue.length > 1 ? 's' : '') + ' dans la file.'
        },
      }
    };
    if(!termine) {
      message.channel.send('**Playing :**\n', embedObj);
    }
  }
  else {
    message.reply('**please, join a vocal channel :wink:.**')
  }
}



// run at end of songQueue / remove bot from voiceChannel
function playbackCompletion(message) {
  conn.disconnect();
  voiceChannel.leave();
  isPlaying = false;
  termine = false;
}

async function ajoutPlaylist(nomPlaylist, musique, message) {
    var nomFichier = config.dossier_playlists+nomPlaylist+'.playlist';
    
    fs.readFile(nomFichier, 'utf8', async function readFileCallback(err, data){
        if (err){
            await message.reply('an error occure while I try to open the playlist :cry:.');
            throw err;
        }
        playlist = JSON.parse(data);
        playlist.musiques.push(musique); 
        json = JSON.stringify(playlist);
        fs.writeFile(nomFichier, json, 'utf8', async function (err, written, string) {
            if(err) {
                await message.reply('an error occured during the writing :cry:.');
                throw err;
            }
            message.reply('music \"' + musique.titre + ' - ' + musique.artiste + '\" has been add to **' + playlist.nom + '**.');
        });
    });
}

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
var commandesPlaylist = {
    "creat" : {
        usage : '<name>',
        description : 'Creat a playlist with a the giving name.',
        process : async function(client, message, args) {
            if(args.length < 1) {
                message.reply('I need a name.');
                return ;
            }
            if (args.length > 1) {
                message.reply('I just need a name.');
                return ;
            }
            var nomFichier = config.dossier_playlists+args[0]+'.playlist';
            if(fs.existsSync(nomFichier)) {
                message.reply('this playlist already exist.');
            } else {
                let playlist = {
                    nom : args[0],
                    musiques : []
                };
                let json = JSON.stringify(playlist);
                fs.writeFile(nomFichier, json, 'utf8', async function (err) {
                    if (err) {
                        await message.reply('an error appear while I try to creat the playlist :cry:.');
                        throw err;
                    }
                    message.reply('the playlist \"' + args[0] + '\" has been created.');
                });
            }
        }
    },
    "add" : {
        usage : '<playlist> <music name>',
        description : 'Add a music in the given playlist.',
        process : async function(client, message, args) {
            if(args.length < 2) {
                message.reply('Not enought parameters.');
                return ;
            }
            nomMusique = args[1];
            args.slice(2).forEach(function(iter){
                nomMusique = nomMusique +' ' + iter;
            });

            var nomFichier = config.dossier_playlists+args[0]+'.playlist';
            if(!fs.existsSync(nomFichier)) {
                message.reply('this playlist doesn\'t exist.');
            } else {
                
                findTracksOnPlex(nomMusique, 0, 10).then(async function(res) {
                    
                    var liste = res.MediaContainer.Metadata;
                    var taille = res.MediaContainer.size;
                    if (taille < 1) {
                        await message.reply('I don\'t find this music :cry:.');
                        throw "Music is missing.";
                    }
                    if (taille > 1) {
                        let messageLines = '\n';
                        tracks = res.MediaContainer.Metadata;
                        let resultSize = res.MediaContainer.size;
                        plexQuery = nomMusique; // set query for !nextpage
                        plexOffset = taille; // set paging
                        botPlaylist = args[0];
                        for (var t = 0; t < tracks.length; t++) {
                            if ('originalTitle' in tracks[t]) {
                                artist = tracks[t].originalTitle;
                            }
                            else {
                                artist = tracks[t].grandparentTitle;
                            }
                            messageLines += (t+1) + ' - ' + artist + ' - ' + tracks[t].title + '\n';
                        }
                        messageLines += '\n***!playlist choice (number)** to add your music.*';
                        messageLines += '\n***!playlist page** to pass to the next page.*';
                        message.reply(messageLines);
                        return ;
                    }
                    
                    var key = liste[0].Media[0].Part[0].key;
                    var artist = '';
                    var title = liste[0].title;
                    if ('originalTitle' in liste[0]) {
                      artist = liste[0].originalTitle;
                    }
                    else {
                      artist = liste[0].grandparentTitle;
                    }
                    let musique = {
                        query : nomMusique,
                        artiste : artist,
                        titre : title,
                        cle : key
                    };
                    ajoutPlaylist(args[0], musique, message);
                });
            }
        }
    },
    'page' : {
        usage: '',
        description: 'pass to the next page while you research a music.',
        process: function(client, message, query) {
            findSong(plexQuery, plexOffset, plexPageSize, message);
        }
    },
    'choice' : {
        usage: '<song number>',
        description: 'add a song to the playlist. Note : this will add to the playlist you given with the "add" command. ',
        process: function(client, message, query) {
            if(!botPlaylist){
                message.reply('... maybe you forgot to type "add" before ?');
                return ;
            }
            var songNumber = query;
            songNumber = parseInt(songNumber);
            songNumber = songNumber - 1;
            
            var key = tracks[songNumber].Media[0].Part[0].key;
            var artist = '';
            var title = tracks[songNumber].title;
            if ('originalTitle' in tracks[songNumber]) {
              artist = tracks[songNumber].originalTitle;
            }
            else {
              artist = tracks[songNumber].grandparentTitle;
            }
            let musique = {
                    query : plexQuery,
                    artiste : artist,
                    titre : title,
                    cle : key
            };
            ajoutPlaylist(botPlaylist, musique, message);
        }
    },
    "play" : {
        usage : '<playlist> ?r',
        description : 'play the given playlist.\nThe \'r\' option is to play the playlist randomly.',
        process : async function(client, message, args) {
            if(args.length < 1) {
                message.reply('not enought arguments.');
                return ;
            }
            if(args.length > 2) {
                message.reply('just the name of the playlist, plus "r" if you want to play it randomly.');
                return ;
            }
            let aleatoire = false;
            if(args.length == 2) {
              if(args[1] != 'r') {
                message.reply('you mean "r" right ?');
                return ;
              }
              aleatoire = true;
            }
            let nomFichier = config.dossier_playlists+args[0]+'.playlist';
            if(!fs.existsSync(nomFichier)) {
                message.reply('this playlist doesn\'t exist.');
            } else {
                fs.readFile(nomFichier, 'utf8', async function readFileCallback(err, data){
                        if (err){
                            await message.reply('an error occure while I try to open the playlist :cry:.');
                            throw err;
                        }
                        playlist = JSON.parse(data);
                        if(aleatoire){
                          let j = 0;
                          let inter;
                          for(let i = 0; i < playlist.musiques.length; i++) {
                            let j = getRandomInt(playlist.musiques.length);
                            let inter = playlist.musiques[j];
                            playlist.musiques[j] = playlist.musiques[i];
                            playlist.musiques[i] = inter;
                            
                          }
                        }
                        playlist.musiques.forEach(function (musique){
                            songQueue.push({'artist' : musique.artiste, 'title': musique.titre, 'key': musique.cle});
                        });
                        
                        if(isPlaying){
                          await message.reply('the playlist has been add to the queue.');
                          if(aleatoire) {
                            message.channel.send('!viewqueue');
                          }
                        } else {
                          if(aleatoire) {
                            await message.channel.send('!viewqueue');
                          }
                            encoreDuTravail(message);
                        }
                        
                });
            }
        }
    },
    "print" : {
        usage : '<playlist>',
        description : 'print the content of the playlist.',
        process : async function(client, message, args) {
            if(args.length < 1) {
                message.reply('not enought arguments.');
                return ;
            }
            if (args.length > 1) {
                message.reply('just the name of the playlist.');
                return ;
            }
            var nomFichier = config.dossier_playlists+args[0]+'.playlist';
            if(!fs.existsSync(nomFichier)) {
                message.reply('this playlist doesn\'t exist.');
            } else {
                
                let embedObj = {
                    embed: {
                        color: 4251856,
                        fields: [
                            {
                                name: 'Music',
                                value: '',
                                inline: true
                            },
                        ],
                        footer: {
                            text: ''
                        },
                    }
                };
                fs.readFile(nomFichier, 'utf8', async function readFileCallback(err, data){
                        if (err){
                            await message.reply('an error occure while I try to open the playlist :cry:.');
                            throw err;
                        }
                        playlist = JSON.parse(data);
                        if(playlist.musiques.length > 1) {
                          embedObj.embed.fields[0].name += 's';
                        }
                        let ligne = '';
                        let indice = 0;
                        premier = true;
                        
                        playlist.musiques.forEach(function (musique){
                            indice++;
                            let ligne = indice + ' - ' + musique.titre + ' - ' + musique.artiste + '\n';
                            if (embedObj.embed.fields[0].value.length + ligne.length > 1024) {
                              message.channel.send('\n**' + args[0] + (!premier ? '(next)' : '') + ' :**\n\n', Object.assign({}, embedObj));
                              embedObj.embed.fields[0].value = '';
                              premier = false;
                            }
                            embedObj.embed.fields[0].value = embedObj.embed.fields[0].value + ligne;
                        });
                        embedObj.embed.footer.text = 'There is' + indice + ' music' + (indice > 1 ? 's' : '') + ' in this playlist.';
                        await message.channel.send('\n**' + args[0] + (!premier ? '(next)' : '')+ ' :**\n\n', embedObj);
                        
                });
            }
        }
    },
     "list" : {
        usage : '',
        description : 'print the name of all the playlists.',
        process : async function(client, message, args) {
            if(args.length > 0) {
                message.reply('there is no argument for this command.');
                return ;
            }
            
            fs.readdir(config.dossier_playlists, function (err, files) {
                if (err) {
                    message.reply('an error occured with the folder :cry:.');
                    throw err
                }
                let embedObj = {
                    embed: {
                        color: 4251856,
                        fields: [
                            {
                                name: 'Name',
                                value: '',
                                inline: true
                            },
                        ],
                        footer: {
                            text: ''
                        },
                    }
                };
                files.forEach(function (file) {
                    embedObj.embed.fields[0].value = embedObj.embed.fields[0].value + file.slice(0, -'.playlist'.length) + '\n';
                });
                message.channel.send('\n**Playlists :**\n\n', embedObj);
            });
        }
     },
     "remove" : {
        usage : '<playlist>',
        description : 'remove the given playlist.',
        process : async function(client, message, args) {
            if(args.length < 1) {
                message.reply('I need a name.');
                return ;
            }
            if(args.length > 1) {
                message.reply('just the name.');
                return ;
            }
            var nomFichier = config.dossier_playlists+args[0]+'.playlist';
            if(!fs.existsSync(nomFichier)) {
                message.reply('this playlist doesn\'t exist.');
                return
            }
            fs.unlink(nomFichier, (err) => {
                if (err){
                    message.reply('an error has occured during the suppression procedure :cry:.');
                    throw err;
                }
                botPlaylist = null;
                message.reply('the playlist \"'+args[0]+'\" has been removed.');
            });
        }
     },
     "delete" : {
        usage : '<playlist> <index>',
        description : 'remove on song from the given playlist (type !playlist print <playlist> to get the index).',
        process : async function(client, message, args) {
            if(args.length < 2) {
                message.reply('not enought arguments.');
                return ;
            }
            if(args.length > 2) {
                message.reply('too many arguments');
                return ;
            }
            let nomFichier = config.dossier_playlists+args[0]+'.playlist';
            let indice = parseInt(args[1]);
            indice = indice - 1;
            fs.readFile(nomFichier, 'utf8', async function readFileCallback(err, data){
                        if (err){
                            await message.reply('an error has occured during the opening of the playlist :cry:.');
                            throw err;
                        }
                        playlist = JSON.parse(data); 
                        let musique = playlist.musiques[indice];
                        let musiques = []
                        let entree = 0;
                        playlist.musiques.forEach(function(iter) {
                            if(entree != indice) {
                                musiques.push(iter);
                            }
                            entree++;
                        });
                        playlist.musiques = musiques;
                        json = JSON.stringify(playlist);
                        fs.writeFile(nomFichier, json, 'utf8', async function (err, written, string) {
                            if(err) {
                                await message.reply('an error occured during the writing :cry:.');
                                throw err;
                            }
                            message.reply('the music \"' + musique.titre + ' - ' + musique.artiste + '\" has been remove from **' + playlist.nom + '**.');
                        });
                });
        }
     }
}

// plex commands -------------------------------------------------------------
var commands = {
  'plextest' : {
    usage: '',
    description: 'test plex at bot start up to make sure everything is working',
    process: function(client, message) {
      plex.query('/').then(function(result) {
        if(message) {
          message.reply('name: ' + result.MediaContainer.friendlyName +'\nv: ' + result.MediaContainer.version);
        }
        else {
          console.log('name: ' + result.MediaContainer.friendlyName);
          console.log('v: ' + result.MediaContainer.version);
        }
      }, function(err) {
        console.log('ya done fucked up');
      });
    }
  },
  'clearqueue' : {
    usage: '',
    description: 'clears all songs in queue',
    process: function(client, message) {
      if (songQueue.length > 0) {
        songQueue = []; // remove all songs from queue

        message.reply('**the queue has been cleared.**');
      }
      else {
        message.reply('**there is no music in the queue :cry:.**');
      }
    }
  },
  'nextpage' : {
    usage: '',
    description: 'get next page of songs if desired song not listed',
    process: function(client, message, query) {
      findSong(plexQuery, plexOffset, plexPageSize, message);
    }
  },
  'pause' : {
    usage: '',
    description: 'pauses current song if one is playing',
    process: function(client, message) {
      if (isPlaying) {
        dispatcher.pause(true); // pause song
        isPaused = true;
        var embedObj = {
          embed: {
            color: 16424969,
            description: '**Music pause.**',
          }
        };
        message.channel.send('**Update:**', embedObj);
      }
      else {
        message.reply('**Nothing is played :cry:.**');
      }
    }
  },
  'play' : {
    usage: '<song title or artist>',
    description: 'bot will join voice channel and play song if one song available.  if more than one, bot will return a list to choose from',
    process: function(client, message, query) {
      // if song request exists
      if (query.length > 0) {
        plexOffset = 0; // reset paging
        plexQuery = null; // reset query for !nextpage

        findSong(query, plexOffset, plexPageSize, message);
      }
      else {
        message.reply('**need a title or at least one word.**');
      }
    }
  },
  'playsong' : {
    usage: '<song number>',
    description: 'play a song from the generated song list',
    process: function(client, message, query) {
      var songNumber = query;
      songNumber = parseInt(songNumber);
      songNumber = songNumber - 1;

      addToQueue(songNumber, tracks, message);
    }
  },
  'removesong' : {
    usage: '<song queue number>',
    description: 'removes song by index from the song queue',
    process: function(client, message, query) {
      var songNumber = query;
      songNumber = parseInt(songNumber);
      songNumber = songNumber - 1;

      if (songQueue.length > 0 ) {
        if (songNumber > -1 && songNumber <= songQueue.length) {
          // remove by index (splice)
          var removedSong = songQueue.splice(songNumber, 1);
          message.reply('**You have removed ' + removedSong[0].artist + ' - ' + removedSong[0].title + ' from the queue.**');
          // message that it has been removed
        }
        else {
          message.reply('**whut ?!**');
        }
      }
      else {
        message.reply('**the queue is empty :cry: .**');
      }
    }
  },
  'resume' : {
    usage: '',
    description: 'skips the current song if one is playing and plays the next song in queue if it exists',
    process: function(client, message) {
      if (isPaused) {

        dispatcher.resume(); // run dispatcher.end events in playSong
        var embedObj = {
          embed: {
            color: 4251856,
            description: '**here we go again !.**',
          }
        };
        message.channel.send('**Update:**', embedObj);
      }
      else {
        message.reply('**Nothing to be resume.**');
      }
    }
  },
  'skip' : {
    usage: '?<int>',
    description: 'skips the current song if one is playing and plays the next song in queue if it exists',
    process: function(client, message, query) {
      let nombreSkip = 1;
      console.log(query);
      if(query) {
          nombreSkip = parseInt(query, 10);
          if(isNaN(nombreSkip)) {
              message.reply('I need an integer.');
              return ;
          }
          
          if(nombreSkip < 1){
                message.reply('I can i do with '+ nombreSkip +'.\n'+
                            'I need a strictly positif integer to work !');
                return ;
          }
      }
      if (isPlaying) {
        if(nombreSkip > songQueue.length) {
          message.channel.send('skiping all the queue !');
          nombreSkip = songQueue.length;
        }
        let messageString = songQueue[0].artist + ' - ' + songQueue[0].title + ' has been passed.\n';
        for(let i = 0; i < nombreSkip - 1; i++){
          songQueue.shift();
          messageString += songQueue[0].artist + ' - ' + songQueue[0].title + ' has been passed.\n';
        }
        message.channel.send(messageString);
        dispatcher.end();
      } else {
        message.reply('nothing to be pass.');
      }
    }
  },
  'stop' : {
    usage: '',
    description: 'stops song if one is playing',
    process: function(client, message) {
      if (isPlaying) {
        songQueue = []; // removes all songs from queue
        dispatcher.end(); // stop dispatcher from playing audio

        var embedObj = {
          embed: {
            color: 10813448,
            description: '**Playback has been stopped.**',
          }
        };
        message.channel.send('**Update:**', embedObj);
      }
      else {
        message.reply('**Nothing currently playing.**');
      }
    }
  },
  'viewqueue' : {
    usage: '',
    description: 'displays current song queue',
    process: function(client, message) {
      //var messageLines = '\n**Song Queue:**\n\n';

      var messageLines = '';

      if (songQueue.length > 0) {
        for (var t = 0; t < songQueue.length; t++) {
          messageLines += (t+1) + ' - ' + songQueue[t].artist + ' - ' + songQueue[t].title + '\n';
        }

        messageLines += '\n***!removesong (number)** to remove a song*';
        messageLines += '\n***!skip** to skip the current song*';

        var embedObj = {
          embed: {
            color: 2389639,
            description: messageLines,
          }
        };

        message.channel.send('\n**Song Queue:**\n\n', embedObj);
      }
      else {
        message.reply('**There are no songs in the queue.**');
      }
    }
  },
  'volume' : {
    usage: '<real or \'?\'>',
    description: 'Set the volume to the given real, who need to between 0 and 1. Type \'?\' to get the current volume.',
    process: function(client, message, query) {
      if(query == "?") {
        message.reply(`the volume is at ${volume}.`);
      } else {
        volume_parse = Math.max(Math.min(parseFloat(query),1.),0.);
        volume = isNaN(volume_parse) ? volume : volume_parse;
        if(isPlaying) {
          dispatcher.setVolume(volume);
        }
        message.reply(`the volume has been set to ${volume}.`);
      }
    }
  },
  'playlist' : {
    usage : '<command>',
    description : 'Manipulate playlists. Type "playlist ?" to get the commands help.',
    process : function(client, message, query) {
        if(query == "?") {
            for (let command in commandesPlaylist){
                let embedObj = {
                        embed: {
                            color: 4251856,
                            fields:
                            [
                                {
                                    name: 'Command',
                                    value: config.caracteres_commande + 'playlist ' + command + ' ' + commandesPlaylist[command].usage,
                                    inline: true
                                },
                                {
                                    name: 'Description',
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
        args = query.split(' ');
        let commande = commandesPlaylist[args[0]];
        if (commande) {
            commande.process(client, message, args.slice(1));
        } else {
            message.reply('sorry \"' + args[0] + '\" is not a valid command :cry:.\nType \"!playlist ?\" to get the commands help.');
        }
        
    }
  },
};

module.exports = commands;
