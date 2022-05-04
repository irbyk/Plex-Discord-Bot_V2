import { Client, Message } from "discord.js";
import { Bot } from "../../app/bot";
import fs from "fs/promises";

module.exports = {
  name : 'delete',
  command : {
    usage : '<playlist> <index>',
    description : 'remove one song from the given playlist (type !playlist print <playlist> to get the index).',
    process : async function(bot: Bot, client: Client, message: Message, args: string[]) {
        if(args.length < 2) {
            message.reply(bot.language.ERROR_NOT_ENOUGHT_ARG);
            return ;
        }
        if(args.length > 2) {
            message.reply(bot.language.ERROR_TOO_MANY_ARGS);
            return ;
        }
        let nomFichier = bot.config.dossier_playlists+args[0]+'.playlist';
        let indice = parseInt(args[1]);
        indice = indice - 1;
        try {
            const data = await fs.readFile(nomFichier, 'utf8');
            let playlist = JSON.parse(data); 
            let musique = playlist.musiques.splice(indice,1);
            let json = JSON.stringify(playlist);
            try {
                fs.writeFile(nomFichier, json, 'utf8');
            } catch (err) {
                await message.reply(bot.language.WRITTING_PLAYLIST_ERROR);
                throw err;
            }
            await message.reply(bot.language.PLAYLIST_DELETE_SUCCES.format({title: musique[0].titre, artist : musique[0].artiste, playlist_name : playlist.nom}));
        } catch (err){
            await message.reply(bot.language.OPEN_PLAYLIST_ERROR);
            throw err;
        }
    }
  }
};
