'use strict';
// Bot module ------------------------------------------------------------------
const EventEmitter = require('events');
const PlexAPI = require('plex-api');
const fs = require('fs');
const ytdl = require('ytdl-core');
const config = require('../config/config');
const xml2json = require('xml2js');
const request = require('request');
const language = require('../'+config.language);
	// plex constants ------------------------------------------------------------
const plexConfig = require('../config/plex');
const PLEX_PLAY_START = (plexConfig.https ? 'https://' : 'http://') + plexConfig.hostname + ':' + plexConfig.port;
const PLEX_PLAY_END = '?X-Plex-Token=' + plexConfig.token;

class Bot extends EventEmitter{
		constructor(client){
				super();
				this.client = client;

				// plex config ---------------------------------------------------------------
				this.language = language;
				this.config = config;

				// plex client ---------------------------------------------------------------
				this.plex = new PlexAPI({
                                            hostname: plexConfig.hostname,
                                            port: plexConfig.port,
                                            token: plexConfig.token,
											https: plexConfig.https,
                                            options: {
                                            	identifier: plexConfig.options.identifier,
                                            	product: plexConfig.options.product,
                                            	version: plexConfig.options.version,
												iceName: plexConfig.options.deviceName,
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
	/**
	 * Work like a simple semaphore to avoid conflict while playing song.
	 */
	beginWorking() {
		this.workingTask++;
	}

	/**
	 *
	 */
	endWorking() {
		this.workingTask--;
		if(this.workingTask == 0 && this.waitForStart) {
			this.waitForStart = false;
			this.playSong(this.waitForStartMessage);
		}
	}

	getRandomNumber(max) {
		return Math.floor(Math.random() * Math.floor(max));
	}

	async findRandomTracksOnPlex(message) {
		if(Object.keys(this.cache_library).length == 0){
			await this.loadLibrary();
		}
		let nombre = this.getRandomNumber(Object.keys(this.cache_library).length);
		let res = await this.plex.query('/library/sections/' + this.cache_library[Object.keys(this.cache_library)[nombre]].key + '/all?type=10');
		let nombre2 = this.getRandomNumber(res.MediaContainer.Metadata.length);
		let music = this.trackToMusic(res.MediaContainer.Metadata[nombre2]);
		this.songQueue.push(music);
		if(!this.isPlaying){
			this.playSong(message);
		} else {
			message.reply(language.BOT_ADDTOQUEUE_SUCCES.format({artist : music.artist, title : music.title}));
		}
	}

	/**
	 * Find song when provided with query string, offset, pagesize, and message
	 */
	async findTracksOnPlex(query, offset, pageSize, type = 10) {
		let queryHTTP = encodeURI(query);
		return await this.plex.query('/search/?type=' + type + '&query=' + queryHTTP + '&X-Plex-Container-Start=' + offset + '&X-Plex-Container-Size=' + pageSize);
	}

	/**
	 *
	 */
	async loadMood(id) {
		let res = await this.plex.query('/library/sections/' + id + '/mood?type=10');
		let moods = {};
		if(res.MediaContainer.Directory) {
			for(let mood of res.MediaContainer.Directory) {
				moods[mood.title] = {name: mood.title, key : mood.key, url : '/library/sections/' + id + '/all?type=10&mood=' + mood.key};
			}
		}
		return (Object.keys(moods).length === 0 && moods.constructor == Object ? undefined : moods);
	}

	/**
	 *
	 */
	async loadLibrary(id=-1) {
		try {
			if(id == -1) {
			this.cache_library = {};
			let res = await this.plex.query('/library/sections');
			for(let library of res.MediaContainer.Directory){
				if(library.type == 'artist'){
					this.cache_library[library.key] = {name: library.title, key : library.key, mood : await this.loadMood(library.key)};
					this.emit('libraryAdded', this.cache_library[library.key]);
				}
			}
			
		} else {
			let res = await this.plex.query('/library/sections/' + id);
			if(!res.MediaContainer.title1) {
				this.emit('loadLibraryError', {key: id, err: new Error('Key doesn\'t exist.')});
				return;
			}
			this.cache_library[id] = {name: res.MediaContainer.title1, key: id, mood: await this.loadMood(id)};
			this.emit('libraryAdded', this.cache_library[id]);
		}
		} catch(err) {
			this.emit('loadLibraryError', {key: id, err: err});
		}
	}

	async removeLibrary(id=-1) {
		if(id == -1) {
			;
		} else {
			let list = Object.entries(this.cache_library);
			let library = this.cache_library[id];
			delete this.cache_library[id];
			this.emit('libraryRemoved', library);
		}
	}

	/**
	 *
	 */
	async findArtist(name, message) {
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

	/**
	 *
	 */
	async playOneMood(moodName, message){
		if(Object.keys(this.cache_library).length == 0){
			await this.loadLibrary();
		}
		let musics = [];
		for (let library of Object.values(this.cache_library)){
			if(library.mood[moodName]) {
				let res = await this.plex.query(library.mood[moodName].url)
				for(let track of res.MediaContainer.Metadata){
					musics.push(this.trackToMusic(track));
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

	
	/**
	 *
	 */
	trackToMusic(track) {
		let key = track.Media[0].Part[0].key;
		let artist = '';
		let title = track.title;
		if ('originalTitle' in track) {
			artist = track.originalTitle;
		}
		else {
			artist = track.grandparentTitle;
		}
		let album = track.parentTitle;
		return {'artist' : artist, 'title': title, 'key': key, 'album': album};
	};

	/**
	 *
	 */
	async findOneSongOnPlex(query) {
		let res = await this.findTracksOnPlex(query, 0, 1, 10);
		
		let liste = res.MediaContainer.Metadata;
		let taille = res.MediaContainer.size;
		if (taille < 1) {
				throw "La musique n'a pas été trouvée.";
		}
		return this.trackToMusic(liste[0]);
	};

	/**
	 *
	 */
	findPlaylist(query, message, random) {
		let self = this;
		self.findTracksOnPlex(query, 0, 10, 15).then(function(res) {
			let key = res.MediaContainer.Metadata[0].key;
			let url = PLEX_PLAY_START + key + PLEX_PLAY_END;
			self.loadPlaylist(url, message, random);
		});
	}

	/**
	 *
	 */
	loadPlaylist(url, message, random=false) {
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

				if (random) {
					let h = 0;
					if (this.isPlaying)
						h = 1;
					
					for(let i = h; i < self.songQueue.length; i++) {
						let j = this.getRandomNumber(self.songQueue.length -1) + h;
						let inter = self.songQueue[j];
						self.songQueue[j] = self.songQueue[i];
						self.songQueue[i] = inter;
					}
				}

				if(!this.isPlaying) {
					this.playSong(message);
				}
			});
		});
	}

	/**
	 *
	 */
	findAlbum(query, message) {
		let self = this;
		// Album : type = 9
		self.findTracksOnPlex(query, 0, 10, 9).then(function(res) {
			let key = res.MediaContainer.Metadata[0].key;
			let url = PLEX_PLAY_START + key + PLEX_PLAY_END;
			self.loadAlbum(url, message);
		});
	}

	/**
	 *
	 */
	loadAlbum(url, message) {
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
				if(!this.isPlaying) {
					this.playSong(message);
				}
			});
		});
	}

	/**
	 *
	 */
	findSong(query, offset, pageSize, message) {
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
			console.error(err);
		});
	}

	/**
	 *
	 */
	addToQueue(songNumber, tracks, message) {
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
	}

	/**
	 *
	 */
	async playSong(message) {		
		
		if (this.voiceChannel == null)
			this.voiceChannel = message.member.voice.channel;

		if (this.voiceChannel) {
			this.emit('will play', message);
			if(this.workingTask > 0){
			this.isPlaying = true;
			this.waitForStart = true;
			this.waitForStartMessage = message;
			
			} else {
				this.voiceChannel.join().then(function(connection) {
					this.conn = connection;
					
					let url;
					if(this.songQueue[0].key) {
						url = PLEX_PLAY_START + this.songQueue[0].key + PLEX_PLAY_END;
					} else {
						url = ytdl(this.songQueue[0].url, { quality: 'highestaudio' });
					}
					this.isPlaying = true;

					let self = this;
					let dispatcherFunc = function() {
						
						if (self.songQueue.length > 0) {
							if(self.songQueue[0].replay) {
								self.songQueue[0].played = true;
								self.playSong(message);
							} else {
								self.songQueue.shift();
								if (self.songQueue.length > 0) {
									self.playSong(message);
								}
								// no songs left in queue, continue with playback completion events
								else {
									self.isPlaying = false;
									self.emit('finish', message);
									self.playbackCompletion(message);
								}
							}
						} else {
							self.isPlaying = false;
							self.emit('finish', message);
							self.playbackCompletion(message);
						}
					};
					
					this.dispatcher = connection.play(url).on('finish', dispatcherFunc).on('start', () => {
							if(!this.songQueue[0].played) {
								var embedObj = this.songToEmbedObject(this.songQueue[0]);
								message.channel.send(language.BOT_PLAYSONG_SUCCES, embedObj);
							}
					});
					this.dispatcher.setVolume(this.volume);
				});
			}
		} else {
				message.reply(language.BOT_PLAYSONG_FAIL)
		}
	}

	/**
	 *
	 */
	songToEmbedObject(song) {
		var embedObj = {
			embed: {
				color: 4251856,
				fields:
				[
					{
						name: language.ARTIST,
						value: song.artist,
						inline: true
					},
					{
						name: language.TITLE,
						value: song.title,
						inline: true
					}
				],
				footer: {
					text: language.NUMBER_MUSIC_IN_QUEUE.format({number : this.songQueue.length, plurial : (this.songQueue.length > 1 ? 's' : '')})
				},
			}
		};
		return embedObj;
	}

	/**
	 *
	 */
	async playbackCompletion(message) {
		if(!this.isPlaying) {
			if(this.conn){
					await this.conn.disconnect();
			}
			if(this.voiceChannel) {
					await this.voiceChannel.leave();
					this.voiceChannel = null;
			}
		}
	}

	/**
	 *
	 */
	async ajoutPlaylist(nomPlaylist, musique, message) {
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
	}

	/**
	 *
	 */
	async destroy(){
		await this.playbackCompletion(null);
	}

	/**
	 *
	 */
	async getLibrariesList() {
		let res = await this.plex.query('/library/sections');
		let retour = [];
		for(let library of res.MediaContainer.Directory){
			if(library.type == 'artist'){
				retour.push({name: library.title, key: library.key, mood : await this.loadMood(library.key)});
			}
		}
		return retour;
	}
};

async function youtubeURLToMusic(youtubeURL) {
	let songInfo = await ytdl.getInfo(query);
	return {'artist' : songInfo.videoDetails.author.name , 'title': songInfo.videoDetails.title, 'url': songInfo.videoDetails.video_url};
}

module.exports = Bot;
