const Discord = require("discord.js");
const config = require("./config.json");
const ytdl = require("ytdl-core");
const yt = require('youtube-node');

const token = config.TOKEN;
const prefix = config.PREFIX;
var bot = new Discord.Client();
var youtube = new yt();
var autoplay = true;

youtube.setKey('AIzaSyB8VN6fqy86Pg90H4DfKJDHhNZcWNK-cXo');


// youtube.search('amber run',5,function(err, res){
// 	if(err) console.log(err);
// 	else console.log(JSON.stringify(res, null, 2));
// });
var autoplayer = function(server) {
	var link = "https://www.youtube.com/watch?v=";
	var ytid = server.queue[0].split('=');
	//console.log(splt);
// 	youTube.related('hafhSaP_Nh4', 2, function(error, result) {
//   if (error) {
//     console.log(error);
//   }
//   else {
//     console.log(JSON.stringify(result, null, 2));
//   }
// });
	youtube.related(ytid[1],1,function(err, res){
		if(err) console.log(err);
		else {
					console.log(JSON.stringify(res.items[0].id.videoId, null, 2));
					server.queue.push(link + res.items[0].id.videoId);
					// console.log(link + res.items[0].id.videoId);
		}

	});
};

var play = function(connection, message) {
	var server = servers[message.guild.id];

	if(autoplay){
		// console.log(currentQ);
		autoplayer(server);

	}



  server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}));
	ytdl.getInfo(server.queue[0], function(err, info){
		if(err) throw err;
		bot.user.setPresence({game:{name: info.title.toUpperCase(), type: 2}}).then(function(){console.log(info.title.toUpperCase());}).catch(function(err){throw err;});
		message.channel.send("Now playing " + info.title.toUpperCase())

	});


  // const stream = ytdl('https://www.youtube.com/watch?v=XAWgeLF9EVQ', { filter : 'audioonly' });
  //     const dispatcher = connection.playStream(stream, streamOptions);
  //     console.log(stream);
  // console.log(server.dispatcher);
	//var currentQ = server.queue[0];
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
        bot.user.setPresence({game:{name: 'NADA...', type: 2}}).then(function(){server.dispatcher.end();}).catch(function(err){throw err;});

      }
      break;

    case "stop":
      var server = servers[message.guild.id];
      if(message.guild.voiceConnection){
				autoplay = false;
        bot.user.setPresence({game:{name: 'NADA...', type: 2}}).then(function(){message.guild.voiceConnection.disconnect();message.channel.send(":wave:");}).catch(function(err){throw err;});

      }
      break;

		case "autoplay":
			// // var serverQueue = servers[message.guild.id].queue;
			// if(!servers[message.guild.id]){
			// 	message.channel.send("Play something first!").then(function(){return;}).catch(function(err){console.log(err.stack)});
			// }
			// else {
				autoplay = !autoplay;
				message.channel.send("Autoplay is " + autoplay).then(function(){return;}).catch(function(err){console.log(err.stack)});

				// var server = servers[message.guild.id];
				// autoplay(server);
			// }
				break;
		case "q":
			var server = servers[message.guild.id];
			if(!server) {
				message.channel.send("Queue has " + server.queue.length + ' songs.');
			}
			else {
				message.channel.send("Queue has " + server.queue.length + ' songs.');

			}
			break;
  }



});

bot.login(token);
