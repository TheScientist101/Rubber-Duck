var disco = require("discord.js")
var fs = require("fs")
var content = fs.readFileSync("auth.json")
var jsonContent = JSON.parse(content)
var token = jsonContent.token
const { exec } = require('child_process')
bot = new disco.Client()
bot.on('ready', () =>{
  console.log('Logged in as ' + bot.user.tag)
})
bot.on('message', msg =>{
  console.log(msg.channel)
})

bot.login(token)
