const { GoatWrapper } = require("fca-liane-utils");

module.exports = {
  config: {
    name: "adc",
    aliases: ["adc"],
    version: "1.2",
    author: "Loid Butter",
    usePrefix: false,
    countDown: 5,
    role: 2,
    shortDescription: {
      vi: "",
      en: "adc command"
    },
    longDescription: {
      vi: "",
      en: "only bot owner"
    },
    category: "owner",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, args }) {
    // Safeguard for DEV configuration
    const permission = global.GoatBot.config.adminBot || []; // Default to an empty array if undefined
    if (!permission.includes(event.senderID)) {
      return api.sendMessage(
        "❌ | You aren't allowed to use this command. Check the ADC command.",
        event.threadID,
        event.messageID
      );
    }

    const axios = require("axios");
    const fs = require("fs");
    const request = require("request");
    const cheerio = require("cheerio");
    const { resolve } = require("path");
    const { senderID, threadID, messageID, messageReply, type } = event;

    let name = args[0];
    let text = type === "message_reply" ? messageReply.body : null;

    if (!text && !name) {
      return api.sendMessage(
        "Please reply to the link you want to apply the code to or write the file name to upload the code to Pastebin!",
        threadID,
        messageID
      );
    }

    if (!text && name) {
      const filePath = `${__dirname}/${args[0]}.js`;
      fs.readFile(filePath, "utf-8", async (err, data) => {
        if (err) {
          console.log(`File not found: ${args[0]}.js`);
          return api.sendMessage(
            `Command ${args[0]} does not exist!`,
            threadID,
            messageID
          );
        }

        const { PasteClient } = require("pastebin-api");
        const client = new PasteClient("N5NL5MiwHU6EbQxsGtqy7iaodOcHithV");

        async function pastebin(name) {
          const url = await client.createPaste({
            code: data,
            expireDate: "N",
            format: "javascript",
            name: name,
            publicity: 1
          });
          const id = url.split("/")[3];
          return `https://pastebin.com/raw/${id}`;
        }

        const link = await pastebin(args[1] || "noname");
        return api.sendMessage(link, threadID, messageID);
      });
      return;
    }

    // Handle URL cases
    const urlR = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    const url = text.match(urlR);

    if (url && url[0].indexOf("pastebin") !== -1) {
      try {
        const response = await axios.get(url[0], {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
          }
        });

        fs.writeFile(`${__dirname}/${args[0]}.js`, response.data, "utf-8", (err) => {
          if (err) {
            console.log(`Error writing file: ${args[0]}.js`);
            return api.sendMessage(
              `An error occurred while applying the code ${args[0]}.js`,
              threadID,
              messageID
            );
          }
          api.sendMessage(
            `Applied the code to ${args[0]}.js, use command load to use!`,
            threadID,
            messageID
          );
        });
      } catch (error) {
        console.log(`Error fetching Pastebin code: ${error.message}`);
        return api.sendMessage(
          `An error occurred while fetching the pastebin code. Error: ${error.message}`,
          threadID,
          messageID
        );
      }
    }
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });