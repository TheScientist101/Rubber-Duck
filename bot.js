var disco = require("discord.js")
var lodash = require("lodash")
var fs = require("fs")
var authContent = fs.readFileSync("auth.json")
var jsonAuthContent = JSON.parse(authContent)
var token = jsonAuthContent.token
var serverContent = fs.readFileSync("serverinfo.json")
var jsonServerContent = JSON.parse(serverContent)
console.log(jsonServerContent)
var serverList = jsonServerContent.servers;

var channelTimings = {}
var channelCountdown = {}


function updateJson(){
  fs.writeFile('serverinfo.json', JSON.stringify(jsonServerContent), 'utf8', error => {
    if(error){
      console.error(error);
    }else{
      console.log("JSON updated")
    }
  });
}

bot = new disco.Client()

bot.on('ready', () =>{
  console.log('Logged in as ' + bot.user.tag)
  console.log("Logging servers")
  var allGuilds = bot.guilds;
  allGuilds.forEach(server => {
    var isthere = false
    serverList.forEach(recordedServer => {
      if(recordedServer.id == server.id){
        isthere = true
      }
    });
    if(!isthere){
      var newServer = {
        id: server.id,
        legal_channels: []
      }
      serverList.push(newServer);
    }

  });
  updateJson()
  serverList.forEach(recordedServer => {
    recordedServer.legal_channels.forEach(channel => {
      channelTimings[channel] = Math.floor(Math.random() * 5) + 1;
      channelCountdown[channel] = 0;
    });
  });
})

bot.on('guildCreate', guild => {
  var newServer = {
    id: guild.id,
    legal_channels: []
  }
  serverList.push(newServer);
  updateJson()
});

bot.on('message', msg =>{
  var server = lodash.filter(serverList, x => x.id === msg.guild.id)[0]
  if(msg.content === ":debug" && msg.member.hasPermission('ADMINISTRATOR')){
    if(server.legal_channels.indexOf(msg.channel.id) == -1){
      server.legal_channels.push(msg.channel.id)
      msg.channel.send("Now debugging in this channel")
      channelTimings[msg.channel.id] = Math.floor(Math.random() * 10);
      channelCountdown[msg.channel.id] = 0;
      updateJson()
    }else{
      msg.channel.send("Already debugging in this channel!")
    }
  }else if(msg.content === ":remove" && msg.member.hasPermission('ADMINISTRATOR')){
    var index = server.legal_channels.indexOf(msg.channel.id)
    if(index > -1){
      server.legal_channels.splice(index,1)
      msg.channel.send("This channel is no longer being debugged")
      updateJson()
    }else{
      msg.channel.send("This channel is already not being debugged!")
    }
  }else{
    if(server.legal_channels.indexOf(msg.channel.id) != -1){
      channelCountdown[msg.channel.id] = channelCountdown[msg.channel.id] +
       Math.ceil(msg.content.length / 75)
       if(channelCountdown[msg.channel.id] >= channelTimings[msg.channel.id]){
         msg.channel.send({"files": ["./res/duck.png"]})
         channelTimings[msg.channel.id] = Math.floor(Math.random() * 5) + 1;
         channelCountdown[msg.channel.id] = 0;
       }
    }
  }
})

bot.login(token)
