const express = require("express");
const path = require("path");
const app = express();
const fs = require('fs')
const { BaileysClass } = require("@bot-wa/bot-wa-baileys");
const { Configuration, OpenAIApi } = require("openai");
const chalk = require("chalk");
const { spawn } = require("child_process");
const figlet = require("figlet");

const otpBot = new BaileysClass({});
const port = process.env.PORT || 3000;
const receivedMessages = JSON.parse(fs.readFileSync('msg.json'))

app.use(express.static("public"));
app.use(express.json());

function displayMessageWithFont(text, font) {
  figlet.text(text, { font: font }, function (err, data) {
    if (err) {
      console.log("Error occurred while formatting text with Figlet:", err);
      console.log(text); // Fallback to plain text if Figlet fails
    } else {
      console.log(data);
    }
  });
}

function formatDate(dateString) {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"];

  const date = new Date(dateString);
  const day = days[date.getDay()];
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');

  return `${day} ${hour}:${minute}`;
}

function runtime(seconds) {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor((seconds % (3600 * 24)) / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = Math.floor(seconds % 60);
  var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
}
console.log('----------------------------------------------------------');
(async () => {
  try {
    const banner = await displayMessageWithFont("SatganzDevs", "Banner");
    console.log(banner);
    console.log('----------------------------- SatganzDevs Server start on %s', server.url);
    console.log('\n');
  } catch (err) {
    console.log('SatganzDevs');
    console.error('Error occurred while formatting text with Figlet:', err);
    console.log('----------------------------- SatganzDevs Server start on %s', server.url);
    console.log('\n');
  }
})();
let startTime = Date.now();
let lastQR = null;

const botUptime = () => {
  const currentTime = Date.now();
  const uptimeSeconds = Math.floor((currentTime - startTime) / 1000);
  return runtime(uptimeSeconds);
};

let botStatus = 'Not Connected'

otpBot.on("auth_failure", async (error) => console.log(chalk.bold.red("[ ERROR ]: ", error)));

otpBot.on("qr", (qr) => {
  console.log('new QR', qr);
  lastQR = qr;
});

otpBot.on("ready", () => {
displayMessageWithFont("Connected To Sever!!", "Block");
botStatus = 'Connected'
});

otpBot.on("close", () => {
console.log(chalk.bold.green(`Disconnected!`));
botStatus = 'Not Connected'
});

otpBot.on("message", async (message) => {
  console.log(
        chalk.bgMagenta.bold.cyan("[ PESAN ]"),
        chalk.black(chalk.bgGreen(formatDate(new Date()))),
          chalk.magenta("=> Dari"),
        chalk.green(message.from)
      );
  otpBot.sendPresenceUpdate(message.from, "composing");

  // const configuration = new Configuration({
  //   apiKey: "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",
  // });
  // const openai = new OpenAIApi(configuration);

  // const completion = await openai.createChatCompletion({
  //   model: "gpt-3.5-turbo-16k-0613",
  //   messages: [
  //     { role: "system", content: "tolong gunakan bahasa indonesia ya" },
  //     { role: "user", content: message.body },
  //   ],
  // });

  // const response = completion.data.choices[0].message.content;

  // otpBot.sendText(message.from, response, message);

  // receivedMessages.push({
  //   sender: message.from,
  //   body: message.body,
  //   timestamp: formatDate(new Date()),
  // });

  startTime = Date.now();
});

app.get("/messages", (req, res) => {
  res.json(receivedMessages);
});

// app.post("/send-message", (req, res) => {
//   const { recipient, message } = req.body;
//   if (!recipient || !message) {
//     return res
//       .status(400)
//       .json({ error: "Recipient and message are required." });
//   }

//   otpBot
//     .sendText(recipient + "@s.whatsapp.net", message)
//     .then(() => res.json({ success: true }))
//     .catch((error) => res.status(500).json({ error: "Failed to send message." }));
// });

app.get("/runtime", (req, res) => {
  res.json({
    botUptime: botUptime(),
    botStatus,
    lastQR: lastQR || "No QR Code available",
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const server = app.listen(port, () => {
  figlet('Connected!', (err, data) => {
   console.log('----------------------------------------------------------');
   console.log(data);
   console.log('----------------------------- SatganzDevs Server start on %s', server.url);
   console.log('\n');
  });
});

process.on("SIGINT", () => {
  server.close(() => {
    console.log("Server has been gracefully terminated");
    process.exit(0);
  });
});
