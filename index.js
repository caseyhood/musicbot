const Discord = require("discord.js");
const config = require("./config.json");
const ytdl = require("ytdl-core");

const token = config.TOKEN;
const prefix = config.PREFIX;
var bot = new Discord.Client();

var play = function(connection, message) {

  var server = servers[message.guild.id];
  //console.log(server.queue[0]);
  // ?const streamOptions = { seek: 0, volume: 1 };
  //console.log(server.queue);
  //bot.user.setPresence({game:{name: 'IDLE', type: 2}}).then(function(){console.log("info.title");}).catch(function(err){throw err;});

  server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}));
    
  ytdl.getInfo(server.queue[0], function(err, info){
    if(err) throw err;
    bot.user.setPresence({game:{name: info.title.toUpperCase(), type: 2}}).then(function(){console.log(info.title.toUpperCase());}).catch(function(err){throw err;});

  })
  // const stream = ytdl('https://www.youtube.com/watch?v=XAWgeLF9EVQ', { filter : 'audioonly' });
  //     const dispatcher = connection.playStream(stream, streamOptions);
  //     console.log(stream);
  // console.log(server.dispatcher);
  server.queue.shift();
  server.dispatcher.on("end", function(){
    if(server.queue[0]){
      play(connection, message);
    }
    else {
      bot.user.setPresence({game:{name: 'NADA...', type: 2}}).then(function(){connection.disconnect();console.log("now stopped and disconnected");}).catch(function(err){throw err;});
    }
  })
  // return;
}

var servers = {};

bot.on("ready", function(){
  console.log("MusicBot Online...");
  console.log(prefix);
  bot.user.setPresence({game:{name: 'NADA...', type: 2}}).catch(function(err){throw err;});

})

bot.on("message", async function(message) {
  // bot.user.setStatus("status");

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  //console.log(args);
  //const command = args.shift().toLowerCase();
  //console.log(command);

  if(message.author.equals(bot.user)) return;

  //if(!message.content.startsWith(prefix)) return;

  switch(args[0].toLowerCase()) {
    case "invite":
      bot.generateInvite(["ADMINISTRATOR"]).then(function(link){
        console.log(link);
        message.channel.send("<"+link+">");
      }).catch(function(err){
        throw err;
      });
      break;

    case "play":
      if(!args[1]){
        message.channel.send("Please provide a link");
        return;
      }
      if(!message.member.voiceChannel){
        message.channel.send("You must be in a voice channel");
        return;
      }
      if(!servers[message.guild.id]){
        servers[message.guild.id] = {
          queue: [],
        }
      }
      var server = servers[message.guild.id];
      server.queue.push(args[1]);
      // console.log(server.queue);

      if(!message.guild.voiceConnection){
        message.member.voiceChannel.join().then(function(connection){

          play(connection, message);
          // console.log(message);
        }).catch(function(err){console.log(err.stack)});
      }
      break;

    case "skip":
      var server = servers[message.guild.id];
      if(server.dispatcher){
        server.dispatcher.end();
      }
      break;

    case "stop":
      var server = servers[message.guild.id];
      if(message.guild.voiceConnection){

        bot.user.setPresence({game:{name: 'NADA...', type: 2}}).then(function(){message.guild.voiceConnection.disconnect();message.channel.send(":wave:");}).catch(function(err){throw err;});

      }
      break;
  }



});

bot.login(token);
