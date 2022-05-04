import { PlexAPI, PlexAPIConfig } from "./plexAPI";

export interface PlexResponse {
	MediaContainer: {
		size: number;
		allowCameraUpload: boolean; 
		allowChannelAccess: boolean,
		allowMediaDeletion: boolean,
		allowSharing: boolean,      
		allowSync: boolean,
		allowTuners: boolean,       
		backgroundProcessing: boolean,
		certificate: boolean;
		companionProxy: boolean;
		countryCode: string;
		diagnostics: string;
		eventStream: boolean,
		friendlyName: string;
		hubSearch: boolean,
		itemClusters: boolean,
		livetv: number,
		machineIdentifier: string;
		mediaProviders: boolean,
		multiuser: boolean;
		musicAnalysis: number;
		myPlex: boolean,
		myPlexMappingState: string;
		myPlexSigninState: string;
		myPlexSubscription: boolean;
		myPlexUsername: string;
		offlineTranscode: number;
		ownerFeatures: string; // example : '002c9f1a-2fc0-4812-b85b-0e6140f21a0f,044a1fac-6b55-47d0-9933-25a035709432,04d7d794-b76c-49ef-9184-52f8f1f501ee,05690239-443e-43fb-bc1a-95b5d916ca63,06d14b9e-2af8-4c2b-a4a1-ea9d5c515824,07f804e6-28e6-4beb-b5c3-f2aefc88b938,0a348865-4f87-46dc-8bb2-f37637975724,0de6151c-e0dd-47c8-a81e-1acb977c7f0f,0eee866d-782b-4dfd-b42b-3bbe8eb0af16,13056a62-9bd2-47cf-aba9-bab00095fd08,1417df52-986e-4e4b-8dcd-3997fbc5c976,16d69c53-4c40-4821-b9f3-57ca690b2d4d,1844737f-1a87-45c3-ab20-01435959e63c,1b3a63e4-c2f4-4011-a181-2343d3a97ef7,1dd846ed-7cde-4dc5-8ef6-53d3ce8c4e9d,1df3cd16-faf2-4d37-8349-1fcf3713bf1d,222020fb-1504-492d-af33-a0b80a49558a,228a6439-ee2f-4a9b-b0fc-1bfcd48b5095,22b27e12-472e-4383-92ea-2ec3976d8e72,22d52c96-9e2b-45c0-9e2a-1d6c66ad3474,24b4cf36-b296-4002-86b7-f1adb657e76a,2797e341-b062-46ed-862f-0acbba5dd522,298a11d3-9324-4104-8047-0ac10df4a8a6,2ea0e464-ea4f-4be2-97c1-ce6ed4b377dd,300231e0-69aa-4dce-97f4-52d8c00e3e8c,32cc8bf5-b425-4582-a52d-71b4f1cf436b,34e182bd-2f62-4678-a9e9-d13b3e25019d,39dbdd84-8339-4736-96a1-0eb105cc2e08,3a2b0cb6-1519-4431-98e2-823c248c70eb,3bfd3ccf-8c63-4dbb-8f87-9b21b402c82b,3c376154-d47e-4bbf-9428-2ea2592fd20a,4742780c-af9d-4b44-bf5b-7b27e3369aa8,4b522f91-ae89-4f62-af9c-76f44d8ef61c,4ca03b04-54c1-4f9f-aea2-f813ae48f317,4cd4dc0e-6cbe-456c-9988-9f073fadcd73,4e27cf82-9fb6-4ebe-8e10-c48bfe6fbbb6,55b9f6ed-5d26-4d2d-a436-68882a9901b5,567033ef-ffee-44fb-8f90-f678077445f9,5b6190a9-77a4-477e-9fbc-c8118e35a4c1,5c1951bf-ccf1-4821-8ee7-e50f51218ae7,5d819d02-5d04-4116-8eec-f49def4e2d6f,5e2a89ec-fb26-4234-b66e-14d37f35dff2,62b1e357-5450-41d8-9b60-c7705f750849,6380e085-02fe-43b5-8bff-380fa4f2423c,644c4466-05fa-45e0-a478-c594cf81778f,65152b75-13a9-408a-bd30-dbd23a259183,65685ff8-4375-4e4c-a806-ec1f0b4a8b7f,67c80530-eae3-4500-a9fa-9b6947d0f6d1,68747f3a-ce13-46ce-9274-1e0544c9f500,6d7be725-9a96-42c7-8af4-01e735138822,6f82ca43-6117-4e55-ae0e-5ea3b3e99a96,78643fe5-d192-40c7-8e93-5ccf04c0b767,7e7596aa-6e2c-41d1-a460-1e13cf0b62f2,7ee1495c-2798-4288-94e2-9cd98e67d441,82999dd3-a2be-482e-9f44-357879b4f603,849433b0-ef60-4a71-9dd9-939bc01f5362,84a754b0-d1ca-4433-af2d-c949bf4b4936,850f3d1e-3f38-44c1-9c0c-e3c9127b8b5a,8536058d-e1dd-4ae7-b30f-e8b059b7cc17,85ebfb7b-77fb-4afd-bb1a-2fe2fefdddbe,86da2200-58db-4d78-ba46-f146ba25906b,88aba3a3-bd62-42a5-91bb-0558a4c1db57,8e8dd5c8-14a4-4208-97d4-623e09191774,8fd37970-6e4e-4f00-a64a-e70b52f18e94,93bf35b9-3b62-4a8a-b09b-5c85437fa67b,95149521-f64b-46ea-825c-9114e56afd2c,96cac76e-c5bc-4596-87eb-4fdfef9aaa11,98872b06-2ff3-4b71-96bc-039e2ebe7adc,9a67bff2-cb80-4bf9-81c6-9ad2f4c78afd,9c982beb-c676-4d6f-a777-ff5d37ec3081,9dc1df45-fb45-4be1-9ab2-eb23eb57f082,a19d495a-1cef-4f7c-ab77-5186e63e17f7,a3d2d5c4-46a0-436e-a2d6-80d26f32b369,a4bc568b-477f-4f36-894b-49e19f34353f,a536a6e1-0ece-498a-bf64-99b53c27de3a,a548af72-b804-4d05-8569-52785952d31d,a6e0a154-4735-4cbb-a6ec-7a0a146c8216,a6f3f9b3-c10c-4b94-ad59-755e30ac6c90,abd37b14-706c-461f-8255-fa9563882af3,adaptive_bitrate,b20d91ca-1b2f-45a2-a115-c1ad24c66ac5,b227c158-e062-4ff1-95d8-8ed11cecafb1,b2403ac6-4885-4971-8b96-59353fd87c72,b46d16ae-cbd6-4226-8ee9-ab2b27e5dd42,b5874ecb-6610-47b2-8906-1b5a897acb02,b58d7f28-7b4a-49bb-97a7-152645505f28,b612f571-83c3-431a-88eb-3f05ce08da4a,b77e6744-c18d-415a-8e7c-7aac5d7a7750,b83c8dc9-5a01-4b7a-a7c9-5870c8a6e21b,b8cf9f40-4f8a-4de4-b203-5bbcf8b09f5a,bb50c92f-b412-44fe-8d8a-b1684f212a44,bbf73498-4912-4d80-9560-47c4fe212cec,bc8d1fca-deb0-4d0a-a6f4-12cfd681002d,bfeaee4e-965a-4d24-b163-020c3c57d936,c2409baa-d044-45c7-b1f4-e9e7ccd2d128,c55d5900-b546-416d-a8c5-45b24a13e9bc,c5adf9dc-af13-4a85-a24b-98de6fa2f595,c7ae6f8f-05e6-48bb-9024-c05c1dc3c43e,c92d4903-bc06-4715-8ce4-4a22674abac8,camera_upload,cc9bea3b-11ab-4402-a222-4958bb129cab,cloudsync,collections,content_filter,d14556be-ae6d-4407-89d0-b83953f4789a,d1477307-4dac-4e57-9258-252e5b908693,d20f9af2-fdb1-4927-99eb-a2eb8fbff799,d413fb56-de7b-40e4-acd0-f3dbb7c9e104,d85cb60c-0986-4a02-b1e1-36c64c609712,d8810b38-ec9b-494c-8555-3df6e365dfbd,d9f42aea-bc9d-47db-9814-cd7a577aff48,dab501df-5d99-48ef-afc2-3e839e4ddc9a,db965785-ca5c-46fd-bab6-7b3d29c18492,ddd730e1-a0a0-429f-a7d3-7c5001d24497,download_certificates,dvr,e45bc5ae-1c3a-4729-922b-c69388c571b7,e66aa31c-abdd-483d-93bc-e17485d8837f,e7cea823-02e5-48c4-a501-d37b82bf132f,e8230c74-0940-4b91-9e20-6571eb068086,e954ef21-08b4-411e-a1f0-7551f1e57b11,ea442c16-044a-4fa7-8461-62643f313c62,ec64b6f6-e804-4ef3-b114-9d5c63e1a941,ee352392-2934-4061-ba35-5f3189f19ab4,f3235e61-c0eb-4718-ac0a-7d6eb3d8ff75,f3a99481-9671-4274-a0d3-4c06a72ef746,f83450e2-759a-4de4-8b31-e4a163896d43,f87f382b-4a41-4951-b4e4-d5822c69e4c6,f8ea4f37-c554-476a-8852-1cbd2912f3f6,fb34e64d-cd89-47b8-8bae-a6d20c542bae,fd6683b9-1426-4b00-840f-cd5fb0904a6a,fec722a0-a6d4-4fbd-96dc-4ffb02b072c5,federated-auth,hardware_transcoding,home,hwtranscode,item_clusters,kevin-bacon,livetv,loudness,lyrics,music-analysis,music_videos,pass,photo_autotags,photos-v5,photosV6-edit,photosV6-tv-albums,premium_music_metadata,radio,server-manager,session_bandwidth_restrictions,session_kick,shared-radio,sync,trailers,tuner-sharing,type-first,unsupportedtuners,webhooks',
		photoAutoTag: boolean;
		platform: string;
		platformVersion: string;
		pluginHost: boolean;
		pushNotifications: boolean;
		readOnlyLibraries: boolean;
		streamingBrainABRVersion: number;
		streamingBrainVersion: number;
		sync: boolean;
		transcoderActiveVideoSessions: number;
		transcoderAudio: boolean;
		transcoderLyrics: boolean;
		transcoderPhoto: boolean;
		transcoderSubtitles: boolean;
		transcoderVideo: boolean;
		transcoderVideoBitrates: string; //example : '64,96,208,320,720,1500,2000,3000,4000,8000,10000,12000,20000',
		transcoderVideoQualities: string; // example : '0,1,2,3,4,5,6,7,8,9,10,11,12',
		transcoderVideoResolutions: string; // example : '128,128,160,240,320,480,768,720,720,1080,1080,1080,1080',
		updatedAt: number;
		updater: boolean;
		version: string;
		voiceSearch: boolean;
		Directory: any[];
	}
}

export interface PlexSong {
	artist: string;
	title: string;
	key: string;
	album: string;
	url: string;
}

export interface PlexTrack {
	MediaContainer: any;
}

export enum PlexType {
	SONG = 10,
	ARTIST = 8
}

export class Plex extends PlexAPI {

	private offset: number;
	private pageSize: number;

	constructor(options: PlexAPIConfig) {
		super(options);
		this.offset = 0;
		this.pageSize = 100;
	}

	public async sendQuery(query: string, type: number): Promise<PlexResponse> {
		const queryHTTP = encodeURI(query);
		return await this.query('/search/?type=' + type + '&query=' + queryHTTP + '&X-Plex-Container-Start=' + this.offset + '&X-Plex-Container-Size=' + this.pageSize);
	}

	public async getTracksFromName(name: string): Promise<PlexTrack[]> {
		const res = await this.sendQuery(name, PlexType.SONG);
		console.dir(res.MediaContainer.Directory);
		return [];
	}

	public async getSongsFromName(name: string): Promise<PlexSong[]> {
		return [];
	}

}