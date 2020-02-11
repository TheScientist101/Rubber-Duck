var disco = require("discord.js")
var fs = require("fs")
var authContent = fs.readFileSync("auth.json")
var jsonAuthContent = JSON.parse(content)
var token = jsonContent.token
var serverContent = fs.readFileSync("serverinfo.json")
var jsonServerContent = JSON.parse(serverContent)
var serverList = jsonServerContent.servers;
const { exec } = require('child_process')
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
  fs.writeFile('serverinfo.json', jsonServerContent, 'utf8');
})

bot.on('guildCreate', guild => {
  var newServer = {
    id: guild.id,
    legal_channels: []
  }
  serverList.push(newServer);
  fs.writeFile('serverinfo.json', jsonServerContent, 'utf8');
});

bot.on('message', msg =>{
  console.log(msg.channel)
})

bot.login(token)
