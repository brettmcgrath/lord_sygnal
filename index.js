require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const ytdl = require('ytdl-core');
const music = require('./music');


const token = process.env.TOKEN;
const prefix = process.env.PREFIX;


bot.login(token);


bot.on('ready', () => {
  console.info(`${bot.user.tag} is logged in and ready to rock!`);
});


//Stuff that happens when people join or leave a voice channel
bot.on("voiceStateUpdate",  (newMember, bot) => {
  if (newMember.id === "368578878777720832" ) { //This is the ID for Brian P
    bot.voiceChannel.join()
      .then(connection => {
      const dispatcher = connection.playFile('C:/Users/Athos/code/sygnal/sounds/uuu.mp3');
      dispatcher.on("end", end => {bot.voiceChannel.leave()});
    })
    .catch(console.error());
  } else if (newMember.id === "554176592746643461") { //This is the ID for Nate
    bot.voiceChannel.join()
      .then(connection => {
      const dispatcher = connection.playStream(ytdl('https://www.youtube.com/watch?v=TJWHDdhq1CI'), { 
        // filter: "audioonly",
        // highWaterMark: 1<<25,
      })
      .on("error", error => console.error(error))
    // dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    dispatcher.on("end", () => {bot.voiceChannel.leave();

    });
      });
    }
  });

//Music bot parts
bot.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = music.queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}play`)) {
    music.execute(message, serverQueue);
    console.log("supposedly playing something")
    return;
  } else if (message.content.startsWith(`${prefix}music.skip`)) {
    music.skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}music.stop`)) {
    music.stop(message, serverQueue);
    return;
  } else {
    message.channel.send("You need to enter a valid command!");
  }
});



//Listens for specific words to respond
let count = 0
bot.on("message", message => {
  if (message.content.includes("bye")) {
  message.member.voiceChannel.join()
    .then(connection => {
        const dispatcher = connection.playFile('C:/Users/Athos/code/sygnal/sounds/bye.mp3');
        dispatcher.on("end", end => {message.member.voiceChannel.leave()});
    })
    .catch(console.error());

  } else if (message.content.includes("lord") && message.content.includes("sygnal")) {
      message.reply("Pleased to be of service, m'lord, and may it please the court.");
    //message.channel.send('hello!');
  } else if (message.content.includes("rimworld" || "elite dangerous")) {
    message.reply("These frivolities are not historically accurate.");
  } else if (message.content.includes("sygnal") && message.content.includes("lord") === false) {
    message.reply("As a member of this court, I demand to be addrressed by noble title! I am Lord Sygnal!");
  } else if (message.author.id === "314666562290188290") { //John
    if (count === 10) {
      message.channel.send('Sir John, is that you?');
      count = 0
    } else {
      count += 1
    }
  } else if (message.author.id === "368578878777720832") { //Brett
    if (count === 10) {
      message.channel.send('Thus spake the Lord Chamberlain! He hath spoken!');
      count = 0
    } else {
      count += 1
      console.log(count)
    }
  } else if (message.author.id === "554176592746643461") { //Nate
    if (count === 10) {
      message.channel.send('The King has spoken! Long live the King!');
      count = 0
    } else {
      count += 1
    }
  } else if (message.content.startsWith('!kick')) {
      if (message.mentions.users.size) {
        const taggedUser = message.mentions.users.first();
        message.channel.send(`You wanted to kick: ${taggedUser.username}`);
  } else {
    message.reply('Please tag a valid user!');
    }
  }
});

//listens for new member joining the guild
bot.on("guildMemberAdd", (member) => {
  let guild = member.guild; // Reading property `guild` of guildmember object.
  let name = member.user.tag; // GuildMembers don't have a tag property, read property user of guildmember to get the user object from it
  if(guild.systemChannel){ // Checking if it's not null
    guild.systemChannel.send("Good day yeoman and welcome to Court. I am Lord Sygnal! On behalf of his Majesty King Bürgher Meister, we welcome you!");
  }
});
