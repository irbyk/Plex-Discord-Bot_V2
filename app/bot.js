// Bot module ------------------------------------------------------------------
const EventEmitter = require('events');
const PlexAPI = require('plex-api');
const fs = require('fs');
const readline = require('readline');
const ytdl = require('ytdl-core');
const config = require('../config/config');
const xml2json = require('xml2js');
const request = require('request');
const language = require('../'+config.language);
  // plex constants ------------------------------------------------------------
const plexConfig = require('../config/plex');
const PLEX_PLAY_START = 'http://' + plexConfig.hostname + ':' + plexConfig.port;
const PLEX_PLAY_END = '?X-Plex-Token=' + plexConfig.token;

var Bot = class Bot extends EventEmitter{
    constructor(){
        super();
        // plex config ---------------------------------------------------------------
        this.language = language;
          this.config = config;

      // plex client ---------------------------------------------------------------
        this.plex = new PlexAPI({
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
        // plex variables ------------------------------------------------------------
        this.tracks = null;
        this.plexQuery = null;
        this.plexOffset = 0; // default offset of 0
        this.plexPageSize = 10; // default result size of 10
        this.isPlaying = false;
        this.isPaused = false;
        this.songQueue = []; // will be used for queueing songs
        this.volume = 0.2
        this.botPlaylist = null;

        // plex vars for playing audio -----------------------------------------------
        this.dispatcher = null;
        this.voiceChannel = null;
        this.conn = null;
        this.cache_library = {};
        
        this.workingTask = 0;
        this.waitForStart = false;
        this.waitForStartMessage = null;
    }
};

//Work like a simple semaphore to avoid conflict while playing song.
Bot.prototype.beginWorking = function(){
    this.workingTask++;
}

Bot.prototype.endWorking = function(){
    this.workingTask--;
    if(this.workingTask == 0 && this.waitForStart) {
        this.waitForStart = false;
        this.playSong(this.waitForStartMessage);
    }
}

// find song when provided with query string, offset, pagesize, and message
Bot.prototype.findTracksOnPlex = async function(query, offset, pageSize, type = 10) {
  return await this.plex.query('/search/?type=' + type + '&query=' + query + '&X-Plex-Container-Start=' + offset + '&X-Plex-Container-Size=' + pageSize);
};



Bot.prototype.loadMood = async function(name) {
  let self = this;
  self.cache_library[name].mood = {};
  let res = await self.plex.query('/library/sections/' + self.cache_library[name].key + '/mood?type=10');
  for(let mood of res.MediaContainer.Directory) {
    self.cache_library[name].mood[mood.title] = {key : mood.key, url : '/library/sections/' + self.cache_library[name].key + '/all?type=10&mood=' + mood.key};
  }
}

Bot.prototype.loadLibrary = async function() {
  let self = this;
  self.cache_library = {};
  let res = await this.plex.query('/library/sections');
  for(let library of res.MediaContainer.Directory){
    if(library.type == 'artist'){
      self.cache_library[library.title] = {key : library.key, mood : {}};
      await self.loadMood(library.title);
    }
  }
  
}

Bot.prototype.findArtist = async function(name, message) {
    // Artist : type = 8
    let resArtist = await this.findTracksOnPlex(name, 0, 10, 8);
    let resAlbums = await this.plex.query(resArtist.MediaContainer.Metadata[0].key);
    for(let album of resAlbums.MediaContainer.Metadata) {
        let resTracks = await this.plex.query(album.key);
        for(let track of resTracks.MediaContainer.Metadata) {
            let music = this.trackToMusic(track);
            this.songQueue.push(music);
        }
    }
    message.reply('add ' + name + '\'s albums to the queue.');
    if(!this.isPlaying) {
        this.playSong(message);
    }
}

Bot.prototype.findMood = async function(libraryName, moodName, message){
  let self = this;
  if(!self.cache_library[libraryName]) {
    await self.loadLibrary();
    if(!self.cache_library[libraryName]) {
      message.reply('I didn\'t find the library :cry:.')
      return;
    }
  }
  if(!self.cache_library[libraryName].mood[moodName]){
    await self.loadMood(libraryName);
    await self.loadLibrary();
    if(!self.cache_library[libraryName]) {
      message.reply('I didn\'t find the mood :cry:.')
      return;
    }
  }
  return !self.cache_library[libraryName].mood[moodName];
};

Bot.prototype.playOneMood = async function(moodName, message){
  if(Object.keys(this.cache_library).length == 0){
    await this.loadLibrary();
  }
  musics = [];
  for (let library of Object.values(this.cache_library)){
    if(library.mood[moodName]) {
      let res = await this.plex.query(library.mood[moodName].url)
      for(let track of res.MediaContainer.Metadata){
        musics.push(this.trackToMusic(track, true));
      }
    }
  }
  
  if(musics.length > 0) {
    let musicChosen = musics[Math.floor(Math.random() * Math.floor(musics.length))];
    this.songQueue.push(musicChosen);
    if(!this.isPlaying){
      this.playSong(message);
    } else {
      message.reply(language.BOT_ADDTOQUEUE_SUCCES.format({artist : musicChosen.artist, title : musicChosen.title}));
    }
  } else {
    message.reply('I cannot find the mood you\'re looking for :cry:.');
    throw 'mood missing'
  }
}

Bot.prototype.trackToMusic = function(track, repeat = false) {
  let key = track.Media[0].Part[0].key;
  let artist = '';
  let title = track.title;
  if ('originalTitle' in track) {
    artist = track.originalTitle;
  }
  else {
    artist = track.grandparentTitle;
  }
  return {'artist' : artist, 'title': title, 'key': key};
};

Bot.prototype.findOneSongOnPlex = async function(query) {
  let res = await this.findTracksOnPlex(query, 0, 1, 10);
  
  let liste = res.MediaContainer.Metadata;
  let taille = res.MediaContainer.size;
  if (taille < 1) {
      throw "La musique n'a pas été trouvée.";
  }
  return this.trackToMusic(liste[0]);
};

Bot.prototype.jouerUneMusique = async function(musique, vChannel, callback) {
  let self = this;
  let connection = await vChannel.join();
  this.conn = connection;
  this.voiceChannel = vChannel;
  let url;
  if(musique.key) {
    url = PLEX_PLAY_START + musique.key + PLEX_PLAY_END;
  } else {
    url = ytdl(musique.url);
  }
  self.isPlaying = true;
  self.dispatcher = connection.play(url).on('finish', () => callback()).on('error', function (){ throw "problème de lecture."});
  self.dispatcher.setVolume(self.volume);
  return self.dispatcher;
};

Bot.prototype.findPlaylist = function(query, message) {
  let self = this;
  self.findTracksOnPlex(query, 0, 10, 15).then(function(res) {
    let key = res.MediaContainer.Metadata[0].key;
    let url = PLEX_PLAY_START + key + PLEX_PLAY_END;
    self.loadPlaylist(url, message);
  });
}

Bot.prototype.loadPlaylist = function(url, message) {
  let self = this;
  request(url, (err, res, body) => {
    xml2json.parseString(body.toString('utf8'), {}, (err, jsonObj) => {
      let res = jsonObj;
      let tracks = jsonObj.MediaContainer.Track;
      let resultSize = res.MediaContainer.$.size;

      for (let i = 0; i < resultSize;i++) {
        let track = tracks[i].$
        let key = tracks[i].Media[0].Part[0].$.key;
        let title = track.title;
        let artist = '';
        if ('originalTitle' in track) {
          artist = track.originalTitle;
        }
        else {
          artist = track.grandparentTitle;
        }
        self.songQueue.push({'artist' : artist, 'title': title, 'key': key});
      }
      self.encoreDuTravail(message);
    });
  });
}

Bot.prototype.findSong = function(query, offset, pageSize, message) {
    let self = this;
    self.findTracksOnPlex(query, offset, pageSize).then(function(res) {
    self.tracks = res.MediaContainer.Metadata;

    let resultSize = res.MediaContainer.size;
    self.plexQuery = query; // set query for !nextpage
    self.plexOffset = self.plexOffset + resultSize; // set paging

    let messageLines = '\n';
    let artist = '';
    if (resultSize == 1 && offset == 0) {
      let songKey = 0;
      // add song to queue
      self.addToQueue(songKey, self.tracks, message);
    }
    else if (resultSize > 1) {
      for (let t = 0; t < self.tracks.length; t++) {
        if ('originalTitle' in self.tracks[t]) {
          artist = self.tracks[t].originalTitle;
        }
        else {
          artist = self.tracks[t].grandparentTitle;
        }
        messageLines += language.BOT_FIND_SONG_INFO_MUSIC.format({index : t+1, artist : artist, title : self.tracks[t].title}) + '\n';
      }
      messageLines += language.BOT_FIND_SONG_INFO;
      message.reply(messageLines);
    }
    else {
      message.reply(language.BOT_FIND_SONG_ERROR);
    }
  }, function (err) {
    console.log('narp');
  });
};


Bot.prototype.addToQueue = function(songNumber, tracks, message) {
  let self = this;
  if (songNumber > -1){
    let key = tracks[songNumber].Media[0].Part[0].key;
    let artist = '';
    let title = tracks[songNumber].title;
    if ('originalTitle' in tracks[songNumber]) {
      artist = tracks[songNumber].originalTitle;
    }
    else {
      artist = tracks[songNumber].grandparentTitle;
    }

    self.songQueue.push({'artist' : artist, 'title': title, 'key': key});
    if (!self.isPlaying) {
      self.playSong(message)
    } else {
      message.reply(language.BOT_ADDTOQUEUE_SUCCES.format({artist : artist, title : title}));
    }

  }
  else {
    message.reply(language.BOT_ADDTOQUEUE_FAIL);
  }
};

  // play song when provided with index number, track, and message
Bot.prototype.playSong = function(message) {
    
    let self = this;
    self.voiceChannel = message.member.voice.channel;
    
    if (self.voiceChannel) {
        self.emit('will play', message);
        if(this.workingTask > 0){
        this.isPlaying = true;
        this.waitForStart = true;
        this.waitForStartMessage = message;
        } else {
            self.voiceChannel.join().then(function(connection) {
              self.conn = connection;
              
              let url;
              if(self.songQueue[0].key) {
                url = PLEX_PLAY_START + self.songQueue[0].key + PLEX_PLAY_END;
              } else {
                url = ytdl(self.songQueue[0].url, { quality: 'highestaudio' });
              }
              self.isPlaying = true;
              
              self.dispatcher = connection.play(url).on('finish', () => {
                if (self.songQueue.length > 0) {
                  if(self.songQueue[0].replay) {
                    self.songQueue[0].played = true;
                    self.playSong(message);
                  } else {
                    self.songQueue.shift();
                    if (self.songQueue.length > 0) {
                      self.playSong(message);
                    }
                    // no songs left in queue, continue with playback completetion events
                    else {
                        this.isPlaying = false;
                        self.emit('finish', message);
                        self.playbackCompletion(message);
                    }
                  }
                } else {
                      self.emit('finish', message);
                      self.playbackCompletion(message);
                  }
              }).on('start', () => {
                  if(!self.songQueue[0].played) {
                    var embedObj = {
                      embed: {
                        color: 4251856,
                        fields:
                        [
                          {
                            name: language.ARTIST,
                            value: self.songQueue[0].artist,
                            inline: true
                          },
                          {
                            name: language.TITLE,
                            value: self.songQueue[0].title,
                            inline: true
                          }
                        ],
                        footer: {
                          text: language.NUMBER_MUSIC_IN_QUEUE.format({number : self.songQueue.length, plurial : (self.songQueue.length > 1 ? 's' : '')})
                        },
                      }
                    };
                    message.channel.send(language.BOT_PLAYSONG_SUCCES, embedObj);
                  }
              });
              self.dispatcher.setVolume(self.volume);
            });
          }
    } else {
        message.reply(language.BOT_PLAYSONG_FAIL)
    }
    
};

Bot.prototype.playbackCompletion = async function(message) {
    if(!this.isPlaying) {
        if(this.conn){
            await this.conn.disconnect();
        }
        if(this.voiceChannel) {
            await this.voiceChannel.leave();
        }
    }
};

Bot.prototype.ajoutPlaylist = async function(nomPlaylist, musique, message) {
  let self = this;
  let nomFichier = self.config.dossier_playlists + nomPlaylist + '.playlist';
  
  fs.readFile(nomFichier, 'utf8', async function(err, data){
      if (err){
          await message.reply(language.OPEN_PLAYLIST_ERROR);
          throw err;
      }
      let playlist = JSON.parse(data);
      playlist.musiques.push(musique); 
      let json = JSON.stringify(playlist);
      fs.writeFile(nomFichier, json, 'utf8', async function (err, written, string) {
          if(err) {
              await message.reply(language.WRITTING_PLAYLIST_ERROR);
              throw err;
          }
          message.reply(language.ADD_SONG_TO_PLAYLIST_SUCCES.format({title : musique.titre, artist : musique.artiste, playlist_name : playlist.nom}));
      });
  });
};

Bot.prototype.destroy = async function(){
    await this.playbackCompletion(null);
}

module.exports = Bot;