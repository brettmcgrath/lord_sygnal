const ytdl = require('ytdl-core');


const queue = new Map();

async function execute(message, serverQueue) {
    const args = message.content.split(/ +/);
  
    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a voice channel to play music!"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }
  
    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
      title: songInfo.title,
      url: songInfo.video_url
    };
  
    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
      };
  
      queue.set(message.guild.id, queueContruct);
  
      queueContruct.songs.push(song);
  
      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.songs[0]);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`${song.title} has been added to the queue!`);
    }
  }
  
function skip(message, serverQueue) {
    if (!message.member.voiceChannel)
         return message.channel.send("You have to be in a voice channel to stop the music!");
    if (!serverQueue)
        return message.channel.send("There is no song that I could skip!");

    if (serverQueue.connection.dispatcher) {
        serverQueue.connection.dispatcher.end();
    }
}
  
function stop(message, serverQueue) {
    if (!message.member.voiceChannel)
        return message.channel.send(
        "You have to be in a voice channel to stop the music!"
        );
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}
  
function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }
  
    const dispatcher = serverQueue.connection
      .playStream(ytdl(song.url, { //was play but now playStream, seems to only work like that
        // filter: "audioonly",
        highWaterMark: 1<<25,
      })
      .on("error", error => console.error(error)))
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    dispatcher.on("end", () => {
      console.log("the song ended whether you wanted it to or not")
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    });
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}


exports.execute = execute;
exports.skip = skip;
exports.stop = stop;
exports.play = play;
exports.queue = queue;