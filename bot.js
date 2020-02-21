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

var defaultServerTemplate = {
  "id": "0",
  "minrand": "1",
  "maxrand": "5",
  "msglength": "75",
  "prefix": ":",
  "legal_channels": []
}

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

function sendDuck(msg){
   channelCountdown[msg.channel.id] = channelCountdown[msg.channel.id] +
   Math.ceil(msg.content.length / 75)
   if(channelCountdown[msg.channel.id] >= channelTimings[msg.channel.id]){
     msg.channel.send({"files": ["./res/duck.png"]})
     channelTimings[msg.channel.id] = Math.floor(Math.random() * 5) + 1;
     channelCountdown[msg.channel.id] = 0;
   }
}

function addLegalChannel(server, channel){
  server.legal_channels.push(channel.id)
  channelTimings[channel.id] = Math.floor(Math.random() * 10);
  channelCountdown[channel.id] = 0;
  updateJson()
}

function removeLegalChannel(server, index){
  server.legal_channels.splice(index,1)
  updateJson()
}

function updateProperty(server, prop, value){
  server[prop] = value
  updateJson()
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
      var newServer = Object.assign({}, defaultServerTemplate)
      newServer.id = server.id
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
  var newServer = Object.assign({}, defaultServerTemplate)
  newServer.id = server.id
  serverList.push(newServer);
  updateJson()
});

bot.on('message', msg =>{
  if(msg.author.bot) return;
  var server = lodash.filter(serverList, x => x.id === msg.guild.id)[0]
  var pref = server.prefix
  if(msg.content.startsWith(pref)  && msg.member.hasPermission('ADMINISTRATOR')){
    if(msg.content === pref.concat("debug")){
      if(server.legal_channels.indexOf(msg.channel.id) == -1){
        addLegalChannel(server, msg.channel)
        msg.channel.send("Now debugging in this channel")
      }else{
        msg.channel.send("Already debugging in this channel!")
      }
    }else if(msg.content === pref.concat("remove")){
      var index = server.legal_channels.indexOf(msg.channel.id)
      if(index > -1){
        removeLegalChannel(server, index)
        msg.channel.send("This channel is no longer being debugged")
      }else{
        msg.channel.send("This channel is already not being debugged!")
      }
    }else if(msg.content.startsWith(pref.concat("prefix "))){
      var newPrefix = msg.content.substring(
        (pref.concat("prefix ")).length, msg.content.length
      )
      updateProperty(server, "prefix", newPrefix)
      msg.channel.send("Prefix has been changed to '".concat(newPrefix).concat("'"))
    }
  }else{
    if(server.legal_channels.indexOf(msg.channel.id) != -1){
      sendDuck(msg)
    }
  }
})

bot.login(token)
