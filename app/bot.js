// Bot module ------------------------------------------------------------------
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

var Bot = function() {
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
  this.termine = false;
  // plex functions ------------------------------------------------------------
};

  // find song when provided with query string, offset, pagesize, and message
Bot.prototype.findTracksOnPlex = async function(query, offset, pageSize, type = 10) {
  return await this.plex.query('/search/?type=' + type + '&query=' + query + '&X-Plex-Container-Start=' + offset + '&X-Plex-Container-Size=' + pageSize);
};

Bot.prototype.findOneSongOnPlex = async function(query) {
  let res = await this.findTracksOnPlex(query, 0, 1);
  let liste = res.MediaContainer.Metadata;
  let taille = res.MediaContainer.size;
  if (taille < 1) {
      throw "La musique n'a pas été trouvée.";
  }
  let key = liste[0].Media[0].Part[0].key;
  let artist = '';
  let title = liste[0].title;
  if ('originalTitle' in liste[0]) {
    artist = liste[0].originalTitle;
  }
  else {
    artist = liste[0].grandparentTitle;
  }
  return {'artist' : artist, 'title': title, 'key': key};
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
        messageLines += bot.language.BOT_FIND_SONG_INFO_MUSIC.format({index : t+1, artist : artist, title : self.tracks[t].title}) + '\n';
      }
      messageLines += language.BOT_FIND_SONG_1;
      messageLines += language.BOT_FIND_SONG_2;
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
        self.songQueue.shift();
        if (self.songQueue.length > 0) {
          self.playSong(message);
        }
        // no songs left in queue, continue with playback completetion events
        else {
            self.playbackCompletion(message);
        }
      });
      self.dispatcher.setVolume(self.volume);
    });

    // probbaly just change this to channel alert, not reply
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
    if(!self.termine) {
      message.channel.send(language.BOT_PLAYSONG_SUCCES, embedObj);
    }
    //message.channel.send('**♪ ♫ ♪ Playing: ' + songQueue[0].artist + ' - ' + songQueue[0].title + ' ♪ ♫ ♪**');
  }
  else {
    message.reply(language.BOT_PLAYSONG_FAIL)
  }
};

Bot.prototype.playbackCompletion = async function(message) {
  await this.conn.disconnect();
  await this.voiceChannel.leave();
  this.isPlaying = false;
  this.termine = false;
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

module.exports = Bot;