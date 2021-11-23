let uriResolvers: { [id: string]: Function} = {
    "directory": function directory(parentUrl: any, dir: any) {
        addDirectoryUriProperty(parentUrl, dir);
    },

    "server": function server(parentUrl: any, srv: any) {
        addServerUriProperty(srv);
    },
};

function addServerUriProperty(server: any) {
    server.uri = '/system/players/' + server.address;
}

function addDirectoryUriProperty(parentUrl: any, directory: any) {
    if (parentUrl[parentUrl.length - 1] !== '/') {
        parentUrl += '/';
    }
    if (directory.key[0] === '/') {
        parentUrl = '';
    }
    directory.uri = parentUrl + directory.key;
}

export function attach(parentUrl: any) {
    return function resolveAndAttachUris(result: any) {
        let children = result._children || [];

        children.forEach(function (child: any) {
            let childType: string = child._elementType.toLowerCase();
            let resolver = uriResolvers[childType];

            if (resolver) {
                resolver(parentUrl, child);
            }
        });

        return result;
    };
};