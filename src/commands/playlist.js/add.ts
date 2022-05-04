import { Client, Message } from "discord.js";
import { Bot, BotSong, youtubeURLToMusic } from "../../app/bot";

const ytdl = require('ytdl-core');
const fs = require('fs');

module.exports = {
	name : 'add',
	command : {
		usage : '<playlist> <music name>',
		description : 'Add a music to the given playlist.',
		process : async function(bot: Bot, client: Client, message: Message, args: string[]) {
				if(args.length < 2) {
						message.reply(bot.language.ERROR_NOT_ENOUGHT_ARG);
						return ;
				}
				let nomMusique = args[1];
				args.slice(2).forEach(function(iter){
						nomMusique = nomMusique +' ' + iter;
				});

				let nomFichier = bot.config.dossier_playlists+args[0]+'.playlist';
				if(!fs.existsSync(nomFichier)) {
						message.reply(bot.language.PLAYLIST_UNKNOW);
				} else {
					if(ytdl.validateURL(nomMusique)) {
						let musique: BotSong = await youtubeURLToMusic(nomMusique)
						bot.addPlaylist(args[0], musique, message);
					} else {
						//bot.findOneSongOnPlex(nomMusique)
						let musique = await bot.findOneSongOnPlex(nomMusique);
						/*let res = await bot.findTracksOnPlex(nomMusique, 0, 10);
						let liste = res.MediaContainer.Metadata;
						let taille = res.MediaContainer.size;
						if (taille < 1) {
								await message.reply(bot.language.BOT_FIND_SONG_ERROR);
								throw new Error("Song was not found.");
						}
						if (taille > 1) {
								let messageLines = '\n';
								bot.tracks = res.MediaContainer.Metadata;
								bot.plexQuery = nomMusique; // set query for !nextpage
								bot.plexOffset = taille; // set paging
								bot.botPlaylist = args[0];
								let artist;
								for (let t = 0; t < bot.tracks.length; t++) {
										if ('originalTitle' in bot.tracks[t]) {
												artist = bot.tracks[t].originalTitle;
										}
										else {
												artist = bot.tracks[t].grandparentTitle;
										}
										messageLines += bot.language.BOT_FIND_SONG_INFO_MUSIC.format({index : t+1, artist : artist, title : bot.tracks[t].title}) + '\n';
								}
								messageLines += bot.language.PLAYLIST_ADD_INFO.format({caracteres_commande : bot.config.caracteres_commande});
								message.reply(messageLines);
								return ;
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
						let musique = {
								query : nomMusique,
								artiste : artist,
								titre : title,
								cle : key
						};*/
						bot.addPlaylist(args[0], musique, message);
					}
			}
		}
	}
};
