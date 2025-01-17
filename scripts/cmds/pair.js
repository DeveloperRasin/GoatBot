const { GoatWrapper } = require("fca-liane-utils");
const axios = require("axios");

module.exports = {
  config: {
    name: "pair",
    version: "1.0",
    author: "Rasin",
    description: {
      en: "Calculate love percentage between two names.",
    },
    guide: {
      en: "Type: !pair <name1> | <name2>",
    },
    category: "fun",
    usePrefix: true,
  },

  onStart: async function ({ message, args }) {
    const input = args.join(" ").split("|").map(item => item.trim());

    if (input.length !== 2) {
      return message.reply("Please use the correct format: !pair <name1> | <name2>");
    }

    const [name1, name2] = input;

    try {
      const response = await axios.get(`https://developer-rasin.onrender.com/api/rasin/pair`, {
        params: { name1, name2 },
      });

      const { Name, CrushName, LovePercentage } = response.data;

      message.reply(`💞✨ Love Matched! ✨💞\n\n You 💌 Embarking on a magical journey with Partner.\n\n🌟 The stars align with a pairing chance of ${LovePercentage}! 🦋\n\nName: ${Name}\nPartner Name: ${CrushName} 🌼`);
    } catch (error) {
      message.reply("Something went wrong. Please try again later.");
    }
  },
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });