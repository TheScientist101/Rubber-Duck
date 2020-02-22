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


function randomRange(min, max){
  return Math.floor(Math.random() * (max-min)) + min
}
function resetChannelTimings(server, id){
  channelTimings[id] = randomRange(parseInt(server.minrand, 10), parseInt(server.maxrand, 10));
  channelCountdown[id] = 0;
}
function updateJson(){
  fs.writeFile('serverinfo.json', JSON.stringify(jsonServerContent), 'utf8', error => {
    if(error){
      console.error(error);
    }else{
      console.log("JSON updated")
    }
  });
}

function sendDuck(server, msg){
   channelCountdown[msg.channel.id] = channelCountdown[msg.channel.id] +
   Math.ceil(msg.content.length / parseInt(server.msglength, 10))
   if(channelCountdown[msg.channel.id] >= channelTimings[msg.channel.id]){
     msg.channel.send({"files": ["./res/duck.png"]})
     resetChannelTimings(server, msg.channel.id)
   }
}

function addLegalChannel(server, channel){
  if(server.legal_channels.indexOf(channel.id) == -1){
    server.legal_channels.push(channel.id)
    resetChannelTimings(server, channel.id)
    updateJson()
    channel.send("Now debugging in this channel")
  }else{
    channel.send("Already debugging in this channel!")
  }
}

function removeLegalChannel(server, msg){
  let index = server.legal_channels.indexOf(msg.channel.id)
  if(index > -1){
    server.legal_channels.splice(index,1)
    updateJson()
    msg.channel.send("This channel is no longer being dubugged!")
  }else{
    msg.channel.send("This channel is already not being debugged!")
  }
}

function updateProperty(server, prop, value, msg, displayName){
  server[prop] = value
  updateJson()
  msg.channel.send(displayName.concat(" has been changed to \"".concat(value).concat("\"")))
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
  serverList.forEach(recordedServer => {
    Object.keys(defaultServerTemplate).forEach(key => {
      if(!recordedServer.hasOwnProperty(key)){
        recordedServer[key] = defaultServerTemplate[key]
      }
    })
    recordedServer.legal_channels.forEach(id => {
      resetChannelTimings(recordedServer, id)
    });
  });
  updateJson()
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
    let args = msg.content.split(" ")
    let command = args[0].substring(1,args[0].length)
    if(command === "debug"){
      addLegalChannel(server, msg.channel)
    }else if(command === "remove"){
      removeLegalChannel(server, msg)
    }else if(command === "prefix"){
      updateProperty(server, "prefix", args[1], msg, "Prefix")
    }else if(command === "min"){
      updateProperty(server, "minrand", args[1], msg, "Random Minimum")
    }else if(command === "max"){
      updateProperty(server, "maxrand", args[1], msg, "Random Maximum")
    }else if(command === "length"){
      updateProperty(server, "msglength", args[1], msg, "Message Length")
    }
  }else{
    if(server.legal_channels.indexOf(msg.channel.id) != -1){
      sendDuck(server, msg)
    }
  }
})

bot.login(token)
