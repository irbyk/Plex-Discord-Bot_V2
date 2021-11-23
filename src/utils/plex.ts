import os from 'os';
import uuid from 'uuid';
import url from 'url';
import xml2js from 'xml2js';
import { attach } from './uri';
import fetch from 'node-fetch';
// var os = require('os');
// var uuid = require('uuid');
// var url = require('url');
// var xml2js = require('xml2js');
const headers = require('plex-api-headers');
const extend = require('util')._extend;

// var uri = require('./uri');

const PLEX_SERVER_PORT = 32400;




export interface PlexAPIConfig {
	hostname	: string;
	port	: number;
	token	: string;
	https: boolean;
	requestOptions?: string;
	timeout?: string;
	authenticator?: string;
	options	: PlexAPIOptions;
}

export interface PlexAPIOptions {
	identifier?	: string;
	product?	: string;
	version?	: string;
	deviceName?	: string;
	platform?	: string;
	device?	: string;
	platformVersion?: string;
}

interface Part {
	key: string;
}

interface Media {
	Part: Part[];
}

export interface Track {
	Media: Media[];
	title: string;
	originalTitle: string;
	grandparentTitle: string;
	parentTitle: string;

}

export interface Mood {
	name: string;
	key: string;
	url: string;
	id: number;
}


interface QueryOption {
	uri: string;
	method: string;
	parseResponse: boolean;
}

export class PlexAPI {

	private hostname: string;
	private port: number;
	private https: boolean;
	private requestOptions?: any;
	private timeout?: string;
	private managedUser?: string;
	private authToken: string;
	private options: PlexAPIOptions;
	private serverUrl: string;


	constructor(options: PlexAPIConfig) {
		let opts = options;
		let hostname = typeof options === 'string' ? options : options.hostname;

		this.hostname = hostname;
		this.port = opts.port || PLEX_SERVER_PORT;
		this.https = opts.https;
		this.requestOptions = opts.requestOptions || {};
		this.timeout = opts.timeout;
		this.authToken = opts.token;
		this.options = opts.options || {};
		this.options.identifier = this.options.identifier || uuid.v4();
		this.options.product = this.options.product || 'Node.js App';
		this.options.version = this.options.version || '1.0';
		this.options.device = this.options.device || os.platform();
		this.options.deviceName = this.options.deviceName || 'Node.js App';
		this.options.platform = this.options.platform || 'Node.js';
		this.options.platformVersion = this.options.platformVersion || process.version;

		if (typeof this.hostname !== 'string') {
			throw new TypeError('Invalid Plex Server hostname');
		}

		this.serverUrl = hostname + ':' + this.port;
	}

	public getHostname() {
		return this.hostname;
	};

	public getPort() {
		return this.port;
	};

	public getIdentifier() {
		return this.options.identifier;
	};

	public query(option: QueryOption | string) {
		let options: QueryOption = (typeof option === 'string')? { 
			uri: option,
			method: 'GET',
			parseResponse: true
		 }: option;

		if (options.uri === undefined) {
			throw new TypeError('Requires uri parameter');
		}
		return this._request(options).then(attach(options.uri));
	};

	public postQuery(options: any) {
		if (typeof options === 'string') {
			// Support old method of only supplying a single `url` parameter
			options = { uri: options };
		}
		if (options.uri === undefined) {
			throw new TypeError('Requires uri parameter');
		}
	
		options.method = 'POST';
		options.parseResponse = true;
	
		return this._request(options).then(attach(url));
	};

	public putQuery(options: any) {
		if (typeof options === 'string') {
			// Support old method of only supplying a single `url` parameter
			options = { uri: options };
		}
		if (options.uri === undefined) {
			throw new TypeError('Requires uri parameter');
		}
	
		options.method = 'PUT';
		options.parseResponse = true;
	
		return this._request(options).then(attach(url));
	};

	public deleteQuery(options: any) {
		if (typeof options === 'string') {
			// Support old method of only supplying a single `url` parameter
			options = { uri: options };
		}
		if (options.uri === undefined) {
			throw new TypeError('Requires uri parameter');
		}
	
		options.method = 'DELETE';
		options.parseResponse = false;
	
		return this._request(options);
	};

	public perform(options: any) {
		if (typeof options === 'string') {
			// Support old method of only supplying a single `url` parameter
			options = { uri: options };
		}
		if (options.uri === undefined) {
			throw new TypeError('Requires uri parameter');
		}
	
		options.method = 'GET';
		options.parseResponse = false;
	
		return this._request(options);
	};

	public find(options: any, criterias: any) {
		if (typeof options === 'string') {
			// Support old method of only supplying a single `url` parameter
			options = { uri: options };
		}
		if (options.uri === undefined) {
			throw new TypeError('Requires uri parameter');
		}
	
		return this.query(options).then(function (result) {
			let children = result._children || result.MediaContainer.Server;
			return filterChildrenByCriterias(children, criterias);
		});
	};

	public _request(options: any) {
		let reqUrl = this._generateRelativeUrl(options.uri);
		let method = options.method;
		let timeout = this.timeout;
		let parseResponse = options.parseResponse;
		let extraHeaders = options.extraHeaders || {};
		let self = this;
	
		let requestHeaders = headers(
			this,
			extend(
				{
					Accept: 'application/json',
					'X-Plex-Token': this.authToken,
				},
				extraHeaders
			)
		);
		let reqOpts = {
			uri: new url.URL(reqUrl),
			encoding: null,
			method: method || 'GET',
			timeout: timeout,
			gzip: true,
			headers: requestHeaders,
			...this.requestOptions,
		};
		return new Promise(async (resolve, reject) => {
			let response;
			try {
				response = await fetch(reqOpts.uri.href, reqOpts);

			} catch(err: any) {
				return reject(err);
			}	// request(reqOpts, function onResponse(err: any, response: any, body: any) {
	
				// 403 forbidden when managed user does not have sufficient permission
				if (response.status === 403) {
					return reject(
						new Error(
							'Plex Server denied request due to lack of managed user permissions! ' +
								'In case of a delete request, delete content mustbe  allowed in plex-media-server options.'
						)
					);
				}
	
				// 401 unauthorized when authentication is required against the requested URL
				if (response.status === 401) {
					return reject(
						new Error(
							'Plex Server denied request'
						)
					);
				}
	
				if (response.status < 200 || response.status > 299) {
					return reject(
						new Error(
							'Plex Server didnt respond with a valid 2xx status code, response code: ' + response.status
						)
					);
				}
	
				// prevent holding an open http agent connection by pretending to consume data,
				// releasing socket back to the agent connection pool: http://nodejs.org/api/http.html#http_agent_maxsockets
				//response.on('data', function onData() {});
				let body = await response.text();
				response.headers
				return parseResponse ? resolve(self.ResponseParser(response, body)) : resolve(undefined);
			});
		//});
	};


	public _serverScheme() {
		if (typeof this.https !== 'undefined') {
			// If https is supplied by the user, always do what it says
			return this.https ? 'https://' : 'http://';
		}
		// Otherwise, use https if it's on port 443, the standard https port.
		return this.port === 443 ? 'https://' : 'http://';
	};

	public _generateRelativeUrl(relativeUrl: string) {
		return this._serverScheme() + this.serverUrl + relativeUrl;
	};

	private ResponseParser(response: any, body: any ) {
		if (response.headers.get('Content-Type') === 'application/json') {
			return Promise.resolve(body).then(JSON.parse);
		} else if (!response.headers.get('Content-Type')) {
			return Promise.resolve(body);
		} else if (response.headers.get('Content-Type').indexOf('xml') > -1) {
			return xmlToJSON(body, {
				attrkey: 'attributes',
			});
		}
	
		return Promise.resolve(body);
	};
}
function xmlToJSON(str: string, options: any) {
    return new Promise((resolve, reject) => {
        xml2js.parseString(str, options, (err: any, jsonObj: any) => {
            if (err) {
                return reject(err);
            }
            resolve(jsonObj);
        });
    });
}

function filterChildrenByCriterias(children: any, criterias: any) {
    let context = {
        criterias: criterias || {},
    };

    return children.filter(criteriasMatchChild, context);
}

function criteriasMatchChild(this: any, child: any) {
    let criterias = this.criterias;

    return Object.keys(criterias).reduce(function matchCriteria(hasFoundMatch, currentRule) {
        let regexToMatch = new RegExp(criterias[currentRule]);
        return regexToMatch.test(child[currentRule]);
    }, true);
}