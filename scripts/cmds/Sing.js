const fs = require('fs');
const ytdl = require('ytdl-core');
const { resolve } = require('path');

async function downloadMusicFromYoutube(link, path) {
  var timestart = Date.now();
  if (!link) return 'Missing YouTube link.';
  var resolveFunc = function () { };
  var rejectFunc = function () { };
  var returnPromise = new Promise(function (resolve, reject) {
    resolveFunc = resolve;
    rejectFunc = reject;
  });
  ytdl(link, {
    filter: format =>
      format.quality == 'tiny' && format.audioBitrate == 48 && format.hasAudio == true
  }).pipe(fs.createWriteStream(path))
    .on("close", async () => {
      var data = await ytdl.getInfo(link);
      var result = {
        title: data.videoDetails.title,
        dur: Number(data.videoDetails.lengthSeconds),
        viewCount: data.videoDetails.viewCount,
        likes: data.videoDetails.likes,
        author: data.videoDetails.author.name,
        timestart: timestart
      };
      resolveFunc(result);
    });
  return returnPromise;
}

module.exports = {
  config: {
    name: "sing",
    version: "1.0.1",
    hasPermission: 0,
    author: "D-Jukie",
    description: "Play music from a YouTube link or search keyword.",
    category: "Utility",
    guide: {
      en: "   {p}{n} <YouTube link>: Play music from a YouTube link\n   {p}{n} <search query>: Search and choose music to play",
    },
    countDown: 0,
    dependencies: { fs: "", ytdl: "", "youtube-search-api": "" }
  },

  handleReply: async function ({ api, event, handleReply }) {
    const { createReadStream, unlinkSync, statSync } = require("fs-extra");

    try {
      const selectedIndex = parseInt(event.body) - 1;
      if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= handleReply.link.length) {
        return api.sendMessage('Invalid selection. Please reply with a valid number.', event.threadID, event.messageID);
      }

      const selectedLink = 'https://www.youtube.com/watch?v=' + handleReply.link[selectedIndex];
      const path = `${__dirname}/cache/1.mp3`;
      var data = await downloadMusicFromYoutube(selectedLink, path);

      if (statSync(path).size > 26214400) {
        return api.sendMessage('The file exceeds the 25MB limit and cannot be sent.', event.threadID, () => unlinkSync(path), event.messageID);
      }

      api.unsendMessage(handleReply.messageID);
      return api.sendMessage({
        body: `🎵 Title: ${data.title}\n🎶 Channel: ${data.author}\n⏱️ Duration: ${this.convertHMS(data.dur)}\n👀 Views: ${data.viewCount}\n👍 Likes: ${data.likes}\n⏱️ Processing Time: ${Math.floor((Date.now() - data.timestart) / 1000)} seconds`,
        attachment: createReadStream(path)
      }, event.threadID, () => unlinkSync(path), event.messageID);

    } catch (e) {
      console.error("Error in handleReply:", e);
      return api.sendMessage('An error occurred while processing your request.', event.threadID, event.messageID);
    }
  },

  convertHMS: function (value) {
    const sec = parseInt(value, 10);
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - (hours * 3600)) / 60);
    let seconds = sec - (hours * 3600) - (minutes * 60);
    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return (hours !== '00' ? hours + ':' : '') + minutes + ':' + seconds;
  },

  run: async function ({ api, event, args }) {
    if (args.length === 0 || !args) {
      return api.sendMessage('Please provide a YouTube link or a search query.', event.threadID, event.messageID);
    }
    const keywordSearch = args.join(" ");
    var path = `${__dirname}/cache/1.mp3`;

    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }

    if (args[0].startsWith("https://")) {
      try {
        var data = await downloadMusicFromYoutube(keywordSearch, path);
        if (fs.statSync(path).size > 26214400) {
          return api.sendMessage('The file exceeds the 25MB limit and cannot be sent.', event.threadID, () => fs.unlinkSync(path), event.messageID);
        }

        return api.sendMessage({
          body: `🎵 Title: ${data.title}\n🎶 Channel: ${data.author}\n⏱️ Duration: ${this.convertHMS(data.dur)}\n👀 Views: ${data.viewCount}\n👍 Likes: ${data.likes}\n⏱️ Processing Time: ${Math.floor((Date.now() - data.timestart) / 1000)} seconds`,
          attachment: fs.createReadStream(path)
        }, event.threadID, () => fs.unlinkSync(path), event.messageID);

      } catch (e) {
        console.error("Error in run (direct link):", e);
        return api.sendMessage('An error occurred while processing your request.', event.threadID, event.messageID);
      }
    } else {
      try {
        const Youtube = require('youtube-search-api');
        var link = [];
        var msg = "";
        var num = 0;
        var data = (await Youtube.GetListByKeyword(keywordSearch, false, 6)).items;

        for (let value of data) {
          link.push(value.id);
          num += 1;
          msg += (`${num} - ${value.title} (${value.length.simpleText})\n\n`);
        }

        var body = `»🔎 Found ${link.length} results matching your search:\n\n${msg}» Reply with the number to select one of the results.`;
        return api.sendMessage({
          body: body
        }, event.threadID, (error, info) => global.client.handleReply.push({
          type: 'reply',
          name: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          link
        }), event.messageID);

      } catch (e) {
        console.error("Error in run (search query):", e);
        return api.sendMessage('An error occurred while searching. Please try again later.', event.threadID, event.messageID);
      }
    }
  },

  onStart: async function (options) {
    return this.run(options);
  }
};