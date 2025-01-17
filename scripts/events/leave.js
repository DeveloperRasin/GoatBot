const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "leave",
    version: "1.0.0",
    author: "Adapted from Mirai Team",
    category: "events",
    eventType: ["log:unsubscribe"],
    description: "Notifies when a user or the bot leaves the group",
  },

  onStart: async ({ api, event, usersData, threadsData }) => {
    try {
      const { threadID } = event;
      const leftUserId = event.logMessageData.leftParticipantFbId;

      // If the bot leaves the group, do nothing
      if (leftUserId == api.getCurrentUserID()) return;

      const threadData = await threadsData.get(threadID);

      // Check if global.data is defined and if userName is accessible
      let userName;

      if (global.data && global.data.userName && typeof global.data.userName.get === 'function') {
        userName = global.data.userName.get(leftUserId);
      }

      // If userName is still undefined, fallback to usersData.getName
      if (!userName) {
        console.log(`User name not found in global data, fetching from usersData for ${leftUserId}`);
        userName = await usersData.getName(leftUserId);
      }

      // Handle case where userName is still undefined (e.g., user left without name)
      if (!userName) {
        userName = "Unknown User";
        console.warn(`Could not find user name for ${leftUserId}. Using default "Unknown User"`);
      }

      const isSelfLeave = event.author == leftUserId;

      const leaveMessage = isSelfLeave
        ? "তুই গ্রুপে থাকার যোগ্য না\n\nলিভ নেউয়ার জন্য ধন্যবাদ 🤢"
        : "মানুষটা কিক খাইলো রে\nএমনে মানুষ টা ভালাই ছিলো😫, ক্যান যে আবার মাতাব্বরি করতে গেল😂😆";

      const customLeaveMessage = threadData.data.customLeave || "[ {name} ] {type}";
      const finalMessage = customLeaveMessage
        .replace(/\{name}/g, userName)
        .replace(/\{type}/g, leaveMessage);

      const cachePath = path.join(__dirname, "cache", "leaveGif");
      const gifPath = path.join(cachePath, `leave.gif`);

      // Ensure cache directory exists
      if (!fs.existsSync(cachePath)) {
        fs.mkdirSync(cachePath, { recursive: true });
      }

      const formPush = fs.existsSync(gifPath)
        ? { body: finalMessage, attachment: fs.createReadStream(gifPath) }
        : { body: finalMessage };

      return api.sendMessage(formPush, threadID);
    } catch (error) {
      console.error("An error occurred while handling the leave event:", error);
    }
  },
};
