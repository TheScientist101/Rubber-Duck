var { Client, GatewayIntentBits } = require("discord.js")
var fs = require("fs")
var duckImages = fs.readdirSync("public")
require('dotenv').config()
var token = process.env.TOKEN

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

function sendDuck(channel) {
  channel.send({ "files": ["res/".concat(duckImages[randomRange(0, duckImages.length)])], "content": "Quack" });
}

bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
}
);

bot.on('ready', () => {
  console.log('Logged in as ' + bot.user.tag)
});

bot.on('messageCreate', async msg => {
  if (msg.author.bot) return;
  if (msg.channel.constructor.name !== "ThreadChannel") {
    thread = await msg.startThread({ name: msg.content, autoArchiveDuration: 60 });
    sendDuck(thread);
    thread.send("Here's a duck!");
  } else {
    sendDuck(msg.channel);
  }
});

app.listen(8999, () => {

});

bot.login(token)
