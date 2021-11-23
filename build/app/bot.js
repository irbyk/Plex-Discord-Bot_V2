'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
const fs_1 = __importDefault(require("fs"));
const events_1 = __importDefault(require("events"));
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const xml2js_1 = __importDefault(require("xml2js"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const stream_1 = require("stream");
const plex_1 = require("../utils/plex");
const voice_1 = require("@discordjs/voice");
//import config from '../../config/config.json'
// Bot module ------------------------------------------------------------------
// const EventEmitter = require('events');
// const PlexAPI = require('plex-api');
// const fs = require('fs');
// const ytdl = require('ytdl-core');
const config = require('../../config/config');
// const xml2json = require('xml2js');
// const fetch = require('node-fetch');
// const { Readable } = require('stream');
const language = require('../../' + config.language);
// plex constants ------------------------------------------------------------
const plexConfig = require('../../config/plex');
const PLEX_PLAY_START = (plexConfig.https ? 'https://' : 'http://') + plexConfig.hostname + ':' + plexConfig.port;
const PLEX_PLAY_END = '?X-Plex-Token=' + plexConfig.token;
function getRandomNumber(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
/**
 *
*/
function trackToSong(track) {
    const key = track.Media[0].Part[0].key;
    let artist = '';
    const title = track.title;
    if ('originalTitle' in track) {
        artist = track.originalTitle;
    }
    else {
        artist = track.grandparentTitle;
    }
    const album = track.parentTitle;
    return {
        artist: artist,
        title: title,
        key: key,
        album: album,
        url: '',
        origin: 'Plex'
    };
}
;
class Bot extends events_1.default {
    constructor(client) {
        super();
        this.client = client;
        // plex config ---------------------------------------------------------------
        this.language = language;
        this.config = config;
        // plex client ---------------------------------------------------------------
        this.plex = new plex_1.PlexAPI({
            hostname: plexConfig.hostname,
            port: plexConfig.port,
            token: plexConfig.token,
            https: plexConfig.https,
            options: {
                identifier: plexConfig.options.identifier,
                product: plexConfig.options.product,
                version: plexConfig.options.version,
                deviceName: plexConfig.options.deviceName,
                platform: plexConfig.options.platform,
                device: plexConfig.options.device
            }
        });
        // plex variables ------------------------------------------------------------
        this.tracks = [];
        this.plexQuery = "";
        this.plexOffset = 0; // default offset of 0
        this.plexPageSize = 10; // default result size of 10
        this.isPlaying = false;
        this.isPaused = false;
        this.songQueue = []; // will be used for queueing songs
        this.volume = 0.2;
        // plex vars for playing audio -----------------------------------------------
        this.audioPlayer = (0, voice_1.createAudioPlayer)();
        ;
        this.voiceChannel = undefined;
        this.cache_library = {};
        this.workingTask = 0;
        this.waitForStart = false;
        this.waitForStartMessage = undefined;
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
        if (this.workingTask == 0 && this.waitForStart) {
            this.waitForStart = false;
            if (this.waitForStartMessage != undefined)
                this.playSong(this.waitForStartMessage);
        }
    }
    async findRandomTracksOnPlex(message) {
        if (Object.keys(this.cache_library).length == 0) {
            await this.loadLibrary();
        }
        const nombre = getRandomNumber(Object.keys(this.cache_library).length);
        const res = await this.plex.query('/library/sections/' + this.cache_library[Object.keys(this.cache_library)[nombre]].key + '/all?type=10');
        const nombre2 = getRandomNumber(res.MediaContainer.Metadata.length);
        const song = trackToSong(res.MediaContainer.Metadata[nombre2]);
        this.songQueue.push(song);
        if (!this.isPlaying) {
            this.playSong(message);
        }
        else {
            message.reply(language.BOT_ADDTOQUEUE_SUCCES.format({ artist: song.artist, title: song.title }));
        }
    }
    /**
     * Find song when provided with query string, offset, pagesize, and message
     */
    async findTracksOnPlex(query, offset, pageSize, type = 10) {
        const queryHTTP = encodeURI(query);
        return await this.plex.query('/search/?type=' + type + '&query=' + queryHTTP + '&X-Plex-Container-Start=' + offset + '&X-Plex-Container-Size=' + pageSize);
    }
    /**
     *
     */
    async loadMood(id) {
        const res = await this.plex.query('/library/sections/' + id + '/mood?type=10');
        const moods = {};
        if (res.MediaContainer.Directory) {
            for (let mood of res.MediaContainer.Directory) {
                moods[mood.title] = {
                    name: mood.title,
                    key: mood.key,
                    id: id,
                    url: '/library/sections/' + id + '/all?type=10&mood=' + mood.key
                };
            }
        }
        return (Object.keys(moods).length === 0 && moods.constructor == Object ? undefined : moods);
    }
    /**
     *
     */
    async loadLibrary(id = -1) {
        try {
            if (id == -1) {
                this.cache_library = {};
                const res = await this.plex.query('/library/sections');
                for (let library of res.MediaContainer.Directory) {
                    if (library.type == 'artist') {
                        this.cache_library[library.key] = { name: library.title, key: library.key, mood: await this.loadMood(library.key) };
                        this.emit('libraryAdded', this.cache_library[library.key]);
                    }
                }
            }
            else {
                const res = await this.plex.query('/library/sections/' + id);
                if (!res.MediaContainer.title1) {
                    this.emit('loadLibraryError', { key: id, err: new Error('Key doesn\'t exist.') });
                    return;
                }
                this.cache_library[id] = { name: res.MediaContainer.title1, key: id, mood: await this.loadMood(id) };
                this.emit('libraryAdded', this.cache_library[id]);
            }
        }
        catch (err) {
            this.emit('loadLibraryError', { key: id, err: err });
        }
    }
    async removeLibrary(id = -1) {
        if (id == -1) {
            ;
        }
        else {
            const library = this.cache_library[id];
            delete this.cache_library[id];
            this.emit('libraryRemoved', library);
        }
    }
    /**
     *
     */
    async findArtist(name, message) {
        // Artist : type = 8
        const resArtist = await this.findTracksOnPlex(name, 0, 10, 8);
        const resAlbums = await this.plex.query(resArtist.MediaContainer.Metadata[0].key);
        for (let album of resAlbums.MediaContainer.Metadata) {
            const resTracks = await this.plex.query(album.key);
            for (let track of resTracks.MediaContainer.Metadata) {
                const song = trackToSong(track);
                this.songQueue.push(song);
            }
        }
        message.reply('add ' + name + '\'s albums to the queue.');
        if (!this.isPlaying) {
            this.playSong(message);
        }
    }
    /**
     *
     */
    async playOneMood(moodName, message) {
        if (Object.keys(this.cache_library).length == 0) {
            await this.loadLibrary();
        }
        const musics = [];
        for (let library of Object.values(this.cache_library)) {
            if (library.mood[moodName]) {
                const res = await this.plex.query(library.mood[moodName].url);
                for (let track of res.MediaContainer.Metadata) {
                    musics.push(trackToSong(track));
                }
            }
        }
        if (musics.length > 0) {
            const musicChosen = musics[Math.floor(Math.random() * Math.floor(musics.length))];
            this.songQueue.push(musicChosen);
            if (!this.isPlaying) {
                this.playSong(message);
            }
            else {
                message.reply(language.BOT_ADDTOQUEUE_SUCCES.format({ artist: musicChosen.artist, title: musicChosen.title }));
            }
        }
        else {
            message.reply('I cannot find the mood you\'re looking for :cry:.');
            throw 'mood missing';
        }
    }
    /**
     *
     */
    async findOneSongOnPlex(query) {
        const res = await this.findTracksOnPlex(query, 0, 1, 10);
        const liste = res.MediaContainer.Metadata;
        const taille = res.MediaContainer.size;
        if (taille < 1) {
            throw new Error('The song was not found.');
        }
        return trackToSong(liste[0]);
    }
    ;
    /**
     *
     */
    async findPlaylist(query, message, random) {
        const res = await this.findTracksOnPlex(query, 0, 10, 15);
        const key = res.MediaContainer.Metadata[0].key;
        const url = PLEX_PLAY_START + key + PLEX_PLAY_END;
        this.loadPlaylist(url, message, random);
    }
    /**
     *
     */
    async loadPlaylist(url, message, random = false) {
        let body = await (await (0, node_fetch_1.default)(url)).text();
        // request(url, (err, res, body) => {
        xml2js_1.default.parseString(body, {}, (err, jsonObj) => {
            const tracks = jsonObj.MediaContainer.Track;
            const resultSize = jsonObj.MediaContainer.$.size;
            for (let i = 0; i < resultSize; i++) {
                /*const track = tracks[i].$
                const key = tracks[i].Media[0].Part[0].$.key;
                const title = track.title;
                let artist = '';
                if ('originalTitle' in track) {
                    artist = track.originalTitle;
                }
                else {
                    artist = track.grandparentTitle;
                }*/
                let song = trackToSong(tracks[i]);
                this.songQueue.push(song);
            }
            if (random) {
                let h = 0;
                if (this.isPlaying)
                    h = 1;
                for (let i = h; i < this.songQueue.length; i++) {
                    const j = getRandomNumber(this.songQueue.length - 1) + h;
                    const inter = this.songQueue[j];
                    this.songQueue[j] = this.songQueue[i];
                    this.songQueue[i] = inter;
                }
            }
            if (!this.isPlaying) {
                this.playSong(message);
            }
        });
        // });
    }
    /**
     *
     */
    async findAlbum(query, message) {
        // Album : type = 9
        const res = await this.findTracksOnPlex(query, 0, 10, 9);
        try {
            let key = res.MediaContainer.Metadata[0].key;
            let url = PLEX_PLAY_START + key + PLEX_PLAY_END;
            await this.loadAlbum(url, message);
        }
        catch (err) {
            throw new Error('The album was not found.');
        }
    }
    /**
     *
     */
    async loadAlbum(url, message) {
        let body = await (await (0, node_fetch_1.default)(url)).text();
        xml2js_1.default.parseString(body, {}, (err, jsonObj) => {
            const tracks = jsonObj.MediaContainer.Track;
            const resultSize = jsonObj.MediaContainer.$.size;
            for (let i = 0; i < resultSize; i++) {
                /*const track = tracks[i].$
                const key = tracks[i].Media[0].Part[0].$.key;
                const title = track.title;
                let artist = '';
                if ('originalTitle' in track) {
                    artist = track.originalTitle;
                }
                else {
                    artist = track.grandparentTitle;
                }*/
                let song = trackToSong(tracks[i]);
                this.songQueue.push(song);
            }
            if (!this.isPlaying) {
                this.playSong(message);
            }
        });
    }
    /**
     *
     */
    async findSong(query, offset, pageSize, message) {
        try {
            const res = await this.findTracksOnPlex(query, offset, pageSize);
            this.tracks = res.MediaContainer.Metadata;
            const resultSize = res.MediaContainer.size;
            this.plexQuery = query; // set query for !nextpage
            this.plexOffset = this.plexOffset + resultSize; // set paging
            let messageLines = '\n';
            let artist = '';
            if (resultSize == 1 && offset == 0) {
                // songKey = 0;
                // add song to queue
                this.addToQueue(0, this.tracks, message);
            }
            else if (resultSize > 1) {
                for (let t = 0; t < this.tracks.length; t++) {
                    if ('originalTitle' in this.tracks[t]) {
                        artist = this.tracks[t].originalTitle;
                    }
                    else {
                        artist = this.tracks[t].grandparentTitle;
                    }
                    messageLines += language.BOT_FIND_SONG_INFO_MUSIC.format({ index: t + 1, artist: artist, title: this.tracks[t].title }) + '\n';
                }
                messageLines += language.BOT_FIND_SONG_INFO.format({ caracteres_commande: this.config.caracteres_commande });
                message.reply(messageLines);
            }
            else {
                message.reply(language.BOT_FIND_SONG_ERROR);
            }
        }
        catch (err) {
            console.error(err);
        }
        ;
    }
    /**
     *
     */
    addToQueue(songNumber, tracks, message) {
        if (songNumber > -1) {
            /*let key = tracks[songNumber].Media[0].Part[0].key;
            let artist = '';
            let title = tracks[songNumber].title;
            if ('originalTitle' in tracks[songNumber]) {
                artist = tracks[songNumber].originalTitle;
            }
            else {
                artist = tracks[songNumber].grandparentTitle;
            }*/
            let song = trackToSong(tracks[songNumber]);
            this.songQueue.push(song);
            if (!this.isPlaying) {
                this.playSong(message);
            }
            else {
                message.reply(language.BOT_ADDTOQUEUE_SUCCES.format({ artist: song.artist, title: song.title }));
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
        if (this.isPlaying) {
            console.log('pouet');
            return;
        }
        if (this.connection === undefined) {
            this.connection = (0, voice_1.joinVoiceChannel)({
                channelId: message.member.voice.channelId,
                guildId: message.member.voice.channel.guild.id,
                adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator
            });
            this.audioPlayer = (0, voice_1.createAudioPlayer)();
            this.connection.subscribe(this.audioPlayer);
            this.voiceChannel = message.member.voice.channel;
        }
        if (this.voiceChannel) {
            this.emit('will play', message);
            if (this.workingTask > 0) {
                this.isPlaying = true;
                this.waitForStart = true;
                this.waitForStartMessage = message;
            }
            else {
                let readstream;
                if (this.songQueue[0].key) {
                    const urlPlex = PLEX_PLAY_START + this.songQueue[0].key + PLEX_PLAY_END;
                    let response = await (0, node_fetch_1.default)(urlPlex);
                    readstream = stream_1.Readable.from(response.body, { highWaterMark: 1 << 32 });
                }
                else {
                    readstream = (0, ytdl_core_1.default)(this.songQueue[0].url, { filter: 'audioonly', quality: 'lowestaudio', highWaterMark: 1 << 25 }); //lowestaudio highestaudio
                }
                this.isPlaying = true;
                // Arrow fuction to be played after a song is finished.
                let dispatcherFunc = () => {
                    if (this.songQueue.length > 0) {
                        if (this.songQueue[0].replay) {
                            this.songQueue[0].played = true;
                            this.playSong(message);
                        }
                        else {
                            this.songQueue.shift();
                            if (this.songQueue.length > 0) {
                                this.isPlaying = false;
                                this.playSong(message);
                            }
                            // no songs left in queue, continue with playback completion events
                            else {
                                this.isPlaying = false;
                                this.emit('finish', message);
                                this.playbackCompletion();
                            }
                        }
                    }
                    else {
                        this.isPlaying = false;
                        this.emit('finish', message);
                        this.playbackCompletion();
                    }
                };
                let resource = (0, voice_1.createAudioResource)(readstream);
                this.audioPlayer.play(resource);
                console.log(this.audioPlayer.eventNames());
                /*this.dispatcher = connection.play(readstream, {highWaterMark: 200000000}).on('finish', dispatcherFunc).on('start', () => {
                +		if(!this.songQueue[0].played) {
                            let embedObj = this.songToEmbedObject(this.songQueue[0]);
                            message.channel.send(language.BOT_PLAYSONG_SUCCES, embedObj);
                        }
                }).on('error', (err: string) => console.log(err));
                this.dispatcher.setVolume(this.volume);*/
            }
        }
        else {
            message.reply(language.BOT_PLAYSONG_FAIL);
        }
    }
    /**
     *
     */
    songToEmbedObject(song) {
        const embedObj = {
            embed: {
                color: 4251856,
                fields: [
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
                    text: language.NUMBER_MUSIC_IN_QUEUE.format({ number: this.songQueue.length, plurial: (this.songQueue.length > 1 ? 's' : '') })
                },
            }
        };
        return embedObj;
    }
    /**
     *
     */
    async playbackCompletion() {
        if (!this.isPlaying) {
            if (this.connection) {
                await this.connection.destroy();
            }
        }
    }
    /**
     *
     */
    async ajoutPlaylist(nomPlaylist, song, message) {
        const nomFichier = this.config.dossier_playlists + nomPlaylist + '.playlist';
        try {
            let data = await fs_1.default.promises.readFile(nomFichier, 'utf8');
            const playlist = JSON.parse(data);
            playlist.musiques.push(song);
            const json = JSON.stringify(playlist);
            try {
                fs_1.default.promises.writeFile(nomFichier, json, 'utf8');
                message.reply(language.ADD_SONG_TO_PLAYLIST_SUCCES.format({ title: song.title, artist: song.artist, playlist_name: playlist.nom }));
            }
            catch (err) {
                await message.reply(language.WRITTING_PLAYLIST_ERROR);
                throw err;
            }
        }
        catch (err) {
            await message.reply(language.OPEN_PLAYLIST_ERROR);
            throw err;
        }
    }
    /**
     *
     */
    async destroy() {
        await this.playbackCompletion();
    }
    /**
     *
     */
    async getLibrariesList() {
        const res = await this.plex.query('/library/sections');
        const retour = [];
        for (let library of res.MediaContainer.Directory) {
            if (library.type == 'artist') {
                retour.push({ name: library.title, key: library.key, mood: await this.loadMood(library.key) });
            }
        }
        return retour;
    }
}
exports.Bot = Bot;
;
async function youtubeURLToMusic(youtubeURL) {
    const songInfo = await ytdl_core_1.default.getInfo(youtubeURL);
    return { 'artist': songInfo.videoDetails.author.name, 'title': songInfo.videoDetails.title, 'url': songInfo.videoDetails.video_url };
}
//# sourceMappingURL=bot.js.map