Note : this is a personal upgrade of the Plex Discord bot made by danxfisher available here : https://github.com/danxfisher/Plex-Discord-Bot
He should have all the credit for starting this project.
# Plex Discord Bot

You need Node.js v16

## Installation
1. Clone the repo or download a zip and unpackage it.

If you to use [Docker](https://www.docker.com/) , skip the points 2 and 3.

2. Install Node.js: https://nodejs.org/
3. Navigate to the root folder and in the console, type `npm install`
    * You should see packages beginning to install


4. Once this is complete, go here: https://discordapp.com/developers/applications/me
    1. Log in or create an account
    2. Click **New App**
    3. Fill in App Name and anything else you'd like to include
    4. Click **Create App**
        * This will provide you with your Client ID and Client Secret
    5. Click **Create Bot User**
        * This will provide you with your bot Username and Token
5. Take all of the information from the page and enter it into the `config/keys.js` file, replacing the placeholders.
6. Navigate to the `config/plex.js` file and replace the placeholders with your Plex Server information
    1. To get your token, following the instructions here: https://support.plex.tv/hc/en-us/articles/204059436-Finding-an-authentication-token-X-Plex-Token
    2. The identifier, product, version, and deviceName can be anything you want
7. Once you have the configs set up correctly, you'll need to authorize your bot on a server you have administrative access to.  For documentation, you can read: https://discordapp.com/developers/docs/topics/oauth2#bots.  The steps are as follows:
    1. Go to `https://discordapp.com/api/oauth2/authorize?client_id=[CLIENT ID]&permissions=3197953&scope=bot` where [CLIENT_ID] is the Discord App Client ID
    2. Select **Add a bot to a server** and select the server to add it to
    3. Click **Authorize**
    4. You should now see your bot in your server listed as *Offline*.

If want want to use [Docker](https://www.docker.com/), just go to the Docker section.

8. To bring your bot *Online*, navigate to the root of the app (where `index.js` is located) and in your console, type `node index.js`
    * This will start your server.  The console will need to be running for the bot to run.

If I am missing any steps, feel free to reach out or open  an issue/bug in the Issues for this repository.

***
## Docker
If you are using [Docker](https://www.docker.com/), you can use these commands to build and start your Plex bot (after downloading the source code and set the config file) :

go to your plex bot folder (`cd your/plex/bot/folder`)

`docker build -t image/plexbot .`

`docker run -p 32400 -d --name plexbot image/plexbot`

wait a few seconds and your bot should join your server and be active.
You can use `docker logs plexbot` to see the log of the bot (use `docker logs -f plexbot` if you want realtime log).

Note : you may need the `sudo` command/admin access depending of your user right.
## Usage

1. Join a Discord voice channel.
2. Upon playing a song, the bot will join your channel and play your desired song.

***

## Some Commands

* `!?` : print all of the available commands.
* `!plexTest` : a test to see make sure your Plex server is connected properly.
* `!clearqueue` : clears all songs in queue.
* `!nextpage` : get next page of songs if desired song is not listed.
* `!pause` : pauses current song if one is playing.
* `!play <song title or artist>` : bot will join voice channel and play song if one song available.  if more than one, bot will return a list to choose from.
* `!playsong <song number>` : plays a song from the generated song list.
* `!removesong <song queue number>` : removes song by index from the song queue.
* `!resume` : resumes song if previously paused.
* `!skip` : skips the current song if one is playing and plays the next song in queue if it exists.
* `!stop` : stops song if one is playing.
* `!viewqueue` : displays current song queue.
* `!playlist ?` : displays all the playlist related commands.
***
## Customization

Update the `config\keys.js` file with your information:

```javascript
module.exports = {
  'botToken'      : 'DISCORD_BOT_TOKEN',
};
```

And update the `config\plex.js` file with your Plex information:

```javascript
module.exports= {
  'hostname'    : 'PLEX_LOCAL_IP',
  'port'        : 'PLEX_LOCAL_PORT',
  'https'       : false,
  'token'       : 'PLEX_TOKEN',
  'managedUser' : 'PLEX_MANAGED_USERNAME',
  'options'     : {
    'identifier': 'APP_IDENTIFIER',
    'product'   : 'APP_PRODUCT_NAME',
    'version'   : 'APP_VERSION_NUMBER',
    'deviceName': 'APP_DEVICE_NAME',
    'platform'  : 'Discord',
    'device'    : 'Discord'
  }
};
```
You can find us on Discord : https://discord.gg/c39aRhB
Join it if you want to discuss or have any suggestions.

If you see any bugs use the issue tracker.  Thanks!

***

## To Do:
* ????
```

## Completed:
* [x] youtube command.
* [x] refactor the code base.
* [x] add language support.
* [x] plex mood support.
* [x] plex playlist support.
* [x] plex artist support.
* [x] shuffle and loop support.
