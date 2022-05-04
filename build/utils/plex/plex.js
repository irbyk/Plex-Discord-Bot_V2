"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plex = exports.PlexType = void 0;
const plexAPI_1 = require("./plexAPI");
var PlexType;
(function (PlexType) {
    PlexType[PlexType["SONG"] = 10] = "SONG";
    PlexType[PlexType["ARTIST"] = 8] = "ARTIST";
})(PlexType = exports.PlexType || (exports.PlexType = {}));
class Plex extends plexAPI_1.PlexAPI {
    constructor(options) {
        super(options);
        this.offset = 0;
        this.pageSize = 100;
    }
    async sendQuery(query, type) {
        const queryHTTP = encodeURI(query);
        return await this.query('/search/?type=' + type + '&query=' + queryHTTP + '&X-Plex-Container-Start=' + this.offset + '&X-Plex-Container-Size=' + this.pageSize);
    }
    async getTracksFromName(name) {
        const res = await this.sendQuery(name, PlexType.SONG);
        console.dir(res.MediaContainer.Directory);
        return [];
    }
    async getSongsFromName(name) {
        return [];
    }
}
exports.Plex = Plex;
//# sourceMappingURL=plex.js.map