const { GoatWrapper } = require("fca-liane-utils");
const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");

const profileSize = 35;

module.exports = {
  config: {
    name: "gcs",
    version: "1.0",
    author: "Kshitiz",
    countDown: 5,
    role: 2,
    shortDescription: "Get GC stats",
    longDescription: "",
    category: "box",
    guide: {
      en: "{p}{n}",
    },
  },

  onStart: async function ({ api, event, usersData, message }) {
    try {
      // Get thread info
      const threadInfo = await api.getThreadInfo(event.threadID);
      const participantIDs = threadInfo.participantIDs;
      const adminIDs = threadInfo.adminIDs.map((admin) => admin.id);

      console.log("Thread Info:", threadInfo.threadName);
      console.log("Participants:", participantIDs.length);
      console.log("Admins:", adminIDs.length);

      // Fetch profile images
      const adminProfileImages = [];
      const memberProfileImagesFiltered = [];

      for (let participantID of participantIDs) {
        const avatarUrl = await usersData.getAvatarUrl(participantID);
        console.log(`Fetching avatar for ${participantID}: ${avatarUrl}`);
        try {
          const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
          if (adminIDs.includes(participantID)) adminProfileImages.push(response);
          else memberProfileImagesFiltered.push(response);
        } catch (error) {
          console.error(`Failed to fetch avatar for ${participantID}:`, error.message);
        }
      }

      const numAdmins = adminProfileImages.length;
      const numMembers = memberProfileImagesFiltered.length;

      // Canvas dimensions
      const maxImagesPerRow = 15;
      const gapBetweenImages = 10;
      const totalProfiles = numAdmins + numMembers;
      const rowsNeeded = Math.ceil(totalProfiles / maxImagesPerRow);
      const canvasWidth = maxImagesPerRow * (profileSize + gapBetweenImages) - gapBetweenImages + 20;
      const canvasHeight = rowsNeeded * (profileSize + gapBetweenImages) + 150;

      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");

      // Draw background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw thread image
      if (threadInfo.imageSrc) {
        try {
          const threadImageResponse = await axios.get(threadInfo.imageSrc, { responseType: "arraybuffer" });
          const threadImage = await loadImage(threadImageResponse.data);
          const threadImageSize = profileSize * 2;
          const threadImageX = (canvasWidth - threadImageSize) / 2;
          const threadImageY = 10;

          ctx.save();
          ctx.beginPath();
          ctx.arc(canvasWidth / 2, threadImageY + threadImageSize / 2, threadImageSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(threadImage, threadImageX, threadImageY, threadImageSize, threadImageSize);
          ctx.restore();
          ctx.beginPath();
          ctx.arc(canvasWidth / 2, threadImageY + threadImageSize / 2, threadImageSize / 2 + 3, 0, Math.PI * 2);
          ctx.strokeStyle = "red";
          ctx.lineWidth = 3;
          ctx.stroke();
        } catch (error) {
          console.error("Failed to fetch thread image:", error.message);
        }
      }

      // Draw thread name
      ctx.fillStyle = "black";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.fillText(threadInfo.threadName || "Group Chat", canvasWidth / 2, profileSize * 2 + 40);

      // Draw admins and members
      let x = 10;
      let y = profileSize * 2 + 60;
      let colIndex = 0;

      // Draw Admins
      for (let i = 0; i < adminProfileImages.length; i++) {
        const response = adminProfileImages[i];
        if (!response) continue;
        const image = await loadImage(response.data);

        ctx.strokeStyle = "gold";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, profileSize, profileSize);
        ctx.drawImage(image, x + 2, y + 2, profileSize - 4, profileSize - 4);

        colIndex++;
        x += profileSize + gapBetweenImages;
        if (colIndex >= maxImagesPerRow) {
          colIndex = 0;
          x = 10;
          y += profileSize + gapBetweenImages;
        }
      }

      // Draw Members
      for (let i = 0; i < memberProfileImagesFiltered.length; i++) {
        const response = memberProfileImagesFiltered[i];
        if (!response) continue;
        const image = await loadImage(response.data);

        ctx.strokeStyle = "green";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, profileSize, profileSize);
        ctx.drawImage(image, x + 2, y + 2, profileSize - 4, profileSize - 4);

        colIndex++;
        x += profileSize + gapBetweenImages;
        if (colIndex >= maxImagesPerRow) {
          colIndex = 0;
          x = 10;
          y += profileSize + gapBetweenImages;
        }
      }

      // Save the canvas to a file
      const outputFolder = __dirname + "/cache";
      if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);
      const outputFile = `${outputFolder}/group_members.png`;

      const out = fs.createWriteStream(outputFile);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", () => {
        message.reply(
          {
            body: `Admins: ${numAdmins}, Members: ${numMembers}`,
            attachment: fs.createReadStream(outputFile),
          },
          event.threadID
        );
      });

      out.on("error", (err) => {
        console.error("Error writing image file:", err.message);
        message.reply("Failed to generate the image.");
      });
    } catch (error) {
      console.error("Error:", error.message);
      message.reply("An error occurred while generating the group status.");
    }
  },
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });